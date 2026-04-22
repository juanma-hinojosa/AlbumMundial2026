import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AuthProvider } from "@/context/AuthContext";
import { StickerProvider, useStickers } from "@/context/StickerContext";
import '@/utils/i18n';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn } from 'react-native-reanimated';

// Creamos un componente intermedio que verifique la carga
function RootNavigator() {
  const { isLoading } = useStickers();

  if (isLoading) {
    return (
      <LoadingSpinner
        message="Cargando tu álbum..."
        size="large"
        style={{ backgroundColor: '#f8f9fa' }}
      />
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
    </Animated.View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StickerProvider>
          <RootNavigator />
        </StickerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
