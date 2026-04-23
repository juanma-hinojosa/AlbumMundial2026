import ErrorBoundary from "@/components/ErrorBoundary";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGES = [
  { code: 'es-LA', label: 'Español (Latinoamérica)' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Sincroniza el estado si el idioma cambia desde otro lugar
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const changeLanguage = async (langCode: string) => {
    setCurrentLang(langCode);
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user-language', langCode);
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>{t('settings')}</Text>
          <Text style={styles.headerSubtitle}>{t('selectLanguage')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.listContainer}>
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.languageOption, isActive && styles.activeOption]}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.8}
              >
                <Text style={[styles.languageText, isActive && styles.activeText]}>
                  {lang.label}
                </Text>
                {isActive && <Ionicons name="checkmark" size={20} color="#ffffff" />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  activeOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  languageText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  activeText: {
    color: '#ffffff',
  },
});