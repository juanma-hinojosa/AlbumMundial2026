import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Textos de traducción
const resources = {
  'es-LA': {
    translation: {
      settings: 'Configuración',
      language: 'Idioma',
      selectLanguage: 'Seleccionar Idioma',
    }
  },
  'en': {
    translation: {
      settings: 'Settings',
      language: 'Language',
      selectLanguage: 'Select Language',
    }
  },
  'pt-BR': {
    translation: {
      settings: 'Configurações',
      language: 'Idioma',
      selectLanguage: 'Selecionar Idioma',
    }
  }
};

// Detector de idioma personalizado para manejar AsyncStorage
const languageDetector: any = {
  type: 'languageDetector',
  async: true, // Avisamos que es asíncrono
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      // Si no hay idioma guardado, detecta el del dispositivo
      const deviceLang = Localization.getLocales()[0].languageTag;
      const defaultLang = ['es-LA', 'en', 'pt-BR'].includes(deviceLang) ? deviceLang : 'es-LA';
      
      return callback(defaultLang);
    } catch (error) {
      console.error('Error reading language', error);
      return callback('es-LA');
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // 👈 ESTO ES VITAL EN REACT NATIVE
    resources,
    fallbackLng: 'es-LA',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false // 👈 EVITA CRASHES DE RENDERIZADO ASÍNCRONO EN EXPO
    }
  });

export default i18n;