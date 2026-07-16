import { expect, test } from '@playwright/test';
import { attachRuntimeGuards, expectImagesToDecode } from './helpers';

const routes = [
  '/',
  '/v1/',
  '/work/growth-system/',
  '/work/home-internet/',
  '/work/production-ai/',
  '/work/device-commerce/',
  '/work/enterprise-integration/',
  '/work/retail-self-service/',
] as const;

for (const route of routes) {
  test(`${route} keeps visible text and brand assets inside their UI`, async ({ page }, testInfo) => {
    const runtime = attachRuntimeGuards(page, testInfo);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBe(200);
    await expectImagesToDecode(page);

    const failures = await page.evaluate(() => {
      const candidates = document.querySelectorAll<HTMLElement>(
        'h1,h2,h3,h4,p,a,button,strong,small,span,em,i,b,li',
      );

      return Array.from(candidates).flatMap((element) => {
        if (element.closest('[aria-hidden="true"]')) return [];
        if (element.closest('.chapter-nav,.work-track,.case-index-inner,.hero-marquee,.tool-tape,.sr-only,[data-theme-option] span')) return [];
        if (!Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) return [];

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden' || rect.width < 1 || rect.height < 1) return [];

        const horizontal = element.scrollWidth - element.clientWidth;
        const vertical = element.scrollHeight - element.clientHeight;
        const clipsVertically = ['hidden', 'clip'].includes(style.overflowY) && vertical > 1;
        if (horizontal <= 3 && !clipsVertically) return [];

        return [{
          tag: element.tagName.toLowerCase(),
          className: element.className,
          text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 90),
          horizontal,
          vertical: clipsVertically ? vertical : 0,
        }];
      });
    });

    expect(failures).toEqual([]);

    const pageWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client + 1);
    runtime.assertClean();
  });
}
