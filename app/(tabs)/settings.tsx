import ErrorBoundary from "@/components/ErrorBoundary";
import LoginScreen from "@/components/Login";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGES = [
  { code: 'es-LA', label: 'Español (Latinoamérica)' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth(); // <-- OBTENER USUARIO DEL CONTEXTO
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [showLogin, setShowLogin] = useState(false); // <-- ESTADO PARA MOSTRAR LOGIN

  // Sincroniza el estado si el idioma cambia desde otro lugar
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  // Si el usuario se loguea, cerramos automáticamente la vista de Login
  useEffect(() => {
    if (user) setShowLogin(false);
  }, [user]);

  const changeLanguage = async (langCode: string) => {
    setCurrentLang(langCode);
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user-language', langCode);
  };

  if (showLogin && !user) {
    return (
      <View style={{ flex: 1 }}>
        <LoginScreen />
      </View>
    );
  }


  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }} >
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

          {user ? (
            <LogoutButton />
          ) : (
            <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.loginContainer}>
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={() => setShowLogin(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="log-in-outline" size={24} color="#ffffff" />
                <Text style={styles.loginText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

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
  // Agrega estos estilos para el botón de Iniciar Sesión (ajústalos a tu diseño)
  loginContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000', // Color oscuro o el que uses en tu app
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});