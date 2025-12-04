export interface Match {
  id: string;
  stage: string;       // "Grupo A", "Octavos", "Final"
  type: 'group' | 'knockout'; 
  date: string;        // Formato ISO: "2024-06-20T21:00:00"
  team1: { name: string; code: string; flag?: string }; // Usamos código para buscar bandera si quieres
  team2: { name: string; code: string; flag?: string };
  stadium: string;
  score?: { t1: number; t2: number }; // Opcional, si ya se jugó
  status: 'scheduled' | 'live' | 'finished';
}

export const fixtureData: Match[] = [
  // --- GRUPO A ---
  {
    id: 'm1',
    stage: 'Grupo A',
    type: 'group',
    date: '2026-12-04T20:00:00', // Pon una fecha cercana a HOY para probar
    team1: { name: 'Argentina', code: 'ARG' },
    team2: { name: 'Croacia', code: 'CRO' },
    stadium: 'Mercedes-Benz Stadium',
    status: 'scheduled'
  },
  {
    id: 'm2',
    stage: 'Grupo A',
    type: 'group',
    date: new Date().toISOString(), // TRUCO: Este partido siempre será "HOY" para tus pruebas
    team1: { name: 'Mexico', code: 'MEX' },
    team2: { name: 'Noruega', code: 'NOR' },
    stadium: 'AT&T Stadium',
    status: 'live',
    score: { t1: 1, t2: 0 }
  },
  {
    id: 'm3',
    stage: 'Grupo B',
    type: 'group',
    date: new Date().toISOString(), // TRUCO: Este partido siempre será "HOY" para tus pruebas
    team1: { name: 'España', code: 'SPN' },
    team2: { name: 'Holanda', code: 'NET' },
    stadium: 'AT&T Stadium',
    status: 'live',
    score: { t1: 1, t2: 5 }
  },
  {
    id: 'm4',
    stage: 'Grupo B',
    type: 'group',
    date: new Date().toISOString(), // TRUCO: Este partido siempre será "HOY" para tus pruebas
    team1: { name: 'England', code: 'ENG' },
    team2: { name: 'France', code: 'FRA' },
    stadium: 'AT&T Stadium',
    status: 'live',
    score: { t1: 1, t2: 2 }
  },
  // --- MATA MATA (Ejemplo) ---
  {
    id: 'm50',
    stage: 'Octavos de Final',
    type: 'knockout',
    date: '2024-06-30T16:00:00',
    team1: { name: '1A', code: '?' },
    team2: { name: '2B', code: '?' },
    stadium: 'Hard Rock Stadium',
    status: 'scheduled'
  }
];