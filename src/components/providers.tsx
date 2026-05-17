'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { SessionProvider } from 'next-auth/react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ theme, toggle }}>
        <I18nProvider>{children}</I18nProvider>
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
