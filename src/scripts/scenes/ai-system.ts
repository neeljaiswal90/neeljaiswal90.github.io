import {
  animate,
  inView,
  stagger,
  type AnimationPlaybackControls,
} from 'motion';
import { composeDisposers, type MotionControllerFactory } from '../core/controller';

const ENTER_AMOUNT = 0.28;
const ENTER_MARGIN = '0px 0px -10% 0px';

/**
 * Plays the compact AI evidence scene once, then removes every inline value so
 * CSS remains the durable source of layout and interaction state.
 */
export const createAISystemSceneController: MotionControllerFactory = (root, context) => {
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-ai-step]'));
  const stats = Array.from(root.querySelectorAll<HTMLElement>('[data-ai-stat]'));
  const path = root.querySelector<SVGPathElement>('[data-ai-path]');
  if (steps.length === 0 && stats.length === 0 && !path) return;

  let played = false;
  let generation = 0;
  let stopWatching: (() => void) | undefined;
  let animations: AnimationPlaybackControls[] = [];
  let settleFrame = 0;

  const settle = () => {
    [...steps, ...stats].forEach((element) => {
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
      element.style.removeProperty('transform-origin');
    });
    if (path) {
      path.style.removeProperty('opacity');
      path.style.removeProperty('stroke-dasharray');
      path.style.removeProperty('stroke-dashoffset');
      path.style.removeProperty('transform');
      path.style.removeProperty('transform-origin');
    }
  };

  const cancelScheduledSettle = () => {
    if (!settleFrame) return;
    context.window.cancelAnimationFrame(settleFrame);
    settleFrame = 0;
  };

  // Motion may commit its final keyframe just after `finished`/`stop` settles.
  // Clear once synchronously and once on the following frame so CSS always owns
  // the durable state.
  const settleAfterCommit = () => {
    settle();
    cancelScheduledSettle();
    settleFrame = context.window.requestAnimationFrame(() => {
      settleFrame = 0;
      settle();
    });
  };

  const stopAnimations = () => {
    generation += 1;
    animations.forEach((animation) => animation.stop());
    animations = [];
    settleAfterCommit();
  };

  const play = () => {
    if (played) return;
    played = true;
    cancelScheduledSettle();
    stopWatching?.();
    stopWatching = undefined;

    if (context.reduced()) {
      settle();
      return;
    }

    const activeGeneration = ++generation;
    const nextAnimations: AnimationPlaybackControls[] = [];

    if (path) {
      nextAnimations.push(
        animate(
          path,
          { opacity: [0, 1], pathLength: [0, 1] },
          {
            duration: context.tokens.durations.scene,
            ease: context.tokens.ease.standard,
          },
        ),
      );
    }

    if (steps.length > 0) {
      nextAnimations.push(
        animate(
          steps,
          { opacity: [0, 1], y: [20, 0], scale: [0.97, 1] },
          {
            duration: context.tokens.durations.slow,
            delay: stagger(context.tokens.stagger.loose, { startDelay: context.tokens.durations.fast }),
            ease: context.tokens.ease.emphasized,
          },
        ),
      );
    }

    if (stats.length > 0) {
      nextAnimations.push(
        animate(
          stats,
          { opacity: [0, 1], x: [-14, 0] },
          {
            duration: context.tokens.durations.base,
            delay: stagger(context.tokens.stagger.base, { startDelay: context.tokens.durations.base }),
            ease: context.tokens.ease.standard,
          },
        ),
      );
    }

    animations = nextAnimations;
    const finished = Promise.allSettled(nextAnimations.map((animation) => animation.finished));
    void finished.then(() => {
      if (activeGeneration !== generation) return;
      animations = [];
      settleAfterCommit();
    });
  };

  if (context.reduced() || !('IntersectionObserver' in context.window)) {
    played = true;
    settle();
  } else {
    stopWatching = inView(root, play, {
      amount: ENTER_AMOUNT,
      margin: ENTER_MARGIN,
    });
  }

  const stopPreference = context.onPreferenceChange((reduced) => {
    if (!reduced) return;
    played = true;
    stopWatching?.();
    stopWatching = undefined;
    stopAnimations();
  });

  return composeDisposers(
    stopPreference,
    () => stopWatching?.(),
    stopAnimations,
  );
};

export default createAISystemSceneController;
