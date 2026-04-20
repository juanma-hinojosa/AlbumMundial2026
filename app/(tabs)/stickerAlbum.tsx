import { StickerGrid } from "@/components/StickerGrid";
import { StickerStats } from "@/components/StickerStats";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RemainingStickerAlbumScreen from "../../components/remainingStickerAlbum";
import StickerObtainedScreen from "../../components/stickersObtained";


const COLORS = [
  '#f4f4f2',
  '#1d1c1a',
  '#6fa5a3',
  '#d5191e',
  '#343975',
  '#e3db71',
  '#7a1c1d',
  '#b1b6ce',
  '#ebb8a5',
  '#666f57',
  '#b5ba47',
  '#245da0',
];

// albumData
export default function StickerAlbumScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'missing' | 'repeated' | 'estadisticas'>('all');

  const renderContent = () => {
    switch (activeTab) {
      case 'estadisticas':
        return <StickerStats />;
      case 'missing':
        return <RemainingStickerAlbumScreen />;
      case 'repeated':
        return <StickerObtainedScreen />;
      default:
        return <StickerGrid filterType="all" />;

    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        <TabButton label="Todas" active={activeTab === 'all'} onPress={() => setActiveTab('all')} />
        <TabButton label="Faltantes" active={activeTab === 'missing'} onPress={() => setActiveTab('missing')} />
        <TabButton label="Repetidas" active={activeTab === 'repeated'} onPress={() => setActiveTab('repeated')} />
        <TabButton label='Estadisticas' active={activeTab === 'estadisticas'} onPress={() => setActiveTab('estadisticas')} />
        {/* <TabButton label='Intercambiar' /> */}
        {/* <TabButton label='Escanear Album' /> */}
      </ScrollView>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );

}

// const TabButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={[styles.tabButton, active && styles.activeTab]}
//     >
//       <Text style={[styles.tabText, active && styles.activeTabText]}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// };


const TabButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {

  // color aleatorio que NO cambia en re-renders
  const randomColor = useMemo(() => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }, []);

  const backgroundColor = active ? '#1d1c1a' : randomColor;

  // Detectar si el fondo es claro u oscuro (para el texto)
  const isLight = (hex: string) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
  };

  const textColor = active
    ? '#fff'
    : isLight(randomColor)
    ? '#000'
    : '#fff';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        { backgroundColor }
      ]}
    >
      <Text style={[styles.tabText, { color: textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    // paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 50,
    marginBottom: 5,
    marginTop:20
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,


    justifyContent: 'center',  // centra vertical
    alignItems: 'center',      // centra horizontal
  },
  activeTab: {
    backgroundColor: '#333',
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
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