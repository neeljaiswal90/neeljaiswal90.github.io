import { animate, type AnimationPlaybackControls } from 'motion';
import type { MotionControllerFactory } from '../core/controller';
import { composeDisposers, listen } from '../core/controller';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const createMediaDialogController: MotionControllerFactory = (root, { document, reducedMotion, tokens }) => {
  const dialog = root.matches('#photo-dialog')
    ? (root as HTMLDialogElement)
    : root.querySelector<HTMLDialogElement>('#photo-dialog');
  const image = dialog?.querySelector<HTMLImageElement>('#photo-dialog-image');
  const title = dialog?.querySelector<HTMLElement>('#photo-dialog-title');
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-photo-close]');
  const openButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-photo-open]'));

  if (!dialog || !image || !title) return;

  let returnFocus: HTMLElement | null = null;
  let animation: AnimationPlaybackControls | null = null;
  let closing = false;
  let destroyed = false;

  const stopAnimation = () => {
    animation?.stop();
    animation = null;
  };

  const restoreFocus = () => {
    const target = returnFocus;
    returnFocus = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  };

  const finishClose = () => {
    if (!dialog.hasAttribute('open')) return;

    if (typeof dialog.close === 'function') dialog.close();
    else {
      dialog.removeAttribute('open');
      closing = false;
      restoreFocus();
    }
  };

  const closeDialog = () => {
    if (!dialog.hasAttribute('open') || closing) return;
    closing = true;
    stopAnimation();

    const figure = dialog.querySelector<HTMLElement>('figure');
    if (reducedMotion.reduced || !figure) {
      finishClose();
      return;
    }

    const controls = animate(
      figure,
      { opacity: [1, 0], transform: ['translateY(0px) scale(1)', 'translateY(10px) scale(0.985)'] },
      { duration: tokens.durations.fast, ease: tokens.ease.exit },
    );
    animation = controls;
    void controls.finished.then(() => {
      if (animation === controls) animation = null;
      if (!destroyed) finishClose();
    }).catch(() => {
      if (animation === controls) animation = null;
    });
  };

  const openDialog = (button: HTMLButtonElement) => {
    const figure = button.closest('figure');
    const source = figure?.querySelector<HTMLImageElement>('img');
    if (!source) return;

    stopAnimation();
    closing = false;
    returnFocus = button;
    image.src = button.dataset.photoFull || source.currentSrc || source.src;
    image.alt = source.alt;
    title.textContent = button.dataset.photoTitle || source.alt;

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');

    closeButton?.focus({ preventScroll: true });

    const dialogFigure = dialog.querySelector<HTMLElement>('figure');
    if (!reducedMotion.reduced && dialogFigure) {
      const controls = animate(
        dialogFigure,
        { opacity: [0, 1], transform: ['translateY(12px) scale(0.985)', 'translateY(0px) scale(1)'] },
        { duration: tokens.durations.base, ease: tokens.ease.standard },
      );
      animation = controls;
      const clearAnimation = () => {
        if (animation === controls) animation = null;
      };
      void controls.finished.then(clearAnimation, clearAnimation);
    }
  };

  const cleanups = openButtons.map((button) =>
    listen(button, 'click', () => openDialog(button)),
  );

  if (closeButton) cleanups.push(listen(closeButton, 'click', closeDialog));

  cleanups.push(
    listen(dialog, 'click', (event) => {
      if (event.target === dialog) closeDialog();
    }),
    listen(dialog, 'cancel', (event) => {
      event.preventDefault();
      closeDialog();
    }),
    listen(dialog, 'close', () => {
      closing = false;
      restoreFocus();
    }),
    listen(dialog, 'keydown', (event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault();
        closeDialog();
        return;
      }

      if (keyboardEvent.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        keyboardEvent.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (keyboardEvent.shiftKey && document.activeElement === first) {
        keyboardEvent.preventDefault();
        last.focus();
      } else if (!keyboardEvent.shiftKey && document.activeElement === last) {
        keyboardEvent.preventDefault();
        first.focus();
      }
    }),
  );

  return composeDisposers(
    ...cleanups,
    () => {
      destroyed = true;
      stopAnimation();
      if (dialog.hasAttribute('open')) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
      restoreFocus();
    },
  );
};

export default createMediaDialogController;
