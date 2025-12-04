// import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Match } from '../data/fixtureData';

// Función simple para formatear hora (ej: 21:00)
const formatTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Función para formatear fecha (ej: Lun 20 Jun)
const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
};

export const MatchCard = ({ match }: { match: Match }) => {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  return (
    <View style={styles.card}>
      {/* Cabecera: Fecha y Estadio */}
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {formatDate(match.date)} • {match.stage}
        </Text>
        {isLive && <Text style={styles.liveBadge}>EN VIVO</Text>}
      </View>

      {/* Enfrentamiento */}
      <View style={styles.matchRow}>
        {/* Equipo 1 */}
        <View style={styles.teamContainer}>
          <Text style={styles.teamCode}>{match.team1.code}</Text>
          <Text style={styles.teamName}>{match.team1.name}</Text>
        </View>

        {/* Marcador o Hora */}
        <View style={styles.scoreContainer}>
          {match.status === 'scheduled' ? (
            <Text style={styles.timeText}>{formatTime(match.date)}</Text>
          ) : (
            <Text style={[styles.scoreText, isLive && styles.scoreLive]}>
              {match.score?.t1} - {match.score?.t2}
            </Text>
          )}
        </View>

        {/* Equipo 2 */}
        <View style={styles.teamContainer}>
          <Text style={styles.teamCode}>{match.team2.code}</Text>
          <Text style={styles.teamName}>{match.team2.name}</Text>
        </View>
      </View>
      
      <Text style={styles.stadium}>{match.stadium}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateText: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  liveBadge: { color: 'white', backgroundColor: 'red', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' },
  
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamContainer: { flex: 1, alignItems: 'center' },
  teamCode: { fontSize: 24, fontWeight: '900', color: '#333' }, // Estilo tipo TV
  teamName: { fontSize: 12, color: '#666', marginTop: 2 },
  
  scoreContainer: { width: 80, alignItems: 'center' },
  timeText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  scoreText: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  scoreLive: { color: '#d32f2f' },
  
  stadium: { marginTop: 10, textAlign: 'center', fontSize: 10, color: '#aaa' }
});