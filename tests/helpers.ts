import { expect, type Page, type TestInfo } from '@playwright/test';

export const sectionIds = [
  'home',
  'about',
  'focus',
  'work',
  'stack',
  'contact',
] as const;

export function attachRuntimeGuards(page: Page, testInfo: TestInfo) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedFirstPartyRequests: string[] = [];
  const badFirstPartyResponses: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    if (isFirstParty(request.url(), testInfo)) {
      failedFirstPartyRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`);
    }
  });
  page.on('response', (response) => {
    if (isFirstParty(response.url(), testInfo) && response.status() >= 400) {
      badFirstPartyResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  return {
    assertClean() {
      expect.soft(consoleErrors, 'browser console errors').toEqual([]);
      expect.soft(pageErrors, 'uncaught page errors').toEqual([]);
      expect.soft(failedFirstPartyRequests, 'failed first-party requests').toEqual([]);
      expect.soft(badFirstPartyResponses, 'first-party HTTP errors').toEqual([]);
    },
  };
}

function isFirstParty(url: string, testInfo: TestInfo) {
  const configuredBaseURL = testInfo.project.use.baseURL;
  if (typeof configuredBaseURL !== 'string') return false;
  try {
    return new URL(url).origin === new URL(configuredBaseURL).origin;
  } catch {
    return false;
  }
}

export async function expectImagesToDecode(page: Page) {
  const failures = await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[src]:not([src=""])'));
    const failed: string[] = [];

    for (const image of images) {
      image.scrollIntoView({ block: 'center' });
      try {
        if (!image.complete) {
          await Promise.race([
            new Promise<void>((resolve, reject) => {
              image.addEventListener('load', () => resolve(), { once: true });
              image.addEventListener('error', () => reject(new Error('load error')), { once: true });
            }),
            new Promise<void>((_, reject) => window.setTimeout(() => reject(new Error('timeout')), 5_000)),
          ]);
        }
        await image.decode();
      } catch {
        // naturalWidth below is the final source of truth; decode can reject for an
        // already-decoded SVG in some browser versions.
      }
      if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
        failed.push(image.currentSrc || image.src || image.alt || '<unknown image>');
      }
    }

    return failed;
  });

  expect(failures, 'every rendered image should load and decode').toEqual([]);
}
