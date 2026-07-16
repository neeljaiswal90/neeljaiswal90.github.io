import type { Dispose, MotionContext, MotionControllerFactory } from './core/controller';
import { composeDisposers } from './core/controller';
import { createReducedMotionPolicy } from './core/reduced-motion';
import { motionTokens } from './core/tokens';
import { createRevealController } from './controllers/reveal';
import { createThemeController } from './controllers/theme';
import { createPageNavigationController } from './controllers/page-navigation';
import { createOutcomeExplorerController } from './controllers/outcome-explorer';
import { createToolFilterController } from './controllers/tool-filter';
import { createMediaDialogController } from './controllers/media-dialog';
import { createSpotlightController } from './controllers/spotlight';
import { createCopyEmailController } from './controllers/copy-email';
import { createHeroScene } from './scenes/hero';
import { createAISystemSceneController } from './scenes/ai-system';
import { createExperienceSceneController } from './scenes/experience';
import { createCaseStudySceneController } from './scenes/case-study';

const controllerFactories: Readonly<Record<string, MotionControllerFactory>> = {
  reveal: createRevealController,
  theme: createThemeController,
  'page-navigation': createPageNavigationController,
  'outcome-explorer': createOutcomeExplorerController,
  'tool-filter': createToolFilterController,
  'media-dialog': createMediaDialogController,
  spotlight: createSpotlightController,
  'copy-email': createCopyEmailController,
  hero: createHeroScene,
  'ai-system-scene': createAISystemSceneController,
  'experience-scene': createExperienceSceneController,
  'case-study-scene': createCaseStudySceneController,
};

let disposeMountedPage: Dispose | undefined;
let mountGeneration = 0;
document.documentElement.classList.add('motion-ready');

async function mountPage(): Promise<void> {
  const generation = ++mountGeneration;
  disposeMountedPage?.();

  const abortController = new AbortController();
  const reducedMotion = createReducedMotionPolicy(window);
  const context: MotionContext = {
    document,
    window,
    signal: abortController.signal,
    reducedMotion,
    tokens: motionTokens,
    reduced: () => reducedMotion.reduced,
    onPreferenceChange: (listener) => reducedMotion.subscribe(listener, { immediate: false }),
  };
  const disposers: Dispose[] = [
    () => abortController.abort(),
    () => reducedMotion.dispose(),
  ];

  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-controller]'));
  for (const root of roots) {
    const names = (root.dataset.controller ?? '').trim().split(/\s+/).filter(Boolean);
    for (const name of names) {
      const factory = controllerFactories[name];
      if (!factory) {
        console.warn(`[portfolio] Unknown controller: ${name}`);
        continue;
      }
      try {
        const dispose = await factory(root, context);
        if (typeof dispose === 'function') disposers.push(dispose);
      } catch (error) {
        console.error(`[portfolio] Controller failed: ${name}`, error);
      }
    }
  }

  if (generation !== mountGeneration) {
    composeDisposers(...disposers)();
    return;
  }
  disposeMountedPage = composeDisposers(...disposers);
}

const unmountPage = () => {
  mountGeneration += 1;
  disposeMountedPage?.();
  disposeMountedPage = undefined;
};

void mountPage();
document.addEventListener('astro:before-swap', unmountPage);
document.addEventListener('astro:page-load', () => void mountPage());
window.addEventListener('pagehide', unmountPage);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) void mountPage();
});
