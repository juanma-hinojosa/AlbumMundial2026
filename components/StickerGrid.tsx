import { useStickers } from '@/context/StickerContext';
import { albumData } from '@/data/albumData';
import { Image } from 'expo-image';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { StickerItem } from './stickerItem';


// Definimos los tipos de filtro permitidos
type FilterType = 'all' | 'missing' | 'repeated';

interface StickerGridProps {
  filterType: FilterType;
}

// Este componente recibe el "tipo de filtro" como prop
export const StickerGrid = ({ filterType = 'all' }) => {
  const { inventory, toggleSticker, decrementSticker } = useStickers();

  const getFilteredSections = () => {
    // ... lógica de filtrado (igual que antes) ...
    const filtered = albumData.map(country => {
      const filteredStickers = country.stickers.filter(sticker => {
        const qty = inventory[sticker.id] || 0; // TS no se quejará aquí

        if (filterType === 'missing') return qty === 0;
        if (filterType === 'repeated') return qty > 1;
        return true;
      });

      return {
        title: country.name,
        data: [filteredStickers],
        code: country.code
      };
    }).filter(section => section.data[0].length > 0);

    return filtered;
  };

  return (
    <SectionList
      sections={getFilteredSections()}
      keyExtractor={(item, index) => index.toString()}
      renderSectionHeader={({ section: { title, code } }) => (
        <View style={styles.header}>
          <Image
            style={{ width: 65, height: 40 }}
            source={{ uri: `https://flagcdn.com/w320/${code.toLowerCase()}.png` }}
            contentFit="cover"
          />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}
      renderItem={({ item: stickers }) => (
        <View style={styles.stickersContainer}>
          {stickers.map((sticker) => (
            <View key={sticker.id} style={styles.gridItem}>
              <StickerItem
                item={sticker}
                quantity={inventory[sticker.id]}
                onToggle={() => toggleSticker(sticker.id)}
                onDecrement={() => decrementSticker(sticker.id)}
              />
            </View>
          ))}
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 80 }} // Espacio para el TabBar
    />
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: '#f4f4f4', padding: 10, marginTop: 10, flexDirection: 'row', alignItems:'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  stickersContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5 },
  gridItem: { width: '20%', padding: 4 }
});