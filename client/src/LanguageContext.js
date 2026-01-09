import React, { createContext, useContext, useState, useEffect } from 'react';
import stringsData from './strings';

const LanguageContext = createContext();

export const LANGUAGES = {
  eng: { code: 'eng', name: 'English', flag: '🇬🇧' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
};

export function LanguageProvider({ children }) {
  // Try to get saved language from localStorage, default to 'de' for Berlin
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('los-language');
    return saved && LANGUAGES[saved] ? saved : 'de';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('los-language', language);
  }, [language]);

  // Get strings for current language
  const strings = {
    ...stringsData[language],
    ...stringsData.shared,
  };

  const value = {
    language,
    setLanguage,
    strings,
    languages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;

