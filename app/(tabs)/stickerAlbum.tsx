import ErrorBoundary from "@/components/ErrorBoundary";
import { StickerGrid } from "@/components/StickerGrid";
import { StickerStats } from "@/components/StickerStats";
import hapticFeedback from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import RemainingStickerAlbumScreen from "../../components/remainingStickerAlbum";
import StickerObtainedScreen from "../../components/stickersObtained";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const COLORS = [
  '#f4f4f2',
  '#1d1c1a',
  '#6fa5a3',
  '#d5191e',
  '#343975',
  '#e3db71',
  '#7a1c1d',
  '#b1b6ce',
  '#ebb8a5',
  '#666f57',
  '#b5ba47',
  '#245da0',
];

// albumData
export default function StickerAlbumScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'missing' | 'repeated' | 'estadisticas'>('all');

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all': return 'grid-outline';
      case 'missing': return 'help-circle-outline';
      case 'repeated': return 'copy-outline';
      case 'estadisticas': return 'stats-chart-outline';
      default: return 'grid-outline';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'estadisticas':
        return <StickerStats />;
      case 'missing':
        return <RemainingStickerAlbumScreen />;
      case 'repeated':
        return <StickerObtainedScreen />;
      default:
        return <StickerGrid filterType="all" />;

    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{t('album:albumTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('album:albumSubtitle')}</Text>
        </Animated.View>

        {/* Tabs */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.tabsWrapper}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <TabButton
              label={t('album:tabs:all')}
              icon={getTabIcon('all')}
              active={activeTab === 'all'}
              onPress={() => setActiveTab('all')}
            />

            <TabButton
              label={t('album:tabs:missing')}
              icon={getTabIcon('missing')}
              active={activeTab === 'missing'}
              onPress={() => setActiveTab('missing')}
            />

            <TabButton
              label={t('album:tabs:repeated')}
              icon={getTabIcon('repeated')}
              active={activeTab === 'repeated'}
              onPress={() => setActiveTab('repeated')}
            />

            <TabButton
              label={t('album:tabs:stats')}
              icon={getTabIcon('estadisticas')}
              active={activeTab === 'estadisticas'}
              onPress={() => setActiveTab('estadisticas')}
            />
          </ScrollView>
        </Animated.View>

        {/* Content */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.contentContainer}
        >
          {renderContent()}
        </Animated.View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}



const TabButton = ({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) => {
  const handlePress = () => {
    hapticFeedback.light();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.tabButton,
        active && styles.activeTabButton
      ]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={active ? '#ffffff' : 'rgba(26, 26, 46, 0.6)'}
      />
      <Text style={[
        styles.tabText,
        active && styles.activeTabText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: screenHeight > 700 ? 28 : 24,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: screenHeight > 700 ? 16 : 14,
    color: 'rgba(26, 26, 46, 0.7)',
    textAlign: 'center',
  },
  tabsWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabsContainer: {
    maxHeight: screenHeight > 700 ? 60 : 55,
    paddingVertical: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: screenHeight > 700 ? 12 : 10,
    paddingHorizontal: screenHeight > 700 ? 16 : 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    marginRight: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(26, 26, 46, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTabButton: {
    backgroundColor: '#2A398D',
    borderColor: '#2A398D',
    shadowOpacity: 0.15,
  },
  tabText: {
    color: 'rgba(26, 26, 46, 0.8)',
    fontWeight: '600',
    fontSize: screenHeight > 700 ? 14 : 12,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Legacy styles - keeping for backward compatibility
  header_old: {
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#333',
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: "center"
  },
  headerTitle_old: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  flagContainer: {
    width: 50,
    height: 20
  },
  flag: {
    width: "100%"
  },
  stickersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
  },
  gridItem: {
    width: '20%',
    padding: 4
  }
});