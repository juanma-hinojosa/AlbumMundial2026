import CountdownTimer from "@/components/CountdownTimer";
import { Image, ImageBackground } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

const PlaceholderImage = require('@/assets/images/hero-home.jpg')
const LogoWorldCup = require('@/assets/images/logo-world-cup.png')

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <ImageBackground
        source={PlaceholderImage}
        resizeMode="cover"
        style={styles.imageContainer}
        alt="Background Image Messi"
      >
        <View style={styles.overlay}>
          <View>
            <Image
              source={LogoWorldCup}
              style={styles.logo}
              alt="Fifa World Cup Logo"
            />
          </View>

          <View
            style={styles.textContainer}
          >
            <Text style={styles.text}>
              FALTAN
            </Text>
            <CountdownTimer targetDate="2026-06-11T23:59:59" />
          </View>
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    // justifyContent: 'flex-start', // <- Alinea todo desde arriba
  },
  logo: {
    marginTop: 50, // <- Lo deja en la parte superior centrado
    width: 80,
    height: 80,
  },
  textContainer: {
    marginTop: 80, // <- Lo baja al centro visual (ajusta si quieres)
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