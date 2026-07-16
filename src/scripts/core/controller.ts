import type { ReducedMotionPolicy } from './reduced-motion';
import type { MotionTokens } from './tokens';

export type Dispose = () => void;

export interface MotionContext {
  document: Document;
  window: Window;
  signal: AbortSignal;
  reducedMotion: ReducedMotionPolicy;
  tokens: MotionTokens;
  reduced(): boolean;
  onPreferenceChange(listener: (reduced: boolean) => void): Dispose;
}

export type MotionControllerFactory = (
  root: HTMLElement,
  context: MotionContext,
) => void | Dispose | Promise<void | Dispose>;

/** Compose cleanup callbacks into one idempotent, reverse-order disposer. */
export function composeDisposers(
  ...disposers: Array<Dispose | void | null | false>
): Dispose {
  let active = true;

  return () => {
    if (!active) return;
    active = false;

    for (let index = disposers.length - 1; index >= 0; index -= 1) {
      const dispose = disposers[index];
      if (typeof dispose === 'function') dispose();
    }
  };
}

/** Add an event listener and return its exact inverse. */
export function listen(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): Dispose {
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener, options);
}
