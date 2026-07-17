import {
  animate,
  inView,
  scroll,
  stagger,
  type AnimationPlaybackControls,
} from 'motion';
import { composeDisposers, type Dispose, type MotionControllerFactory } from '../core/controller';

const TITLE = '[data-case-title]';
const METRIC = '[data-case-metric]';
const SCENE = '[data-case-scene][data-case-section]';
const PROGRESS = '[data-case-progress]';
const INDEX_LINK = '[data-case-index-link]';
const MOTION_PROPERTIES = [
  'opacity',
  'transform',
  'transform-origin',
  'clip-path',
  'will-change',
] as const;

function sectionToken(scene: HTMLElement, index: number): string {
  return scene.dataset.caseSection?.trim() || scene.id || String(index + 1);
}

function linkToken(link: HTMLAnchorElement): string {
  const authored = link.dataset.caseIndexLink?.trim();
  if (authored) return authored.replace(/^#/, '');
  const hash = link.hash || link.getAttribute('href')?.split('#').at(-1) || '';
  try {
    return decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return hash.replace(/^#/, '');
  }
}

/**
 * Owns case-study entrance choreography, reading progress, and the active
 * section index. Every query is scoped to the case-study root so multiple
 * studies can coexist without sharing state.
 */
export const createCaseStudySceneController: MotionControllerFactory = (root, context) => {
  const title = root.querySelector<HTMLElement>(TITLE);
  const metrics = Array.from(root.querySelectorAll<HTMLElement>(METRIC));
  const scenes = Array.from(root.querySelectorAll<HTMLElement>(SCENE));
  const progress = root.querySelector<HTMLElement>(PROGRESS);
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>(INDEX_LINK));
  const animatedTargets = Array.from(new Set([
    ...(title ? [title] : []),
    ...metrics,
    ...scenes,
  ]));
  const activeAnimations = new Set<AnimationPlaybackControls>();
  const cleanupFrames = new Set<number>();
  const entranceDisposers: Dispose[] = [];
  const playedScenes = new WeakSet<HTMLElement>();
  const initialLinkState = links.map((link) => ({
    link,
    active: link.classList.contains('is-active'),
    ariaCurrent: link.getAttribute('aria-current'),
  }));
  let animationGeneration = 0;
  let introPlayed = false;
  let entranceWatching = true;
  let stopProgress: Dispose | undefined;

  const clearMotion = (targets: Iterable<HTMLElement>) => {
    for (const target of targets) {
      for (const property of MOTION_PROPERTIES) target.style.removeProperty(property);
    }
  };

  const cancelCleanupFrames = () => {
    cleanupFrames.forEach((frame) => context.window.cancelAnimationFrame(frame));
    cleanupFrames.clear();
  };

  // Motion can commit a final keyframe immediately after controls finish or
  // cancel. Clear synchronously and across subsequent frames so CSS regains
  // durable ownership after both normal playback and live reduced-motion.
  const clearAfterCommit = (targets: Iterable<HTMLElement>) => {
    const ownedTargets = Array.from(targets);
    clearMotion(ownedTargets);
    let remainingPasses = 3;
    const nextPass = () => {
      const frame = context.window.requestAnimationFrame(() => {
        cleanupFrames.delete(frame);
        clearMotion(ownedTargets);
        remainingPasses -= 1;
        if (remainingPasses > 0) nextPass();
      });
      cleanupFrames.add(frame);
    };
    nextPass();
  };

  const track = (controls: AnimationPlaybackControls, targets: HTMLElement[]) => {
    const generation = animationGeneration;
    activeAnimations.add(controls);
    const finish = () => {
      activeAnimations.delete(controls);
      if (generation === animationGeneration) clearAfterCommit(targets);
    };
    void controls.finished.then(finish, finish);
    return controls;
  };

  const stopEntranceWatching = () => {
    if (!entranceWatching) return;
    entranceWatching = false;
    entranceDisposers.splice(0).forEach((dispose) => dispose());
  };

  const settleEntrance = () => {
    animationGeneration += 1;
    activeAnimations.forEach((controls) => controls.cancel());
    activeAnimations.clear();
    clearAfterCommit(animatedTargets);
  };

  const playIntro = () => {
    if (introPlayed) return;
    introPlayed = true;
    if (context.reduced()) {
      clearMotion([...(title ? [title] : []), ...metrics]);
      return;
    }

    const targets = [...(title ? [title] : []), ...metrics];
    if (targets.length === 0) return;
    track(animate(
      targets,
      {
        opacity: [0, 1],
        y: [28, 0],
        clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
      },
      {
        duration: context.tokens.durations.scene,
        delay: stagger(context.tokens.stagger.loose),
        ease: context.tokens.ease.emphasized,
      },
    ), targets);
  };

  const playScene = (scene: HTMLElement, index: number) => {
    if (playedScenes.has(scene)) return;
    playedScenes.add(scene);
    if (context.reduced()) {
      clearMotion([scene]);
      return;
    }

    track(animate(
      scene,
      {
        opacity: [0, 1],
        y: [36, 0],
        clipPath: ['inset(0 0 14% 0)', 'inset(0 0 0% 0)'],
      },
      {
        duration: context.tokens.durations.scene,
        delay: Math.min(index, 2) * context.tokens.stagger.tight,
        ease: context.tokens.ease.emphasized,
      },
    ), [scene]);
  };

  if (context.reduced() || !('IntersectionObserver' in context.window)) {
    introPlayed = true;
    scenes.forEach((scene) => playedScenes.add(scene));
    clearMotion(animatedTargets);
  } else {
    entranceDisposers.push(inView(title ?? root, playIntro, {
      amount: 0.18,
      margin: '0px 0px -8% 0px',
    }));
    scenes.forEach((scene, index) => {
      entranceDisposers.push(inView(scene, () => playScene(scene, index), {
        amount: 0.18,
        margin: '0px 0px -8% 0px',
      }));
    });
  }

  const configureProgress = () => {
    stopProgress?.();
    stopProgress = undefined;
    if (!progress) return;
    progress.style.removeProperty('transform');
    progress.style.removeProperty('transform-origin');
    if (context.reduced()) return;

    progress.style.transformOrigin = '50% 0';
    stopProgress = scroll((value: number) => {
      const bounded = Math.max(0, Math.min(value, 1));
      progress.style.transform = `scaleY(${bounded.toFixed(4)})`;
    }, {
      target: root,
      offset: ['start start', 'end end'],
    });
  };
  configureProgress();

  const setActive = (token: string) => {
    if (!token) return;
    for (const link of links) {
      const active = linkToken(link) === token;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
        const rail = link.closest<HTMLElement>('.case-index-inner');
        if (rail && context.window.innerWidth <= 900) {
          const railRect = rail.getBoundingClientRect();
          const linkRect = link.getBoundingClientRect();
          const left = rail.scrollLeft + linkRect.left - railRect.left - (rail.clientWidth - linkRect.width) / 2;
          rail.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
        }
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  let activeObserver: IntersectionObserver | undefined;
  if (scenes.length > 0 && links.length > 0) {
    const firstScene = scenes[0];
    if (firstScene) setActive(sectionToken(firstScene, 0));
    if ('IntersectionObserver' in context.window) {
      const visible = new Map<HTMLElement, IntersectionObserverEntry>();
      activeObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!(entry.target instanceof HTMLElement)) continue;
          if (entry.isIntersecting) visible.set(entry.target, entry);
          else visible.delete(entry.target);
        }
        const activationLine = context.window.innerHeight * 0.38;
        const active = Array.from(visible.values()).sort((left, right) =>
          Math.abs(left.boundingClientRect.top - activationLine)
          - Math.abs(right.boundingClientRect.top - activationLine))[0];
        if (!(active?.target instanceof HTMLElement)) return;
        const index = scenes.indexOf(active.target);
        setActive(sectionToken(active.target, index));
      }, {
        rootMargin: '-18% 0px -55% 0px',
        threshold: [0, 0.2, 0.5, 0.8],
      });
      scenes.forEach((scene) => activeObserver?.observe(scene));
    }
  }

  const stopPreference = context.onPreferenceChange((reduced) => {
    if (reduced) {
      stopEntranceWatching();
      settleEntrance();
    }
    configureProgress();
  });

  return composeDisposers(
    stopPreference,
    () => stopEntranceWatching(),
    () => stopProgress?.(),
    () => activeObserver?.disconnect(),
    () => {
      animationGeneration += 1;
      activeAnimations.forEach((controls) => controls.cancel());
      activeAnimations.clear();
      cancelCleanupFrames();
      clearMotion(animatedTargets);
      if (progress) {
        progress.style.removeProperty('transform');
        progress.style.removeProperty('transform-origin');
      }
      initialLinkState.forEach(({ link, active, ariaCurrent }) => {
        link.classList.toggle('is-active', active);
        if (ariaCurrent === null) link.removeAttribute('aria-current');
        else link.setAttribute('aria-current', ariaCurrent);
      });
    },
  );
};

export default createCaseStudySceneController;
