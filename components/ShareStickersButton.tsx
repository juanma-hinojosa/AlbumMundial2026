import { useStickers } from '@/context/StickerContext'; // Ajusta la ruta si es necesario
import { supabase } from '@/utils/supabase'; // Ajusta la ruta si es necesario
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const {t} = useTranslation();
 const { inventory } = useStickers();
  const [isSharing, setIsSharing] = useState(false);

  // Función para ordenar numéricamente (ahora recibe solo números)
  const sortByNumber = (a: string, b: string) => {
    return (parseInt(a) || 0) - (parseInt(b) || 0);
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

      // 2. Clasificamos en faltantes y repetidas, y guardamos el orden original
      const missing: Record<string, string[]> = {};
      const repeated: Record<string, string[]> = {};
      const orderedCountries: string[] = []; // Guardará el orden original de la DB

      data.forEach((sticker: StickerData) => {
        const qty = inventory[sticker.id] || 0;
        const country = sticker.pais_o_grupo;
        // Extraemos solo los números del código (ej: "ALG10" -> "10")
        const numberOnly = sticker.codigo.replace(/\D/g, '');

        // Registramos el país en nuestro array de orden si es la primera vez que lo vemos
        if (!orderedCountries.includes(country)) {
          orderedCountries.push(country);
        }

        if (qty === 0) {
          if (!missing[country]) missing[country] = [];
          missing[country].push(numberOnly);
        } else if (qty > 1) {
          if (!repeated[country]) repeated[country] = [];
          repeated[country].push(numberOnly);
        }
      });

      // 3. Construimos el mensaje de texto formateado
      let message = "¡Hola! Te comparto mi lista de figuritas 🏆\n\n";

      // Agregamos las FALTANTES
      message += "❌ ME FALTAN:\n";
      let hasMissing = false;
      
      // Recorremos usando el orden original de la base de datos
      orderedCountries.forEach((country) => {
        if (missing[country] && missing[country].length > 0) {
          hasMissing = true;
          const codes = missing[country].sort(sortByNumber).join(', ');
          message += `*${country}:* ${codes}\n`;
        }
      });

      if (!hasMissing) {
        message += "¡Ninguna! Álbum completo 🎉\n";
      }

      // Agregamos las REPETIDAS
      message += "\n🔁 TENGO REPETIDAS:\n";
      let hasRepeated = false;

      // Recorremos usando el orden original de la base de datos
      orderedCountries.forEach((country) => {
        if (repeated[country] && repeated[country].length > 0) {
          hasRepeated = true;
          const codes = repeated[country].sort(sortByNumber).join(', ');
          message += `*${country}:* ${codes}\n`;
        }
      });

      if (!hasRepeated) {
        message += "Por ahora no tengo repetidas.\n";
      }

      // 4. Abrimos el menú nativo para compartir (WhatsApp, Telegram, etc.)
      await Share.share({
        message: message,
        title: 'Mi lista de intercambio de figuritas',
      });

    } catch (error) {
      console.error("Error al compartir:", error);
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <View >
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator color="#2A398D" />
        ) : (
          <>
            <Ionicons name="share-social" size={20} color="#2A398D" />
            <Text style={styles.shareText}>{t('album:share')}📤</Text>

          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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