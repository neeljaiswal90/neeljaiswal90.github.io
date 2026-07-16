import { animate, type AnimationPlaybackControls } from 'motion';
import {
  composeDisposers,
  listen,
  type MotionControllerFactory,
} from '../core/controller';

interface ActiveTransition {
  controls: AnimationPlaybackControls;
  targetOpen: boolean;
  generation: number;
}

/**
 * Enhances native details/summary disclosure with accordion behavior and a
 * measured panel transition. Without JavaScript, every details element keeps
 * its native semantics and remains independently operable.
 */
export const createExperienceSceneController: MotionControllerFactory = (root, context) => {
  const details = Array.from(root.querySelectorAll<HTMLDetailsElement>('[data-experience-item]'));
  if (details.length === 0) return;

  const panels = new Map<HTMLDetailsElement, HTMLElement>();
  const transitions = new Map<HTMLDetailsElement, ActiveTransition>();
  const settleFrames = new Map<HTMLDetailsElement, number>();
  const clickDisposers: Array<() => void> = [];
  let generation = 0;

  details.forEach((detail) => {
    const panel = detail.querySelector<HTMLElement>('[data-experience-panel]');
    if (panel) panels.set(detail, panel);
  });

  const settlePanel = (detail: HTMLDetailsElement) => {
    const panel = panels.get(detail);
    if (!panel) return;
    panel.style.removeProperty('height');
    panel.style.removeProperty('opacity');
    panel.style.removeProperty('overflow');
    panel.style.removeProperty('transform');
    panel.style.removeProperty('transform-origin');
  };

  const cancelScheduledSettle = (detail: HTMLDetailsElement) => {
    const frame = settleFrames.get(detail);
    if (frame === undefined) return;
    context.window.cancelAnimationFrame(frame);
    settleFrames.delete(detail);
  };

  const settleAfterCommit = (detail: HTMLDetailsElement) => {
    settlePanel(detail);
    cancelScheduledSettle(detail);
    const frame = context.window.requestAnimationFrame(() => {
      settlePanel(detail);
      const confirmationFrame = context.window.requestAnimationFrame(() => {
        settleFrames.delete(detail);
        settlePanel(detail);
      });
      settleFrames.set(detail, confirmationFrame);
    });
    settleFrames.set(detail, frame);
  };

  const finishTransitions = () => {
    generation += 1;
    transitions.forEach(({ controls, targetOpen }, detail) => {
      // `stop()` intentionally commits the current interpolated value. Cancel
      // instead, then apply the semantic target state and remove animation
      // styles so a live reduced-motion change cannot freeze a half-open panel.
      controls.cancel();
      detail.open = targetOpen;
      settleAfterCommit(detail);
    });
    transitions.clear();
  };

  const setInstant = (detail: HTMLDetailsElement, open: boolean) => {
    cancelScheduledSettle(detail);
    detail.open = open;
    settlePanel(detail);
  };

  const closeOthers = (active: HTMLDetailsElement) => {
    details.forEach((detail) => {
      if (detail !== active && detail.open) setInstant(detail, false);
    });
  };

  const transition = (detail: HTMLDetailsElement, targetOpen: boolean) => {
    const panel = panels.get(detail);
    finishTransitions();
    cancelScheduledSettle(detail);

    if (!panel || context.reduced()) {
      if (targetOpen) closeOthers(detail);
      setInstant(detail, targetOpen);
      return;
    }

    if (targetOpen) {
      closeOthers(detail);
      detail.open = true;
      const targetHeight = panel.scrollHeight;
      panel.style.height = '0px';
      panel.style.opacity = '0';
      panel.style.overflow = 'hidden';

      const activeGeneration = ++generation;
      const controls = animate(
        panel,
        { height: [0, targetHeight], opacity: [0, 1], y: [-8, 0] },
        {
          duration: context.tokens.durations.slow,
          ease: context.tokens.ease.emphasized,
        },
      );
      transitions.set(detail, { controls, targetOpen, generation: activeGeneration });
      const finish = () => {
        const active = transitions.get(detail);
        if (!active || active.generation !== activeGeneration) return;
        transitions.delete(detail);
        detail.open = true;
        settleAfterCommit(detail);
      };
      void controls.finished.then(finish, finish);
      return;
    }

    const startHeight = panel.getBoundingClientRect().height || panel.scrollHeight;
    panel.style.height = `${startHeight}px`;
    panel.style.overflow = 'hidden';
    const activeGeneration = ++generation;
    const controls = animate(
      panel,
      { height: [startHeight, 0], opacity: [1, 0], y: [0, -6] },
      {
        duration: context.tokens.durations.base,
        ease: context.tokens.ease.exit,
      },
    );
    transitions.set(detail, { controls, targetOpen, generation: activeGeneration });
    const finish = () => {
      const active = transitions.get(detail);
      if (!active || active.generation !== activeGeneration) return;
      transitions.delete(detail);
      detail.open = false;
      settleAfterCommit(detail);
    };
    void controls.finished.then(finish, finish);
  };

  // Normalize authored state only after enhancement; no-JS keeps native details.
  const initiallyOpen = details.find((detail) => detail.open);
  details.forEach((detail) => {
    if (detail !== initiallyOpen && detail.open) detail.open = false;
    settlePanel(detail);

    const summary = detail.querySelector<HTMLElement>(':scope > summary');
    if (!summary) return;
    clickDisposers.push(
      listen(summary, 'click', (event) => {
        if (event.defaultPrevented || (event as MouseEvent).button > 0) return;
        event.preventDefault();
        finishTransitions();
        transition(detail, !detail.open);
      }),
    );
  });

  const stopPreference = context.onPreferenceChange((reduced) => {
    if (reduced) finishTransitions();
  });

  return composeDisposers(
    ...clickDisposers,
    stopPreference,
    () => {
      finishTransitions();
      details.forEach(settlePanel);
    },
  );
};

export default createExperienceSceneController;
