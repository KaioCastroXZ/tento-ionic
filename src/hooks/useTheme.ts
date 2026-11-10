import { useEffect, useState } from 'react';

import type { ThemeMode } from '../model/settingsState';

const DARK_CLASS = 'ion-palette-dark';
const QUERY = '(prefers-color-scheme: dark)';

const systemPrefersDark = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;

/**
 * Aplica o tema: liga/desliga a classe `ion-palette-dark` no `<html>`.
 * Em "Sistema" acompanha `prefers-color-scheme` ao vivo. Devolve se o tema resolvido é escuro.
 */
export const useTheme = (mode: ThemeMode): boolean => {
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  const isDark = mode === 'system' ? systemDark : mode === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle(DARK_CLASS, isDark);
  }, [isDark]);

  return isDark;
};
