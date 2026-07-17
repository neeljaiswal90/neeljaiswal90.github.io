import { expect, test } from '@playwright/test';
import { attachRuntimeGuards } from './helpers';

test('case-study reading layout is usable without horizontal page overflow', async ({ page }, testInfo) => {
  const runtime = attachRuntimeGuards(page, testInfo);
  await page.goto('/work/growth-system/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.case-index')).toBeVisible();
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await expect(page.locator('.case-evidence-boundary')).toBeVisible();
  const evidenceLink = page.locator('.case-index a[href="#evidence"]');
  await expect(evidenceLink).toHaveAttribute('aria-current', 'location');

  const mobileIndex = await page.locator('.case-index-inner').evaluate((rail) => {
    const links = Array.from(rail.querySelectorAll<HTMLElement>('a'));
    const current = rail.querySelector<HTMLElement>('a[aria-current]');
    if (!current) throw new Error('Active case-study index link is missing');
    const railRect = rail.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    return {
      targetHeights: links.map((link) => link.getBoundingClientRect().height),
      currentInsideRail: currentRect.left >= railRect.left && currentRect.right <= railRect.right + 1,
    };
  });
  expect(mobileIndex.targetHeights.every((height) => height >= 44)).toBe(true);
  expect(mobileIndex.currentInsideRail).toBe(true);

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  runtime.assertClean();
});
