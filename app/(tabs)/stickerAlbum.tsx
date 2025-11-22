import { StickerItem } from "@/components/stickerItem";
import { albumData } from "@/data/albumData";
import { Image } from "expo-image";
// import albumData from "@/data/figus-db.json";
import { useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// albumData
export default function StickerAlbumScreen() {
  const [inventory, setInventory] = useState<Record<string, number>>({
    "ARG_10": 2,
    // "QAT_1": 1
  })

  const handleToggle = (id: string) => {
    setInventory(prev => {
      const currentCount = prev[id] || 0;
      return { ...prev, [id]: currentCount + 1 };
    });
  }
  const sections = albumData.map(country => ({
    title: country.name,
    code: country.code,
    data: [country.stickers] // <--- OJO AQUÍ: Array dentro de array
  }));

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()} // Key simple ya que es 1 item por sección

        renderSectionHeader={({ section: { title, code } }) => (
          <View style={styles.header}>
            <View >
              {code ? (
                <Image
                  style={{ width: 65, height: 40 }}
                  source={{ uri: `https://flagcdn.com/w320/${code.toLowerCase()}.png` }}
                  contentFit="cover"
                />
              ) : (
                <Text>🏳️</Text> // fallback simple
              )}
            </View>

            <View>
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
          </View>
        )}

        renderItem={({ item: stickers }) => (
          <View style={styles.stickersContainer}>
            {/* Mapeamos las figuritas manualmente aquí dentro */}
            {stickers.map((sticker) => (
              <View key={sticker.id} style={styles.gridItem}>
                <StickerItem
                  item={sticker}
                  quantity={inventory[sticker.id]}
                  onToggle={() => handleToggle(sticker.id)}
                />
              </View>
            ))}
          </View>
        )}

        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#333',
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: "center"
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },

  flagContainer: {
    width: 50,
    height: 20
  },

  flag: {
    width: "100%"
  },

  // Estilo nuevo para el contenedor de las figuritas
  stickersContainer: {
    flexDirection: 'row', // Las pone una al lado de otra
    flexWrap: 'wrap',     // Si no caben, bajan a la siguiente línea
    justifyContent: 'flex-start', // Alineadas a la izquierda
    paddingHorizontal: 5,
  },
  // Estilo para asegurar que cada figurita ocupe el 33% (3 columnas)
  gridItem: {
    width: '20%', // 100% / 3 = 33.33%
    padding: 4       // Espacio entre ellas
  }
});