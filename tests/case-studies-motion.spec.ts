import { expect, test } from '@playwright/test';

test('case-study scenes settle immediately under reduced motion', async ({ page }) => {
  await page.goto('/work/growth-system/', { waitUntil: 'domcontentloaded' });
  await page.locator('#evidence').scrollIntoViewIfNeeded();

  await expect.poll(async () => page.evaluate(() => {
    const root = document.querySelector('[data-controller~="case-study-scene"]');
    if (!(root instanceof HTMLElement)) return false;
    const selectors = '[data-case-title], [data-case-metric], [data-case-scene]';
    const inlineSettled = Array.from(root.querySelectorAll<HTMLElement>(selectors))
      .every((element) => element.style.opacity === '' && element.style.transform === '');
    const running = root.getAnimations({ subtree: true })
      .some((animation) => animation.playState === 'running');
    return inlineSettled && !running;
  })).toBe(true);
});
