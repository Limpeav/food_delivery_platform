'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/stores/languageStore';

export const LanguageInitializer: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    // Sync language attribute on <html> element
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.setAttribute('data-lang', language);
    }
  }, [language]);

  return null;
};
