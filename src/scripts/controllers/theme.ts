import type { MotionControllerFactory } from '../core/controller';
import { composeDisposers, listen } from '../core/controller';

const STORAGE_KEY = 'neel-portfolio-theme';

const themeColors = {
  studio: '#f6f7fb',
  cinema: '#1a1715',
  navy: '#0b1220',
} as const;

type ThemeName = keyof typeof themeColors;

function isThemeName(value: string | null): value is ThemeName {
  return value !== null && Object.hasOwn(themeColors, value);
}

export const createThemeController: MotionControllerFactory = (root, { document, window }) => {
  const documentRoot = document.documentElement;
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-theme-option]'));
  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  const readStoredTheme = (): ThemeName | null => {
    try {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY);
      return isThemeName(storedTheme) ? storedTheme : null;
    } catch {
      return null;
    }
  };

  const applyTheme = (theme: ThemeName, persist = false) => {
    documentRoot.dataset.theme = theme;
    themeMeta?.setAttribute('content', themeColors[theme]);

    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.themeOption === theme));
    }

    if (!persist) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme selection remains useful even when storage is unavailable.
    }
  };

  const initialTheme = readStoredTheme();
  const authoredTheme = documentRoot.dataset.theme ?? null;
  applyTheme(initialTheme ?? (isThemeName(authoredTheme) ? authoredTheme : 'studio'));

  const cleanups = buttons.map((button) =>
    listen(button, 'click', () => {
      const theme = button.dataset.themeOption ?? null;
      if (isThemeName(theme)) applyTheme(theme, true);
    }),
  );

  cleanups.push(
    listen(window, 'storage', (event) => {
      const storageEvent = event as StorageEvent;
      if (storageEvent.key === STORAGE_KEY && isThemeName(storageEvent.newValue)) {
        applyTheme(storageEvent.newValue);
      }
    }),
  );

  return composeDisposers(...cleanups);
};

export default createThemeController;
