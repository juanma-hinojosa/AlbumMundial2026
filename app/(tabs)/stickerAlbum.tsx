import { StickerGrid } from "@/components/StickerGrid";
import { useState } from "react";
// import { StickerItem } from "@/components/stickerItem";
// import albumData from "@/data/figus-db.json";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RemainingStickerAlbumScreen from "../../components/remainingStickerAlbum";
import StickerObtainedScreen from "../../components/stickersObtained";

// albumData
export default function StickerAlbumScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'missing' | 'repeated'>('all');

  const renderContent = () => {
    switch (activeTab) {
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
        <TabButton label='Intercambiar QR' />
        <TabButton label='Compartir' />
        <TabButton label='Estadisticas' />
        <TabButton label='Escanear Album' />
      </ScrollView>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );

}

const TabButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.activeTab]}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 60,
    marginBottom: 5,
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