import { expect, test } from '@playwright/test';
import { attachRuntimeGuards } from './helpers';

test('case-study reading layout is usable without horizontal page overflow', async ({ page }, testInfo) => {
  const runtime = attachRuntimeGuards(page, testInfo);
  await page.goto('/work/growth-system/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.case-index')).toBeVisible();
  await page.locator('#evidence').scrollIntoViewIfNeeded();
  await expect(page.locator('.case-evidence-boundary')).toBeVisible();

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  runtime.assertClean();
});
