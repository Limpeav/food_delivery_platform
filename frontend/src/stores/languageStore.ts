'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, locales, TranslationKeys } from '@/locales';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationKeys;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      t: locales.en,
      setLanguage: (language: Language) => {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
          document.documentElement.setAttribute('data-lang', language);
        }
        set({
          language,
          t: locales[language] || locales.en,
        });
      },
      toggleLanguage: () => {
        const next = get().language === 'en' ? 'km' : 'en';
        get().setLanguage(next);
      },
    }),
    {
      name: 'cravery_language',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const lang = state.language || 'en';
          state.t = locales[lang] || locales.en;
          if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
            document.documentElement.setAttribute('data-lang', lang);
          }
        }
      },
    }
  )
);

/**
 * Convenient hook for components to access language and translation strings
 */
export function useTranslation() {
  const { language, setLanguage, toggleLanguage, t } = useLanguageStore();
  const currentTranslations = locales[language] || locales.en;

  return {
    language,
    setLanguage,
    toggleLanguage,
    t: currentTranslations,
    isKhmer: language === 'km',
    isEnglish: language === 'en',
  };
}
