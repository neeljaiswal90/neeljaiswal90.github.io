document.documentElement.classList.add('js');

try {
  const storageKey = document.documentElement.dataset.themeStorageKey;
  const theme = storageKey ? localStorage.getItem(storageKey) : null;
  const colors = { studio: '#f6f7fb', cinema: '#1a1715', navy: '#0b1220' };
  if (theme && Object.prototype.hasOwnProperty.call(colors, theme)) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]);
  }
} catch {
  // Storage is optional; Studio remains the default.
}
