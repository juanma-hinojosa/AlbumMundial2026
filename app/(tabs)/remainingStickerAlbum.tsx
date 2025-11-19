import { StyleSheet, Text, View } from "react-native";

export default function remainingStickerAlbumScreen() {
  return(
    <View style={styles.container}>
      <Text style={styles.text}>Figuritas Faltantes</Text>
    </View>
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