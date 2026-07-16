import { expect, test } from '@playwright/test';
import { canonicalUrl } from '../src/data/site';
import { attachRuntimeGuards } from './helpers';

const caseStudies = [
  {
    slug: 'growth-system',
    title: 'Conversion, compounded.',
    company: 'Mint Mobile',
    brand: 'mint-mobile',
    metrics: ['+54.7%', '+77%', '+10% AOV'],
    previous: null,
    next: 'home-internet',
  },
  {
    slug: 'home-internet',
    title: 'From eligibility to recurring revenue.',
    company: 'Mint Home Internet',
    brand: 'mint-mobile',
    metrics: ['33.4K → 64K', '+60%', '+9.3%'],
    previous: 'growth-system',
    next: 'production-ai',
  },
  {
    slug: 'production-ai',
    title: 'Resolve the need, not just the message.',
    company: 'Mint Mobile',
    brand: 'mint-mobile',
    metrics: ['56%', '3.1 → 4.44', '−34%'],
    previous: 'home-internet',
    next: 'device-commerce',
  },
  {
    slug: 'device-commerce',
    title: 'A device business, not a product page.',
    company: 'Mint Mobile',
    brand: 'mint-mobile',
    metrics: ['75%'],
    previous: 'production-ai',
    next: 'enterprise-integration',
  },
  {
    slug: 'enterprise-integration',
    title: 'Integration is a product.',
    company: 'Inspire Brands',
    brand: 'inspire-brands',
    metrics: [],
    previous: 'device-commerce',
    next: 'retail-self-service',
  },
  {
    slug: 'retail-self-service',
    title: 'Help customers help themselves.',
    company: 'Best Buy',
    brand: 'best-buy',
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
    await expect(page.locator('.case-company-lockup [data-company-brand]')).toHaveAttribute('data-company-brand', caseStudy.brand);
    await expect(page.locator('.case-evidence-boundary p')).not.toBeEmpty();

    const processContainment = await page.locator('.case-process li > strong').evaluateAll((titles) =>
      titles.map((title) => ({ clientWidth: title.clientWidth, scrollWidth: title.scrollWidth })),
    );
    for (const title of processContainment) {
      expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 1);
    }
    const connectorContent = await page.locator('.case-process li').first().evaluate((item) =>
      getComputedStyle(item, '::after').content,
    );
    expect(connectorContent).toBe('""');

    const metricCells = page.locator('[data-case-metric]');
    await expect(metricCells).toHaveCount(caseStudy.metrics.length);
    for (const metric of caseStudy.metrics) {
      await expect(metricCells.getByText(metric, { exact: true })).toHaveCount(1);
    }

    await expect(page.locator('a[href="/#work"]')).toHaveCount(3);
    await expect(page.locator('.case-brand')).toHaveAttribute('href', '/#home');
    await expect(page.locator('.case-process')).toContainText('Operating system');
    await expect(page.locator('.case-evidence-boundary')).toContainText('Support boundary');
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

test('case study returns to Cohesion selected work', async ({ page }) => {
  await page.goto('/#work', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.coh-work .coh-work-card[href="/work/growth-system/"]');
  await expect(card).toHaveCount(1);
  await card.click();
  await expect(page).toHaveURL(/\/work\/growth-system\/$/);

  const allWork = page.locator('.case-topbar-back');
  await expect(allWork).toHaveAttribute('href', '/#work');
  await allWork.click();
  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.locator('#work')).toBeVisible();
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
