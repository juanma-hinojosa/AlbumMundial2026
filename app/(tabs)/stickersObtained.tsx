import { StickerGrid } from "@/components/StickerGrid";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StickerObtainedScreen() {
  return(
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
       <View style={{ padding: 10, backgroundColor: '#e8f5e9' }}>
        <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>Listas para cambiar</Text>
      </View>
      <StickerGrid filterType="repeated" />
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