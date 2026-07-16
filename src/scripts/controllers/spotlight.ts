import { hover } from 'motion';
import type { Dispose, MotionControllerFactory } from '../core/controller';
import { composeDisposers, listen } from '../core/controller';

interface PointerPosition {
  x: number;
  y: number;
}

export const createSpotlightController: MotionControllerFactory = (root, { window, reducedMotion }) => {
  const cards = Array.from(root.querySelectorAll<HTMLElement>('.spotlight-card'));
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const rects = new WeakMap<HTMLElement, DOMRect>();
  const positions = new WeakMap<HTMLElement, PointerPosition>();
  const activePointerCleanups = new Map<HTMLElement, Dispose>();
  let gestureCleanups: Dispose[] = [];
  let frameId = 0;

  const measure = (card: HTMLElement) => {
    rects.set(card, card.getBoundingClientRect());
  };

  const render = () => {
    frameId = 0;
    for (const card of cards) {
      const rect = rects.get(card);
      const position = positions.get(card);
      if (!rect || !position || rect.width <= 0 || rect.height <= 0) continue;

      const normalizedX = (position.x - rect.left) / rect.width;
      const normalizedY = (position.y - rect.top) / rect.height;
      card.style.setProperty('--mx', `${(normalizedX * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(normalizedY * 100).toFixed(1)}%`);
      if (card.classList.contains('work-card')) {
        card.style.setProperty('--card-ry', `${((normalizedX - .5) * 3.2).toFixed(2)}deg`);
        card.style.setProperty('--card-rx', `${((.5 - normalizedY) * 2.4).toFixed(2)}deg`);
      }
    }
  };

  const scheduleRender = () => {
    if (!frameId) frameId = window.requestAnimationFrame(render);
  };

  const disable = () => {
    for (const cleanup of activePointerCleanups.values()) cleanup();
    activePointerCleanups.clear();
    for (const cleanup of gestureCleanups.splice(0)) cleanup();
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    for (const card of cards) {
      positions.delete(card);
      rects.delete(card);
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
      card.style.removeProperty('--card-rx');
      card.style.removeProperty('--card-ry');
    }
  };

  const enable = () => {
    disable();
    if (reducedMotion.reduced || !hoverQuery.matches) return;

    gestureCleanups = cards.map((card) =>
      hover(card, (_element, event) => {
        measure(card);
        positions.set(card, { x: event.clientX, y: event.clientY });
        scheduleRender();

        activePointerCleanups.get(card)?.();
        const stopPointerMove = listen(card, 'pointermove', (moveEvent) => {
          const pointerEvent = moveEvent as PointerEvent;
          positions.set(card, { x: pointerEvent.clientX, y: pointerEvent.clientY });
          scheduleRender();
        }, { passive: true });
        activePointerCleanups.set(card, stopPointerMove);

        return () => {
          stopPointerMove();
          activePointerCleanups.delete(card);
          positions.delete(card);
        };
      }),
    );
  };

  const measureAll = () => {
    if (reducedMotion.reduced || !hoverQuery.matches) return;
    for (const card of cards) measure(card);
  };

  const cleanups: Dispose[] = [
    reducedMotion.subscribe(enable),
    listen(hoverQuery, 'change', enable),
    listen(window, 'resize', measureAll, { passive: true }),
  ];

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target instanceof HTMLElement) measure(entry.target);
      }
    });
    for (const card of cards) resizeObserver.observe(card);
    cleanups.push(() => resizeObserver.disconnect());
  }

  return composeDisposers(...cleanups, disable);
};

export default createSpotlightController;
