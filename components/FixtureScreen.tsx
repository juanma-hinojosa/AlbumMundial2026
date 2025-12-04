import { initialStandings } from '@/data/standingsData';
import { useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { fixtureData } from '../data/fixtureData';
import { GroupTable } from './GroupTable';

type TabType = 'today' | 'groups' | 'playoff' | 'standings';

export default function FixtureMatch() {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Lógica de filtrado
  const getMatches = () => {
    const today = new Date();

    switch (activeTab) {
      case 'today':
        return fixtureData.filter(m => {
          const matchDate = new Date(m.date);
          return (
            matchDate.getDate() === today.getDate() &&
            matchDate.getMonth() === today.getMonth() &&
            matchDate.getFullYear() === today.getFullYear()
          );
        });

      case 'groups':
        // Ordenamos cronológicamente
        return fixtureData
          .filter(m => m.type === 'group')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      case 'playoff': // Mata Mata
        return fixtureData
          .filter(m => m.type === 'knockout')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      default: // Si es 'standings' u otra cosa, devolvemos un array vacío para no renderizar partidos
        return [];
    }
  };

  // const data = getMatches();

  const MatchesList = () => {
    const data = getMatches();
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {activeTab === 'today' 
                ? "No hay partidos programados para hoy." 
                : "No hay partidos disponibles."}
            </Text>
          </View>
        }
      />
    );
  };

  // const renderContent = () => {
  //   if (activeTab === 'standings') {
  //     return (
  //       <FlatList
  //         data={initialStandings}
  //         keyExtractor={(item) => item.id}
  //         renderItem={({ item }) => <GroupTable group={item} />}
  //         contentContainerStyle={{ paddingTop: 15, paddingBottom: 20 }}
  //       />
  //     );
  //   }

  //   // Para los partidos (Fixture)
  //   return (
  //     <FlatList
  //       data={getMatches()}
  //       // ... props anteriores ...
  //       renderItem={({ item }) => <MatchCard match={item} />}
  //     // ...
  //     />
  //   );
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Mundial 2026</Text>
        
        {/* ScrollView horizontal para Tabs (se mantiene igual) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabContainer}>
            {/* ... todos tus TouchableOpacity para los tabs se mantienen igual ... */}
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'today' && styles.activeTab]} 
              onPress={() => setActiveTab('today')}
            >
              <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Hoy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'groups' && styles.activeTab]} 
              onPress={() => setActiveTab('groups')}
            >
              <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Partidos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'standings' && styles.activeTab]} 
              onPress={() => setActiveTab('standings')}
            >
              <Text style={[styles.tabText, activeTab === 'standings' && styles.activeTabText]}>Posiciones</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'playoff' && styles.activeTab]} 
              onPress={() => setActiveTab('playoff')}
            >
              <Text style={[styles.tabText, activeTab === 'playoff' && styles.activeTabText]}>Fase Final</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* RENDERIZADO CONDICIONAL DEL CONTENIDO */}
      <View style={{ flex: 1 }}>
        {activeTab === 'standings' ? (
          <FlatList
            data={initialStandings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GroupTable group={item} />}
            contentContainerStyle={{ paddingTop: 15, paddingBottom: 20 }}
          />
        ) : (
          <MatchesList />
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  headerContainer: { backgroundColor: '#fff', padding: 15, paddingBottom: 0 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#007AFF' },
  tabScroll: { maxHeight: 50 },
  tabContainer: { flexDirection: 'row', marginBottom: 10, paddingRight: 20 },
  // tabContainer: { flexDirection: 'row', marginBottom: 10 },
  tab: {
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#fff' },

  emptyState: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 }
});