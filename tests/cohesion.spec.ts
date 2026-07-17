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
  await expect(page.locator('#home > .coh-identity-header')).toHaveCount(1);
  await expect(page.locator('#home > .coh-topbar')).toHaveCount(1);
  await expect(page.locator('.coh-domain-cloud, .coh-domain-token')).toHaveCount(0);
  await expect(page.locator('.coh-capability-halo, [data-coh-hero-icon]')).toHaveCount(0);
  await expect(page.locator('.coh-hero-wordmark-track')).toHaveCount(1);
  await expect(page.locator('.coh-hero-wordmark-group')).toHaveCount(2);
  await expect(page.locator('.coh-intro-greeting')).toHaveText('Hi, I’m Neel.');
  await expect(page.locator('.coh-role-line')).toContainText('I build');
  await expect(page.locator('[data-role-cycle]')).toHaveText('conversion engines');
  await expect(page.locator('.coh-portrait-flip-hint')).toHaveCount(0);
  await expect(page.locator('.coh-hero-capability')).toHaveCount(4);
  await expect(page.locator('.coh-hero-capability-front > i')).toHaveCount(4);
  await expect(page.locator('.coh-hero-capability-back')).toHaveCount(4);
  await expect(page.locator('.coh-hero-capability-back > i')).toHaveCount(0);
  await expect(page.locator('.coh-hero-capability-back').first()).toContainText('one measurable growth system');
  await expect(page.locator('#home .coh-hero-actions, #home .coh-hero-cta, #home .coh-hero-secondary')).toHaveCount(0);
  await expect(page.locator('#home a[href*="Resume"]')).toHaveCount(0);
  await expect(page.locator('.coh-hero-next-cta')).toHaveAttribute('href', '#about');
  await expect(page.locator('.coh-hero-next-cta')).toContainText('Explore how I lead');
  await expect(page.locator('.coh-hero-next-cta')).toContainText('Continue to About');

  await expect(page.locator('#work .coh-work-card')).toHaveCount(0);
  await expect(page.locator('.coh-work-tile')).toHaveCount(6);
  await expect(page.locator('.coh-work-tile [data-company-brand]')).toHaveCount(6);
  await expect(page.locator('.coh-work-tile a[href="/work/growth-system/"]')).toHaveCount(1);
  await expect(page.locator('.coh-work-all')).toHaveAttribute('href', '/work/');
  await expect(page.locator('.coh-work-all')).toContainText('View all six case studies');
  await expect(page.locator('.coh-build-card')).toHaveCount(6);
  await expect(page.locator('.coh-build-card').filter({ hasText: 'HabitFlow' })).toHaveAttribute('href', 'https://github.com/neeljaiswal90/habitflow');
  await expect(page.locator('.coh-build-card').filter({ hasText: 'Fitness App' })).toHaveAttribute('href', 'https://neeltraining.lovable.app/');
  await expect(page.locator('article.coh-build-card.is-private')).toHaveCount(2);
  await expect(page.locator('.coh-build-card').filter({ hasText: 'Orderflow' })).toContainText('Private build');
  await expect(page.locator('.coh-build-card').filter({ hasText: 'Stocks Screener' })).toContainText('Private build');
  await expect(page.locator('.coh-build-card').filter({ hasText: 'TradingView MCP' })).toHaveCount(0);
  await expect(page.locator('.coh-tool-grid li')).toHaveCount(27);
  await expect(page.locator('.coh-stack-heading h2')).toHaveText('Tools I use.');
  await expect(page.locator('.coh-stack-heading > span')).toHaveText('27 public tools across product, design, data, and delivery.');
  await expect(page.locator('.coh-stack-heading')).not.toContainText('Depth before logo count');
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
  await expect(page.locator('.coh-award-record')).toHaveAttribute('href', /jdpower\.com/);
  await expect(page.locator('.coh-award-record img')).toHaveAttribute('src', '/assets/jd-power-2023-purchase-experience-award.webp');
  await expect(page.locator('.coh-award-record img')).toHaveAttribute('alt', /2023 J\.D\. Power.*Mint Mobile/i);
  await expect(page.locator('.coh-award-copy h2')).toContainText('#1 in value MVNO purchase experience.');
  await expect(page.locator('.coh-proof-stat')).toHaveCount(3);
  await expect(page.locator('.coh-proof-banner')).not.toContainText('Operating range');
  await expect(page.locator('.coh-proof-stat.is-sample')).toContainText('14,519');
  await expect(page.locator('.coh-proof-stat.is-sample')).toContainText('Customer responses across four purchase channels');
  await expect(page.locator('.coh-about-card')).toHaveCount(3);
  await expect(page.locator('#about .coh-focus-metrics > div')).toHaveCount(6);
  await expect(page.locator('.coh-orbit-card')).toHaveCount(0);
  await expect(page.locator('#home .coh-orbit-card')).toHaveCount(0);
  await expect(page.locator('.coh-about-heading h2')).toHaveText('How I lead.');
  await expect(page.locator('.coh-about-heading > span')).toHaveText('Portfolio ownership, evidence-led decisions, and applied AI.');
  await expect(page.locator('.coh-focus-heading h2')).toHaveText('Systems built to perform.');
  await expect(page.locator('.coh-work-heading h2')).toHaveText('Explore the work.');
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
  await expect(portraitFlip).toHaveAttribute('aria-pressed', 'false');
  if (testInfo.project.name === 'mobile-chromium') {
    await portraitFlip.click({ force: true });
    await expect(portraitFlip).toHaveAttribute('aria-pressed', 'true');
    await expect(portraitFlip).toHaveClass(/is-flipped/);
    await portraitFlip.click({ force: true });
  } else {
    await portraitFlip.hover({ force: true });
    await expect(portraitFlip).toHaveAttribute('aria-pressed', 'true');
    await expect(portraitFlip).toHaveClass(/is-flipped/);
    await page.mouse.move(0, 0);
  }
  await expect(portraitFlip).toHaveAttribute('aria-pressed', 'false');

  await portraitFlip.focus();
  await portraitFlip.press('Enter');
  await expect(portraitFlip).toHaveAttribute('aria-pressed', 'true');
  await portraitFlip.press('Enter');
  await expect(portraitFlip).toHaveAttribute('aria-pressed', 'false');
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
      intro: center('.coh-identity-header'),
      wordmark: center('.coh-hero-wordmark'),
      portrait: center('.coh-portrait-wrap'),
      nextCta: center('.coh-hero-next-cta'),
    };
  });
  for (const [element, center] of Object.entries(heroAlignment)) {
    expect(Math.abs(center - heroAlignment.portrait), `${element} should share the portrait center axis`).toBeLessThanOrEqual(2);
  }

  const heroConnection = await page.evaluate(() => {
    const hero = document.querySelector('.coh-hero');
    const portrait = document.querySelector('.coh-portrait-wrap');
    const proof = document.querySelector('.coh-hero-proof');
    const aboutHeading = document.querySelector('.coh-about-heading');
    const identity = document.querySelector('.coh-identity-header');
    if (!(hero instanceof HTMLElement) || !(portrait instanceof HTMLElement) || !(proof instanceof HTMLElement) || !(aboutHeading instanceof HTMLElement) || !(identity instanceof HTMLElement)) {
      throw new Error('Integrated hero elements are missing');
    }
    const heroRect = hero.getBoundingClientRect();
    const portraitRect = portrait.getBoundingClientRect();
    const proofRect = proof.getBoundingClientRect();
    const aboutRect = aboutHeading.getBoundingClientRect();
    const identityStyle = getComputedStyle(identity);
    return {
      portraitToProof: proofRect.top - portraitRect.bottom,
      heroToAbout: aboutRect.top - heroRect.bottom,
      headerRadius: Number.parseFloat(identityStyle.borderTopLeftRadius),
      headerShadow: identityStyle.boxShadow,
    };
  });
  expect(heroConnection.portraitToProof).toBeGreaterThanOrEqual(0);
  expect(heroConnection.portraitToProof).toBeLessThanOrEqual(120);
  expect(heroConnection.heroToAbout).toBeLessThanOrEqual(110);
  expect(heroConnection.headerRadius).toBeGreaterThanOrEqual(24);
  expect(heroConnection.headerShadow).not.toBe('none');

  const interactionLayout = await page.evaluate(() => {
    const nav = document.querySelector(window.innerWidth <= 680 ? '.coh-mobile-nav' : '.coh-pill-nav');
    const nextCta = document.querySelector('.coh-hero-next-cta');
    const leadership = document.querySelector('.coh-about-card');
    if (!(nav instanceof HTMLElement) || !(nextCta instanceof HTMLElement) || !(leadership instanceof HTMLElement)) {
      throw new Error('Interaction layout elements are missing');
    }
    const navRect = nav.getBoundingClientRect();
    const nextCtaRect = nextCta.getBoundingClientRect();
    return {
      navTop: navRect.top,
      viewportHeight: window.innerHeight,
      nextCtaOverlapsNav: nextCtaRect.bottom > navRect.top && nextCtaRect.top < navRect.bottom,
      leadershipPosition: getComputedStyle(leadership).position,
    };
  });
  if (testInfo.project.name === 'mobile-chromium') {
    expect(interactionLayout.navTop).toBeGreaterThan(interactionLayout.viewportHeight * 0.8);
    expect(interactionLayout.nextCtaOverlapsNav).toBe(false);
    expect(interactionLayout.leadershipPosition).toBe('static');
  } else {
    expect(interactionLayout.leadershipPosition).toBe('sticky');
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
  expect(portraitFraming.objectPosition).toBe('52% 50%');

  const results = await new AxeBuilder({ page })
    .exclude('.coh-focus-number')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(blocking).toEqual([]);

  runtime.assertClean();
});

test('hero capability cards reveal their context without clipping', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const cards = page.locator('[data-coh-capability]');
  const firstCard = cards.first();
  const firstInner = firstCard.locator('.coh-hero-capability-inner');
  await expect(cards).toHaveCount(4);

  if (testInfo.project.name === 'mobile-chromium') {
    await firstCard.click({ force: true });
    await expect(firstCard).toHaveAttribute('aria-pressed', 'true');
    await expect(firstCard).toHaveClass(/is-flipped/);
    await firstCard.click({ force: true });
    await expect(firstCard).toHaveAttribute('aria-pressed', 'false');
  } else {
    await firstCard.hover({ force: true });
    await expect.poll(() => firstInner.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');
    await page.mouse.move(0, 0);
  }

  await firstCard.focus();
  await firstCard.press('Enter');
  await expect(firstCard).toHaveAttribute('aria-pressed', 'true');
  await firstCard.press('Enter');
  await expect(firstCard).toHaveAttribute('aria-pressed', 'false');

  const faces = await page.locator('.coh-hero-capability-face').evaluateAll((elements) => elements.map((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  })));
  expect(faces).toHaveLength(8);
  for (const face of faces) {
    expect(face.scrollHeight).toBeLessThanOrEqual(face.clientHeight + 1);
    expect(face.scrollWidth).toBeLessThanOrEqual(face.clientWidth + 1);
  }

  const contrastPairs = await page.locator('.coh-hero-capability-back').evaluateAll((elements) => elements.flatMap((face) => {
    const background = getComputedStyle(face).backgroundColor;
    return Array.from(face.querySelectorAll('small, strong, em')).map((copy) => ({
      background,
      foreground: getComputedStyle(copy).color,
    }));
  }));
  const luminance = (color: string) => {
    const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
    if (channels.length !== 3) throw new Error(`Unable to parse color: ${color}`);
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
  };
  for (const pair of contrastPairs) {
    const lighter = Math.max(luminance(pair.background), luminance(pair.foreground));
    const darker = Math.min(luminance(pair.background), luminance(pair.foreground));
    expect((lighter + 0.05) / (darker + 0.05)).toBeGreaterThanOrEqual(4.5);
  }
});

test('desktop case-study tiles flip for hover and keyboard focus without trapping navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Desktop-only flip treatment');
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const firstTile = page.locator('.coh-work-tile').first();
  const firstLink = firstTile.locator('a');
  const inner = firstTile.locator('.coh-work-tile-inner');
  await firstTile.scrollIntoViewIfNeeded();
  await firstLink.hover();
  await expect.poll(() => inner.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

  await page.mouse.move(0, 0);
  await firstLink.focus();
  await expect.poll(() => inner.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');
  await expect(firstLink).toHaveAttribute('href', '/work/growth-system/');
});

test('case-study preview faces keep every title, summary, outcome, and link inside the tile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Mobile links directly from the compact front face');
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const faces = await page.locator('.coh-work-tile-back').evaluateAll((elements) => elements.map((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  })));
  expect(faces).toHaveLength(6);
  for (const face of faces) {
    expect(face.scrollHeight).toBeLessThanOrEqual(face.clientHeight + 1);
    expect(face.scrollWidth).toBeLessThanOrEqual(face.clientWidth + 1);
  }
});

test('cohesion hero copy stays contained and section 02 reveals the system stack', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 740 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const heroContainment = await page.evaluate(() => {
    const container = document.querySelector('.coh-identity-header');
    const heading = document.querySelector('.coh-identity-header h1');
    const greeting = document.querySelector('.coh-intro-greeting');
    const role = document.querySelector('.coh-role-line');
    if (!(container instanceof HTMLElement) || !(heading instanceof HTMLElement) || !(greeting instanceof HTMLElement) || !(role instanceof HTMLElement)) {
      throw new Error('Hero positioning elements are missing');
    }
    const containerRect = container.getBoundingClientRect();
    const measurements = [heading, greeting, role].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        leftInset: rect.left - containerRect.left,
        rightInset: containerRect.right - rect.right,
        inlineOverflow: element.scrollWidth - element.clientWidth,
      };
    });
    return { measurements, top: containerRect.top, bottom: containerRect.bottom };
  });

  expect(heroContainment.top).toBeGreaterThanOrEqual(0);
  expect(heroContainment.bottom).toBeLessThanOrEqual(80);
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
  expect(focusTransition.visibleCardDepth).toBeGreaterThanOrEqual(60);
  expect(focusTransition.cueTitleSize).toBeGreaterThanOrEqual(20);
  expect(focusTransition.stepLabelSize).toBeGreaterThanOrEqual(12);
  expect(focusTransition.arrowSize).toBeGreaterThanOrEqual(60);
});

test('rotating identity header hands off to navigation after scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const root = page.locator('html');
  const identity = page.locator('[data-coh-identity-header]');
  const navigation = page.locator('[data-coh-nav-header]');

  await expect(root).not.toHaveClass(/coh-nav-active/);
  await expect(identity).toHaveAttribute('aria-hidden', 'false');
  await expect(navigation).toHaveAttribute('aria-hidden', 'true');
  await expect(navigation).toHaveAttribute('inert', '');

  await page.evaluate(() => window.scrollTo({ top: 180, behavior: 'instant' }));
  await expect(root).toHaveClass(/coh-nav-active/);
  await expect(identity).toHaveAttribute('aria-hidden', 'true');
  await expect(navigation).toHaveAttribute('aria-hidden', 'false');
  await expect(navigation).not.toHaveAttribute('inert', '');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(root).not.toHaveClass(/coh-nav-active/);
  await expect(identity).toHaveAttribute('aria-hidden', 'false');
  await expect(navigation).toHaveAttribute('aria-hidden', 'true');
});

test('page uses natural scrolling with curated journey stops', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const scrolling = await page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-coh-snap]'));
    const wheel = new WheelEvent('wheel', { deltaY: 2_400, cancelable: true });
    window.dispatchEvent(wheel);
    return {
      type: getComputedStyle(document.documentElement).scrollSnapType,
      targetCount: targets.length,
      alignments: targets.map((target) => getComputedStyle(target).scrollSnapAlign),
      wheelPrevented: wheel.defaultPrevented,
    };
  });

  expect(scrolling.targetCount).toBeGreaterThanOrEqual(13);
  expect(scrolling.type).toBe('none');
  expect(scrolling.alignments.every((alignment) => alignment === 'none')).toBe(true);
  expect(scrolling.wheelPrevented).toBe(false);
  await expect(page.locator('[data-coh-journey]')).toHaveCount(18);
  await expect(page.locator('[data-coh-focus-nav]')).toHaveCount(0);
});

test('hero and global arrows move one component at a time', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Mobile uses one bottom chapter dock instead of competing floating arrows');
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const heroNext = page.locator('[data-coh-hero-next]');
  const navigation = page.locator('[data-coh-journey-nav]');
  const previous = navigation.locator('[data-coh-journey-previous]');
  const next = navigation.locator('[data-coh-journey-next]');

  await expect(heroNext).toBeVisible();
  await expect(navigation).toHaveAttribute('aria-hidden', 'true');
  await expect(navigation).toHaveAttribute('inert', '');

  await heroNext.click({ force: true });
  await expect(navigation).toHaveAttribute('data-active-index', '1');
  await expect(navigation).toBeVisible();
  await expect(navigation.locator('[data-coh-journey-label]')).toHaveText('About');
  await expect(navigation.locator('[data-coh-journey-progress]')).toHaveText('01 / 17');

  await next.click();
  await expect(navigation).toHaveAttribute('data-active-index', '2');
  await expect(navigation.locator('[data-coh-journey-label]')).toHaveText('Portfolio leadership');

  await previous.click();
  await expect(navigation).toHaveAttribute('data-active-index', '1');

  await page.locator('.coh-focus-heading').evaluate((heading) => heading.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(navigation).toHaveAttribute('data-active-index', '7');
  await next.click();
  await expect(navigation).toHaveAttribute('data-active-index', '8');
  await next.click();
  await expect(navigation).toHaveAttribute('data-active-index', '9');
  await expect(navigation.locator('[data-coh-journey-label]')).toContainText('02 ·');

  await page.locator('#contact').evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(navigation).toHaveAttribute('data-active-index', '17');
  await expect(next).toBeDisabled();
  await expect(previous).toBeEnabled();
});

test('journey arrows traverse every component forward and backward', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Desktop-only journey navigator');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const navigation = page.locator('[data-coh-journey-nav]');
  const previous = navigation.locator('[data-coh-journey-previous]');
  const next = navigation.locator('[data-coh-journey-next]');

  await page.locator('[data-coh-hero-next]').click({ force: true });
  await expect(navigation).toHaveAttribute('data-active-index', '1');

  for (let target = 2; target <= 17; target += 1) {
    await next.click();
    await expect(navigation).toHaveAttribute('data-active-index', String(target));
  }

  for (let target = 16; target >= 0; target -= 1) {
    await previous.click({ force: true });
    await expect(navigation).toHaveAttribute('data-active-index', String(target));
  }

  const navigatorDesign = await navigation.evaluate((element) => {
    const previousButton = element.querySelector('[data-coh-journey-previous]');
    const nextButton = element.querySelector('[data-coh-journey-next]');
    if (!(previousButton instanceof HTMLElement) || !(nextButton instanceof HTMLElement)) {
      throw new Error('Journey navigation buttons are missing');
    }
    return {
      width: element.getBoundingClientRect().width,
      background: getComputedStyle(element).backgroundColor,
      previousBackground: getComputedStyle(previousButton).backgroundColor,
      nextBackground: getComputedStyle(nextButton).backgroundColor,
    };
  });
  expect(navigatorDesign.width).toBeLessThanOrEqual(60);
  expect(navigatorDesign.background).toBe('rgba(0, 0, 0, 0)');
  expect(navigatorDesign.previousBackground).not.toBe(navigatorDesign.nextBackground);
});

test('about cards use the guided system-card pattern without clipping evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1584, height: 1136 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const layout = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.coh-about-card'));
    const metrics = Array.from(document.querySelectorAll<HTMLElement>('.coh-about-card .coh-focus-metrics > div'));
    if (cards.length !== 3 || metrics.length !== 6) {
      throw new Error('About composition is incomplete');
    }
    return {
      viewportWidth: window.innerWidth,
      cards: cards.map((card) => ({
        width: card.getBoundingClientRect().width,
        position: getComputedStyle(card).position,
      })),
      metrics: metrics.map((metric) => {
        const rect = metric.getBoundingClientRect();
        const cardRect = metric.closest('.coh-about-card')?.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          insideCard: Boolean(cardRect && rect.left >= cardRect.left && rect.right <= cardRect.right),
          horizontalOverflow: metric.scrollWidth - metric.clientWidth,
          verticalOverflow: metric.scrollHeight - metric.clientHeight,
        };
      }),
    };
  });

  for (const card of layout.cards) {
    expect(card.width).toBeGreaterThan(900);
    expect(card.position).toBe('sticky');
  }
  for (const metric of layout.metrics) {
    expect(metric.left).toBeGreaterThanOrEqual(0);
    expect(metric.right).toBeLessThanOrEqual(layout.viewportWidth);
    expect(metric.insideCard).toBe(true);
    expect(metric.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(metric.verticalOverflow).toBeLessThanOrEqual(1);
  }
});

test('portrait demonstrates its flip once and settles on the front', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const portrait = page.locator('[data-coh-portrait-flip]');

  if (testInfo.project.name === 'reduced-motion') {
    await expect(portrait).toHaveAttribute('data-intro-flip', 'complete');
  } else {
    await expect(portrait).toHaveAttribute('data-intro-flip', 'preview', { timeout: 1_200 });
    await expect(portrait).toHaveAttribute('data-intro-flip', 'complete', { timeout: 2_200 });
  }

  await expect(portrait).toHaveAttribute('aria-pressed', 'false');
  await expect(portrait.locator('.coh-portrait-front')).toHaveAttribute('aria-hidden', 'false');
  await expect(portrait.locator('.coh-portrait-back')).toHaveAttribute('aria-hidden', 'true');
  await expect(portrait.locator('.coh-portrait-back')).toContainText('Senior product leadership');
  await expect(portrait.locator('.coh-portrait-back')).toContainText('Complex portfolios. Clear decisions. Measurable growth.');
  await expect(portrait.locator('.coh-portrait-back')).toContainText('Ecommerce · 0-to-1 products · applied AI');
  await expect(portrait.locator('.coh-portrait-back')).not.toContainText('Product systems that grow.');

  const image = portrait.locator('.coh-portrait-front img');
  await expect(portrait.locator('.coh-portrait-front picture')).toHaveCount(1);
  await expect(portrait.locator('.coh-portrait-front source[type="image/avif"]')).toHaveAttribute('srcset', /headshot-320\.avif/);
  await expect(portrait.locator('.coh-portrait-front source[type="image/webp"]')).toHaveAttribute('srcset', /headshot-320\.webp/);
  await expect(image).toHaveAttribute('src', '/assets/headshot-870.webp');
  await expect(image).toHaveAttribute('width', '870');
  await expect(image).toHaveAttribute('height', '906');
  await expect(image).toHaveCSS('object-position', '52% 50%');
});

test('contact section provides social links, résumé download, and inbox form', async ({ page }) => {
  await page.route('https://formsubmit.co/ajax/**', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const contact = page.locator('#contact');
  await contact.evaluate((section) => section.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForTimeout(850);
  await expect(contact.getByRole('heading', { level: 2 })).toContainText('You’re looking to grow your product.');
  await expect(contact.getByRole('heading', { level: 2 })).toContainText('Let’s build what’s next.');
  await expect(contact.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', /linkedin\.com\/in\/neelesh-jaiswal/);
  await expect(contact.getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', /github\.com\/neeljaiswal90/);
  await expect(contact.getByRole('link', { name: /Download résumé/i })).toHaveAttribute('download', 'Neelesh_Jaiswal_Resume.pdf');

  const form = contact.locator('[data-coh-contact-form]');
  await form.getByLabel('Name').fill('Portfolio Visitor');
  await form.getByLabel('Email').fill('visitor@example.com');
  await form.getByLabel(/Company/).fill('Example Co');
  await form.getByLabel('What can I help with?').fill('I would like to discuss a product leadership opportunity.');
  const submit = form.getByRole('button', { name: 'Send message' });
  await submit.evaluate((button) => button.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await submit.click({ force: true });
  await expect(form.locator('[data-coh-contact-status]')).toHaveText('Thanks — your message is on its way.');
  await expect(form).toHaveAttribute('data-state', 'success');
});

test('legacy Cohesion URL preserves section context on the main portfolio', async ({ page }) => {
  await page.goto('/cohesion/#work', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.locator('#work')).toBeVisible();
});
