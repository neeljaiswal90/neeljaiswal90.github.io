import { animate, stagger } from 'motion';
import type { MotionControllerFactory } from '../core/controller';

const ease = [0.2, 0.75, 0.25, 1] as const;

export const createOutcomeExplorerController: MotionControllerFactory = (root, context) => {
  const track = root.querySelector<HTMLElement>('#work-track');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-work-slide]'));
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-work-go]'));
  const previous = root.querySelector<HTMLButtonElement>('[data-work-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-work-next]');
  const count = root.querySelector<HTMLElement>('#work-count');
  const announcement = root.querySelector<HTMLElement>('#work-announcement');
  if (!track || slides.length === 0) return;

  let activeIndex = 0;
  let sceneAnimation: ReturnType<typeof animate> | undefined;
  let sceneGeneration = 0;

  const slideLeft = (index: number) => slides[index]!.offsetLeft - track.offsetLeft;

  const settleScene = (slide: HTMLElement) => {
    for (const element of slide.querySelectorAll<HTMLElement>(
      ':scope > h3, :scope > p, .work-metrics b, .story-flow li, .work-case-link',
    )) {
      element.style.removeProperty('transform');
      element.style.removeProperty('opacity');
    }
  };

  const animateScene = (slide: HTMLElement) => {
    sceneAnimation?.stop();
    slides.forEach(settleScene);
    if (context.reduced()) return;
    const generation = ++sceneGeneration;
    const elements = Array.from(
      slide.querySelectorAll<HTMLElement>(
        ':scope > h3, :scope > p, .work-metrics b, .story-flow li, .work-case-link',
      ),
    );
    sceneAnimation = animate(
      elements,
      { opacity: [0, 1], y: [16, 0] },
      { duration: 0.46, delay: stagger(0.045), ease },
    );
    const settleIfCurrent = () => {
      if (generation === sceneGeneration) settleScene(slide);
    };
    void sceneAnimation.finished.then(settleIfCurrent, settleIfCurrent);
  };

  const setActive = (
    index: number,
    options: { scroll?: boolean; announce?: boolean; updateHash?: boolean; animate?: boolean } = {},
  ) => {
    const bounded = Math.max(0, Math.min(index, slides.length - 1));
    const activeSlide = slides[bounded]!;
    const changed = bounded !== activeIndex;
    activeIndex = bounded;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === bounded;
      slide.classList.toggle('is-active', active);
      slide.inert = !active;
    });
    links.forEach((link, linkIndex) => {
      if (linkIndex === bounded) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (count) count.textContent = `${String(bounded + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (previous) previous.disabled = bounded === 0;
    if (next) next.disabled = bounded === slides.length - 1;
    if (options.scroll) {
      track.scrollTo({ left: slideLeft(bounded), behavior: context.reduced() ? 'auto' : 'smooth' });
    }
    if (options.announce && announcement) announcement.textContent = activeSlide.getAttribute('aria-label') ?? '';
    if (options.updateHash) history.replaceState(history.state, '', `#${activeSlide.id}`);
    if (changed || options.animate) animateScene(activeSlide);
  };

  const hashIndex = slides.findIndex((slide) => `#${slide.id}` === window.location.hash);
  activeIndex = hashIndex >= 0 ? hashIndex : 0;
  setActive(activeIndex, { scroll: hashIndex >= 0, animate: true });

  links.forEach((link, index) => {
    link.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        setActive(index, { scroll: true, announce: true, updateHash: true, animate: true });
      },
      { signal: context.signal },
    );
    link.addEventListener(
      'keydown',
      (event) => {
        const direction =
          event.key === 'ArrowDown' || event.key === 'ArrowRight'
            ? 1
            : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
              ? -1
              : 0;
        if (!direction) return;
        event.preventDefault();
        const target = Math.max(0, Math.min(index + direction, links.length - 1));
        links[target]?.focus();
        setActive(target, { scroll: true, announce: true, updateHash: true, animate: true });
      },
      { signal: context.signal },
    );
  });

  previous?.addEventListener(
    'click',
    () => setActive(activeIndex - 1, { scroll: true, announce: true, updateHash: true, animate: true }),
    { signal: context.signal },
  );
  next?.addEventListener(
    'click',
    () => setActive(activeIndex + 1, { scroll: true, announce: true, updateHash: true, animate: true }),
    { signal: context.signal },
  );
  track.addEventListener(
    'keydown',
    (event) => {
      let target = activeIndex;
      if (event.key === 'ArrowLeft') target -= 1;
      else if (event.key === 'ArrowRight') target += 1;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = slides.length - 1;
      else return;
      event.preventDefault();
      setActive(target, { scroll: true, announce: true, updateHash: true, animate: true });
    },
    { signal: context.signal },
  );

  const slideObserver = new IntersectionObserver(
    (entries) => {
      const candidate = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      const index = candidate ? slides.indexOf(candidate.target as HTMLElement) : -1;
      if (index >= 0 && index !== activeIndex) setActive(index, { updateHash: true, animate: true });
    },
    { root: track, threshold: [0.6, 0.8] },
  );
  slides.forEach((slide) => slideObserver.observe(slide));

  const stopPreference = context.onPreferenceChange((reduced) => {
    if (!reduced) return;
    sceneAnimation?.stop();
    slides.forEach(settleScene);
    track.scrollTo({ left: slideLeft(activeIndex), behavior: 'auto' });
  });

  return () => {
    slideObserver.disconnect();
    stopPreference();
    sceneAnimation?.stop();
    slides.forEach((slide) => {
      slide.inert = false;
      settleScene(slide);
    });
  };
};

export default createOutcomeExplorerController;
