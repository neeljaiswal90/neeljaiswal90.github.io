import { expect, test } from '@playwright/test';
import { canonicalUrl, site } from '../src/data/site';
import { workCaseSlugs } from '../src/data/work';

const contentRoutes = [
  {
    path: '/',
    canonical: canonicalUrl('/'),
    kind: 'home',
    image: canonicalUrl(site.socialImage.path),
    imageAlt: site.socialImage.alt,
  },
  {
    path: '/cohesion/',
    canonical: canonicalUrl('/cohesion/'),
    kind: 'variation',
    image: canonicalUrl('/assets/social-card-cohesion.png'),
    imageAlt: 'Neel Jaiswal with the headline Make complex systems feel obvious, surrounded by playful dimensional forms',
  },
  ...workCaseSlugs.map((slug) => ({
    path: `/work/${slug}/`,
    canonical: canonicalUrl(`/work/${slug}/`),
    kind: 'case',
    image: canonicalUrl(site.socialImage.path),
    imageAlt: site.socialImage.alt,
  })),
] as const;

function xmlLocations(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1] ?? '');
}

test('sitemap contains exactly the eight canonical content routes', async ({ request }) => {
  const indexResponse = await request.get('/sitemap-index.xml');
  expect(indexResponse.status()).toBe(200);
  expect(indexResponse.headers()['content-type']).toContain('xml');
  expect(xmlLocations(await indexResponse.text())).toEqual([
    canonicalUrl('/sitemap-0.xml'),
  ]);

  const sitemapResponse = await request.get('/sitemap-0.xml');
  expect(sitemapResponse.status()).toBe(200);
  expect(sitemapResponse.headers()['content-type']).toContain('xml');
  expect(xmlLocations(await sitemapResponse.text()).sort()).toEqual(
    contentRoutes.map(({ canonical }) => canonical).sort(),
  );
});

test('robots allows crawling and discovers the canonical sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
  expect(await response.text()).toBe([
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${canonicalUrl(site.sitemapPath)}`,
    '',
  ].join('\n'));
});

test('every content route has aligned canonical metadata and valid JSON-LD', async ({ page }) => {
  const observedCanonicals = new Set<string>();

  for (const route of contentRoutes) {
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), `${route.path} should render`).toBe(200);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', route.canonical);
    await expect(page.locator('link[rel="sitemap"]')).toHaveAttribute(
      'href',
      canonicalUrl(site.sitemapPath),
    );
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription?.trim().length ?? 0).toBeGreaterThanOrEqual(80);
    expect(metaDescription?.trim().length ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(180);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      route.image,
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      route.imageAlt,
    );

    const structuredDataText = await page.locator('#structured-data').textContent();
    expect(structuredDataText, `${route.path} should expose JSON-LD`).not.toBeNull();
    const structuredData = JSON.parse(structuredDataText ?? '{}') as {
      '@context'?: string;
      '@graph'?: Array<Record<string, unknown>>;
    };
    expect(structuredData['@context']).toBe('https://schema.org');
    expect(Array.isArray(structuredData['@graph'])).toBe(true);
    const graph = structuredData['@graph'] ?? [];
    expect(graph.some((node) => node['@type'] === 'Person' && node['@id'] === `${canonicalUrl('/')}#person`)).toBe(true);
    expect(graph.some((node) => node['@type'] === 'WebSite' && node.url === canonicalUrl('/'))).toBe(true);
    expect(graph.some((node) =>
      (node['@type'] === 'ProfilePage' || node['@type'] === 'WebPage')
      && node.url === route.canonical),
    ).toBe(true);

    const articles = graph.filter((node) => node['@type'] === 'Article');
    const breadcrumbs = graph.filter((node) => node['@type'] === 'BreadcrumbList');
    expect(articles).toHaveLength(route.kind === 'case' ? 1 : 0);
    expect(breadcrumbs).toHaveLength(route.kind === 'case' ? 1 : 0);
    if (route.kind === 'case') {
      expect(articles[0]?.url).toBe(route.canonical);
      expect(articles[0]?.mainEntityOfPage).toEqual({ '@id': `${route.canonical}#webpage` });
    }

    observedCanonicals.add(route.canonical);
  }

  expect(observedCanonicals.size).toBe(contentRoutes.length);
});
