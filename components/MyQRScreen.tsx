import ScannerScreen from '@/components/ScannerScreen';
import { useStickers } from '@/context/StickerContext';
import { generateQRString } from '@/utils/exchangeLogic';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function MyQRScreen() {
  const { inventory } = useStickers();

  // Usamos useMemo para que no recalcule el string en cada render, solo si cambia el inventario
  const qrData = useMemo(() => generateQRString(inventory), [inventory]);

  // Estado para mostrar/ocultar el escaner
  const [showScanner, setShowScanner] = useState(false)

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL DEL ESCANER */}
      <Modal visible={showScanner} animationType="slide">
        <ScannerScreen onClose={() => setShowScanner(false)} />
      </Modal>


      <View style={styles.card}>
        <Text style={styles.title}>Tu Código de Cambio</Text>
        <Text style={styles.subtitle}>Muéstrale esto a un amigo</Text>

        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={250}
            color="black"
            backgroundColor="white"
          />
        </View>

        <Text style={styles.infoText}>
          Este código contiene tus repetidas y tus faltantes.
        </Text>
      </View>

      {/* BOTÓN GIGANTE PARA ESCANEAR */}
      <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
        <Ionicons name="camera" size={30} color="white" />
        <Text style={styles.scanText}>Escanear amigo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF', // Fondo azul mundialista
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  qrContainer: {
    padding: 10,
    backgroundColor: 'white', // Borde blanco extra
  },
  infoText: {
    marginTop: 20,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    maxWidth: 200
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700', // Un color dorado o llamativo
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5
  },
  scanText: { marginLeft: 10, fontSize: 18, fontWeight: 'bold', color: '#333' }
});