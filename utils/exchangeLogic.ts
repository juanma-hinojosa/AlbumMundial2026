import { albumData } from '@/data/albumData';
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

    // Calculate needs and swaps
    albumData.forEach(country => {
      country.stickers.forEach(sticker => {
        const count = inventory[sticker.id] || 0;
        if (count === 0) {
          needs.push(sticker.id);
        } else if (count > 1) {
          swaps.push(sticker.id);
        }
      });
    });

    // Generate unique share code (retry if collision)
    let shareCode: string;
    let attempts = 0;
    do {
      shareCode = generateShareCode();
      attempts++;

      // Check if code already exists
      const { data: existing } = await supabase
        .from('sharing_sessions')
        .select('share_code')
        .eq('share_code', shareCode)
        .single();

      if (!existing) break;
    } while (attempts < 5); // Max 5 attempts to avoid infinite loop

    if (attempts >= 5) {
      console.error('Unable to generate unique share code');
      return null;
    }

    // Insert sharing session
    const { error } = await supabase
      .from('sharing_sessions')
      .insert({
        share_code: shareCode,
        user_id: userId || null,
        needs,
        swaps
      });

    if (error) {
      console.error('Error creating sharing session:', error);
      return null;
    }

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
      .single();

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

// Legacy function - kept for backward compatibility
export const generateQRString = (inventory: InventoryType, catalog: any[]): string => {
  const needs: string[] = [];
  const swaps: string[] = [];

  albumData.forEach(country => {
    country.stickers.forEach(sticker => {
      const count = inventory[sticker.id] || 0;

      if (count === 0) {
        needs.push(sticker.id);
      } else if (count > 1) {
        swaps.push(sticker.id)
      }
    });
  });

  const needString = `Necesito: ${needs.join(',')}`;
  const swapString = `Cambio: ${swaps.join(',')}`;

  return `${needString}|${swapString}`;
};

// New compact QR generation using share codes
export async function generateCompactQR(
  inventory: InventoryType,
  catalog: any[],
  userId?: string | null
): Promise<string | null> {
  const shareCode = await createSharingSession(inventory, catalog, userId);
  return shareCode;
}

// type InventoryType = Record<string, number>;


// Helper function for legacy support
const findStickerById = (id: string) => {
  for (const country of albumData) {
    const found = country.stickers.find(s => s.id === id);
    if (found) return { ...found, countryName: country.name };
  }
  return null;
};


// Updated calculateMatch to handle both legacy QR codes and new share codes
export const calculateMatch = async (qrString: string, myInventory: InventoryType, catalog: any[]) => {
  try {
    let theirNeeds: string[] = [];
    let theirSwaps: string[] = [];

    // Check if it's a share code (8 characters, alphanumeric) or legacy format
    if (qrString.length === 8 && /^[A-Z0-9]+$/.test(qrString)) {
      // New format: fetch from sharing session
      const sessionData = await fetchSharingSession(qrString);
      if (!sessionData) {
        console.error('Invalid or expired share code');
        return { incoming: [], outgoing: [], error: 'Invalid or expired QR code' };
      }
      theirNeeds = sessionData.needs;
      theirSwaps = sessionData.swaps;
    } else {
      // Legacy format: parse the old string format
      const [needPart, swapPart] = qrString.split('|');
      theirNeeds = needPart.replace('Necesito: ', '').split(',').filter(id => id);
      theirSwaps = swapPart.replace('Cambio: ', '').split(',').filter(id => id);
    }

    const toReceiveIds = theirSwaps.filter(id => (myInventory[id] || 0) === 0);
    const toGiveIds = theirNeeds.filter(id => (myInventory[id] || 0) > 1);

    // Function to find sticker details
    const findStickerById = (id: string) => {
      const found = catalog.find((s: any) => s.id === id);
      if (found) return { ...found, countryName: found.pais_o_grupo };
      return null;
    };

    return {
      incoming: toReceiveIds.map(findStickerById).filter(Boolean),
      outgoing: toGiveIds.map(findStickerById).filter(Boolean)
    };

  } catch (error) {
    console.error("Error calculating match:", error);
    return { incoming: [], outgoing: [], error: 'Error processing QR code' };
  }
};


// export const calculateMatch = (qrString: string, myInventory: InventoryType) => {
//   try {
//     // 1. Desarmar el string "N:A,B|C:C,D"
//     const [needPart, swapPart] = qrString.split('|');
    
//     // Extraer los IDs limpios quitando "N:" y "C:"
//     const theirNeeds = needPart.replace('Necesito:', '').split(',').filter(id => id);
//     const theirSwaps = swapPart.replace('Cambio:', '').split(',').filter(id => id);

//     // 2. MATCH: LO QUE YO RECIBO (Incoming)
//     // Lógica: Ellos lo cambian (theirSwaps) Y yo lo necesito (myInventory[id] === 0)
//     const toReceiveIds = theirSwaps.filter(id => (myInventory[id] || 0) === 0);

//     // 3. MATCH: LO QUE YO DOY (Outgoing)
//     // Lógica: Ellos lo necesitan (theirNeeds) Y yo lo tengo repetido (myInventory[id] > 1)
//     const toGiveIds = theirNeeds.filter(id => (myInventory[id] || 0) > 1);

//     // 4. Convertir IDs a Objetos Bonitos (para mostrar la foto/nombre)
//     return {
//       incoming: toReceiveIds.map(findStickerById).filter(Boolean),
//       outgoing: toGiveIds.map(findStickerById).filter(Boolean)
//     };

//   } catch (error) {
//     console.error("Error leyendo QR", error);
//     return { incoming: [], outgoing: [] };
//   }
// };