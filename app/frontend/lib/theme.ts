export function initTheme() {
  // Check if user has a theme preference in localStorage
  const savedTheme = localStorage.getItem('theme');

  // If there's a saved theme, use it
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    return;
  }

  // Otherwise, use system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.toggle('dark', e.matches);
    }
  });
}

export function setTheme(theme: 'light' | 'dark') {
  localStorage.setItem('theme', theme);

  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function getTheme() {
  return localStorage.getItem('theme');
}

export function isDarkTheme() {
  return getTheme() === 'dark';
}
