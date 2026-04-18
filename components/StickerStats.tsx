import { useStickers } from '@/context/StickerContext';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { ShareStickersButton } from './ShareStickersButton';

const { width } = Dimensions.get('window');

interface StatsState {
  total: number;
  conseguidas: number;
  faltantes: number;
  especialesFaltantes: number;
  porcentaje: number;
}

export const StickerStats = () => {
  const { inventory, isLoading: loadingInventory } = useStickers();
  const [stats, setStats] = useState<StatsState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndCalculateStats();
  }, [inventory]);

  const fetchAndCalculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('stickers')
        .select('id, es_especial');

      if (error) throw error;

      if (data) {
        const totalStickers = data.length;
        let conseguidas = 0;
        let especialesFaltantes = 0;

        data.forEach((sticker) => {
          const qty = inventory[sticker.id] || 0;

          if (qty > 0) {
            conseguidas++;
          } else if (sticker.es_especial) {
            especialesFaltantes++;
          }
        });

        const faltantes = totalStickers - conseguidas;
        const porcentaje = totalStickers > 0 ? (conseguidas / totalStickers) * 100 : 0;

        setStats({
          total: totalStickers,
          conseguidas,
          faltantes,
          especialesFaltantes,
          porcentaje
        });
      }
    } catch (error) {
      console.error("Error stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingInventory) {
    return <ActivityIndicator size="small" color="#800020" style={{ margin: 20 }} />;
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.grid}>

        {/* 1. Porcentaje del álbum */}
        <View style={styles.card}>
          <Text style={styles.label}>Completado</Text>
          <Text style={[styles.value, { color: '#800020' }]}>
            {stats?.porcentaje.toFixed(1)}%
          </Text>
        </View>

        {/* 2. Stickers faltantes */}
        <View style={styles.card}>
          <Text style={styles.label}>Faltantes</Text>
          <Text style={styles.value}>{stats?.faltantes}</Text>
        </View>

        {/* 3. Stickers conseguidas */}
        <View style={styles.card}>
          <Text style={styles.label}>Conseguidas</Text>
          <Text style={styles.value}>{stats?.conseguidas}</Text>
        </View>

        {/* 4. Especiales faltantes */}
        <View style={styles.card}>
          <Text style={styles.label}>Especiales Faltantes</Text>
          <Text style={[styles.value, { color: '#f39c12' }]}>
            {stats?.especialesFaltantes}
          </Text>
          <Text style={styles.miniLabel}>FWC, CC y Escudos</Text>
        </View>

      </View>

      <ShareStickersButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: (width / 2) - 20, // Divide el ancho en dos columnas exactas
    padding: 20,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombras
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 5,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  miniLabel: {
    fontSize: 9,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  }
});