import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

test('chapter navigation and page progress follow the scrolled section', async ({ page }) => {
  const stack = page.locator('#stack');
  await stack.evaluate((section) => section.scrollIntoView({ block: 'start', behavior: 'instant' }));

  const stackLink = page.locator('[data-nav="stack"]');
  await expect(stackLink).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('.chapter-nav [aria-current]')).toHaveCount(1);

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('[data-nav="contact"]')).toHaveAttribute('aria-current', 'location');

  await expect.poll(async () => page.locator('#page-progress-bar').evaluate((bar) => {
    const track = bar.parentElement;
    if (!track) return 0;
    return bar.getBoundingClientRect().width / track.getBoundingClientRect().width;
  })).toBeGreaterThan(0.95);
});

test('outcome explorer supports indexed and arrow navigation', async ({ page }) => {
  const track = page.locator('#work-track');
  await track.scrollIntoViewIfNeeded();
  await expect(page.locator('#work-count')).toHaveText('01 / 06');

  await track.focus();
  await expect(track).toBeFocused();
  await track.press('ArrowRight');
  await expect(page.locator('#work-count')).toHaveText('02 / 06');
  await expect(page.locator('#outcome-02')).toHaveClass(/is-active/);

  const slides = page.locator('[data-work-slide]');
  await expect.poll(async () => slides.evaluateAll((items) =>
    items.map((item) => ({
      active: item.classList.contains('is-active'),
      inert: (item as HTMLElement).inert,
    })),
  )).toEqual([
    { active: false, inert: true },
    { active: true, inert: false },
    { active: false, inert: true },
    { active: false, inert: true },
    { active: false, inert: true },
    { active: false, inert: true },
  ]);

  await page.locator('[data-work-next]').click();
  await expect(page.locator('#work-count')).toHaveText('03 / 06');
  await expect(page.locator('#outcome-03')).toHaveClass(/is-active/);
  await expect(page.locator('#work-announcement')).not.toBeEmpty();

  await track.press('End');
  await expect(page.locator('#work-count')).toHaveText('06 / 06');
  await expect(page.locator('[data-work-next]')).toBeDisabled();
});

test('tool filters expose state and update the visible result count', async ({ page }) => {
  const filter = page.locator('[data-tool-filter="ai"]');
  await filter.scrollIntoViewIfNeeded();
  await filter.click();

  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-tool-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#tool-announcement')).toContainText(/Showing \d+ of \d+/);

  const visibleTiles = await page.locator('[data-tool-groups]:visible').count();
  const countText = await page.locator('#tool-count').textContent();
  expect(Number.parseInt(countText ?? '', 10)).toBe(visibleTiles);
  expect(visibleTiles).toBeGreaterThan(0);
});

test('rapid tool-filter changes settle on the final requested state', async ({ page }) => {
  const grid = page.locator('#tool-grid');
  await grid.scrollIntoViewIfNeeded();

  await page.locator('[data-tool-filter]').evaluateAll((buttons) => {
    const filters = ['plan', 'ai', 'commerce', 'build', 'data'];
    for (const filter of filters) {
      const button = buttons.find((candidate) => candidate.getAttribute('data-tool-filter') === filter);
      if (!(button instanceof HTMLButtonElement)) throw new Error(`Missing ${filter} tool filter`);
      button.click();
    }
  });

  const finalFilter = page.locator('[data-tool-filter="data"]');
  await expect(finalFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-tool-filter][aria-pressed="true"]')).toHaveCount(1);

  const tiles = page.locator('[data-tool-groups]');
  const expectedVisible = await tiles.evaluateAll((items) =>
    items.filter((item) => (item.getAttribute('data-tool-groups') ?? '').split(/\s+/).includes('data')).length,
  );

  await expect.poll(async () => tiles.evaluateAll((items) =>
    items.filter((item) => !(item as HTMLElement).hidden).length,
  )).toBe(expectedVisible);
  await expect(page.locator('#tool-count')).toHaveText(`${expectedVisible} / ${await tiles.count()}`);
  await expect(page.locator('#tool-announcement')).toContainText(`Showing ${expectedVisible} of ${await tiles.count()}`);

  const mismatches = await tiles.evaluateAll((items) => items.filter((item) => {
    const belongsToFinalFilter = (item.getAttribute('data-tool-groups') ?? '').split(/\s+/).includes('data');
    return (item as HTMLElement).hidden === belongsToFinalFilter;
  }).length);
  expect(mismatches, 'only tools in the final rapid filter should remain exposed').toBe(0);
});

test('achievement evidence opens and closes in an accessible dialog', async ({ page }) => {
  const opener = page.locator('[data-photo-open]').first();
  await opener.scrollIntoViewIfNeeded();
  await opener.click();

  const dialog = page.locator('#photo-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('open', '');
  await expect(page.locator('#photo-dialog-title')).not.toBeEmpty();
  await expect(page.locator('#photo-dialog-image')).toHaveJSProperty('complete', true);

  await page.locator('[data-photo-close]').click();
  await expect(dialog).not.toBeVisible();
});

test('photo dialog restores focus after Escape and backdrop dismissal', async ({ page }) => {
  const opener = page.locator('[data-photo-open]').first();
  const dialog = page.locator('#photo-dialog');
  const closeButton = page.locator('[data-photo-close]');
  await opener.scrollIntoViewIfNeeded();

  await opener.focus();
  await opener.click();
  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();

  await opener.click();
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox, 'open dialog should have a measurable content box').not.toBeNull();
  const backdropX = Math.max(1, (dialogBox?.x ?? 20) - 12);
  const backdropY = Math.max(1, (dialogBox?.y ?? 20) - 12);
  await page.mouse.click(backdropX, backdropY);
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('theme choice updates browser chrome metadata and survives reload', async ({ page }) => {
  const cinema = page.locator('[data-theme-option="cinema"]');
  await cinema.scrollIntoViewIfNeeded();
  await cinema.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
  await expect(cinema).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-theme-option][aria-pressed="true"]')).toHaveCount(1);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1a1715');
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('neel-portfolio-theme'))).toBe('cinema');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
  await expect(page.locator('[data-theme-option="cinema"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1a1715');
});

test('experience disclosures keep one role open and settle panel motion', async ({ page }) => {
  const roles = page.locator('[data-experience-item]');
  const secondRole = roles.nth(1);
  const fourthRole = roles.nth(3);

  await expect(roles).toHaveCount(5);
  await expect(page.locator('[data-experience-item][open]')).toHaveCount(1);

  await secondRole.locator(':scope > summary').click();
  await expect(secondRole).toHaveAttribute('open', '');
  await expect(page.locator('[data-experience-item][open]')).toHaveCount(1);

  const fourthSummary = fourthRole.locator(':scope > summary');
  await fourthSummary.focus();
  await fourthSummary.press('Enter');
  await expect(fourthSummary).toBeFocused();
  await expect(fourthRole).toHaveAttribute('open', '');
  await expect(secondRole).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-experience-item][open]')).toHaveCount(1);

  const fourthPanel = fourthRole.locator('[data-experience-panel]');
  await expect.poll(async () => fourthPanel.evaluate((panel) => {
    const style = (panel as HTMLElement).style;
    return ['height', 'opacity', 'overflow', 'transform']
      .every((property) => style.getPropertyValue(property) === '');
  })).toBe(true);
});

test('hero and AI scenes remove temporary inline motion after choreography', async ({ page }) => {
  const hero = page.locator('[data-controller~="hero"]');
  await expect(hero).toHaveClass(/hero-motion-complete/);

  const heroSettled = await hero.evaluate((root) =>
    Array.from(root.querySelectorAll<HTMLElement>(
      '[data-hero-kicker], [data-hero-line-inner], [data-hero-word], [data-hero-lower], [data-hero-signal-content]',
    )).every((element) => element.style.opacity === '' && element.style.transform === ''),
  );
  expect(heroSettled, 'hero should hand final presentation back to CSS').toBe(true);

  const ai = page.locator('[data-controller~="ai-system-scene"]');
  await ai.evaluate((section) => section.scrollIntoView({ block: 'center', behavior: 'instant' }));

  await expect.poll(async () => ai.evaluate((root) => {
    const targets = root.querySelectorAll<HTMLElement>('[data-ai-step], [data-ai-stat], [data-ai-path]');
    const hasInlineMotion = Array.from(targets).some((element) =>
      element.style.opacity !== ''
      || element.style.transform !== ''
      || element.style.strokeDasharray !== ''
      || element.style.strokeDashoffset !== '');
    return hasInlineMotion || root.getAnimations({ subtree: true })
      .some((animation) => animation.playState === 'running');
  })).toBe(true);

  await ai.evaluate(async (root) => {
    const animations = root.getAnimations({ subtree: true })
      .filter((animation) => animation.playState === 'running');
    await Promise.allSettled(animations.map((animation) => animation.finished));
  });

  await expect.poll(async () => ai.evaluate((root) =>
    Array.from(root.querySelectorAll<HTMLElement>('[data-ai-step], [data-ai-stat], [data-ai-path]'))
      .every((element) => element.style.opacity === ''
        && element.style.transform === ''
        && element.style.strokeDasharray === ''
        && element.style.strokeDashoffset === ''),
  )).toBe(true);
});
