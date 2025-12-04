'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'cn';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferredLocale') as Locale;
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'cn')) {
        return savedLocale;
      }
    }
    return defaultLocale;
  });
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLocale', newLocale);
    }
  };
  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}