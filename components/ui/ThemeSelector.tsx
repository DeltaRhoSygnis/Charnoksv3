
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../types';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();

  const groupedThemes = themes.reduce((acc, currentTheme) => {
    const category = currentTheme.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(currentTheme);
    return acc;
  }, {} as Record<string, Theme[]>);

  return (
    <div className="bg-card-bg backdrop-blur-md rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-bold mb-4 text-text-primary">Select Theme</h3>
      {Object.entries(groupedThemes).map(([category, themeList]) => (
        <div key={category} className="mb-6">
          <h4 className="font-semibold text-text-secondary mb-3">{category} Themes</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {themeList.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-lg text-center transition-all duration-200 border-2 ${
                  theme === t.id ? 'border-primary scale-105' : 'border-transparent hover:border-primary/50'
                }`}
              >
                <div className={`${t.id} w-full h-12 rounded-md mb-2 flex items-center justify-center animate-gradient-x`}>
                </div>
                <span className="font-medium text-sm text-text-primary">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThemeSelector;
