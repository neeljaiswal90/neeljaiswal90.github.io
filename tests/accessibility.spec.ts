import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const themes = ['studio', 'cinema', 'navy'] as const;

for (const theme of themes) {
  test(`${theme} theme has no serious or critical accessibility violations`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem('neel-portfolio-theme', selectedTheme);
    }, theme);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');

    expect(blocking).toEqual([]);
  });
}

test('skip link reaches the main portfolio content', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  const skipLink = page.locator('.skip-link');
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
});

test('case-study route has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/work/growth-system/', { waitUntil: 'domcontentloaded' });

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');

  expect(blocking).toEqual([]);
});
