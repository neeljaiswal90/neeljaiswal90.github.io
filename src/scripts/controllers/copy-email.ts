import type { MotionControllerFactory } from '../core/controller';
import { composeDisposers, listen } from '../core/controller';

export const createCopyEmailController: MotionControllerFactory = (root, { window }) => {
  const button = root.querySelector<HTMLButtonElement>('#copy-email');
  if (!button) return;

  const initialLabel = button.textContent ?? 'Copy email';
  let feedbackTimer = 0;
  let destroyed = false;

  const clearFeedback = () => {
    if (feedbackTimer) window.clearTimeout(feedbackTimer);
    feedbackTimer = 0;
    button.textContent = initialLabel;
  };

  const openMailClient = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const copyEmail = async () => {
    const email = button.dataset.email;
    if (!email) return;

    if (!window.navigator.clipboard?.writeText) {
      openMailClient(email);
      return;
    }

    try {
      await window.navigator.clipboard.writeText(email);
      if (destroyed) return;
      clearFeedback();
      button.textContent = 'Email copied';
      feedbackTimer = window.setTimeout(clearFeedback, 1800);
    } catch {
      if (!destroyed) openMailClient(email);
    }
  };

  return composeDisposers(
    listen(button, 'click', () => {
      void copyEmail();
    }),
    () => {
      destroyed = true;
      clearFeedback();
    },
  );
};

export default createCopyEmailController;
