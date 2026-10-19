import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ur from './locales/ur.json';
import ta from './locales/ta.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ur: { translation: ur },
      ta: { translation: ta }
    },
    supportedLngs: ['en', 'hi', 'ta', 'ur'],
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

const applyDocumentLanguage = (language) => {
  const baseLanguage = language?.split('-')[0] || 'en';
  document.documentElement.lang = baseLanguage;
  document.documentElement.dir = baseLanguage === 'ur' ? 'rtl' : 'ltr';
};

applyDocumentLanguage(i18n.resolvedLanguage);
i18n.on('languageChanged', applyDocumentLanguage);

export default i18n;
