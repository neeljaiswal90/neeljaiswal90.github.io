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

    const mobileNavigation = page.locator('.coh-mobile-nav');
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.locator('a')).toHaveCount(5);
    await expect(page.locator('.coh-topbar')).toBeHidden();
    await expect(page.locator('.coh-journey-nav')).toBeHidden();
    await expect(page.locator('.coh-hero-journey-next')).toBeHidden();
    const navigationLayout = await mobileNavigation.evaluate((nav) => {
      const rect = nav.getBoundingClientRect();
      const links = Array.from(nav.querySelectorAll<HTMLElement>('a'));
      return {
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        links: links.map((link) => ({
          width: link.getBoundingClientRect().width,
          height: link.getBoundingClientRect().height,
        })),
      };
    });
    expect(navigationLayout.left).toBeGreaterThanOrEqual(0);
    expect(navigationLayout.right).toBeLessThanOrEqual(width);
    expect(navigationLayout.bottom).toBeLessThanOrEqual(812);
    for (const link of navigationLayout.links) {
      expect(link.width).toBeGreaterThanOrEqual(44);
      expect(link.height).toBeGreaterThanOrEqual(44);
    }

    await mobileNavigation.locator('[data-coh-nav="work"]').click();
    await expect.poll(() => page.locator('#work').evaluate((section) => section.getBoundingClientRect().top)).toBeLessThanOrEqual(16);
    const workAnchorTop = await page.locator('#work').evaluate((section) => section.getBoundingClientRect().top);
    expect(workAnchorTop).toBeGreaterThanOrEqual(-1);

    await page.locator('#stack').evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(mobileNavigation.locator('[data-coh-nav="focus"]')).toHaveClass(/is-active/);

    const workTiles = page.locator('.coh-work-tile');
    const workRail = page.locator('.coh-work-tiles');
    await workRail.scrollIntoViewIfNeeded();
    await workRail.evaluate((rail) => { rail.scrollLeft = 0; });
    await expect(workTiles).toHaveCount(6);
    await expect(page.locator('.coh-work-rail-cue')).toBeVisible();
    await expect(workTiles.first().locator('.coh-work-tile-touch-prompt')).toBeVisible();
    await expect(workTiles.first().locator('.coh-work-tile-desktop-prompt')).toBeHidden();
    const workLayout = await workRail.evaluate((rail) => {
      const first = rail.querySelector('.coh-work-tile');
      if (!(first instanceof HTMLElement)) throw new Error('Case-study tile is missing');
      const railRect = rail.getBoundingClientRect();
      const tileRect = first.getBoundingClientRect();
      const inner = first.querySelector('.coh-work-tile-inner');
      if (!(inner instanceof HTMLElement)) throw new Error('Case-study tile inner is missing');
      return {
        railInsideViewport: railRect.left >= 0 && railRect.right <= document.documentElement.clientWidth,
        hasHorizontalJourney: rail.scrollWidth > rail.clientWidth,
        tileInsideRail: tileRect.left >= railRect.left && tileRect.right <= railRect.right + 1,
        tileTransform: getComputedStyle(inner).transform,
        touchAction: getComputedStyle(rail).touchAction,
      };
    });
    expect(workLayout.railInsideViewport).toBe(true);
    expect(workLayout.hasHorizontalJourney).toBe(true);
    expect(workLayout.tileInsideRail).toBe(true);
    expect(workLayout.tileTransform).toBe('none');
    expect(workLayout.touchAction).not.toBe('pan-x');

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
      const nav = document.querySelector('.coh-mobile-nav');
      if (!(button instanceof HTMLElement) || !(nav instanceof HTMLElement)) throw new Error('Mobile navigation surfaces are missing');
      const buttonRect = button.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      return buttonRect.bottom > navRect.top && buttonRect.top < navRect.bottom;
    });
    expect(overlap).toBe(false);
    runtime.assertClean();
  });
}
