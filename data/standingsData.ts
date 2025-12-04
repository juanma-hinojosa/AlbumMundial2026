export interface TeamStats {
  id: string;
  name: string;
  flag: string; // URL o código de bandera
  mp: number; // Partidos Jugados (Matches Played)
  w: number;  // Ganados (Won)
  d: number;  // Empatados (Drawn)
  l: number;  // Perdidos (Lost)
  gf: number; // Goles Favor
  ga: number; // Goles Contra
  pts: number; // Puntos
}

export interface Group {
  id: string;
  name: string;
  teams: TeamStats[];
}

// Función de utilidad para ordenar la tabla automáticamente
// Criterio FIFA: Puntos > Diferencia de Gol > Goles a Favor
export const sortStandings = (teams: TeamStats[]) => {
  return [...teams].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts; // 1. Puntos
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;         // 2. Diferencia de gol
    return b.gf - a.gf;                        // 3. Goles a favor
  });
};

export const initialStandings: Group[] = [
  {
    id: 'A',
    name: 'Grupo A',
    teams: [
      { id: 'MEX', name: 'México', flag: 'MX', mp: 1, w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3 },
      { id: 'URU', name: 'Uruguay', flag: 'UY', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'EGY', name: 'Egipto', flag: 'EG', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'TUR', name: 'Turquía', flag: 'TR', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'B',
    name: 'Grupo B',
    teams: [
      { id: 'CAN', name: 'Canadá', flag: 'CA', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'CRO', name: 'Croacia', flag: 'HR', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'KSA', name: 'Arabia Saudita', flag: 'SA', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'ITA', name: 'Italia', flag: 'IT', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'C',
    name: 'Grupo C',
    teams: [
      { id: 'ESP', name: 'España', flag: 'ES', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'JPN', name: 'Japón', flag: 'JP', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'PAR', name: 'Paraguay', flag: 'PY', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'CPV', name: 'Cabo Verde', flag: 'CV', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'D',
    name: 'Grupo D',
    teams: [
      { id: 'USA', name: 'Estados Unidos', flag: 'US', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'SUI', name: 'Suiza', flag: 'CH', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'TUN', name: 'Túnez', flag: 'TN', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'NZL', name: 'Nueva Zelanda', flag: 'NZ', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'E',
    name: 'Grupo E',
    teams: [
      { id: 'ARG', name: 'Argentina', flag: 'AR', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'AUT', name: 'Austria', flag: 'AT', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'QAT', name: 'Qatar', flag: 'QA', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'DEN', name: 'Dinamarca', flag: 'DK', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'F',
    name: 'Grupo F',
    teams: [
      { id: 'FRA', name: 'Francia', flag: 'FR', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'SEN', name: 'Senegal', flag: 'SN', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'PAN', name: 'Panamá', flag: 'PA', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'JOR', name: 'Jordania', flag: 'JO', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'G',
    name: 'Grupo G',
    teams: [
      { id: 'ENG', name: 'Inglaterra', flag: 'GB-ENG', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'COL', name: 'Colombia', flag: 'CO', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'ALG', name: 'Argelia', flag: 'DZ', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'POL', name: 'Polonia', flag: 'PL', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'H',
    name: 'Grupo H',
    teams: [
      { id: 'POR', name: 'Portugal', flag: 'PT', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'KOR', name: 'Corea del Sur', flag: 'KR', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'SCO', name: 'Escocia', flag: 'GB-SCT', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'HTI', name: 'Haití', flag: 'HT', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'I',
    name: 'Grupo I',
    teams: [
      { id: 'NED', name: 'Países Bajos', flag: 'NL', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'AUS', name: 'Australia', flag: 'AU', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'RSA', name: 'Sudáfrica', flag: 'ZA', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'GHA', name: 'Ghana', flag: 'GH', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'J',
    name: 'Grupo J',
    teams: [
      { id: 'BRA', name: 'Brasil', flag: 'BR', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'MAR', name: 'Marruecos', flag: 'MA', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'NOR', name: 'Noruega', flag: 'NO', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'CUW', name: 'Curazao', flag: 'CW', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'K',
    name: 'Grupo K',
    teams: [
      { id: 'BEL', name: 'Bélgica', flag: 'BE', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'IRN', name: 'Irán', flag: 'IR', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'CIV', name: 'Costa de Marfil', flag: 'CI', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'BOL', name: 'Bolivia', flag: 'BO', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  },
  {
    id: 'L',
    name: 'Grupo L',
    teams: [
      { id: 'GER', name: 'Alemania', flag: 'DE', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'ECU', name: 'Ecuador', flag: 'EC', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'UZB', name: 'Uzbekistán', flag: 'UZ', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
      { id: 'JAM', name: 'Jamaica', flag: 'JM', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    ]
  }
];
