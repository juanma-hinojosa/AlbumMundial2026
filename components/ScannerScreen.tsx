import { useStickers } from "@/context/StickerContext";
import { calculateMatch } from "@/utils/exchangeLogic";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScannerScreen({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('escaner');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // --- NUEVOS ESTADOS PARA SELECCIÓN ---
  const [selectedIncoming, setSelectedIncoming] = useState<string[]>([]);
  const [selectedOutgoing, setSelectedOutgoing] = useState<string[]>([]);

  const { inventory, catalog, toggleSticker, decrementSticker, processExchange } = useStickers();

  if (!permission) return <View />;


  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>{t('escaner:permiso:title')}</Text>
        <Button onPress={requestPermission} title={`${t('escaner:permiso:permitir')}`} />
        <Button onPress={onClose} title={`${t('escaner:permiso:cancelar')}`} color="red" />
      </View>
    )
  }


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
        setScanError(`${t('escaner:intercambio:noMatch')}`);
        setScanned(false);
      }
    } catch (e) {
      setScanError(`${t('escaner:intercambio:error')}`);
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- LÓGICA DE SELECCIÓN AL TOCAR ---
  const toggleSelection = (id: string, type: 'incoming' | 'outgoing') => {
    if (type === 'incoming') {
      setSelectedIncoming(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedOutgoing(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  const confirmExchange = () => {
     if (selectedIncoming.length === 0 && selectedOutgoing.length === 0) {
      Alert.alert(`${t('escaner:intercambio:antencion')}`, `${t('escaner:intercambio:atencionMessage')}`);
      return;
    }

    // Llamamos a la nueva función optimizada del Contexto
    processExchange(selectedOutgoing, selectedIncoming);

    Alert.alert(`${t('escaner:intercambio:sucess')}`, `${t('escaner:intercambio:atencionMessage')}`, [
      { text: 'OK', onPress: onClose }
    ]);
  }

  // Show processing state
  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#2A398D" />
        <Text style={styles.processingText}>{t('escaner:qr:proccesingText')}</Text>
        <Button title={`${t('escaner:qr:button')}`} onPress={() => {
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
        <Text style={styles.errorTitle}>{t('escaner:error:errorTitle')}</Text>
        <Text style={styles.errorMessage}>{scanError}</Text>
        <View style={styles.errorActions}>
          <Button title={`${t('escaner:error:try')}`} onPress={() => {
            setScanned(false);
            setScanError(null);
          }} />
          <Button title={`${t('escaner:error:cancel')}`} onPress={onClose} color="red" />
        </View>
      </View>
    );
  }

  // Renderizado del resultado: Verificamos que incoming exista
  const hasMatchData = scanned && matchResult && !scanError;


  if (hasMatchData) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.matchTitle}>{t('escaner:match:matchTitle')} </Text>
        <Text style={styles.instructionText}>{t('escaner:match:instructionText')}</Text>

        <View style={styles.section}>
          <Text style={styles.subTitle}>
            🟢 {t('escaner:match:recibes')} ({selectedIncoming.length}/{matchResult.incoming?.length})
          </Text>
          <FlatList
            data={matchResult.incoming || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `incoming-${item.id}`}
            renderItem={({ item }) => {
              const isSelected = selectedIncoming.includes(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggleSelection(item.id, 'incoming')}
                  style={[
                    styles.stickerCard,
                    isSelected ? styles.selectedIncomingCard : styles.unselectedCard
                  ]}
                >
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                    {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={[styles.stickerBadge, !isSelected && styles.unselectedText]}>{item.codigo}</Text>
                  <Text style={styles.stickerCountry}>{item.pais_o_grupo}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>
            🔴 {t('escaner:match:entregas')} ({selectedOutgoing.length}/{matchResult.outgoing?.length})
          </Text>
          <FlatList
            data={matchResult.outgoing || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `outgoing-${item.id}`}
            renderItem={({ item }) => {
              const isSelected = selectedOutgoing.includes(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggleSelection(item.id, 'outgoing')}
                  style={[
                    styles.stickerCard,
                    { borderColor: isSelected ? '#FF6B6B' : '#ccc' },
                    isSelected ? styles.selectedOutgoingCard : styles.unselectedCard
                  ]}
                >
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleActiveRed]}>
                    {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={[styles.stickerBadge, { color: isSelected ? '#FF6B6B' : '#999' }]}>{item.codigo}</Text>
                  <Text style={styles.stickerCountry}>{item.pais_o_grupo}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.confirmBtn, (selectedIncoming.length + selectedOutgoing.length === 0) && { opacity: 0.5 }]}
            onPress={confirmExchange}
          >
            <Text style={styles.confirmBtnText}>{t('escaner:match:confirmBtnText')}</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Button title={`${t('escaner:match:reEscanear')}`} onPress={() => {
              setScanned(false);
              setMatchResult(null);
              setSelectedIncoming([]);
              setSelectedOutgoing([]);
            }} color="gray" />
            <Button title={`${t('escaner:match:cerrar')}`} onPress={onClose} color="red" />
            
          </View>
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
          <Text style={styles.overlayText}>{t('escaner:cameraView:overlayText')} </Text>
          <Text style={styles.overlaySubtext}>{t('escaner:cameraView:overlaySubtext')} </Text>
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
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15
  },
  unselectedCard: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
    borderStyle: 'dashed',
  },
  selectedIncomingCard: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fffb',
    borderWidth: 2,
  },
  selectedOutgoingCard: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
    borderWidth: 2,
  },
  unselectedText: {
    color: '#999'
  },
  checkCircle: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  checkCircleActive: {
    backgroundColor: '#4ECDC4',
  },
  checkCircleActiveRed: {
    backgroundColor: '#FF6B6B',
  }
});