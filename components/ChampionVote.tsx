import { useAuth } from '@/context/AuthContext';
import { useStickers } from '@/context/StickerContext';
import { supabase } from '@/utils/supabase'; // Asegúrate de tener tu cliente de supabase aquí
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CountryFlag from "react-native-country-flag";

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

// Generador de UUID para usuarios anónimos
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
    // if (user) {
    //   setShowLogin(false);
    // }
  }, [user]);

  // Función para obtener el ID de usuario (Logueado o Anónimo local)
  const getVoterId = async () => {
    if (user?.id) return user.id;

    let guestId = await AsyncStorage.getItem('guest_voter_id');
    if (!guestId) {
      guestId = generateUUID();
      await AsyncStorage.setItem('guest_voter_id', guestId);
    }
    return guestId;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Necesitamos traer el user_id para compararlo localmente
      const { data: allVotes, error: votesError } = await supabase
        .from('votes')
        .select('team_id, user_id');

      if (votesError) throw votesError;

      const currentVoterId = await getVoterId();

      // Buscamos si este ID ya emitió un voto
      const myVote = allVotes?.find(v => v.user_id === currentVoterId);
      if (myVote) {
        setUserVote(myVote.team_id);
      } else {
        setUserVote(null);
      }

      calculateStats(allVotes || []);
    } catch (error) {
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
  //   if (!isVotingOpen) {
  //     Alert.alert("Votación cerrada", "El tiempo para elegir campeón ha finalizado.");
  //     return;
  //   }

  //   // SI NO HAY USUARIO, MOSTRAMOS EL COMPONENTE DE LOGIN
  //   if (!user) {
  //     setShowLogin(true);
  //     return;
  //   }

  //   try {
  //     const { error } = await supabase
  //       .from('votes')
  //       .upsert(
  //         { user_id: user.id, team_id: teamId },
  //         { onConflict: 'user_id' }
  //       );

  //     if (error) throw error;

  //     setUserVote(teamId);
  //     fetchData(); // Refrescar stats
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

    const voterId = await getVoterId();

    try {
      const { error } = await supabase
        .from('votes')
        .upsert(
          { user_id: voterId, team_id: teamId },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setUserVote(teamId);
      fetchData();
      Alert.alert("¡Voto registrado!", `Has elegido a ${teamId} como tu campeón.`);
    } catch (error: any) {
      console.error("Error en upsert:", error);
      Alert.alert("Error", "No se pudo actualizar el voto.");
    }
  };

  // Reorganizar el podio: [Plata, Oro, Bronce]
  const rawPodium = stats.slice(0, 3);
  const podiumArrangement = [];
  if (rawPodium.length > 1) podiumArrangement.push({ ...rawPodium[1], rank: 2 });
  if (rawPodium.length > 0) podiumArrangement.push({ ...rawPodium[0], rank: 1 });
  if (rawPodium.length > 2) podiumArrangement.push({ ...rawPodium[2], rank: 3 });

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 {t('votos:votoTitle')}</Text>

      {/* NUEVO PODIO MEJORADO */}
      <View style={styles.podiumContainer}>
        {podiumArrangement.map((item) => {
          const isFirst = item.rank === 1;
          const isSecond = item.rank === 2;
          const isThird = item.rank === 3;

          return (
            <View 
              key={item.team_id} 
              style={[
                styles.podiumStep, 
                isFirst && styles.rank1,
                isSecond && styles.rank2,
                isThird && styles.rank3
              ]}
            >
              <Text style={styles.podiumPlace}>
                {isFirst ? '🥇' : isSecond ? '🥈' : '🥉'}
              </Text>

              {flagMap[item.name] && (
                <CountryFlag 
                  isoCode={flagMap[item.name]} 
                  size={isFirst ? 36 : 28} 
                  style={[styles.flagShadow, isFirst && styles.flagFirst]} 
                />
              )}
              
              <Text style={[styles.podiumName, isFirst && styles.nameFirst]} numberOfLines={1}>
                {item.name}
              </Text>
              
              <Text style={[styles.podiumPercent, isFirst && styles.percentFirst]}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.totalText}>{t('votos:votosNumTotal')}: {totalVotes}</Text>

      {/* LISTA (Mantenida igual, solo asegúrate de integrar tus estilos anteriores) */}
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
  // (
  //   <View style={styles.container}>
  //     <Text style={styles.title}>🏆 {t('votos:votoTitle')}</Text>

  //     {/* PODIO */}
  //     <View style={styles.podiumContainer}>
  //       {podium.map((item, index) => (
  //         <View key={item.team_id} style={[styles.podiumStep, { height: 130 - index * 20 }]}>
  //           {flagMap[item.name] && (
  //             <CountryFlag isoCode={flagMap[item.name]} size={index === 0 ? 30 : 25} style={styles.flagShadow} />
  //           )}
  //           <Text style={styles.podiumName} numberOfLines={1}>{item.name}</Text>
  //           <Text style={styles.podiumPercent}>{item.percentage.toFixed(1)}%</Text>
  //           <Text style={styles.podiumPlace}>
  //             {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
  //           </Text>
  //         </View>
  //       ))}
  //     </View>

  //     <Text style={styles.totalText}>{t('votos:votosNumTotal')}: {totalVotes}</Text>

  //     {/* LISTA */}
  //     <FlatList
  //       data={stats}
  //       keyExtractor={(item) => item.team_id}
  //       contentContainerStyle={{ paddingBottom: 40 }}
  //       renderItem={({ item }) => (
  //         <TouchableOpacity
  //           style={[styles.voteItem, userVote === item.team_id && styles.votedItem]}
  //           onPress={() => handleVote(item.team_id)}
  //           disabled={!isVotingOpen}
  //         >
  //           <View style={styles.teamInfo}>
  //             {flagMap[item.name] ? (
  //               <CountryFlag isoCode={flagMap[item.name]} size={20} style={styles.listFlag} />
  //             ) : (
  //               <Ionicons name="flag-outline" size={20} style={styles.listFlag} />
  //             )}
  //             <Text style={styles.teamName}>{item.name}</Text>
  //           </View>

  //           <View style={styles.voteRight}>
  //             <Text style={styles.percentText}>{item.percentage.toFixed(1)}%</Text>
  //             {userVote === item.team_id && (
  //               <Ionicons name="checkmark-circle" size={22} color="#4ECDC4" />
  //             )}
  //           </View>
  //         </TouchableOpacity>
  //       )}
  //     />
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2A398D' },
  subTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  // --- ESTILOS DEL PODIO ---
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 30,
    height: 190, // Suficiente espacio para las cajas grandes
  },
  podiumStep: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 15,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rank1: {
    height: 175,
    backgroundColor: '#FFF8E1', // Fondo dorado suave
    borderWidth: 2,
    borderColor: '#FFD700',
    borderBottomWidth: 0,
    zIndex: 10,
  },
  rank2: {
    height: 145,
    backgroundColor: '#F5F5F5', // Fondo plateado suave
    borderWidth: 2,
    borderColor: '#B0BEC5',
    borderBottomWidth: 0,
  },
  rank3: {
    height: 125,
    backgroundColor: '#FBE9E7', // Fondo bronce suave
    borderWidth: 2,
    borderColor: '#FFAB91',
    borderBottomWidth: 0,
  },
  podiumPlace: {
    fontSize: 26,
    marginBottom: 6,
  },
  flagShadow: {
    borderRadius: 4,
    marginBottom: 8,
  },
  flagFirst: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  nameFirst: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  podiumPercent: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: 'bold',
  },
  percentFirst: {
    fontSize: 14,
    color: '#F57F17',
  },
  totalText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#555',
  },
  // --- TUS ESTILOS DE LA LISTA ---
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
  },
  votedItem: {
    backgroundColor: '#E0F7FA',
    borderColor: '#4ECDC4',
    borderWidth: 1,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listFlag: {
    marginRight: 10,
    borderRadius: 3,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
  },
  voteRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
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
  },
  
});