const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-coh-reveal]'));
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionLinks = new Map(
  Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-coh-nav]'))
    .map((link) => [link.dataset.cohNav ?? '', link] as const),
);
const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-coh-section]'));
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = (visible.target as HTMLElement).dataset.cohSection;
    sectionLinks.forEach((link, key) => link.classList.toggle('is-active', key === id));
  }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-15% 0px -55% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));
}

const identityHeader = document.querySelector<HTMLElement>('[data-coh-identity-header]');
const navHeader = document.querySelector<HTMLElement>('[data-coh-nav-header]');
let navHeaderActive: boolean | undefined;
const updateHeaderState = () => {
  if (!identityHeader || !navHeader) return;
  const switchPoint = identityHeader.offsetHeight + 32;
  const nextState = window.scrollY > switchPoint;
  if (nextState === navHeaderActive) return;
  navHeaderActive = nextState;
  root.classList.toggle('coh-nav-active', nextState);
  identityHeader.setAttribute('aria-hidden', String(nextState));
  navHeader.setAttribute('aria-hidden', String(!nextState));
  navHeader.toggleAttribute('inert', !nextState);
};

let ticking = false;
const updateScroll = () => {
  const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  root.style.setProperty('--coh-scroll', String(Math.min(1, Math.max(0, window.scrollY / range))));
  updateHeaderState();
  ticking = false;
};
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateScroll);
}, { passive: true });
updateScroll();

const storyRail = document.querySelector<HTMLElement>('.coh-story-cards');
const storySteps = Array.from(document.querySelectorAll<HTMLElement>('.coh-story-step'));
if (storyRail && storySteps.length > 1 && !reducedMotion) {
  const steppedScroll = window.matchMedia('(min-width: 681px)');
  let storyScrollLocked = false;
  let storyScrollTimer = 0;

  const storyAnchor = () => 100;
  const nearestStoryStep = () => {
    const anchor = storyAnchor();
    const distances = storySteps.map((step) => Math.abs(step.getBoundingClientRect().top - anchor));
    return distances.indexOf(Math.min(...distances));
  };
  const releaseStoryScroll = () => {
    window.clearTimeout(storyScrollTimer);
    storyScrollTimer = window.setTimeout(() => {
      storyScrollLocked = false;
    }, 700);
  };
  const moveToStoryStep = (index: number) => {
    const step = storySteps[index];
    if (!step) return;
    const top = step.getBoundingClientRect().top + window.scrollY - storyAnchor();
    window.scrollTo({ top, behavior: 'smooth' });
  };

  window.addEventListener('wheel', (event) => {
    if (!steppedScroll.matches || Math.abs(event.deltaY) < 4) return;
    const railRect = storyRail.getBoundingClientRect();
    const anchor = storyAnchor();
    const railIsActive = railRect.top <= anchor + 100 && railRect.bottom >= anchor + window.innerHeight * 0.55;
    if (!railIsActive) return;

    const currentIndex = nearestStoryStep();
    const direction = event.deltaY > 0 ? 1 : -1;
    const nextIndex = currentIndex + direction;
    const leavingRail = nextIndex < 0 || nextIndex >= storySteps.length;
    if (leavingRail) return;

    event.preventDefault();
    releaseStoryScroll();
    if (storyScrollLocked) return;
    storyScrollLocked = true;
    moveToStoryStep(nextIndex);
  }, { passive: false });
}

const hero = document.querySelector<HTMLElement>('.coh-hero');
if (hero && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--pointer-x', String((event.clientX - rect.left) / rect.width - 0.5));
    hero.style.setProperty('--pointer-y', String((event.clientY - rect.top) / rect.height - 0.5));
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--pointer-x', '0');
    hero.style.setProperty('--pointer-y', '0');
  });
}

const roleTarget = document.querySelector<HTMLElement>('[data-role-cycle]');
const roles = ['conversion engines', 'ecommerce growth systems', 'agentic AI workflows', 'AI resolution products'];
if (roleTarget && !reducedMotion) {
  let roleIndex = 0;
  let roleIsChanging = false;
  window.setInterval(async () => {
    if (document.hidden || roleIsChanging) return;
    roleIsChanging = true;
    const exit = roleTarget.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-0.55em)' }],
      { duration: 180, easing: 'ease-in', fill: 'forwards' },
    );
    try {
      await exit.finished;
      roleIndex = (roleIndex + 1) % roles.length;
      roleTarget.textContent = roles[roleIndex] ?? roles[0] ?? '';
      const enter = roleTarget.animate(
        [{ opacity: 0, transform: 'translateY(0.55em)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 280, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'forwards' },
      );
      await enter.finished;
    } catch {
      // The browser may cancel an animation when the page is backgrounded.
    } finally {
      roleIsChanging = false;
    }
  }, 2600);
}

const contactForm = document.querySelector<HTMLFormElement>('[data-coh-contact-form]');
if (contactForm) {
  const submitButton = contactForm.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = contactForm.querySelector<HTMLElement>('[data-coh-contact-submit-label]');
  const status = contactForm.querySelector<HTMLElement>('[data-coh-contact-status]');
  const initialLabel = submitLabel?.textContent ?? 'Send message';
  const returnedFromSubmission = new URLSearchParams(window.location.search).get('contact') === 'sent';

  const setFormState = (state: 'idle' | 'submitting' | 'success' | 'error', message: string) => {
    contactForm.dataset.state = state;
    if (status) status.textContent = message;
    if (submitButton) submitButton.disabled = state === 'submitting';
    if (submitLabel) submitLabel.textContent = state === 'submitting' ? 'Sending…' : initialLabel;
  };

  if (returnedFromSubmission) {
    setFormState('success', 'Thanks — your message is on its way.');
    window.history.replaceState({}, '', `${window.location.pathname}#contact`);
  }

  contactForm.addEventListener('focusin', () => root.classList.add('coh-form-active'));
  contactForm.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!contactForm.contains(document.activeElement)) root.classList.remove('coh-form-active');
    }, 0);
  });

  contactForm.addEventListener('submit', async (event) => {
    if (!contactForm.reportValidity()) return;
    const endpoint = contactForm.dataset.cohContactEndpoint;
    if (!endpoint || !window.fetch) return;

    event.preventDefault();
    setFormState('submitting', 'Sending your message…');

    try {
      const response = await window.fetch(endpoint, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Contact form returned ${response.status}`);
      contactForm.reset();
      setFormState('success', 'Thanks — your message is on its way.');
    } catch {
      setFormState('error', 'I couldn’t send that message. Please use the email link beside this form.');
    }
  });
}

const portraitFlip = document.querySelector<HTMLButtonElement>('[data-coh-portrait-flip]');
const portraitStatus = document.querySelector<HTMLElement>('[data-coh-portrait-status]');
if (portraitFlip) {
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  const portraitFront = portraitFlip.querySelector<HTMLElement>('.coh-portrait-front');
  const portraitBack = portraitFlip.querySelector<HTMLElement>('.coh-portrait-back');
  let lastPointerType = '';
  let previewTimer = 0;
  let resetTimer = 0;
  const completeIntroFlip = () => {
    window.clearTimeout(previewTimer);
    window.clearTimeout(resetTimer);
    portraitFlip.dataset.introFlip = 'complete';
  };
  const showPortraitBack = (showBack: boolean) => {
    completeIntroFlip();
    portraitFlip.classList.toggle('is-flipped', showBack);
    portraitFlip.setAttribute('aria-pressed', String(showBack));
    portraitFlip.setAttribute('aria-label', showBack
      ? 'Show Neel’s portrait'
      : 'Reveal Neel’s leadership focus');
    portraitFront?.setAttribute('aria-hidden', String(showBack));
    portraitBack?.setAttribute('aria-hidden', String(!showBack));
    if (portraitStatus) portraitStatus.textContent = showBack
      ? 'Showing what Neel builds.'
      : 'Showing Neel’s portrait.';
  };

  if (reducedMotion) {
    completeIntroFlip();
  } else {
    previewTimer = window.setTimeout(() => {
      if (portraitFlip.dataset.introFlip === 'pending') portraitFlip.dataset.introFlip = 'preview';
    }, 420);
    resetTimer = window.setTimeout(() => {
      if (portraitFlip.dataset.introFlip === 'preview') completeIntroFlip();
    }, 1550);
  }

  portraitFlip.addEventListener('pointerdown', (event) => {
    lastPointerType = event.pointerType;
    completeIntroFlip();
  });

  portraitFlip.addEventListener('mouseenter', () => {
    if (hoverCapable.matches) showPortraitBack(true);
  });
  portraitFlip.addEventListener('mouseleave', () => {
    if (hoverCapable.matches) showPortraitBack(false);
  });
  portraitFlip.addEventListener('click', (event) => {
    const keyboardActivation = event.detail === 0;
    if (hoverCapable.matches && lastPointerType === 'mouse' && !keyboardActivation) return;
    showPortraitBack(!portraitFlip.classList.contains('is-flipped'));
  });
}

const experienceItems = Array.from(document.querySelectorAll<HTMLDetailsElement>('[data-coh-experience]'));
experienceItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    experienceItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const toolFilterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-coh-tool-filter]'));
const toolCards = Array.from(document.querySelectorAll<HTMLElement>('[data-coh-tool]'));
const toolCount = document.querySelector<HTMLElement>('#coh-tool-count');
const toolAnnouncement = document.querySelector<HTMLElement>('#coh-tool-announcement');
const toolLibrary = document.querySelector<HTMLDetailsElement>('[data-coh-tool-library]');
const featuredToolCount = toolCards.filter((card) => card.hasAttribute('data-coh-tool-featured')).length;

const setToolFilter = (filter: string, label: string) => {
  let visibleCount = 0;
  toolCards.forEach((card) => {
    const groups = (card.dataset.cohToolGroups ?? '').trim().split(/\s+/);
    const visible = filter === 'all' || groups.includes(filter);
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (toolLibrary) toolLibrary.open = filter !== 'all';

  toolFilterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.cohToolFilter === filter));
  });

  if (toolCount) toolCount.textContent = filter === 'all'
    ? `${featuredToolCount} featured · ${toolCards.length} total`
    : `${visibleCount} / ${toolCards.length} tools`;
  if (toolAnnouncement) {
    toolAnnouncement.textContent = filter === 'all'
      ? `Showing ${featuredToolCount} featured tools. The complete ${toolCards.length}-tool inventory is available on demand.`
      : `Showing ${visibleCount} of ${toolCards.length} public tools in ${label}.`;
  }
};

toolFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setToolFilter(button.dataset.cohToolFilter ?? 'all', button.textContent?.trim() ?? 'all tools');
  });
});

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-coh-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}
