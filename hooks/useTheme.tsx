
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { THEMES } from '../constants';
import type { Theme } from '../types';

interface ThemeContextType {
  theme: string;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    try {
      const savedTheme = window.localStorage.getItem('app-theme');
      return savedTheme || 'theme-golden';
    } catch (error) {
      console.error("Could not read theme from localStorage", error);
      return 'theme-golden';
    }
  });

  const setTheme = useCallback((themeId: string) => {
    try {
      window.localStorage.setItem('app-theme', themeId);
      setThemeState(themeId);
    } catch (error) {
      console.error("Could not save theme to localStorage", error);
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
