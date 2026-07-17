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
  await expect(page.locator('.coh-hero-wordmark-track')).toHaveCount(1);
  await expect(page.locator('.coh-hero-wordmark-group')).toHaveCount(2);
  await expect(page.locator('.coh-intro-greeting')).toHaveText('Hi, I’m Neel.');
  await expect(page.locator('.coh-role-line')).toContainText('I build');
  await expect(page.locator('[data-role-cycle]')).toHaveText('conversion engines');
  await expect(page.locator('.coh-portrait-flip-hint')).toHaveCount(0);

  await expect(page.locator('.coh-work-card')).toHaveCount(6);
  await expect(page.locator('.coh-work-card [data-company-brand]')).toHaveCount(6);
  await expect(page.locator('.coh-build-card')).toHaveCount(6);
  await expect(page.locator('.coh-build-card').filter({ hasText: 'HabitFlow' })).toHaveAttribute('href', 'https://github.com/neeljaiswal90/habitflow');
  await expect(page.locator('.coh-build-card').filter({ hasText: 'Fitness App' })).toHaveAttribute('href', 'https://neeltraining.lovable.app/');
  await expect(page.locator('article.coh-build-card.is-private')).toHaveCount(2);
  await expect(page.locator('.coh-build-card').filter({ hasText: 'Orderflow' })).toContainText('Private build');
  await expect(page.locator('.coh-build-card').filter({ hasText: 'Stocks Screener' })).toContainText('Private build');
  await expect(page.locator('.coh-build-card').filter({ hasText: 'TradingView MCP' })).toHaveCount(0);
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
      actions: center('.coh-hero-actions'),
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
  expect(heroConnection.headerRadius).toBe(0);
  expect(heroConnection.headerShadow).toBe('none');

  const interactionLayout = await page.evaluate(() => {
    const nav = document.querySelector('.coh-pill-nav');
    const actions = document.querySelector('.coh-hero-actions');
    const leadership = document.querySelector('.coh-story-card.is-leadership');
    if (!(nav instanceof HTMLElement) || !(actions instanceof HTMLElement) || !(leadership instanceof HTMLElement)) {
      throw new Error('Interaction layout elements are missing');
    }
    const navRect = nav.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    return {
      navTop: navRect.top,
      viewportHeight: window.innerHeight,
      actionsOverlapNav: actionsRect.bottom > navRect.top && actionsRect.top < navRect.bottom,
      leadershipPosition: getComputedStyle(leadership).position,
    };
  });
  if (testInfo.project.name === 'mobile-chromium') {
    expect(interactionLayout.navTop).toBeGreaterThan(interactionLayout.viewportHeight * 0.8);
    expect(interactionLayout.actionsOverlapNav).toBe(false);
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

test('page settles scrolling on narrative component boundaries', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const snapping = await page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-coh-snap]'));
    return {
      type: getComputedStyle(document.documentElement).scrollSnapType,
      targetCount: targets.length,
      alignments: targets.map((target) => getComputedStyle(target).scrollSnapAlign),
      stops: targets.map((target) => getComputedStyle(target).scrollSnapStop),
    };
  });

  expect(snapping.targetCount).toBeGreaterThanOrEqual(18);
  expect(snapping.alignments.every((alignment) => alignment === 'start')).toBe(true);
  await expect(page.locator('.coh-focus-card[data-coh-snap]')).toHaveCount(0);
  const storyStops = await page.locator('.coh-story-step').evaluateAll((steps) => steps.map((step) => getComputedStyle(step).scrollSnapStop));
  expect(storyStops).toEqual(['always', 'always', 'always']);
  expect(snapping.stops.every((stop) => stop === 'normal' || stop === 'always')).toBe(true);
  if (testInfo.project.name === 'reduced-motion') {
    expect(snapping.type).toBe('none');
  } else {
    expect(['y', 'y proximity']).toContain(snapping.type);
  }
});

test('about story rail advances one card per scroll gesture', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop wheel behavior');
  await page.setViewportSize({ width: 1060, height: 768 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const steps = page.locator('.coh-story-step');
  await expect(steps).toHaveCount(3);
  await steps.first().evaluate((step) => {
    const top = step.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'instant' });
  });
  await page.waitForTimeout(450);

  await page.mouse.wheel(0, 2_400);
  await page.waitForTimeout(900);

  const getNearestStep = () => steps.evaluateAll((items) => {
    const anchor = 100;
    const distances = items.map((item) => Math.abs(item.getBoundingClientRect().top - anchor));
    return distances.indexOf(Math.min(...distances));
  });
  expect(await getNearestStep()).toBe(1);

  await page.mouse.wheel(0, 2_400);
  await page.waitForTimeout(900);
  expect(await getNearestStep()).toBe(2);
});

test('section 02 advances through every system and offers desktop arrow navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop focus navigation behavior');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const cards = page.locator('.coh-focus-card');
  const navigation = page.locator('[data-coh-focus-nav]');
  const nextButton = navigation.locator('[data-coh-focus-next]');
  await expect(cards).toHaveCount(4);
  await cards.first().evaluate((card) => {
    const stack = card.parentElement;
    if (!(stack instanceof HTMLElement)) throw new Error('Focus stack is missing');
    const top = stack.getBoundingClientRect().top + window.scrollY + (card as HTMLElement).offsetTop - 96;
    window.scrollTo({ top, behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  const getNearestCard = () => cards.evaluateAll((items) => {
    const stack = items[0]?.parentElement;
    if (!(stack instanceof HTMLElement)) throw new Error('Focus stack is missing');
    const stackTop = stack.getBoundingClientRect().top + window.scrollY;
    const readingPosition = window.scrollY + 96;
    const distances = items.map((item) => Math.abs(stackTop + (item as HTMLElement).offsetTop - readingPosition));
    return distances.indexOf(Math.min(...distances));
  });

  await expect(navigation).toBeVisible();
  await expect(navigation.locator('[data-coh-focus-progress]')).toHaveText('01 / 04');
  expect(await getNearestCard()).toBe(0);

  await nextButton.click();
  await page.waitForTimeout(850);
  expect(await getNearestCard()).toBe(1);
  await expect(navigation.locator('[data-coh-focus-progress]')).toHaveText('02 / 04');

  await page.mouse.wheel(0, 2_400);
  await page.waitForTimeout(850);
  expect(await getNearestCard()).toBe(2);

  await nextButton.click();
  await page.waitForTimeout(850);
  expect(await getNearestCard()).toBe(3);
  await expect(navigation.locator('[data-coh-focus-progress]')).toHaveText('04 / 04');

  const lastCardTop = await cards.last().evaluate((card) => {
    const stack = card.parentElement;
    if (!(stack instanceof HTMLElement)) throw new Error('Focus stack is missing');
    return stack.getBoundingClientRect().top + window.scrollY + (card as HTMLElement).offsetTop;
  });
  await page.mouse.wheel(0, 2_400);
  await page.waitForTimeout(850);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(lastCardTop);
});

test('section 02 arrow navigation stays hidden on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile-only visibility check');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-coh-focus-nav]')).toHaveCSS('display', 'none');
});

test('about metrics remain fully visible beside the story cards', async ({ page }) => {
  await page.setViewportSize({ width: 1584, height: 1136 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const layout = await page.evaluate(() => {
    const storyCard = document.querySelector('.coh-story-card');
    const metrics = Array.from(document.querySelectorAll<HTMLElement>('.coh-about-metric'));
    if (!(storyCard instanceof HTMLElement) || metrics.length !== 6) {
      throw new Error('About composition is incomplete');
    }
    const cardRect = storyCard.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      cardWidth: cardRect.width,
      metrics: metrics.map((metric) => {
        const rect = metric.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          overlapsCard: rect.right > cardRect.left - 8 && rect.left < cardRect.right + 8,
          horizontalOverflow: metric.scrollWidth - metric.clientWidth,
          verticalOverflow: metric.scrollHeight - metric.clientHeight,
        };
      }),
    };
  });

  expect(layout.cardWidth).toBeLessThanOrEqual(852);
  for (const metric of layout.metrics) {
    expect(metric.left).toBeGreaterThanOrEqual(0);
    expect(metric.right).toBeLessThanOrEqual(layout.viewportWidth);
    expect(metric.overlapsCard).toBe(false);
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
