import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = '@sticker_inventory_v1';
const CATALOG_CACHE_KEY = '@sticker_catalog_v1';
const CATALOG_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

type InventoryType = Record<string, number>;
type CachedCatalog = {
  data: any[];
  timestamp: number;
};

interface StickerContextType {
  inventory: InventoryType;
  isLoading: boolean;
  catalog: any[]; // <--- NUEVO: Guardaremos todos los stickers aquí
  toggleSticker: (id: string) => void;
  decrementSticker: (id: string) => void;
  processExchange: (givenIds: string[], receivedIds: string[]) => void;
}

const StickerContext = createContext<StickerContextType | undefined>(undefined);

export const StickerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [catalog, setCatalog] = useState<any[]>([]);

  // Refs for debouncing and preventing unnecessary operations
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedInventory = useRef<InventoryType>({});
  const catalogLoadedRef = useRef(false);

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

  // Load catalog with caching
  const loadCatalog = useCallback(async () => {
    if (catalogLoadedRef.current) return;

    try {
      // Try cache first
      const cachedData = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
      if (cachedData) {
        const parsed: CachedCatalog = JSON.parse(cachedData);
        const isExpired = Date.now() - parsed.timestamp > CATALOG_CACHE_DURATION;

        if (!isExpired) {
          setCatalog(parsed.data);
          catalogLoadedRef.current = true;
          return;
        }
      }

      // Fetch from Supabase if cache miss/expired
      const { data: catalogData, error: catalogError } = await supabase
        .from('stickers')
        .select('*');

      if (!catalogError && catalogData) {
        setCatalog(catalogData);
        catalogLoadedRef.current = true;

        // Cache the result
        const cacheData: CachedCatalog = {
          data: catalogData,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Error loading catalog:', error);
    }
  }, []);

  // Load inventory
  const loadInventory = useCallback(async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('inventory')
          .eq('id', user.id)
          .single();

        if (!error && data?.inventory) {
          setInventory(data.inventory);
          lastSavedInventory.current = data.inventory;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.inventory));
        }
      } else {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue) {
          const parsedInventory = JSON.parse(jsonValue);
          setInventory(parsedInventory);
          lastSavedInventory.current = parsedInventory;
        }
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }, [user]);

  // Initial data loading effect
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadCatalog(), loadInventory()]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadCatalog, loadInventory]);


  // Optimized save function with proper debouncing
  const saveInventory = useCallback(async (inventoryToSave: InventoryType) => {
    try {
      // Always save to local storage immediately
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryToSave));

      // Save to Supabase if user is logged in
      if (user) {
        await supabase
          .from('profiles')
          .update({ inventory: inventoryToSave })
          .eq('id', user.id);
      }

      lastSavedInventory.current = inventoryToSave;
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }, [user]);

  // Debounced save effect
  useEffect(() => {
    if (isLoading) return;

    // Check if inventory actually changed
    const hasChanged = JSON.stringify(inventory) !== JSON.stringify(lastSavedInventory.current);
    if (!hasChanged) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout with better debouncing
    saveTimeoutRef.current = setTimeout(() => {
      saveInventory(inventory);
    }, 800); // Slightly longer delay for better batching

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [inventory, isLoading, saveInventory]);


  // Optimized sticker manipulation with useCallback
  const toggleSticker = useCallback((id: string) => {
    setInventory(prev => {
      const currentCount = prev[id] || 0;
      return { ...prev, [id]: currentCount + 1 };
    });
  }, []);

  const decrementSticker = useCallback((id: string) => {
    setInventory(prev => {
      const currentCount = prev[id] || 0;
      if (currentCount === 0) return prev;
      return { ...prev, [id]: currentCount - 1 };
    });
  }, []);

  // NUEVO: Procesa el intercambio sumando y restando en una sola operación
  const processExchange = useCallback((givenIds: string[], receivedIds: string[]) => {
    setInventory(prev => {
      const newInventory = { ...prev };

      // 1. Restar los que estoy dando
      givenIds.forEach(id => {
        const currentCount = newInventory[String(id)] || 0;
        if (currentCount > 0) {
          newInventory[String(id)] = currentCount - 1;
        }
      });

      // 2. Sumar los que estoy recibiendo
      receivedIds.forEach(id => {
        const currentCount = newInventory[String(id)] || 0;
        newInventory[String(id)] = currentCount + 1;
      });

      return newInventory;
    });
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    inventory,
    isLoading,
    catalog,
    toggleSticker,
    decrementSticker,
    processExchange // <--- Agregar aquí
  }), [inventory, isLoading, catalog, toggleSticker, decrementSticker, processExchange]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <StickerContext.Provider value={contextValue}>
      {children}
    </StickerContext.Provider>
  );
};

export const useStickers = (): StickerContextType => {
  const context = useContext(StickerContext);
  if (!context) throw new Error('useStickers debe usarse dentro de StickerProvider');
  return context;
};