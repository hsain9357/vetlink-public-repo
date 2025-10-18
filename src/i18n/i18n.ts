import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';

// Determine the best language for the user
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback: (lang: string) => void) => {
    const locale = Localization.getLocales()[0].languageCode;
    callback(locale || 'en');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
    },
    debug: true,
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
  });

// Set RTL for Arabic
i18n.on('languageChanged', (lng) => {
  I18nManager.forceRTL(lng === 'ar');
});

export default i18n;