const themeToggle = document.querySelector('.nav-theme-toggle');
const metaThemeColor = document.querySelector('meta[name="theme-color"]');

function setTheme(theme) {
  const isLight = theme === 'light';
  if (isLight) html.dataset.theme = 'light';
  else delete html.dataset.theme;

  themeToggle?.setAttribute('aria-checked', String(isLight));
  metaThemeColor?.setAttribute('content', isLight ? '#fafafa' : '#0a0a0a');
  glitchInstance?.setColors(getGlitchColors());
}

function initTheme() {
  setTheme(storage.get('theme') === 'light' ? 'light' : 'dark');

  themeToggle?.addEventListener('click', () => {
    const next = html.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    storage.set('theme', next);
  });
}
