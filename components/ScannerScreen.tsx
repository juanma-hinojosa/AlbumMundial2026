import { useStickers } from "@/context/StickerContext";
import { calculateMatch } from "@/utils/exchangeLogic";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from "react";
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScannerScreen({ onClose }: { onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const { inventory, catalog, toggleSticker, decrementSticker } = useStickers();

  if (!permission) return <View />;


  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>Necesitamos permiso para usar la cámara</Text>
        <Button onPress={requestPermission} title="Dar Permiso" />
        <Button onPress={onClose} title="Cancelar" color="red" />
      </View>
    )
  }


  // const handleBarCodeScanned = async ({ data }: { data: string }) => {
  //   setScanned(true);
  //   setIsProcessing(true);
  //   setScanError(null);

  //   try {
  //     // calculateMatch is now async
  //     const result = await calculateMatch(data, inventory, catalog);

  //     if (result.error) {
  //       setScanError(result.error);
  //       setScanned(false);
  //     } else if (result && (result.incoming?.length > 0 || result.outgoing?.length > 0)) {
  //       setMatchResult(result);
  //       console.log(matchResult)
  //     } else {
  //       setScanError("No se encontraron intercambios posibles");
  //       setScanned(false);
  //     }
  //   } catch (e) {
  //     console.error('Error processing QR:', e);
  //     setScanError("Error al procesar el código QR");
  //     setScanned(false);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setIsProcessing(true);
    setScanError(null);

    try {
      const result = await calculateMatch(data, inventory, catalog);
      console.log("🔍 Resultado crudo del match:", result); // ESTE es el log que importa

      if (result.error) {
        setScanError(result.error);
        setScanned(false);
      } else if (result && (result.incoming?.length > 0 || result.outgoing?.length > 0)) {
        setMatchResult(result); // Aquí actualizamos el estado para la pantalla
      } else {
        setScanError("No se encontraron intercambios posibles (quizás ya tienes lo que el otro ofrece)");
        setScanned(false);
      }
    } catch (e) {
      setScanError("Error crítico al procesar");
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmExchange = () => {
    // PROTECCIÓN: Si matchResult es null, no hacemos nada
    if (!matchResult) return;

    // Usamos ?. para evitar crashes si incoming/outgoing no existen
    matchResult.incoming?.forEach((s: any) => toggleSticker(s.id));
    matchResult.outgoing?.forEach((s: any) => decrementSticker(s.id)); matchResult.outgoing.forEach((s: any) => decrementSticker(s.id));

    alert('¡Intercambio realizado con éxito!');
    onClose(); // Cerramos el escáner
  }

  // Show processing state
  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#2A398D" />
        <Text style={styles.processingText}>Procesando código QR...</Text>
        <Button title="Cancelar" onPress={() => {
          setIsProcessing(false);
          setScanned(false);
          onClose();
        }} color="red" />
      </View>
    );
  }

  // Show error state
  if (scanned && scanError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#d5191e" />
        <Text style={styles.errorTitle}>Error al escanear</Text>
        <Text style={styles.errorMessage}>{scanError}</Text>
        <View style={styles.errorActions}>
          <Button title="Intentar de nuevo" onPress={() => {
            setScanned(false);
            setScanError(null);
          }} />
          <Button title="Cancelar" onPress={onClose} color="red" />
        </View>
      </View>
    );
  }

  // Renderizado del resultado: Verificamos que incoming exista
  const hasMatchData = scanned && matchResult && !scanError;

  // Renderizado del resultado del Match
  // if (hasMatchData) {
  //   return (
  //     <View style={styles.resultContainer}>
  //       <Text style={styles.matchTitle}>¡Resultado del cruce!</Text>

  //       <View style={styles.section}>
  //         <Text style={styles.subTitle}>🟢 Recibes ({matchResult.incoming?.length || 0})</Text>
  //         <FlatList
  //           data={matchResult.incoming || []} // Array vacío por defecto
  //           horizontal
  //           renderItem={({ item }) => <Text style={styles.stickerBadge}>{item.id}</Text>}
  //         />
  //       </View>

  //       <View style={styles.section}>
  //         <Text style={styles.subTitle}>🔴 Entregas ({matchResult.outgoing?.length || 0})</Text>
  //         <FlatList
  //           data={matchResult.outgoing || []} // Array vacío por defecto
  //           horizontal
  //           renderItem={({ item }) => <Text style={styles.stickerBadge}>{item.id}</Text>}
  //         />
  //       </View>

  //       <View style={styles.actions}>
  //         <Button title="Confirmar Intercambio" onPress={confirmExchange} />
  //         <Button title="Escanear de nuevo" onPress={() => {
  //           setScanned(false);
  //           setMatchResult(null); // Limpiamos el resultado anterior
  //         }} color="gray" />
  //         <Button title="Cancelar" onPress={onClose} color="red" />
  //       </View>
  //     </View>
  //   );
  // }

  if (hasMatchData) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.matchTitle}>¡Resultado del cruce!</Text>

        <View style={styles.section}>
          <Text style={styles.subTitle}>🟢 Recibes ({matchResult.incoming?.length || 0})</Text>
          <FlatList
            data={matchResult.incoming || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `incoming-${item.id}`} // Importante para el rendimiento
            renderItem={({ item }) => (
              <View style={styles.stickerCard}>
                <Text style={styles.stickerBadge}>{item.codigo}</Text>
                <Text style={styles.stickerCountry}>{item.pais_o_grupo}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>🔴 Entregas ({matchResult.outgoing?.length || 0})</Text>
          <FlatList
            data={matchResult.outgoing || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `outgoing-${item.id}`}
            renderItem={({ item }) => (
              <View style={[styles.stickerCard, { borderColor: '#FF6B6B' }]}>
                <Text style={[styles.stickerBadge, { color: '#FF6B6B' }]}>{item.codigo}</Text>
                <Text style={styles.stickerCountry}>{item.pais_o_grupo}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmExchange}>
            <Text style={styles.confirmBtnText}>Confirmar Intercambio</Text>
          </TouchableOpacity>

          <Button title="Escanear de nuevo" onPress={() => {
            setScanned(false);
            setMatchResult(null);
          }} color="gray" />

          <Button title="Cancelar" onPress={onClose} color="red" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        // Si ya escaneó, pasamos undefined para pausar
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.overlayText}>Apunta al QR de tu amigo</Text>
          <Text style={styles.overlaySubtext}>Compatible con códigos antiguos y nuevos</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: 'white', fontSize: 18, marginTop: 200, fontWeight: 'bold' },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    marginTop: -100
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 3
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  overlaySubtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.8
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d5191e',
    marginTop: 15,
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  errorActions: {
    flexDirection: 'row',
    gap: 15
  },

  stickerCard: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    alignItems: 'center',
    minWidth: 80,
  },
  stickerBadge: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2A398D',
  },
  stickerCountry: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  confirmBtn: {
    backgroundColor: '#2A398D',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Estilos del Resultado
  resultContainer: { flex: 1, padding: 20, backgroundColor: 'white', justifyContent: 'center' },
  matchTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 20 },
  subTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  // stickerBadge: { padding: 8, backgroundColor: '#eee', marginRight: 5, borderRadius: 5, overflow: 'hidden' },
  actions: {
    gap: 10,
    marginTop: 20
  }
});