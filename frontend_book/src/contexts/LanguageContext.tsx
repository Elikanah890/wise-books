import { create } from 'zustand';
import { translations, type Language, type TranslationSchema } from '../i18n/translations';

const LANGUAGE_KEY = 'wisebook_language';

function initialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return stored === 'sw' ? 'sw' : 'en';
  } catch {
    return 'en';
  }
}

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggle: () => void;
}

export const useLanguage = create<LanguageState>((set, get) => ({
  language: initialLanguage(),
  setLanguage: (language) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // ignore storage failures (private mode)
    }
    document.documentElement.lang = language;
    set({ language });
  },
  toggle: () => get().setLanguage(get().language === 'en' ? 'sw' : 'en'),
}));

/** Returns the translation dictionary for the active language. */
export function useT(): TranslationSchema {
  const language = useLanguage((state) => state.language);
  return translations[language];
}
