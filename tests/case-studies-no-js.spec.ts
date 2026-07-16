import { expect, test } from '@playwright/test';

test('all case-study routes remain complete and readable without JavaScript', async ({ page }) => {
  for (const slug of [
    'growth-system',
    'home-internet',
    'production-ai',
    'device-commerce',
    'enterprise-integration',
    'retail-self-service',
  ]) {
    const response = await page.goto(`/work/${slug}/`, { waitUntil: 'load' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-case-section]')).toHaveCount(6);
    await expect(page.locator('#system ol > li')).toHaveCount(4);
    await expect(page.locator('.case-evidence-boundary')).toBeVisible();
  }
});
