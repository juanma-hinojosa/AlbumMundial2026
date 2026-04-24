// import { albumData } from '@/data/albumData';
import { supabase } from './supabase';

type InventoryType = Record<string, number>;

// Generate a unique 8-character alphanumeric share code
function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a sharing session and return the share code
export async function createSharingSession(
  inventory: InventoryType,
  catalog: any[],
  userId?: string | null
): Promise<string | null> {
  try {
    const needs: string[] = [];
    const swaps: string[] = [];

    // Usamos el catálogo real de la base de datos
    // catalog.forEach(sticker => {
    //   // const count = inventory[sticker.id] || 0;
    //   // En lugar de: inventory[sticker.id]
    //   // Usa:
    //   const count = inventory[String(sticker.id)] || 0;
    //   if (count === 0) {
    //     needs.push(sticker.id);
    //   } else if (count > 1) {
    //     swaps.push(sticker.id);
    //   }
    // });
    catalog.forEach(sticker => {
      const count = inventory[String(sticker.id)] || 0;
      if (count === 0) {
        needs.push(String(sticker.id)); // <-- Envolver en String()
      } else if (count > 1) {
        swaps.push(String(sticker.id)); // <-- Envolver en String()
      }
    });

    let shareCode: string;
    let attempts = 0;
    do {
      shareCode = generateShareCode();
      attempts++;
      const { data: existing, error: fetchError } = await supabase
        .from('sharing_sessions')
        .select('share_code')
        .eq('share_code', shareCode)
        .maybeSingle()

      if (!existing) break;
    } while (attempts < 5);

    if (attempts >= 5) return null;

    const { error } = await supabase
      .from('sharing_sessions')
      .insert({
        share_code: shareCode,
        user_id: userId || null,
        needs,
        swaps
      });

    if (error) throw error;

    return shareCode;
  } catch (error) {
    console.error('Error in createSharingSession:', error);
    return null;
  }
}

// Fetch sharing session data by share code
export async function fetchSharingSession(shareCode: string): Promise<{
  needs: string[];
  swaps: string[];
} | null> {
  try {
    const { data, error } = await supabase
      .from('sharing_sessions')
      .select('needs, swaps')
      .eq('share_code', shareCode)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle(); // <--- USA ESTE
    if (error || !data) {
      console.error('Error fetching sharing session:', error);
      return null;
    }

    return {
      needs: data.needs || [],
      swaps: data.swaps || []
    };
  } catch (error) {
    console.error('Error in fetchSharingSession:', error);
    return null;
  }
}


export const generateQRString = (inventory: InventoryType, catalog: any[]): string => {
  const needs: string[] = [];
  const swaps: string[] = [];

  // catalog.forEach(sticker => {
  //   // const count = inventory[sticker.id] || 0;
  //   // En lugar de: inventory[sticker.id]
  //   // Usa:
  //   const count = inventory[String(sticker.id)] || 0;
  //   if (count === 0) {
  //     needs.push(sticker.id);
  //   } else if (count > 1) {
  //     swaps.push(sticker.id);
  //   }
  // });

  catalog.forEach(sticker => {
    const count = inventory[String(sticker.id)] || 0;
    if (count === 0) {
      needs.push(String(sticker.id)); // <-- Envolver en String()
    } else if (count > 1) {
      swaps.push(String(sticker.id)); // <-- Envolver en String()
    }
  });

  return `Necesito: ${needs.join(',')}|Cambio: ${swaps.join(',')}`;
};

// type InventoryType = Record<string, number>;


// Helper function for legacy support
// const findStickerById = (id: string) => {
//   for (const country of albumData) {
//     const found = country.stickers.find(s => s.id === id);
//     if (found) return { ...found, countryName: country.name };
//   }
//   return null;
// };





export async function generateCompactQR(
  inventory: InventoryType,
  catalog: any[],
  userId?: string | null
): Promise<string | null> {
  return await createSharingSession(inventory, catalog, userId);
}

// --- CÁLCULO DE MATCH CORREGIDO ---
export const calculateMatch = async (qrString: string, myInventory: InventoryType, catalog: any[]) => {
  try {
    let theirNeeds: string[] = [];
    let theirSwaps: string[] = [];

    if (qrString.length === 8 && /^[A-Z0-9]+$/.test(qrString)) {
      const sessionData = await fetchSharingSession(qrString);
      if (!sessionData) {
        return { incoming: [], outgoing: [], error: 'Código no encontrado o expirado' };
      }
      theirNeeds = sessionData.needs;
      theirSwaps = sessionData.swaps;
    } else {
      const [needPart, swapPart] = qrString.split('|');
      theirNeeds = needPart?.replace('Necesito: ', '').split(',').filter(id => id) || [];
      theirSwaps = swapPart?.replace('Cambio: ', '').split(',').filter(id => id) || [];
    }

    // Lo que ellos tienen repetido y a mí me falta (aseguramos que id sea String para buscar en el objeto)
    const toReceiveIds = theirSwaps.filter(id => (myInventory[String(id)] || 0) === 0);

    // Lo que a ellos les falta y yo tengo repetido
    const toGiveIds = theirNeeds.filter(id => (myInventory[String(id)] || 0) > 1);

    const findSticker = (id: string) => {
      // CORRECCIÓN CLAVE: Forzamos ambos a String para asegurar la coincidencia
      const found = catalog.find((s: any) => String(s.id) === String(id));
      if (found) {
        return {
          ...found,
          countryName: found.pais_o_grupo
        };
      }
      return null;
    };

    return {
      incoming: toReceiveIds.map(findSticker).filter(Boolean),
      outgoing: toGiveIds.map(findSticker).filter(Boolean)
    };

  } catch (error) {
    console.error("Error calculating match:", error);
    return { incoming: [], outgoing: [], error: 'Error al procesar el match' };
  }
};