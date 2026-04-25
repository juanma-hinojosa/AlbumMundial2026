import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/context/StickerContext';
import { supabase } from '@/utils/supabase'; // Asegúrate de tener tu cliente de supabase aquí
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CountryFlag from "react-native-country-flag";
import LoginScreen from './Login';

interface VoteStats {
  team_id: string;
  name: string;
  count: number;
  percentage: number;
}

const flagMap: any = {
  USA: 'us', MEX: 'mx', CAN: 'ca', ARG: 'ar', BRA: 'br', URU: 'uy',
  COL: 'co', PAR: 'py', ECU: 'ec', CRC: 'cr', PAN: 'pa', JAM: 'jm',
  HON: 'hn', SLV: 'sv', CUW: 'cw', HAI: 'ht', NOR: 'no', GER: 'de',
  FRA: 'fr', ENG: 'gb-eng', ESP: 'es', POR: 'pt', NED: 'nl', BEL: 'be',
  CRO: 'hr', SUI: 'ch', DEN: 'dk', SWE: 'se', CZE: 'cz', TUR: 'tr',
  AUT: 'at', BIH: 'ba', SCO: 'gb-sct', JPN: 'jp', KOR: 'kr', AUS: 'au',
  QAT: 'qa', KSA: 'sa', UZB: 'uz', JOR: 'jo', IRQ: 'iq', IRN: 'ir',
  MAR: 'ma', SEN: 'sn', TUN: 'tn', EGY: 'eg', ALG: 'dz', GHA: 'gh',
  CIV: 'ci', RSA: 'za', COD: 'cd', CPV: 'cv', NZL: 'nz',
};

// Definimos la fecha límite: 3 de Julio de 2026 a las 23:59:59
const VOTING_DEADLINE = new Date('2026-07-03T23:59:59');

export default function ChampionVote() {
  const { t } = useTranslation();
  const { catalog } = useStickers(); // Usamos tu catálogo para sacar los nombres de los países
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [stats, setStats] = useState<VoteStats[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [showLogin, setShowLogin] = useState(false); // <-- ESTADO PARA MOSTRAR EL LOGIN


  // Verificamos si la votación sigue abierta
  const isVotingOpen = new Date() < VOTING_DEADLINE;

  // 1. Obtener la lista única de países del catálogo
  const countries = Array.from(new Set(catalog.map(s => s.pais_o_grupo)))
    .filter(name => name !== "FWC" && name !== "CC")
    .map(name => ({ id: name, name }));

  useEffect(() => {
    fetchData();
    if (user) {
      setShowLogin(false);
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    // try {
    //   const { data: { user } } = await supabase.auth.getUser();

    //   // Consultar todos los votos para las estadísticas
    //   const { data: allVotes, error: votesError } = await supabase
    //     .from('votes')
    //     .select('team_id');

    //   if (votesError) throw votesError;

    //   // Consultar el voto del usuario actual
    //   if (user) {
    //     const { data: myVote } = await supabase
    //       .from('votes')
    //       .select('team_id')
    //       .eq('user_id', user.id)
    //       .single();
    //     if (myVote) setUserVote(myVote.team_id);
    //   }

    //   calculateStats(allVotes || []);
    // } 
    try {
      const { data: allVotes, error: votesError } = await supabase
        .from('votes')
        .select('team_id');

      if (votesError) throw votesError;

      // Usamos el 'user' del contexto en lugar de volver a consultar a supabase
      if (user) {
        const { data: myVote } = await supabase
          .from('votes')
          .select('team_id')
          .eq('user_id', user.id)
          .single();
        if (myVote) setUserVote(myVote.team_id);
      } else {
        setUserVote(null); // Limpiar si no hay usuario
      }

      calculateStats(allVotes || []);
    }
    catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allVotes: any[]) => {
    const total = allVotes.length;
    setTotalVotes(total);

    const counts = allVotes.reduce((acc: any, vote) => {
      acc[vote.team_id] = (acc[vote.team_id] || 0) + 1;
      return acc;
    }, {});

    const processedStats: VoteStats[] = countries.map(c => ({
      team_id: c.id,
      name: c.name,
      count: counts[c.id] || 0,
      percentage: total > 0 ? ((counts[c.id] || 0) / total) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    setStats(processedStats);
  };


  // const handleVote = async (teamId: string) => {
  //   // 1. Verificar fecha límite primero
  //   if (!isVotingOpen) {
  //     Alert.alert("Votación cerrada", "El tiempo para elegir campeón ha finalizado.");
  //     return;
  //   }

  //   try {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) return Alert.alert("Error", "Debes iniciar sesión para votar");

  //     // 2. Corregir el Upsert con la opción onConflict
  //     const { error } = await supabase
  //       .from('votes')
  //       .upsert(
  //         { user_id: user.id, team_id: teamId },
  //         { onConflict: 'user_id' } // <--- ESTO arregla el error 409
  //       );

  //     if (error) throw error;

  //     setUserVote(teamId);
  //     fetchData();
  //     Alert.alert("¡Voto registrado!", `Has elegido a ${teamId} como tu campeón.`);
  //   } catch (error) {
  //     console.error("Error en upsert:", error);
  //     Alert.alert("Error", "No se pudo actualizar el voto.");
  //   }
  // };

  const handleVote = async (teamId: string) => {
    if (!isVotingOpen) {
      Alert.alert("Votación cerrada", "El tiempo para elegir campeón ha finalizado.");
      return;
    }

    // SI NO HAY USUARIO, MOSTRAMOS EL COMPONENTE DE LOGIN
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('votes')
        .upsert(
          { user_id: user.id, team_id: teamId },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setUserVote(teamId);
      fetchData(); // Refrescar stats
      Alert.alert("¡Voto registrado!", `Has elegido a ${teamId} como tu campeón.`);
    } catch (error) {
      console.error("Error en upsert:", error);
      Alert.alert("Error", "No se pudo actualizar el voto.");
    }
  };

  const podium = stats.slice(0, 3);

  if (showLogin) {
    return (
      <View style={{ flex: 1 }}>
        {/* Aquí renderizamos tu componente Login. Asumo que puedes pasarle una prop 
            para cerrarlo manualmente si el usuario se arrepiente */}
        <LoginScreen />
      </View>
    );
  }


  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 {t('votos:votoTitle')}</Text>

      {/* PODIO */}
      <View style={styles.podiumContainer}>
        {podium.map((item, index) => (
          <View key={item.team_id} style={[styles.podiumStep, { height: 130 - index * 20 }]}>
            {flagMap[item.name] && (
              <CountryFlag isoCode={flagMap[item.name]} size={index === 0 ? 30 : 25} style={styles.flagShadow} />
            )}
            <Text style={styles.podiumName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.podiumPercent}>{item.percentage.toFixed(1)}%</Text>
            <Text style={styles.podiumPlace}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.totalText}>{t('votos:votosNumTotal')}: {totalVotes}</Text>

      {/* LISTA */}
      <FlatList
        data={stats}
        keyExtractor={(item) => item.team_id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.voteItem, userVote === item.team_id && styles.votedItem]}
            onPress={() => handleVote(item.team_id)}
            disabled={!isVotingOpen}
          >
            <View style={styles.teamInfo}>
              {flagMap[item.name] ? (
                <CountryFlag isoCode={flagMap[item.name]} size={20} style={styles.listFlag} />
              ) : (
                <Ionicons name="flag-outline" size={20} style={styles.listFlag} />
              )}
              <Text style={styles.teamName}>{item.name}</Text>
            </View>

            <View style={styles.voteRight}>
              <Text style={styles.percentText}>{item.percentage.toFixed(1)}%</Text>
              {userVote === item.team_id && (
                <Ionicons name="checkmark-circle" size={22} color="#4ECDC4" />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2A398D' },
  subTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    marginBottom: 20
  },
  podiumStep: {
    width: '30%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 3,
  },
  podiumName: { fontWeight: 'bold', fontSize: 12, marginTop: 8, color: '#444' },
  podiumPercent: { fontSize: 14, color: '#2A398D', fontWeight: 'bold' },
  podiumPlace: { fontSize: 20, marginTop: 5 },
  flagShadow: { borderRadius: 4, elevation: 2 },
  totalText: { textAlign: 'center', color: '#888', marginBottom: 15, fontSize: 14 },
  voteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center'
  },
  votedItem: { backgroundColor: '#F0FFFB', borderRadius: 10, borderBottomWidth: 0 },
  teamInfo: { flexDirection: 'row', alignItems: 'center' },
  listFlag: { marginRight: 15, borderRadius: 3 },
  teamName: { fontSize: 16, color: '#333' },
  voteRight: { flexDirection: 'row', alignItems: 'center' },
  percentText: { marginRight: 10, color: '#666', fontWeight: '500' },
  closedBadge: {
    backgroundColor: '#ff4444',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 15
  },
  closedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  }
});