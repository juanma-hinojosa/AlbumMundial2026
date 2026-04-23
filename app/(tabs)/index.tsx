import CountdownTimer from "@/components/CountdownTimer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useStickers } from "@/context/StickerContext";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, ImageBackground } from "expo-image";
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PlaceholderImage = require('@/assets/images/hero-home.jpg');
const LogoWorldCup = require('@/assets/images/logo-world-cup.png');


const LANGUAGES = [
  { code: 'es-LA', label: 'Español (Latinoamérica)' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
];

export default function Index() {
  const { t, i18n } = useTranslation(['translation', 'contador']);
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

  const { inventory, catalog } = useStickers();
  const insets = useSafeAreaInsets();

  // Animation values
  const logoScale = useSharedValue(0.8);
  const statsOpacity = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  // Calculate collection stats based on actual album data
  const stats = useMemo(() => {
    // Calculate total stickers from catalog (or fallback to 640 for World Cup)
    const totalStickers = catalog.length > 0 ? catalog.length : 640;

    // Count collected stickers (those with count > 0)
    const collectedCount = Object.values(inventory).reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);

    // Count duplicate stickers (count > 1)
    const duplicatesCount = Object.values(inventory).reduce((sum, count) => sum + Math.max(0, count - 1), 0);

    // Calculate accurate completion percentage
    const completionPercentage = totalStickers > 0 ? Math.round((collectedCount / totalStickers) * 100) : 0;

    return {
      collected: collectedCount,
      duplicates: duplicatesCount,
      completion: completionPercentage,
      total: totalStickers
    };
  }, [inventory, catalog]);

  // Animations
  useEffect(() => {
    logoScale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });

    statsOpacity.value = withTiming(1, {
      duration: 1000,
    });

    pulseAnim.value = withRepeat(
      withTiming(1.05, {
        duration: 2000,
      }),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ImageBackground
          source={PlaceholderImage}
          resizeMode="cover"
          style={styles.imageContainer}
          alt="Background Image Messi"
        >
          <View style={styles.gradientOverlay} />

          <View style={styles.content}>
            {/* Logo Section */}
            <Animated.View
              entering={FadeInUp.delay(200).duration(800)}
              style={[styles.logoSection, logoAnimatedStyle]}
            >
              <Image
                source={LogoWorldCup}
                style={styles.logo}
                alt="Fifa World Cup Logo"
              />
            </Animated.View>

            {/* Main Countdown Section */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(800)}
              style={styles.countdownSection}
            >
              <Animated.View style={pulseAnimatedStyle}>
                <Text style={styles.countdownTitle}>{t('contador:faltan')}</Text>
              </Animated.View>
              <CountdownTimer targetDate="2026-06-11T23:59:59" />
              <Text style={styles.subtitle}>{t('contador:subtitle')}</Text>
            </Animated.View>

            {/* Stats Cards */}
            <Animated.View
              entering={FadeInDown.delay(600).duration(800)}
              style={[styles.statsContainer, statsAnimatedStyle]}
            >
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="albums" size={24} color="#FFD700" />
                  <Text style={styles.statNumber}>{stats.collected}</Text>
                  <Text style={styles.statLabel}>{t('contador:obtenidas')}</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="copy" size={24} color="#FF6B6B" />
                  <Text style={styles.statNumber}>{stats.duplicates}</Text>
                  <Text style={styles.statLabel}>{t('contador:repetidas')}</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="trophy" size={24} color="#4ECDC4" />
                  <Text style={styles.statNumber}>{stats.completion}%</Text>
                  <Text style={styles.statLabel}>{t('contador:de')} {stats.total}</Text>
                </View>
              </View>
            </Animated.View>

          </View>
        </ImageBackground>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 40 : screenHeight > 700 ? 30 : 20,
  },
  logo: {
    width: Platform.OS === 'web' ? 100 : screenHeight > 700 ? 90 : 70,
    height: Platform.OS === 'web' ? 100 : screenHeight > 700 ? 90 : 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  countdownSection: {
    alignItems: 'center',
    marginVertical: screenHeight > 700 ? 20 : 15,
  },
  countdownTitle: {
    fontSize: Platform.OS === 'web' ? 32 : screenHeight > 700 ? 28 : 24,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: screenHeight > 700 ? 3 : 2,
    marginBottom: screenHeight > 700 ? 16 : 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: screenHeight > 700 ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  statsContainer: {
    marginVertical: screenHeight > 700 ? 20 : 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: screenHeight > 700 ? 16 : 12,
    padding: screenHeight > 700 ? 16 : 12,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statNumber: {
    fontSize: screenHeight > 700 ? 24 : 20,
    fontWeight: '700',
    color: '#ffffff',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: screenHeight > 700 ? 12 : 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
    textTransform:'capitalize'
  },
});