import ScannerScreen from '@/components/ScannerScreen';
import { useStickers } from '@/context/StickerContext';
import { useAuth } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { generateCompactQR, generateQRString } from '@/utils/exchangeLogic';
import hapticFeedback from '@/utils/haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  SlideInUp,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MyQRScreen() {
  const { inventory, catalog } = useStickers();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [qrData, setQrData] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Animation values
  const qrScale = useSharedValue(0.8);
  const buttonScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const floatingAnim = useSharedValue(0);

  // Calculate sharing stats
  const sharingStats = useMemo(() => {
    const duplicates = Object.entries(inventory).filter(([_, count]) => count > 1).length;
    const totalStickers = catalog.length || 640; // Fallback to 640 for World Cup
    const collectedStickers = Object.values(inventory).filter(count => count > 0).length;
    const missing = totalStickers - collectedStickers;
    return { duplicates, missing };
  }, [inventory, catalog]);

  // Animations
  useEffect(() => {
    cardOpacity.value = withTiming(1, {
      duration: 800,
    });

    qrScale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });

    floatingAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  // Generate QR code when inventory or catalog changes
  useEffect(() => {
    const generateQR = async () => {
      if (!catalog.length) return; // Wait for catalog to load

      setIsGeneratingQR(true);
      setQrError(null);

      try {
        // Try compact QR first
        const compactCode = await generateCompactQR(inventory, catalog, user?.id);

        if (compactCode) {
          setQrData(compactCode);
          // Animate QR appearance
          qrScale.value = withSequence(
            withTiming(0.8, { duration: 200 }),
            withSpring(1, { damping: 6, stiffness: 150 })
          );
        } else {
          console.warn('Compact QR generation failed, using legacy format');
          const legacyCode = generateQRString(inventory, catalog);
          setQrData(legacyCode);
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        setQrError('Error al generar código QR');
        const legacyCode = generateQRString(inventory, catalog);
        setQrData(legacyCode);
      } finally {
        setIsGeneratingQR(false);
      }
    };

    generateQR();
  }, [inventory, catalog, user?.id]);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const qrAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qrScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const floatingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingAnim.value * 10 }],
  }));

  const handleScanPress = () => {
    hapticFeedback.medium();
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    setShowScanner(true);
  };

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* MODAL DEL ESCANER */}
        <Modal visible={showScanner} animationType="none" transparent>
          <Animated.View
            entering={SlideInUp.duration(400)}
            exiting={SlideOutDown.duration(300)}
            style={styles.modalContainer}
          >
            <ScannerScreen onClose={() => setShowScanner(false)} />
          </Animated.View>
        </Modal>

        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Intercambio</Text>
          <Text style={styles.headerSubtitle}>Comparte tu colección</Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.statsContainer}
        >
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(76, 236, 196, 0.15)' }]}>
              <Ionicons name="copy" size={24} color="#4ECDC4" />
              <Text style={[styles.statNumber, { color: '#4ECDC4' }]}>{sharingStats.duplicates}</Text>
              <Text style={styles.statLabel}>Repetidas</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
              <Ionicons name="help-circle" size={24} color="#FF6B6B" />
              <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>{sharingStats.missing}</Text>
              <Text style={styles.statLabel}>Faltantes</Text>
            </View>
          </View>
        </Animated.View>

        {/* Main QR Card */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(800)}
          style={[styles.qrCard, cardAnimatedStyle]}
        >
          <View style={styles.cardContent}>
            <Animated.View style={floatingAnimatedStyle}>
              <View style={styles.qrHeader}>
                <Ionicons name="qr-code" size={28} color="#2A398D" />
                <Text style={styles.cardTitle}>Tu Código QR</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.qrContainer, qrAnimatedStyle]}>
              {isGeneratingQR ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2A398D" />
                  <Text style={styles.loadingText}>Generando código...</Text>
                </View>
              ) : qrError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={50} color="#d5191e" />
                  <Text style={styles.errorText}>{qrError}</Text>
                </View>
              ) : (
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={qrData}
                    size={Platform.OS === 'web' ? 280 : Math.min(screenWidth - 120, screenHeight > 700 ? 250 : 200)}
                    color="black"
                    backgroundColor="white"
                  />
                  <View style={styles.qrOverlay}>
                    <Ionicons name="football" size={24} color="#d5191e" />
                  </View>
                </View>
              )}
            </Animated.View>

            <View style={styles.qrFooter}>
              <Text style={styles.infoText}>
                {qrData.length === 8
                  ? '🚀 Código compacto - ¡Escanea fácil y rápido!'
                  : 'Este código contiene tus repetidas y faltantes.'}
              </Text>

              {qrData.length === 8 && (
                <View style={styles.shareCodeContainer}>
                  <Text style={styles.shareCodeLabel}>Código:</Text>
                  <Text style={styles.shareCodeText}>{qrData}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.actionContainer}
        >
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanPress}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.scanText}>Escanear Código</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
            <Ionicons name="share-social" size={20} color="#2A398D" />
            <Text style={styles.shareText}>Compartir</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(26, 26, 46, 0.7)',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(26, 26, 46, 0.6)',
    fontWeight: '500',
    textAlign: 'center',
  },
  qrCard: {
    flex: 1,
    minHeight: screenHeight > 700 ? 500 : 400,
    maxHeight: screenHeight > 700 ? '70%' : '65%',
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  cardContent: {
    flex: 1,
    padding: screenHeight > 700 ? 24 : 16,
    justifyContent: 'space-around',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A398D',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    position: 'relative',
    padding: screenHeight > 700 ? 20 : 16,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignSelf: 'center',
  },
  qrOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  qrFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(26, 26, 46, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  shareCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 57, 141, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    gap: 8,
  },
  shareCodeLabel: {
    fontSize: 14,
    color: 'rgba(42, 57, 141, 0.8)',
    fontWeight: '500',
  },
  shareCodeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A398D',
    letterSpacing: 1,
  },
  loadingContainer: {
    width: Platform.OS === 'web' ? 280 : Math.min(screenWidth - 120, screenHeight > 700 ? 250 : 200),
    height: Platform.OS === 'web' ? 280 : Math.min(screenWidth - 120, screenHeight > 700 ? 250 : 200),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 248, 248, 0.8)',
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    width: Platform.OS === 'web' ? 280 : Math.min(screenWidth - 120, screenHeight > 700 ? 250 : 200),
    height: Platform.OS === 'web' ? 280 : Math.min(screenWidth - 120, screenHeight > 700 ? 250 : 200),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 248, 248, 0.8)',
    borderRadius: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#d5191e',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  actionContainer: {
    gap: 12,
    paddingBottom: screenHeight > 700 ? 20 : 10,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#d5191e',
    paddingVertical: screenHeight > 700 ? 18 : 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  scanText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(42, 57, 141, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A398D',
  },
});