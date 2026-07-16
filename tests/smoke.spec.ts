import { expect, test } from '@playwright/test';
import { attachRuntimeGuards, expectImagesToDecode, sectionIds } from './helpers';

test('portfolio shell, assets, and layout are healthy', async ({ page }, testInfo) => {
  const runtime = attachRuntimeGuards(page, testInfo);

  const response = await page.goto('/v1/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Neel/i);
  await expect(page.locator('#main-content')).toBeVisible();

  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`), `#${id} should exist`).toHaveCount(1);
  }

  await expectImagesToDecode(page);

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(
    overflow.scrollWidth,
    `page should not overflow horizontally (${overflow.scrollWidth}px content in ${overflow.clientWidth}px viewport)`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);

  runtime.assertClean();
});
