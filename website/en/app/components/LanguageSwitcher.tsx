'use client';

import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/app/providers/I18nProvider'; 

interface Language {
  code: 'en' | 'cn';
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'cn', name: 'Chinese', nativeName: '中文' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n(); 
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (code: 'en' | 'cn') => {
    setLocale(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-accent transition-colors border"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage.nativeName}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-card shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  locale === language.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{language.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}