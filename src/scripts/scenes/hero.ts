import {
  animate,
  inView,
  scroll,
  stagger,
  type AnimationPlaybackControls,
} from 'motion';
import {
  composeDisposers,
  listen,
  type Dispose,
  type MotionControllerFactory,
} from '../core/controller';

const HERO_LINE_INNER = '[data-hero-line-inner]';
const HERO_WORD = '[data-hero-word]';
const HERO_KICKER = '[data-hero-kicker]';
const HERO_LOWER = '[data-hero-lower]';
const HERO_SIGNAL_CONTENT = '[data-hero-signal-content]';
const HERO_ORBIT = '[data-hero-orbit]';

type HeroTarget = HTMLElement;

function collect<T extends Element>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/**
 * A scene-level hero controller. It owns only the masked headline treatment,
 * card-content choreography, and decorative orbit response; the shared reveal
 * controller can continue to own the durable `.is-visible` contract.
 */
export const createHeroScene: MotionControllerFactory = (root, context) => {
  const lineInners = collect<HeroTarget>(root, HERO_LINE_INNER);
  const words = collect<HeroTarget>(root, HERO_WORD);
  const kicker = root.querySelector<HeroTarget>(HERO_KICKER);
  const lower = root.querySelector<HeroTarget>(HERO_LOWER);
  const signalContents = collect<HeroTarget>(root, HERO_SIGNAL_CONTENT);
  const orbits = collect<HeroTarget>(root, HERO_ORBIT);
  const animatedTargets = [
    ...lineInners,
    ...words,
    ...(kicker ? [kicker] : []),
    ...(lower ? [lower] : []),
    ...signalContents,
  ];
  const activeAnimations = new Set<AnimationPlaybackControls>();
  const disposers: Dispose[] = [];
  let introStarted = false;
  let pointerEnabled = false;
  let pointerFrame = 0;
  let settleFrame = 0;
  let stopScroll: Dispose | undefined;

  const track = (animation: AnimationPlaybackControls) => {
    activeAnimations.add(animation);
    return animation;
  };

  const clearInlineMotion = () => {
    for (const target of animatedTargets) {
      target.style.removeProperty('opacity');
      target.style.removeProperty('transform');
    }
    root.classList.add('hero-motion-complete');
  };

  const stopAnimations = () => {
    // Completing first moves every delayed/staggered target to its visible
    // endpoint. Clearing the resulting inline styles then leaves the same
    // visual state under CSS without a half-committed cancellation frame.
    [...activeAnimations].forEach((animation) => animation.complete());
    activeAnimations.clear();
  };

  const cancelScheduledSettle = () => {
    if (!settleFrame) return;
    context.window.cancelAnimationFrame(settleFrame);
    settleFrame = 0;
  };

  // Motion can commit an interrupted keyframe after its controls settle.
  // Clear across two frames so CSS owns the durable visible state on a live
  // preference change.
  const clearInlineMotionAfterCommit = () => {
    clearInlineMotion();
    cancelScheduledSettle();
    settleFrame = context.window.requestAnimationFrame(() => {
      clearInlineMotion();
      settleFrame = context.window.requestAnimationFrame(() => {
        settleFrame = 0;
        clearInlineMotion();
      });
    });
  };

  const resetPointer = () => {
    if (pointerFrame) context.window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    for (const orbit of orbits) {
      orbit.style.removeProperty('--hero-pointer-x');
      orbit.style.removeProperty('--hero-pointer-y');
    }
  };

  const resetOrbits = () => {
    resetPointer();
    for (const orbit of orbits) {
      orbit.style.removeProperty('--hero-scroll-shift');
    }
  };

  const settle = () => {
    stopAnimations();
    clearInlineMotionAfterCommit();
    resetOrbits();
  };

  const runIntro = () => {
    if (introStarted) return;
    introStarted = true;
    cancelScheduledSettle();

    if (context.reduced()) {
      settle();
      return;
    }

    root.classList.add('hero-motion-active');
    lineInners.forEach((line) => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(108%)';
    });
    words.forEach((word) => {
      word.style.opacity = '0';
      word.style.transform = 'translateY(22%)';
    });
    if (kicker) {
      kicker.style.opacity = '0';
      kicker.style.transform = 'translateY(12px)';
    }
    if (lower) {
      lower.style.opacity = '0';
      lower.style.transform = 'translateY(18px)';
    }
    signalContents.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
    });

    if (kicker) {
      track(animate(
        kicker,
        { opacity: [0, 1], y: [12, 0] },
        { duration: context.tokens.durations.slow, ease: context.tokens.ease.standard },
      ));
    }

    track(animate(
      lineInners,
      { y: ['108%', '0%'] },
      {
        duration: context.tokens.durations.scene,
        delay: stagger(context.tokens.stagger.loose, { startDelay: .08 }),
        ease: context.tokens.ease.emphasized,
      },
    ));

    track(animate(
      words,
      { opacity: [0, 1], y: ['22%', '0%'] },
      {
        duration: context.tokens.durations.slow,
        delay: stagger(context.tokens.stagger.tight, { startDelay: .18 }),
        ease: context.tokens.ease.standard,
      },
    ));

    if (lower) {
      track(animate(
        lower,
        { opacity: [0, 1], y: [18, 0] },
        {
          duration: context.tokens.durations.slow,
          delay: .42,
          ease: context.tokens.ease.standard,
        },
      ));
    }

    const cardsAnimation = track(animate(
      signalContents,
      { opacity: [0, 1], y: [20, 0] },
      {
        duration: context.tokens.durations.slow,
        delay: stagger(context.tokens.stagger.base, { startDelay: .54 }),
        ease: context.tokens.ease.emphasized,
      },
    ));
    const finishIntro = () => {
      activeAnimations.clear();
      clearInlineMotionAfterCommit();
    };
    void cardsAnimation.finished.then(finishIntro, finishIntro);
  };

  if (context.reduced() || !('IntersectionObserver' in context.window)) {
    introStarted = true;
    settle();
  } else {
    const stopInView = inView(root, () => {
      runIntro();
    }, { amount: 0.08 });
    disposers.push(stopInView);
  }

  const hoverQuery = context.window.matchMedia('(hover: hover) and (pointer: fine)');
  const updatePointer = (event: PointerEvent) => {
    if (!pointerEnabled || pointerFrame) return;
    const { clientX, clientY } = event;
    pointerFrame = context.window.requestAnimationFrame(() => {
      pointerFrame = 0;
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;
      orbits.forEach((orbit, index) => {
        const strength = index === 0 ? 8 : -5;
        orbit.style.setProperty('--hero-pointer-x', `${(x * strength).toFixed(2)}px`);
        orbit.style.setProperty('--hero-pointer-y', `${(y * strength).toFixed(2)}px`);
      });
    });
  };

  const configurePointer = () => {
    pointerEnabled = !context.reduced() && hoverQuery.matches;
    if (!pointerEnabled) resetPointer();
  };

  disposers.push(
    listen(root, 'pointermove', (event) => updatePointer(event as PointerEvent), { passive: true }),
    listen(root, 'pointerleave', resetPointer, { passive: true }),
    listen(hoverQuery, 'change', configurePointer),
  );
  configurePointer();

  const configureScroll = () => {
    stopScroll?.();
    stopScroll = undefined;
    if (context.reduced()) return;
    stopScroll = scroll((progress: number) => {
      const centered = progress - .5;
      orbits.forEach((orbit, index) => {
        const range = index === 0 ? 22 : -14;
        orbit.style.setProperty('--hero-scroll-shift', `${(centered * range).toFixed(2)}px`);
      });
    }, {
      target: root,
      offset: ['start end', 'end start'],
    });
  };
  configureScroll();

  disposers.push(context.onPreferenceChange((reduced) => {
    configurePointer();
    configureScroll();
    if (reduced) settle();
  }), () => stopScroll?.());

  return composeDisposers(
    ...disposers,
    () => {
      stopAnimations();
      cancelScheduledSettle();
      clearInlineMotion();
      resetOrbits();
    },
  );
};

export default createHeroScene;
