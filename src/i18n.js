import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import brand from './config/brand.js';

import translationFR from './locales/fr.json';
import translationNL from './locales/nl.json';

const resources = {
    fr: {
        translation: translationFR
    },
    nl: {
        translation: translationNL
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: brand.defaultLang, // dynamically determined based on build config
        supportedLngs: ['fr', 'nl'],
        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        }
    });

export default i18n;
