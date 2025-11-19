import CountdownTimer from "@/components/CountdownTimer";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text} >Album de Figuritas del mundial 2026</Text>

      <View>
        <CountdownTimer targetDate="2026-06-11T23:59:59" />
      </View>

      {/* <Link href="/stickerAlbum" style={styles.button}>
        Figuritas
      </Link>
      
      <Link href="/stickerObtained" style={styles.button}>
        Figuritas obtenidas
      </Link> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});