import { StickerGrid } from "@/components/StickerGrid";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function remainingStickerAlbumScreen() {
  return(
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Puedes agregar un encabezado extra si quieres */}
      <View style={{ padding: 10, backgroundColor: '#ffebee' }}>
        <Text style={{ color: '#c62828', fontWeight: 'bold' }}>¡A buscarlas!</Text>
      </View>
      <StickerGrid filterType="missing" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});