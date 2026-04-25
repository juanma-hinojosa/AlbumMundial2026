import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function LogoutButton() {

  const { t } = useTranslation();


  const handleSignOut = async () => {
    Alert.alert(
      t('translation:logout:logoutTitle', 'Cerrar sesión'), // Usa tus llaves de traducción si las tienes
      t('translation:logout:logoutConfirm', '¿Estás seguro de que deseas salir?'),
      [
        { text: t('translation:logout:cancel', 'Cancelar'), style: 'cancel' },
        {
          text: t('translation:logout:logout', 'Salir'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", "No se pudo cerrar sesión. Inténtalo de nuevo.");
              console.error("Error al cerrar sesión:", error.message);
            }
          }
        }
      ]
    );
  };
  return (
    <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.logoutContainer}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          console.log("Botón presionado"); // <-- Agrega este log para debug
          handleSignOut();
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={24} color="#ff4444" />
        <Text style={styles.logoutText}>{t('translation:logout:logout', 'Cerrar sesión')}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 'auto', // Empuja el botón hacia la parte inferior de la pantalla
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 10, // Asegura que esté por encima de otros elemento
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffecec', // Un fondo rojo muy claro
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  }
});