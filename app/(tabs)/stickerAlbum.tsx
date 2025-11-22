import { StickerGrid } from "@/components/StickerGrid";
// import { StickerItem } from "@/components/stickerItem";
// import albumData from "@/data/figus-db.json";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// albumData
export default function StickerAlbumScreen() {
  return (
   <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StickerGrid filterType="all" />
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