import { AuthProvider } from "@/context/AuthContext";
import { StickerProvider, useStickers } from "@/context/StickerContext";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

// Creamos un componente intermedio que verifique la carga
function RootNavigator() {
  const { isLoading } = useStickers();

  if (isLoading) {
    // Muestra un spinner mientras carga los datos del teléfono
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StickerProvider>
        <RootNavigator />
      </StickerProvider>
    </AuthProvider>

  );
}
