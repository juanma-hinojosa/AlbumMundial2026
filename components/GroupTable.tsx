import { StyleSheet, Text, View } from 'react-native';
import { Group, sortStandings } from '../data/standingsData';

export const GroupTable = ({ group }: { group: Group }) => {
  // Ordenamos los equipos antes de renderizar
  const sortedTeams = sortStandings(group.teams);

  return (
    <View style={styles.container}>
      {/* Título del Grupo */}
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{group.name}</Text>
      </View>

      {/* Cabecera de Columnas */}
      <View style={styles.rowHeader}>
        <Text style={[styles.colTeam, styles.headerText]}>Equipo</Text>
        <Text style={[styles.colNumber, styles.headerText]}>PJ</Text>
        <Text style={[styles.colNumber, styles.headerText]}>DG</Text>
        <Text style={[styles.colPts, styles.headerText]}>PTS</Text>
      </View>

      {/* Filas de Equipos */}
      {sortedTeams.map((team, index) => {
        // Los dos primeros suelen clasificar (Color verde sutil)
        const isQualified = index < 2; 

        return (
          <View key={team.id} style={[styles.row, isQualified && styles.qualifiedRow]}>
            <View style={styles.colTeam}>
              <Text style={styles.posText}>{index + 1}</Text>
              {/* Aquí podrías poner una imagen de bandera si quisieras */}
              <Text style={[styles.teamName, isQualified && styles.boldText]}>
                {team.name}
              </Text>
            </View>
            
            <Text style={styles.colNumber}>{team.mp}</Text>
            <Text style={styles.colNumber}>{team.gf - team.ga}</Text>
            <Text style={[styles.colPts, styles.boldText]}>{team.pts}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    backgroundColor: '#007AFF',
    padding: 10,
  },
  groupTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  rowHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa'
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center'
  },
  qualifiedRow: {
    backgroundColor: '#f0f9ff' // Un azul muy clarito para los clasificados
    // O borderLeftWidth: 4, borderLeftColor: 'green'
  },
  
  // Definición de anchos de columna (Flexbox)
  colTeam: { flex: 4, paddingLeft: 10, flexDirection: 'row', alignItems: 'center' },
  colNumber: { flex: 1, textAlign: 'center', fontSize: 12, color: '#555' },
  colPts: { flex: 1.5, textAlign: 'center', fontWeight: 'bold', fontSize: 14 },

  headerText: { fontWeight: 'bold', color: '#888', fontSize: 11 },
  posText: { width: 20, fontSize: 12, color: '#888', fontWeight: 'bold' },
  teamName: { fontSize: 14, color: '#333', marginLeft: 5 },
  boldText: { fontWeight: 'bold', color: '#000' }
});