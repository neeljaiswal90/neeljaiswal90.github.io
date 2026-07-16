import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachRuntimeGuards, expectImagesToDecode } from './helpers';

test('cohesion is the responsive, accessible, and complete main portfolio', async ({ page }, testInfo) => {
  const runtime = attachRuntimeGuards(page, testInfo);
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Neel Jaiswal/i);
  await expect(page.locator('#cohesion-main')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();

  for (const id of ['home', 'about', 'focus', 'work', 'stack', 'contact']) {
    await expect(page.locator(`#${id}`), `#${id} should exist`).toHaveCount(1);
  }

  await expect(page.locator('.coh-talk')).toHaveAttribute('href', '#contact');

  await expect(page.locator('.coh-work-card')).toHaveCount(6);
  await expect(page.locator('.coh-work-card [data-company-brand]')).toHaveCount(6);
  await expect(page.locator('.coh-tool-grid li')).toHaveCount(27);
  await expect(page.locator('.coh-tool-grid li:visible')).toHaveCount(10);
  await expect(page.locator('[data-coh-tool-filter]')).toHaveCount(7);
  await expect(page.locator('#coh-tool-count')).toHaveText('10 featured · 27 total');
  await expect(page.locator('[data-coh-tool-library]')).not.toHaveAttribute('open', '');
  await expect(page.locator('.coh-tool-blob')).toHaveCount(0);
  await page.locator('#stack').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
  await expect(page.locator('.coh-tool-toolbar')).toHaveClass(/is-visible/);
  await page.waitForTimeout(850);
  await page.locator('[data-coh-tool-filter="ai"]').click({ force: true });
  await expect(page.locator('#coh-tool-count')).toHaveText('5 / 27 tools');
  await expect(page.locator('[data-coh-tool]:visible')).toHaveCount(5);
  await expect(page.locator('[data-coh-tool-library]')).toHaveAttribute('open', '');
  await page.locator('[data-coh-tool-filter="all"]').click({ force: true });
  await expect(page.locator('[data-coh-tool]:visible')).toHaveCount(10);
  await expect(page.locator('#coh-tool-count')).toHaveText('10 featured · 27 total');
  await expect(page.locator('[data-coh-tool-library]')).not.toHaveAttribute('open', '');
  await expect(page.locator('.coh-award-record')).toContainText('Mint Mobile');
  await expect(page.locator('.coh-award-record')).toContainText('#1');
  await expect(page.locator('.coh-award-record')).toHaveAttribute('href', /jdpower\.com/);
  await expect(page.locator('.coh-orbit-card')).toHaveCount(6);
  await expect(page.locator('#about .coh-orbit-card')).toHaveCount(6);
  await expect(page.locator('#home .coh-orbit-card')).toHaveCount(0);
  await expect(page.locator('.coh-release-loop li')).toHaveCount(4);
  await expect(page.locator('.coh-loop-header')).toContainText('Human governed');
  await expect(page.locator('.coh-focus-cue')).toContainText('Scroll through four connected systems');
  await expect(page.locator('.coh-focus-cue')).toHaveAttribute('href', '#focus-system-01');
  await expect(page.locator('.coh-focus-cue-steps > i')).toHaveCount(4);

  const experienceItems = page.locator('[data-coh-experience]');
  await expect(experienceItems).toHaveCount(5);
  await expect(page.locator('.coh-experience-role [data-company-brand]')).toHaveCount(5);
  await expect(experienceItems.first()).toHaveAttribute('open', '');
  await page.locator('.coh-experience-deck').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(850);
  await experienceItems.nth(1).locator('summary').click({ force: true });
  await expect(experienceItems.nth(1)).toHaveAttribute('open', '');
  await expect(experienceItems.first()).not.toHaveAttribute('open', '');
  await expect(experienceItems.nth(1).locator('.coh-experience-scope')).toContainText('Workday');
  await expect(page.locator('.coh-experience-systems a')).toHaveCount(5);

  const portraitFlip = page.locator('[data-coh-portrait-flip]');
  await page.locator('#home').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
  await page.mouse.move(0, 0);
  await expect(portraitFlip).toHaveAttribute('data-intro-flip', 'complete');
  await expect(portraitFlip).toHaveAttribute('aria-expanded', 'false');
  if (testInfo.project.name === 'mobile-chromium') {
    await portraitFlip.click({ force: true });
    await expect(portraitFlip).toHaveAttribute('aria-expanded', 'true');
    await expect(portraitFlip).toHaveClass(/is-flipped/);
    await portraitFlip.click({ force: true });
  } else {
    await portraitFlip.hover({ force: true });
    await expect(portraitFlip).toHaveAttribute('aria-expanded', 'true');
    await expect(portraitFlip).toHaveClass(/is-flipped/);
    await page.mouse.move(0, 0);
  }
  await expect(portraitFlip).toHaveAttribute('aria-expanded', 'false');
  await expectImagesToDecode(page);
  await page.waitForTimeout(900);

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

  const heroAlignment = await page.evaluate(() => {
    const center = (selector: string) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) throw new Error(`Missing ${selector}`);
      const rect = element.getBoundingClientRect();
      return rect.left + rect.width / 2;
    };

    return {
      intro: center('.coh-hero-intro'),
      wordmark: center('.coh-hero-wordmark'),
      portrait: center('.coh-portrait-wrap'),
      actions: center('.coh-hero-actions'),
    };
  });
  for (const [element, center] of Object.entries(heroAlignment)) {
    expect(Math.abs(center - heroAlignment.portrait), `${element} should share the portrait center axis`).toBeLessThanOrEqual(2);
  }

  const portraitFraming = await page.locator('.coh-portrait-wrap').evaluate((portrait) => {
    const image = portrait.querySelector('img');
    if (!(image instanceof HTMLImageElement)) throw new Error('Hero portrait image is missing');
    const rect = portrait.getBoundingClientRect();
    return {
      ratio: rect.height / rect.width,
      objectPosition: getComputedStyle(image).objectPosition,
    };
  });
  expect(portraitFraming.ratio).toBeGreaterThan(1.28);
  expect(portraitFraming.ratio).toBeLessThan(1.5);
  expect(portraitFraming.objectPosition).toBe('50% 43%');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(blocking).toEqual([]);

  runtime.assertClean();
});

test('cohesion hero copy stays contained and section 02 reveals the system stack', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 740 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const heroContainment = await page.evaluate(() => {
    const container = document.querySelector('.coh-hero-intro');
    const heading = document.querySelector('.coh-hero-intro h1');
    const eyebrow = document.querySelector('.coh-hero-eyebrow');
    const summary = document.querySelector('.coh-hero-summary');
    if (!(container instanceof HTMLElement) || !(heading instanceof HTMLElement) || !(eyebrow instanceof HTMLElement) || !(summary instanceof HTMLElement)) {
      throw new Error('Hero positioning elements are missing');
    }
    const containerRect = container.getBoundingClientRect();
    const measurements = [eyebrow, heading, summary].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        leftInset: rect.left - containerRect.left,
        rightInset: containerRect.right - rect.right,
        inlineOverflow: element.scrollWidth - element.clientWidth,
      };
    });
    return { measurements, top: containerRect.top, bottom: containerRect.bottom };
  });

  expect(heroContainment.top).toBeGreaterThanOrEqual(70);
  expect(heroContainment.bottom).toBeLessThanOrEqual(340);
  for (const measurement of heroContainment.measurements) {
    expect(measurement.inlineOverflow, 'hero copy should not overflow its own box').toBeLessThanOrEqual(1);
    expect(measurement.leftInset, 'hero copy should stay inside the left edge').toBeGreaterThanOrEqual(-1);
    expect(measurement.rightInset, 'hero copy should stay inside the right edge').toBeGreaterThanOrEqual(-1);
  }

  const focusTransition = await page.evaluate(() => {
    const section = document.querySelector('#focus');
    const heading = document.querySelector('.coh-focus-heading');
    const cue = document.querySelector('.coh-focus-cue');
    const firstCard = document.querySelector('#focus-system-01');
    if (!(section instanceof HTMLElement) || !(heading instanceof HTMLElement) || !(cue instanceof HTMLElement) || !(firstCard instanceof HTMLElement)) {
      throw new Error('Focus transition elements are missing');
    }
    section.scrollIntoView({ behavior: 'instant' });
    const headingRect = heading.getBoundingClientRect();
    const cueRect = cue.getBoundingClientRect();
    const cardRect = firstCard.getBoundingClientRect();
    const cueTitle = cue.querySelector('.coh-focus-cue-copy strong');
    const stepLabel = cue.querySelector('.coh-focus-cue-steps span');
    const cueArrow = cue.querySelector('.coh-focus-cue-arrow');
    if (!(cueTitle instanceof HTMLElement) || !(stepLabel instanceof HTMLElement) || !(cueArrow instanceof HTMLElement)) {
      throw new Error('Focus cue typography is missing');
    }
    return {
      cueInsideHeading: cueRect.bottom <= headingRect.bottom + 1,
      visibleCardDepth: window.innerHeight - cardRect.top,
      cueTitleSize: Number.parseFloat(getComputedStyle(cueTitle).fontSize),
      stepLabelSize: Number.parseFloat(getComputedStyle(stepLabel).fontSize),
      arrowSize: cueArrow.getBoundingClientRect().width,
    };
  });

  expect(focusTransition.cueInsideHeading).toBe(true);
  expect(focusTransition.visibleCardDepth).toBeGreaterThanOrEqual(80);
  expect(focusTransition.cueTitleSize).toBeGreaterThanOrEqual(20);
  expect(focusTransition.stepLabelSize).toBeGreaterThanOrEqual(12);
  expect(focusTransition.arrowSize).toBeGreaterThanOrEqual(60);
});

test('legacy Cohesion URL preserves section context on the main portfolio', async ({ page }) => {
  await page.goto('/cohesion/#work', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.locator('#work')).toBeVisible();
});
