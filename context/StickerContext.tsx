import { useAuth } from '@/context/AuthContext'; // Importamos el Auth
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@sticker_inventory_v1';
type InventoryType = Record<string, number>;

interface StickerContextType {
  inventory: InventoryType;
  isLoading: boolean;
  toggleSticker: (id: string) => void;
  decrementSticker: (id: string) => void;
}

const StickerContext = createContext<StickerContextType | undefined>(undefined);

export const StickerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Sabemos si el usuario está logueado
  const [inventory, setInventory] = useState<InventoryType>({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. EFECTO DE CARGA: Decide si lee de local o de Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Si hay usuario, leemos desde Supabase (Nube)
          const { data, error } = await supabase
            .from('profiles')
            .select('inventory')
            .eq('id', user.id)
            .single();

          if (!error && data?.inventory) {
            setInventory(data.inventory);
            // Backup local por si se queda sin internet
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.inventory));
          }
        } else {
          // Si NO hay usuario (o es anónimo), leemos desde el teléfono
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          if (jsonValue != null) setInventory(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]); // Se re-ejecuta si el usuario inicia o cierra sesión

  // 2. EFECTO DE GUARDADO: Guarda en local y, si hay sesión, en la nube
  useEffect(() => {
    const saveData = async () => {
      if (isLoading) return;

      try {
        const jsonValue = JSON.stringify(inventory);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue); // Siempre guarda en local

        if (user) {
          // Si hay sesión, actualizamos el JSONB en Supabase
          await supabase
            .from('profiles')
            .update({ inventory })
            .eq('id', user.id);
        }
      } catch (e) {
        console.error("Error guardando datos:", e);
      }
    };

    // Usamos un pequeño delay (debounce visual) para no saturar Supabase si toca muchos seguidos
    const timeoutId = setTimeout(() => {
      saveData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inventory, isLoading, user]);

  // ... (toggleSticker y decrementSticker se mantienen exactamente igual) ...
  // const toggleSticker = (id: string) => { /* ... */ };
  // const decrementSticker = (id: string) => { /* ... */ };

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

export const useStickers = (): StickerContextType => {
  const context = useContext(StickerContext);
  if (!context) throw new Error('useStickers debe usarse dentro de StickerProvider');
  return context;
};