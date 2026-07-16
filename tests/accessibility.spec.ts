import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('skip link reaches the main portfolio content', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  const skipLink = page.locator('.coh-skip');
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page).toHaveURL(/#cohesion-main$/);
});

test('case-study route has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/work/growth-system/', { waitUntil: 'domcontentloaded' });

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');

  expect(blocking).toEqual([]);
});
