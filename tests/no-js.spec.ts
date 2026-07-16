import { expect, test } from '@playwright/test';
import { expectImagesToDecode, sectionIds } from './helpers';

test('the complete portfolio remains readable without JavaScript', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'load' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).not.toHaveClass(/\bjs\b/);
  await expect(page.locator('#main-content')).toBeVisible();

  for (const id of sectionIds) {
    const section = page.locator(`#${id}`);
    await expect(section, `#${id} should be visible without JavaScript`).toBeVisible();
    expect((await section.innerText()).trim().length, `#${id} should expose meaningful text`).toBeGreaterThan(20);
  }

  const revealState = await page.locator('.reveal').first().evaluate((element) => {
    const style = window.getComputedStyle(element);
    return { opacity: Number(style.opacity), visibility: style.visibility, display: style.display };
  });
  expect(revealState.opacity).toBeGreaterThan(0);
  expect(revealState.visibility).not.toBe('hidden');
  expect(revealState.display).not.toBe('none');

  await expectImagesToDecode(page);
});

test('experience disclosures remain native and independently operable without JavaScript', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });

  const roles = page.locator('[data-experience-item]');
  const firstRole = roles.first();
  const secondRole = roles.nth(1);
  await expect(firstRole).toHaveAttribute('open', '');
  await expect(secondRole).not.toHaveAttribute('open', '');

  await secondRole.locator(':scope > summary').click();
  await expect(secondRole).toHaveAttribute('open', '');
  await expect(firstRole).toHaveAttribute('open', '');
  await expect(secondRole.locator('[data-experience-panel]')).toBeVisible();

  await firstRole.locator(':scope > summary').click();
  await expect(firstRole).not.toHaveAttribute('open', '');
  await expect(secondRole).toHaveAttribute('open', '');
});
