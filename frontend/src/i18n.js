import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../public/locales/en.json';
import te from '../public/locales/te.json';
import hi from '../public/locales/hi.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te },
    hi: { translation: hi },
  },
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
