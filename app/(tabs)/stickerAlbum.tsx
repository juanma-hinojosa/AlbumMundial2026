import albumData from "@/data/figus-db.json";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function StickerAlbumScreen() {
  return(
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Lista de Figus</Text>

      <ScrollView>
        {albumData.map((paisObj, index) => {
          // 1. Extraemos el nombre del país (la llave dinámica)
          const nombrePais = Object.keys(paisObj)[0]; 
          // 2. Obtenemos el array de figuritas usando ese nombre
          const listaFiguritas = paisObj[nombrePais];

          return (
            <View key={index} style={styles.sectionContainer}>
              {/* Título del País */}
              <Text style={styles.countryHeader}>{nombrePais}</Text>
              
              {/* Grid de Figuritas */}
              <View style={styles.stickersGrid}>
                {listaFiguritas.map((figu) => (
                  <View 
                    key={figu.id} 
                    style={[
                      styles.stickerItem, 
                      // Estilo condicional si tienes la figu (cantidad > 0)
                      figu.cantidad > 0 && styles.stickerOwned
                    ]}
                  >
                    <Text style={styles.stickerText}>{figu.id}</Text>
                    <Text style={styles.countText}>x{figu.cantidad}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
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