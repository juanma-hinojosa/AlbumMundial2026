import { useStickers } from "@/context/StickerContext";
import { calculateMatch } from "@/utils/exchangeLogic";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from "react";
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScannerScreen({ onClose }: { onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  const { inventory, toggleSticker, decrementSticker } = useStickers();

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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const result = calculateMatch(data, inventory);
      // Validamos que result no sea null antes de guardarlo
      if (result) {
        setMatchResult(result);
      } else {
        // Si el QR no es válido, mostramos error o reiniciamos
        alert("QR Inválido");
        setScanned(false);
      }
    } catch (e) {
      console.error(e);
      setScanned(false);
    }
  };

  const confirmExchange = () => {
   // PROTECCIÓN: Si matchResult es null, no hacemos nada
    if (!matchResult) return;

    // Usamos ?. para evitar crashes si incoming/outgoing no existen
    matchResult.incoming?.forEach((s: any) => toggleSticker(s.id));
    matchResult.outgoing?.forEach((s: any) => decrementSticker(s.id));matchResult.outgoing.forEach((s: any) => decrementSticker(s.id));

    alert('¡Intercambio realizado con éxito!');
    onClose(); // Cerramos el escáner
  }

  // Renderizado del resultado: Verificamos que incoming exista
  const hasMatchData = scanned && matchResult && matchResult.incoming;

  // Renderizado del resultado del Match
  if (hasMatchData) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.matchTitle}>¡Resultado del cruce!</Text>

        <View style={styles.section}>
          <Text style={styles.subTitle}>🟢 Recibes ({matchResult.incoming?.length || 0})</Text>
          <FlatList
            data={matchResult.incoming || []} // Array vacío por defecto
            horizontal
            renderItem={({ item }) => <Text style={styles.stickerBadge}>{item.id}</Text>}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>🔴 Entregas ({matchResult.outgoing?.length || 0})</Text>
          <FlatList
            data={matchResult.outgoing || []} // Array vacío por defecto
            horizontal
            renderItem={({ item }) => <Text style={styles.stickerBadge}>{item.id}</Text>}
          />
        </View>

        <View style={styles.actions}>
          <Button title="Confirmar Intercambio" onPress={confirmExchange} />
          <Button title="Escanear de nuevo" onPress={() => {
             setScanned(false);
             setMatchResult(null); // Limpiamos el resultado anterior
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
          <Text style={styles.overlayText}>Apunta al QR de tu amigo</Text>
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
  closeBtn: { position: 'absolute', top: 50, right: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },

  // Estilos del Resultado
  resultContainer: { flex: 1, padding: 20, backgroundColor: 'white', justifyContent: 'center' },
  matchTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 20 },
  subTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  stickerBadge: { padding: 8, backgroundColor: '#eee', marginRight: 5, borderRadius: 5, overflow: 'hidden' },
  actions: { gap: 10, marginTop: 20 }
});