import { useStickers } from '@/context/StickerContext';
import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { StickerItem } from './stickerItem';

type FilterType = 'all' | 'missing' | 'repeated';

interface StickerGridProps {
  filterType: FilterType;
}

 const flagMap: any = {
  // anfitriones
  USA: 'us',
  MEX: 'mx',
  CAN: 'ca',

  // CONMEBOL
  ARG: 'ar',
  BRA: 'br',
  URU: 'uy',
  COL: 'co',
  PAR: 'py',
  ECU: 'ec',

  // CONCACAF
  CRC: 'cr',
  PAN: 'pa',
  JAM: 'jm',
  HON: 'hn',
  SLV: 'sv',
  CUW:'cw',
  HAI:'ht',

  // UEFA
  NOR:'no',
  GER: 'de',
  FRA: 'fr',
  ENG: 'gb-eng',
  ESP: 'es',
  POR: 'pt',
  NED: 'nl',
  BEL: 'be',
  CRO: 'hr',
  SUI: 'ch',
  DEN: 'dk',
  SWE: 'se',
  CZE: 'cz',
  TUR: 'tr',
  AUT: 'at',
  BIH: 'ba',
  SCO: 'gb-sct', // Escocia usa gb en muchos libs

  // AFC (Asia)
  JPN: 'jp',
  KOR: 'kr',
  AUS: 'au',
  QAT: 'qa',
  KSA: 'sa',
  UZB: 'uz',
  JOR: 'jo',
  IRQ: 'iq',
  IRN:'ir',

  // CAF (África)
  MAR: 'ma',
  SEN: 'sn',
  TUN: 'tn',
  EGY: 'eg',
  ALG: 'dz',
  GHA: 'gh',
  CIV: 'ci',
  RSA: 'za',
  COD: 'cd',
  CPV:'cv',

  // OFC
  NZL: 'nz',
};

export const StickerGrid = ({ filterType = 'all' }: StickerGridProps) => {
  const { inventory, toggleSticker, decrementSticker } = useStickers();
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    fetchStickers();
  }, [inventory, filterType]);

  const sortByNumber = (a: any, b: any) => {
    const numA = parseInt(a.codigo.replace(/\D/g, ''));
    const numB = parseInt(b.codigo.replace(/\D/g, ''));
    return numA - numB;
  };

  const filterStickers = (stickers: any[]) => {
    return stickers.filter((sticker: any) => {
      const qty = inventory[sticker.id] || 0;

      if (filterType === 'missing') return qty === 0;
      if (filterType === 'repeated') return qty > 1;
      return true;
    });
  };

  const fetchStickers = async () => {
    const { data, error } = await supabase.from('stickers').select('*');

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return;
    }

    if (!data || data.length === 0) return;

    const grouped: any = {};
    const especiales: any = { FWC: [], CC: [] };

    data.forEach((sticker) => {
      if (sticker.es_especial) {
        if (sticker.pais_o_grupo === 'FWC') especiales.FWC.push(sticker);
        if (sticker.pais_o_grupo === 'CC') especiales.CC.push(sticker);
        return;
      }

      const group = sticker.grupo;
      const country = sticker.pais_o_grupo;

      if (!grouped[group]) grouped[group] = {};
      if (!grouped[group][country]) grouped[group][country] = [];

      grouped[group][country].push(sticker);
    });

    const sectionsFormatted: any[] = [];

    // 🌍 GRUPOS
    Object.keys(grouped).forEach((group) => {
      const countries = grouped[group];

      const dataByCountry: any[] = [];

      Object.keys(countries).forEach((country) => {
        const stickers = countries[country]
          .sort(sortByNumber);

        const filtered = filterStickers(stickers);

        if (filtered.length > 0) {
          dataByCountry.push({
            country,
            stickers: filtered,
          });
        }
      });

      if (dataByCountry.length > 0) {
        sectionsFormatted.push({
          title: `Grupo ${group}`,
          data: dataByCountry,
        });
      }
    });

    // ⭐ FWC
    const filteredFWC = filterStickers(especiales.FWC).sort(sortByNumber);

    if (filteredFWC.length > 0) {
      sectionsFormatted.push({
        title: '⭐ Especiales FIFA',
        data: [
          {
            country: 'FWC',
            stickers: filteredFWC,
          },
        ],
      });
    }

    // 🥤 CC
    const filteredCC = filterStickers(especiales.CC).sort(sortByNumber);

    if (filteredCC.length > 0) {
      sectionsFormatted.push({
        title: '🥤 Coca-Cola',
        data: [
          {
            country: 'CC',
            stickers: filteredCC,
          },
        ],
      });
    }

    setSections(sectionsFormatted);
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => index.toString()}

      renderSectionHeader={({ section }) => (
        <Text style={styles.groupTitle}>{section.title}</Text>
      )}

      renderItem={({ item }) => (
        <View>
          {/* 🇦🇷 PAIS */}
          {item.country !== 'FWC' && item.country !== 'CC' && (
            <View style={styles.header}>
              <Image
                style={{ width: 65, height: 40 }}
                source={{
                  uri: `https://flagcdn.com/w320/${flagMap[item.country] || item.country?.toLowerCase()}.png`,
                }}
              />
              <Text style={styles.headerTitle}>{item.country}</Text>
            </View>
          )}

          {/* 🟩 STICKERS */}
          <View style={styles.stickersContainer}>
            {item.stickers.map((sticker: any) => (
              <View key={sticker.id} style={styles.gridItem}>
                <StickerItem
                  item={sticker}
                  quantity={inventory[sticker.id]}
                  onToggle={() => toggleSticker(sticker.id)}
                  onDecrement={() => decrementSticker(sticker.id)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
};

const styles = StyleSheet.create({
  groupTitle: {
    marginTop: 15,
    marginLeft: 10,
    fontSize: 22,
    fontWeight: 'bold',
    
  },
  header: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15
  },
  stickersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 5
  },
  gridItem: {
    width: '20%',
    padding: 4
  }
});