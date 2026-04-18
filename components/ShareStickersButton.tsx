import { useStickers } from '@/context/StickerContext'; // Ajusta la ruta si es necesario
import { supabase } from '@/utils/supabase'; // Ajusta la ruta si es necesario
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface StickerData {
  id: string;
  codigo: string;
  pais_o_grupo: string;
}

export const ShareStickersButton = () => {
  const { inventory } = useStickers();
  const [isSharing, setIsSharing] = useState(false);

  // Función para extraer solo los números y ordenar correctamente (ej: "ARG 10" > "ARG 2")
  const sortByNumber = (a: string, b: string) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  };

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // 1. Obtenemos todos los stickers de la base de datos
      const { data, error } = await supabase
        .from('stickers')
        .select('id, codigo, pais_o_grupo');

      if (error) {
        console.error("Error obteniendo stickers para compartir:", error);
        Alert.alert("Error", "Hubo un problema al generar la lista.");
        return;
      }

      if (!data) return;

      // 2. Clasificamos en faltantes y repetidas agrupadas por país/grupo
      const missing: Record<string, string[]> = {};
      const repeated: Record<string, string[]> = {};

      data.forEach((sticker: StickerData) => {
        const qty = inventory[sticker.id] || 0;
        const country = sticker.pais_o_grupo;
        const code = sticker.codigo;

        if (qty === 0) {
          if (!missing[country]) missing[country] = [];
          missing[country].push(code);
        } else if (qty > 1) {
          if (!repeated[country]) repeated[country] = [];
          // Opcional: si quieres mostrar cuántas repetidas tienes de cada una
          // const extras = qty - 1;
          // repeated[country].push(`${code} (x${extras})`);
          repeated[country].push(code);
        }
      });

      // 3. Construimos el mensaje de texto formateado
      let message = "¡Hola! Te comparto mi lista de figuritas 🏆\n\n";

      // Agregamos las FALTANTES
      message += "❌ ME FALTAN:\n";
      const missingCountries = Object.keys(missing).sort();
      if (missingCountries.length === 0) {
        message += "¡Ninguna! Álbum completo 🎉\n";
      } else {
        missingCountries.forEach((country) => {
          const codes = missing[country].sort(sortByNumber).join(', ');
          message += `*${country}:* ${codes}\n`;
        });
      }

      // Agregamos las REPETIDAS
      message += "\n🔁 TENGO REPETIDAS:\n";
      const repeatedCountries = Object.keys(repeated).sort();
      if (repeatedCountries.length === 0) {
        message += "Por ahora no tengo repetidas.\n";
      } else {
        repeatedCountries.forEach((country) => {
          const codes = repeated[country].sort(sortByNumber).join(', ');
          message += `*${country}:* ${codes}\n`;
        });
      }

      // 4. Abrimos el menú nativo para compartir (WhatsApp, Telegram, etc.)
      await Share.share({
        message: message,
        title: 'Mi lista de intercambio de figuritas', // Título (usado principalmente en emails)
      });

    } catch (error) {
      console.error("Error al compartir:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleShare}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Compartir mi lista 📤</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#25D366', // Un verde estilo WhatsApp que llama a la acción de compartir
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});