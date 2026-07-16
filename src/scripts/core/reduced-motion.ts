import type { Dispose } from './controller';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export type ReducedMotionListener = (reduced: boolean) => void;

export interface ReducedMotionSubscriptionOptions {
  immediate?: boolean;
}

/** A live view of the operating-system motion preference. */
export interface ReducedMotionPolicy {
  readonly reduced: boolean;
  subscribe(
    listener: ReducedMotionListener,
    options?: ReducedMotionSubscriptionOptions,
  ): Dispose;
  dispose(): void;
}

export function createReducedMotionPolicy(targetWindow: Window): ReducedMotionPolicy {
  const mediaQuery = targetWindow.matchMedia(REDUCED_MOTION_QUERY);
  const listeners = new Set<ReducedMotionListener>();
  let reduced = mediaQuery.matches;
  let disposed = false;

  const notify = () => {
    listeners.forEach((listener) => listener(reduced));
  };

  const handleChange = (event: MediaQueryListEvent) => {
    if (disposed || reduced === event.matches) return;
    reduced = event.matches;
    notify();
  };

  mediaQuery.addEventListener('change', handleChange);

  return {
    get reduced() {
      return reduced;
    },

    subscribe(listener, { immediate = true } = {}) {
      if (immediate) listener(reduced);
      if (disposed) return () => undefined;

      listeners.add(listener);
      let subscribed = true;

      return () => {
        if (!subscribed) return;
        subscribed = false;
        listeners.delete(listener);
      };
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      mediaQuery.removeEventListener('change', handleChange);
      listeners.clear();
    },
  };
}
