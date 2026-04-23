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
      loadingApp: 'Iniciando aplicación...',
      tabs: {
        home: 'Inicio',
        album: 'Álbum',
        fixture: 'Partidos',
        exchange: 'Intercambiar',
        account: 'Cuenta',
        settings: 'Ajustes'
      }
    },
    contador: {
      faltan: 'faltan',
      dias: 'dias',
      horas: 'horas',
      segundos: 'seg',
      subtitle: 'para la Copa del Mundo',
      obtenidas: 'Obtenidas',
      repetidas: 'Repetidas',
      de: 'de'
    },
    album: {
      grupo: 'Grupo',
      albumTitle: 'Mi Álbum',
      albumSubtitle: 'Colección Mundial 2026',
      tabs: {
        all: 'Todas',
        missing: 'Faltantes',
        repeated: 'Repetidas',
        stats: 'Estadísticas'
      },
      remainingTitle: '¡A buscarlas!',
      repeatedTitle: 'Listas para cambiar',
      stats: {
        completed: 'Completado',
        missing: 'Faltantes',
        obtained: 'Conseguidas',
        specialMissing: 'Especiales Faltantes',
        specialSubtitle: 'FWC, CC y Escudos'
      },
      share: 'Compartir mis repetidas'
    },
    swap: {
      headerTitle: 'Intercambio',
      headerSubtitle: 'Comparte tu coleccion',
      statRepeat: 'Repetidas',
      statFaltantes: 'Faltantes',
      cardQr: 'Tu Codigo QR',
      loadingText: 'Generando codigo...',
      codeCompact: ' Código compacto - ¡Escanea fácil y rápido!',
      code: 'Este código contiene tus repetidas y faltantes.',
      shareCodeLabel: 'Codigo',
      scantext: 'Escanear Código'
    }
  },
  'en': {
    translation: {
      settings: 'Settings',
      language: 'Language',
      selectLanguage: 'Select Language',
      loadingApp: 'Starting app...',
      tabs: {
        home: 'Home',
        album: 'Album',
        fixture: 'Matches',
        exchange: 'Trade',
        account: 'Account',
        settings: 'Settings'
      }
    },
    contador: {
      faltan: 'there are',
      dias: 'days',
      horas: 'hours',
      segundos: 'sec',
      subtitle: 'left until the start for the FIFA World Cup',
      obtenidas: 'obtained',
      repetidas: 'double',
      de: 'of'
    },
    album: {
      grupo: 'Group',
      albumTitle: 'My Album',
      albumSubtitle: 'World Cup Collection 2026',
      tabs: {
        all: 'All',
        missing: 'Missing',
        repeated: 'Repeated',
        stats: 'Stats'
      },
      remainingTitle: 'Go find them!',
      repeatedTitle: 'Ready to trade',
      stats: {
        completed: 'Completed',
        missing: 'Missing',
        obtained: 'Collected',
        specialMissing: 'Special Missing',
        specialSubtitle: 'FWC, CC and Badges'
      },
      share: 'Share my duplicates'

    },
    swap: {
      headerTitle: 'Trade',
      headerSubtitle: 'Show your collection and trade with others',
      statRepeat: 'Duplicates',
      statFaltantes: 'Missing items',
      cardQr: 'Your QR Code',
      loadingText: 'Creating your code...',
      codeCompact: 'Compact code — just scan and go!',
      code: 'This shows what you have and what you’re still looking for.',
      shareCodeLabel: 'Code',
      scantext: 'Scan'
    }
  },
  'pt-BR': {
    translation: {
      settings: 'Configurações',
      language: 'Idioma',
      selectLanguage: 'Selecionar Idioma',
      loadingApp: 'Iniciando aplicativo...',
      tabs: {
        home: 'Início',
        album: 'Álbum',
        fixture: 'Jogos',
        exchange: 'Trocar',
        account: 'Conta',
        settings: 'Configurações'
      }
    },
    contador: {
      faltan: 'faltam',
      dias: 'dias',
      horas: 'horas',
      segundos: 'seg',
      subtitle: 'para o inicio da Copa do Mundo',
      obtenidas: 'Obtidas',
      repetidas: 'Repetidas',
      de: 'de'
    },
    album: {
      grupo: 'Grupo',
      albumTitle: 'Meu Álbum',
      albumSubtitle: 'Coleção Copa do Mundo 2026',
      tabs: {
        all: 'Todas',
        missing: 'Faltantes',
        repeated: 'Repetidas',
        stats: 'Estatísticas'
      },
      remainingTitle: 'Bora buscá-las!',
      repeatedTitle: 'Prontas para trocar',
      stats: {
        completed: 'Completo',
        missing: 'Faltantes',
        obtained: 'Obtidas',
        specialMissing: 'Especiais Faltantes',
        specialSubtitle: 'FWC, CC e Brasão'
      },
      share: 'Compartilhar minhas repetidas'

    },
    swap: {
      headerTitle: 'Trocas',
      headerSubtitle: 'Mostre sua coleção e troque com outros',
      statRepeat: 'Figurinhas repetidas',
      statFaltantes: 'Figurinhas faltando',
      cardQr: 'Seu QR Code',
      loadingText: 'Gerando seu código...',
      codeCompact: 'Código compacto — é só escanear!',
      code: 'Aqui estão suas figurinhas repetidas e as que você ainda procura.',
      shareCodeLabel: 'Código',
      scantext: 'Escanear'
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
  init: () => { },
  cacheUserLanguage: () => { },
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