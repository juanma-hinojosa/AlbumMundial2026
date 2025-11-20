import CountdownTimer from "@/components/CountdownTimer";
import { ImageBackground } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

const PlaceholderImage = require('@/assets/images/hero-home.webp')

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <ImageBackground
        source={PlaceholderImage}
        resizeMode="cover"
        style={styles.imageContainer}
      >

        <View style={styles.overlay}>
          {/* <View>
            <Text style={styles.text} >Album de Figuritas del mundial 2026</Text>
          </View> */}

          <Text style={styles.text}>
            Dias restante para el inicio del 
            <br />
            MUNDIAL
          </Text>
          <CountdownTimer targetDate="2026-06-11T23:59:59" />
        </View>
      </ImageBackground>
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
  imageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Hace que el View cubra completamente su padre
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 0.5 es la opacidad de la capa oscura
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: "center",
    color: '#fff',
    fontSize: 23,
    fontWeight: "bold"
  },
});