// AuxoKit themes map to the Figma "Themes" collection modes. Tokens switch automatically;
// never branch color classes on the theme in TS.
export const themes = ['modern', 'minimal', 'enterprise', 'mono'] as const;
export type AuxoTheme = (typeof themes)[number];

const STORAGE_KEY = 'auxokit-theme';

export function setTheme(theme: AuxoTheme, dark: boolean) {
  const el = document.documentElement;
  el.dataset.theme = theme;
  el.classList.toggle('dark', dark);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, dark }));
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}

export function loadTheme(): { theme: AuxoTheme; dark: boolean } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (saved && themes.includes(saved.theme)) return { theme: saved.theme, dark: !!saved.dark };
  } catch {
    // Fall through to the OS preference.
  }
  return { theme: 'modern', dark: window.matchMedia('(prefers-color-scheme: dark)').matches };
}
