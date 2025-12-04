'use client';

import { useTheme } from '@/app/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-secondary hover:bg-accent transition-colors border"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <div className="relative w-5 h-5">
        <Sun className={`w-5 h-5 text-amber-500 transition-all duration-300 ${
          theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
        }`} />
        <Moon className={`absolute top-0 left-0 w-5 h-5 text-slate-400 transition-all duration-300 ${
          theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
        }`} />
      </div>
    </button>
  );
}