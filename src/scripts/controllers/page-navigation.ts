import { animate, scroll } from 'motion';
import type { MotionControllerFactory } from '../core/controller';

const ease = [0.2, 0.75, 0.25, 1] as const;

export const createPageNavigationController: MotionControllerFactory = (root, context) => {
  const nav = root;
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-nav]'));
  const indicator = nav.querySelector<HTMLElement>('.chapter-nav-indicator');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  const progressBar = document.querySelector<HTMLElement>('#page-progress-bar');
  const compactNavQuery = context.window.matchMedia('(max-width: 1000px)');
  let activeId = sections[0]?.id ?? '';
  let indicatorAnimation: ReturnType<typeof animate> | undefined;
  let indicatorFrame = 0;
  let centerFrame = 0;

  const updateOverflowState = () => {
    const remaining = nav.scrollWidth - nav.clientWidth - nav.scrollLeft;
    nav.classList.toggle('can-scroll-right', compactNavQuery.matches && remaining > 2);
  };

  const centerActiveLink = (link: HTMLAnchorElement | undefined, instant = false) => {
    if (!link) return;
    cancelAnimationFrame(centerFrame);
    centerFrame = requestAnimationFrame(() => {
      if (!compactNavQuery.matches) {
        if (nav.scrollLeft) nav.scrollTo({ left: 0, behavior: 'auto' });
        updateOverflowState();
        return;
      }

      const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
      const centered = link.offsetLeft + (link.offsetWidth / 2) - (nav.clientWidth / 2);
      const nextLeft = Math.max(0, Math.min(centered, maxScroll));
      if (Math.abs(nav.scrollLeft - nextLeft) > 1) {
        nav.scrollTo({
          left: nextLeft,
          behavior: instant || context.reduced() ? 'auto' : 'smooth',
        });
      }
      updateOverflowState();
    });
  };

  const positionIndicator = (link: HTMLAnchorElement | undefined, instant = false) => {
    if (!indicator || !link) return;
    cancelAnimationFrame(indicatorFrame);
    indicatorFrame = requestAnimationFrame(() => {
      const x = link.offsetLeft;
      const width = `${link.offsetWidth}px`;
      indicatorAnimation?.stop();
      if (instant || context.reduced() || !nav.classList.contains('is-ready')) {
        indicator.style.width = width;
        indicator.style.transform = `translate3d(${x}px, 0, 0)`;
      } else {
        indicatorAnimation = animate(indicator, { x, width }, { duration: 0.42, ease });
      }
      nav.classList.add('is-ready');
    });
  };

  const setActive = (id: string, instant = false) => {
    if (!id) return;
    activeId = id;
    let activeLink: HTMLAnchorElement | undefined;
    for (const link of links) {
      const active = link.dataset.nav === id;
      link.toggleAttribute('aria-current', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
        activeLink = link;
      }
    }
    positionIndicator(activeLink, instant);
    centerActiveLink(activeLink, instant);
  };

  const initialHash = window.location.hash.slice(1);
  if (sections.some((section) => section.id === initialHash)) activeId = initialHash;
  setActive(activeId, true);

  const observer = new IntersectionObserver(
    (entries) => {
      const activationLine = window.innerHeight * 0.42;
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (left, right) =>
            Math.abs(left.boundingClientRect.top - activationLine) -
            Math.abs(right.boundingClientRect.top - activationLine),
        );
      const next = visible[0]?.target;
      if (next instanceof HTMLElement) setActive(next.id);
    },
    { rootMargin: '-39% 0px -56% 0px', threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));

  const stopProgress = progressBar
    ? scroll((progress: number) => {
        progressBar.style.transform = `scaleX(${Math.max(0, Math.min(progress, 1)).toFixed(4)})`;
      })
    : () => {};

  for (const link of links) {
    link.addEventListener('click', () => setActive(link.dataset.nav ?? ''), { signal: context.signal });
  }
  nav.addEventListener('scroll', updateOverflowState, { passive: true, signal: context.signal });
  compactNavQuery.addEventListener('change', () => {
    centerActiveLink(links.find((link) => link.dataset.nav === activeId), true);
  }, { signal: context.signal });

  const resizeObserver = new ResizeObserver(() => {
    const activeLink = links.find((link) => link.dataset.nav === activeId);
    positionIndicator(activeLink, true);
    centerActiveLink(activeLink, true);
  });
  resizeObserver.observe(nav);
  links.forEach((link) => resizeObserver.observe(link));
  void document.fonts?.ready.then(() => {
    if (context.signal.aborted) return;
    const activeLink = links.find((link) => link.dataset.nav === activeId);
    positionIndicator(activeLink, true);
    centerActiveLink(activeLink, true);
  });

  const stopPreference = context.onPreferenceChange((reduced) => {
    if (reduced) indicatorAnimation?.complete();
    if (reduced) centerActiveLink(links.find((link) => link.dataset.nav === activeId), true);
  });

  return () => {
    cancelAnimationFrame(indicatorFrame);
    cancelAnimationFrame(centerFrame);
    observer.disconnect();
    resizeObserver.disconnect();
    stopProgress();
    stopPreference();
    indicatorAnimation?.stop();
    nav.classList.remove('can-scroll-right');
    indicator?.style.removeProperty('transform');
    indicator?.style.removeProperty('width');
  };
};

export default createPageNavigationController;
