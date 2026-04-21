import { useStickers } from '@/context/StickerContext';
import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { SectionList, StyleSheet, Text, View, Platform, Dimensions } from 'react-native';
import { StickerItem } from './stickerItem';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

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
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={styles.groupHeaderContainer}
        >
          <View style={styles.groupHeader}>
            <View style={styles.groupIconContainer}>
              <Text style={styles.groupIcon}>
                {section.title.includes('Grupo') ? '🏆' :
                 section.title.includes('FIFA') ? '⭐' : '🥤'}
              </Text>
            </View>
            <Text style={styles.groupTitle}>{section.title}</Text>
          </View>
          <View style={styles.groupDivider} />
        </Animated.View>
      )}

      renderItem={({ item, index }) => (
        <Animated.View
          entering={FadeInDown.delay(index * 50).duration(400)}
          style={styles.countrySection}
        >
          {/* Country Header */}
          {item.country !== 'FWC' && item.country !== 'CC' && (
            <View style={styles.countryHeader}>
              <View style={styles.flagContainer}>
                <Image
                  style={styles.flagImage}
                  source={{
                    uri: `https://flagcdn.com/w320/${flagMap[item.country] || item.country?.toLowerCase()}.png`,
                  }}
                />
              </View>
              <Text style={styles.countryTitle}>{item.country}</Text>
              <View style={styles.countryStats}>
                <Text style={styles.countryStatsText}>
                  {item.stickers.length} stickers
                </Text>
              </View>
            </View>
          )}

          {/* Stickers Grid */}
          <View style={styles.stickersGrid}>
            {item.stickers.map((sticker: any, stickerIndex: number) => (
              <Animated.View
                key={sticker.id}
                entering={FadeInUp.delay((index * 50) + (stickerIndex * 25)).duration(300)}
                style={styles.stickerWrapper}
              >
                <StickerItem
                  item={sticker}
                  quantity={inventory[sticker.id]}
                  onToggle={() => toggleSticker(sticker.id)}
                  onDecrement={() => decrementSticker(sticker.id)}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
};

// Calculate responsive grid dimensions
const getGridDimensions = () => {
  const isWeb = Platform.OS === 'web';
  const padding = 32; // Total horizontal padding from container
  const cardPadding = 32; // Padding inside each card
  const gap = 6; // Gap between items

  let columns;
  if (isWeb) {
    if (screenWidth > 1200) columns = 12;
    else if (screenWidth > 900) columns = 10;
    else if (screenWidth > 600) columns = 8;
    else columns = 6;
  } else {
    // Better mobile calculations
    if (screenWidth >= 430) columns = 5;      // iPhone 14 Pro Max, larger phones
    else if (screenWidth >= 390) columns = 4; // iPhone 14 Pro, iPhone 12/13
    else if (screenWidth >= 375) columns = 4; // iPhone SE, smaller iPhones
    else columns = 3; // Very small screens
  }

  const availableWidth = screenWidth - padding - cardPadding;
  const itemWidth = (availableWidth - (gap * (columns - 1))) / columns;
  return { columns, itemWidth, gap };
};

const { columns, itemWidth, gap } = getGridDimensions();

const styles = StyleSheet.create({
  groupHeaderContainer: {
    marginTop: Platform.OS === 'web' ? 24 : 16,
    marginBottom: Platform.OS === 'web' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(42, 57, 141, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupIcon: {
    fontSize: 20,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    flex: 1,
  },
  groupDivider: {
    height: 2,
    backgroundColor: 'rgba(42, 57, 141, 0.1)',
    borderRadius: 1,
  },
  countrySection: {
    marginBottom: Platform.OS === 'web' ? 24 : 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 46, 0.1)',
  },
  flagContainer: {
    width: 56,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  countryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    flex: 1,
  },
  countryStats: {
    backgroundColor: 'rgba(42, 57, 141, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countryStatsText: {
    fontSize: 12,
    color: '#2A398D',
    fontWeight: '600',
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Platform.OS === 'web' ? 16 : 12,
    gap: gap,
    justifyContent: 'flex-start',
  },
  stickerWrapper: {
    width: itemWidth,
  },
});