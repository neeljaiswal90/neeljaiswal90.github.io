import { expect, test } from '@playwright/test';
import { canonicalUrl } from '../src/data/site';
import { attachRuntimeGuards } from './helpers';

const caseStudies = [
  {
    slug: 'growth-system',
    title: 'Conversion, compounded.',
    company: 'Mint Mobile',
    metrics: ['+54.7%', '+77%', '+10% AOV'],
    previous: null,
    next: 'home-internet',
  },
  {
    slug: 'home-internet',
    title: 'From eligibility to recurring revenue.',
    company: 'Mint Home Internet',
    metrics: ['33.4K → 64K', '+60%', '+9.3%'],
    previous: 'growth-system',
    next: 'production-ai',
  },
  {
    slug: 'production-ai',
    title: 'Resolve the need, not just the message.',
    company: 'Mint Mobile',
    metrics: ['56%', '3.1 → 4.44', '−34%'],
    previous: 'home-internet',
    next: 'device-commerce',
  },
  {
    slug: 'device-commerce',
    title: 'A device business, not a product page.',
    company: 'Mint Mobile',
    metrics: ['75%'],
    previous: 'production-ai',
    next: 'enterprise-integration',
  },
  {
    slug: 'enterprise-integration',
    title: 'Integration is a product.',
    company: 'Inspire Brands',
    metrics: [],
    previous: 'device-commerce',
    next: 'retail-self-service',
  },
  {
    slug: 'retail-self-service',
    title: 'Help customers help themselves.',
    company: 'Best Buy',
    metrics: ['10–20%', '~15%'],
    previous: 'enterprise-integration',
    next: null,
  },
] as const;

const expectedSections = ['overview', 'system', 'problem', 'decisions', 'tradeoffs', 'evidence'];

for (const caseStudy of caseStudies) {
  test(`${caseStudy.slug} renders a complete claim-backed case study`, async ({ page }, testInfo) => {
    const runtime = attachRuntimeGuards(page, testInfo);
    const response = await page.goto(`/work/${caseStudy.slug}/`, { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBe(200);
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(caseStudy.title);
    await expect(page.locator('[data-controller~="case-study-scene"]')).toContainText(caseStudy.company);
    await expect(page).toHaveTitle(new RegExp(`${caseStudy.company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Case Study`));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      canonicalUrl(`/work/${caseStudy.slug}/`),
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');

    const sections = page.locator('[data-case-section]');
    await expect(sections).toHaveCount(expectedSections.length);
    expect(await sections.evaluateAll((elements) => elements.map((element) => element.id)))
      .toEqual(expectedSections);
    await expect(page.locator('#system ol > li')).toHaveCount(4);
    await expect(page.locator('.case-evidence-boundary p')).not.toBeEmpty();

    const metricCells = page.locator('[data-case-metric]');
    await expect(metricCells).toHaveCount(caseStudy.metrics.length);
    for (const metric of caseStudy.metrics) {
      await expect(metricCells.getByText(metric, { exact: true })).toHaveCount(1);
    }

    await expect(page.locator('a[href="/#selected-work"]')).not.toHaveCount(0);
    const previous = page.locator('a[rel="prev"]');
    const next = page.locator('a[rel="next"]');
    if (caseStudy.previous) {
      await expect(previous).toHaveAttribute('href', `/work/${caseStudy.previous}/`);
    } else {
      await expect(previous).toHaveCount(0);
    }
    if (caseStudy.next) {
      await expect(next).toHaveAttribute('href', `/work/${caseStudy.next}/`);
    } else {
      await expect(next).toHaveCount(0);
    }

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    runtime.assertClean();
  });
}

test('homepage work links and browser Back preserve selected-work context', async ({ page }) => {
  await page.goto('/#selected-work', { waitUntil: 'domcontentloaded' });
  const hrefs = await page.locator('.work-case-link').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );
  expect(hrefs).toEqual(caseStudies.map(({ slug }) => `/work/${slug}/`));

  await page.locator('.work-case-link').first().click();
  await expect(page).toHaveURL(/\/work\/growth-system\/$/);
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/#selected-work$/);
  await expect(page.locator('#outcome-01')).toHaveClass(/is-active/);
});

test('case index tracks the active narrative section', async ({ page }) => {
  await page.goto('/work/growth-system/', { waitUntil: 'domcontentloaded' });
  const evidenceLink = page.locator('[data-case-index-link][href="#evidence"]');
  await evidenceLink.click();
  await expect(page).toHaveURL(/#evidence$/);
  await expect(evidenceLink).toHaveAttribute('aria-current', 'location');
  await expect.poll(async () => page.locator('[data-case-progress]').evaluate((bar) => {
    const match = (bar as HTMLElement).style.transform.match(/scaleY\(([\d.]+)\)/);
    return match?.[1] ? Number.parseFloat(match[1]) : 0;
  })).toBeGreaterThan(0.5);
});
