import { expect, test } from '@playwright/test';

test('reduced-motion preference keeps content visible and stops perpetual motion', async ({ page }) => {
  await page.goto('/v1/', { waitUntil: 'domcontentloaded' });

  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await expect(page.locator('.reveal').first()).toHaveClass(/is-visible/);

  const perpetualAnimations = await page.evaluate(() =>
    document.getAnimations()
      .filter((animation) => {
        const iterations = animation.effect?.getTiming().iterations;
        return animation.playState === 'running' && iterations === Infinity;
      })
      .map((animation) => {
        const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
        return target instanceof Element ? target.outerHTML.slice(0, 160) : '<unknown target>';
      }),
  );

  expect(perpetualAnimations, 'infinite animations should stop under reduced motion').toEqual([]);
});

test('live reduced-motion changes stop and restore perpetual motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/v1/', { waitUntil: 'domcontentloaded' });

  await expect.poll(async () => page.evaluate(() =>
    document.getAnimations().filter((animation) => {
      const iterations = animation.effect?.getTiming().iterations;
      return animation.playState === 'running' && iterations === Infinity;
    }).length,
  )).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await expect(page.locator('.reveal').first()).toHaveClass(/is-visible/);
  await expect.poll(async () => page.evaluate(() =>
    document.getAnimations().filter((animation) => {
      const iterations = animation.effect?.getTiming().iterations;
      return animation.playState === 'running' && iterations === Infinity;
    }).length,
  )).toBe(0);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false);
  await expect.poll(async () => page.evaluate(() =>
    document.getAnimations().filter((animation) => {
      const iterations = animation.effect?.getTiming().iterations;
      return animation.playState === 'running' && iterations === Infinity;
    }).length,
  )).toBeGreaterThan(0);
});

test('live reduced motion settles active flagship and disclosure scenes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/v1/', { waitUntil: 'domcontentloaded' });

  const ai = page.locator('[data-controller~="ai-system-scene"]');
  await ai.evaluate((section) => section.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(async () => ai.evaluate((root) =>
    root.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running')
    || Array.from(root.querySelectorAll<HTMLElement>('[data-ai-step], [data-ai-stat], [data-ai-path]'))
      .some((element) => element.style.opacity !== '' || element.style.transform !== ''),
  )).toBe(true);

  const secondRole = page.locator('[data-experience-item]').nth(1);
  await secondRole.locator(':scope > summary').evaluate((summary) => (summary as HTMLElement).click());
  await expect(secondRole).toHaveAttribute('open', '');
  await expect.poll(async () => secondRole.locator('[data-experience-panel]').evaluate((panel) =>
    (panel as HTMLElement).style.height !== '',
  )).toBe(true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await expect(page.locator('[data-controller~="hero"]')).toHaveClass(/hero-motion-complete/);
  await expect(page.locator('[data-experience-item][open]')).toHaveCount(1);
  await expect(secondRole).toHaveAttribute('open', '');

  await expect.poll(async () => page.evaluate(() => {
    const selectors = [
      '[data-hero-kicker]',
      '[data-hero-line-inner]',
      '[data-hero-word]',
      '[data-hero-lower]',
      '[data-hero-signal-content]',
      '[data-ai-step]',
      '[data-ai-stat]',
      '[data-ai-path]',
      '[data-experience-panel]',
    ].join(',');
    const inlineSettled = Array.from(document.querySelectorAll<HTMLElement>(selectors))
      .every((element) => element.style.opacity === ''
        && element.style.transform === ''
        && element.style.height === ''
        && element.style.overflow === ''
        && element.style.strokeDasharray === ''
        && element.style.strokeDashoffset === '');
    const roots = [
      document.querySelector('[data-controller~="hero"]'),
      document.querySelector('[data-controller~="ai-system-scene"]'),
      document.querySelector('[data-controller~="experience-scene"]'),
    ].filter((root): root is Element => root instanceof Element);
    const running = roots.flatMap((root) => root.getAnimations({ subtree: true }))
      .filter((animation) => animation.playState === 'running');
    return inlineSettled && running.length === 0;
  })).toBe(true);
});
