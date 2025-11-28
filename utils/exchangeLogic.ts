import { albumData } from '@/data/albumData';

export const generateQRString = (inventory: InventoryType): string => {
  const needs: string[] = [];
  const swaps: string[] = [];

  // Recorremos el albumData estático para saber qué existe
  // (Es más seguro recorrer el álbum que el inventario, por si el inventario está incompleto)
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

type InventoryType = Record<string, number>;

// export const generateQRString = (inventory: InventoryType): string => {
//   const needs: string[] = [];
//   const swaps: string[] = [];

//   // Recorremos el albumData estático para saber qué existe
//   // (Es más seguro recorrer el álbum que el inventario, por si el inventario está incompleto)
//   albumData.forEach(country => {
//     country.stickers.forEach(sticker => {
//       const count = inventory[sticker.id] || 0;

//       if (count === 0) {
//         needs.push(sticker.id);
//       } else if (count > 1) {
//         swaps.push(sticker.id)
//       }
//     });
//   });

//   const needString = `Necesito: ${needs.join(',')}`;
//   const swapString = `Cambio: ${swaps.join(',')}`;

//   return `${needString}|${swapString}`;
// };


const findStickerById = (id: string) => {
  for (const country of albumData) {
    const found = country.stickers.find(s => s.id === id);
    if (found) return { ...found, countryName: country.name }; // Agregamos el país por si acaso
  }
  return null;
};

export const calculateMatch = (qrString: string, myInventory: InventoryType) => {
  try {
    // 1. Desarmar el string "N:A,B|C:C,D"
    const [needPart, swapPart] = qrString.split('|');
    
    // Extraer los IDs limpios quitando "N:" y "C:"
    const theirNeeds = needPart.replace('Necesito:', '').split(',').filter(id => id);
    const theirSwaps = swapPart.replace('Cambio:', '').split(',').filter(id => id);

    // 2. MATCH: LO QUE YO RECIBO (Incoming)
    // Lógica: Ellos lo cambian (theirSwaps) Y yo lo necesito (myInventory[id] === 0)
    const toReceiveIds = theirSwaps.filter(id => (myInventory[id] || 0) === 0);

    // 3. MATCH: LO QUE YO DOY (Outgoing)
    // Lógica: Ellos lo necesitan (theirNeeds) Y yo lo tengo repetido (myInventory[id] > 1)
    const toGiveIds = theirNeeds.filter(id => (myInventory[id] || 0) > 1);

    // 4. Convertir IDs a Objetos Bonitos (para mostrar la foto/nombre)
    return {
      incoming: toReceiveIds.map(findStickerById).filter(Boolean),
      outgoing: toGiveIds.map(findStickerById).filter(Boolean)
    };

  } catch (error) {
    console.error("Error leyendo QR", error);
    return { incoming: [], outgoing: [] };
  }
};