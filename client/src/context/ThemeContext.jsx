import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'printjack-theme';

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => (prev === 'default' ? 'visitingCard' : 'default'));
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}