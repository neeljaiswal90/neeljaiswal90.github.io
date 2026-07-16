import { animate, inView, type AnimationPlaybackControls } from 'motion';
import {
  composeDisposers,
  type Dispose,
  type MotionControllerFactory,
} from '../core/controller';

const REVEAL_SELECTOR = '.reveal';
const REVEAL_AMOUNT = 0.08;
const REVEAL_MARGIN = '0px 0px -7% 0px';
const REVEAL_FALLBACK_MS = 5_000;

function collectRevealElements(root: HTMLElement): HTMLElement[] {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
  if (root.matches(REVEAL_SELECTOR)) elements.unshift(root);
  return elements;
}

/**
 * Reveals each item once as it enters the viewport. The CSS baseline keeps
 * content visible without JavaScript; `.is-visible` remains the durable final
 * state for CSS, tests, reduced motion, and controller teardown.
 */
export const createRevealController: MotionControllerFactory = (root, context) => {
  const elements = collectRevealElements(root);
  if (elements.length === 0) return;

  const pending = new Set(elements.filter((element) => !element.classList.contains('is-visible')));
  let stopWatching: Dispose | undefined;
  let fallbackTimer: number | undefined;
  const animations = new Map<HTMLElement, AnimationPlaybackControls>();

  const settle = (element: HTMLElement) => {
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  };

  const stopObserver = () => {
    stopWatching?.();
    stopWatching = undefined;
  };

  const clearFallback = () => {
    if (fallbackTimer === undefined) return;
    context.window.clearTimeout(fallbackTimer);
    fallbackTimer = undefined;
  };

  const reveal = (element: Element) => {
    const target = element as HTMLElement;
    target.classList.add('is-visible');
    pending.delete(target);

    if (!context.reduced()) {
      const animation = animate(
        target,
        { opacity: [0, 1], y: [24, 0] },
        { duration: context.tokens.durations.scene, ease: context.tokens.ease.standard },
      );
      animations.set(target, animation);
      const cleanupAnimation = () => {
        animations.delete(target);
        settle(target);
      };
      void animation.finished.then(cleanupAnimation, cleanupAnimation);
    }

    if (pending.size === 0) {
      clearFallback();
      stopObserver();
    }
  };

  const revealAll = () => {
    animations.forEach((animation) => animation.stop());
    animations.clear();
    pending.forEach((element) => element.classList.add('is-visible'));
    elements.forEach(settle);
    pending.clear();
    clearFallback();
    stopObserver();
  };

  if (pending.size > 0) {
    if (context.reducedMotion.reduced || !('IntersectionObserver' in context.window)) {
      revealAll();
    } else {
      stopWatching = inView(Array.from(pending), reveal, {
        root: context.document,
        amount: REVEAL_AMOUNT,
        margin: REVEAL_MARGIN,
      });
      fallbackTimer = context.window.setTimeout(revealAll, REVEAL_FALLBACK_MS);
    }
  }

  const stopMotionSubscription = context.reducedMotion.subscribe(
    (reduced) => {
      if (reduced) revealAll();
    },
    { immediate: false },
  );

  return composeDisposers(stopMotionSubscription, clearFallback, stopObserver, revealAll);
};
