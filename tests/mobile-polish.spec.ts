import { expect, test } from '@playwright/test';
import { attachRuntimeGuards, expectImagesToDecode } from './helpers';

const widths = [320, 375, 430] as const;

for (const width of widths) {
  test(`homepage remains polished at ${width}px`, async ({ page }, testInfo) => {
    const runtime = attachRuntimeGuards(page, testInfo);
    await page.setViewportSize({ width, height: 812 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expectImagesToDecode(page);

    const pageWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client + 1);

    const contact = page.locator('#contact');
    await contact.scrollIntoViewIfNeeded();
    const layout = await contact.evaluate((section) => {
      const viewportWidth = document.documentElement.clientWidth;
      const form = section.querySelector('.coh-contact-form');
      const controls = Array.from(section.querySelectorAll<HTMLElement>('input:not([type="hidden"]):not([name="_honey"]), textarea, button[type="submit"]'));
      const actions = Array.from(section.querySelectorAll<HTMLElement>('.coh-contact-actions a'));
      if (!(form instanceof HTMLElement)) throw new Error('Contact form is missing');
      const formRect = form.getBoundingClientRect();
      return {
        formInsideViewport: formRect.left >= 0 && formRect.right <= viewportWidth,
        controls: controls.map((control) => ({
          width: control.getBoundingClientRect().width,
          height: control.getBoundingClientRect().height,
          fontSize: Number.parseFloat(getComputedStyle(control).fontSize),
          overflow: control.scrollWidth - control.clientWidth,
        })),
        actions: actions.map((action) => ({
          left: action.getBoundingClientRect().left,
          right: action.getBoundingClientRect().right,
          height: action.getBoundingClientRect().height,
        })),
      };
    });

    expect(layout.formInsideViewport).toBe(true);
    for (const control of layout.controls) {
      expect(control.width).toBeGreaterThan(200);
      expect(control.height).toBeGreaterThanOrEqual(54);
      expect(control.fontSize).toBeGreaterThanOrEqual(12);
      expect(control.overflow).toBeLessThanOrEqual(1);
    }
    for (const action of layout.actions) {
      expect(action.left).toBeGreaterThanOrEqual(0);
      expect(action.right).toBeLessThanOrEqual(width);
      expect(action.height).toBeGreaterThanOrEqual(44);
    }

    const submit = contact.getByRole('button', { name: 'Send message' });
    await submit.evaluate((button) => button.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const overlap = await page.evaluate(() => {
      const button = document.querySelector('.coh-contact-submit button');
      const nav = document.querySelector('.coh-pill-nav');
      if (!(button instanceof HTMLElement) || !(nav instanceof HTMLElement)) throw new Error('Mobile navigation surfaces are missing');
      const buttonRect = button.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      return buttonRect.bottom > navRect.top && buttonRect.top < navRect.bottom;
    });
    expect(overlap).toBe(false);
    runtime.assertClean();
  });
}
