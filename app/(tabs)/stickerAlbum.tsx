import albumData from "@/data/figus-db.json";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet, Text, View } from "react-native";

export default function StickerAlbumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Lista de Figus</Text>

      <FlashList
        data={albumData}
        // @ts-ignore: estimatedItemSize exists at runtime for FlashList but may be missing in installed types
        estimatedItemSize={200}   // <- Muy importante para el rendimiento
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        scrollEventThrottle={16}
        decelerationRate="fast"   // <- Scroll suave estilo iOS
        contentContainerStyle={styles.scrollContent}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const nombrePais = Object.keys(item)[0];
          const listaFiguritas = Object.values(item)[0] as { id: string; cantidad: number }[];

          return (
            <View style={styles.sectionContainer}>
              <Text style={styles.countryHeader}>{nombrePais}</Text>

              <View style={styles.stickersGrid}>
                {listaFiguritas.map((figu: any) => (
                  <View
                    key={figu.id}
                    style={[
                      styles.stickerItem,
                      figu.cantidad > 0 && styles.stickerOwned,
                    ]}
                  >
                    <Text style={styles.stickerText}>{figu.id}</Text>
                    <Text style={styles.countText}>x{figu.cantidad}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    paddingTop: 50, // Para evitar el notch
  },
  mainTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  countryHeader: {
    color: '#ffd33d', // Un color amarillo para destacar
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 5,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Esto hace que bajen a la siguiente línea
    gap: 8, // Espacio entre elementos
  },
  stickerItem: {
    backgroundColor: '#3a3f45',
    width: '23%', // Aproximadamente 4 por fila
    aspectRatio: 1, // Mantiene el cuadrado
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  stickerOwned: {
    backgroundColor: '#4caf50', // Verde si la tienes
    borderColor: '#81c784',
  },
  stickerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  countText: {
    color: '#aaa',
    fontSize: 10,
    marginTop: 4,
  }
});