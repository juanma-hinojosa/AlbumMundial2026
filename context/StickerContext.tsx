import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Clave para guardar en el teléfono
const STORAGE_KEY = '@sticker_inventory_v1';

// 1. Definimos la "forma" de nuestro inventario
// Un objeto donde la clave es un string (ID) y el valor un número (cantidad)
type InventoryType = Record<string, number>;

// 2. Definimos la interfaz de lo que el Contexto va a exponer
interface StickerContextType {
  inventory: InventoryType;
  isLoading: boolean; // Agregamos esto para saber si aún estamos leyendo datos
  toggleSticker: (id: string) => void;
  decrementSticker: (id: string) => void;
}

// 3. Creamos el contexto.
// Inicialmente es undefined para forzar a que se use dentro del Provider.
const StickerContext = createContext<StickerContextType | undefined>(undefined);

// 4. Tipamos las props del Provider (necesita children)
interface StickerProviderProps {
  children: ReactNode;
}

export const StickerProvider: React.FC<StickerProviderProps> = ({ children }) => {
  // Estado inicial tipado
  const [inventory, setInventory] = useState<InventoryType>({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. EFECTO DE CARGA (Se ejecuta una sola vez al iniciar)
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          // Si hay datos guardados, los cargamos
          setInventory(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        // Pase lo que pase, terminamos de cargar
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 2. EFECTO DE GUARDADO (Se ejecuta cada vez que 'inventory' cambia)
  useEffect(() => {
    const saveData = async () => {
      try {
        // IMPORTANTE: No guardar si todavía estamos cargando. 
        // Esto evita sobreescribir los datos guardados con un objeto vacío al inicio.
        if (!isLoading) {
          const jsonValue = JSON.stringify(inventory);
          await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        }
      } catch (e) {
        console.error("Error guardando datos:", e);
      }
    };

    saveData();
  }, [inventory, isLoading]);

  const toggleSticker = (id: string) => {
    setInventory(prev => {
      const currentCount = prev[id] || 0;
      return { ...prev, [id]: currentCount + 1 };
    });
  };

  const decrementSticker = (id: string) => {
    setInventory(prev => {
      const currentCount = prev[id] || 0;
      if (currentCount === 0) return prev;
      return { ...prev, [id]: currentCount - 1 };
    });
  };

  return (
    <StickerContext.Provider value={{ inventory, isLoading, toggleSticker, decrementSticker }}>
      {children}
    </StickerContext.Provider>
  );
};

// 5. Hook personalizado con validación de seguridad
export const useStickers = (): StickerContextType => {
  const context = useContext(StickerContext);

  // Si context es undefined, significa que no estamos dentro del Provider
  if (!context) {
    throw new Error('useStickers debe ser usado dentro de un StickerProvider');
  }

  return context;
};