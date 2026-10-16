export type EstadoPartido = 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO';

export type Partido = {
  id: number;
  fecha: number; // número de fecha (jornada) del torneo
  horario: string; // hora de Argentina, "2026-10-17T11:00:00"
  local: string;
  visitante: string;
  golesLocal: number; // el backend lo calcula a partir de los eventos
  golesVisitante: number;
  estado: EstadoPartido;
  cancha: string;
};

// Mientras el backend no tenga el endpoint, dejar en true.
const USAR_MOCK = true;

// Android emulator: http://10.0.2.2:8080 — celular real: la IP de tu PC en la red.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

// Premier League 2026-27. La "cancha" es el estadio del equipo local.
const ESTADIOS: Record<string, string> = {
  Arsenal: 'Emirates Stadium',
  'Aston Villa': 'Villa Park',
  Bournemouth: 'Vitality Stadium',
  Brentford: 'Gtech Community Stadium',
  Brighton: 'Amex Stadium',
  Chelsea: 'Stamford Bridge',
  'Coventry City': 'Coventry Building Society Arena',
  'Crystal Palace': 'Selhurst Park',
  Everton: 'Hill Dickinson Stadium',
  Fulham: 'Craven Cottage',
  'Hull City': 'MKM Stadium',
  'Ipswich Town': 'Portman Road',
  'Leeds United': 'Elland Road',
  Liverpool: 'Anfield',
  'Manchester City': 'Etihad Stadium',
  'Manchester United': 'Old Trafford',
  Newcastle: "St James' Park",
  'Nottingham Forest': 'City Ground',
  Sunderland: 'Stadium of Light',
  Tottenham: 'Tottenham Hotspur Stadium',
};

// Si se pasa resultado el partido está FINALIZADO; si no, PROGRAMADO.
function p(
  id: number,
  fecha: number,
  horario: string,
  local: string,
  visitante: string,
  resultado?: [number, number],
): Partido {
  return {
    id,
    fecha,
    horario,
    local,
    visitante,
    golesLocal: resultado ? resultado[0] : 0,
    golesVisitante: resultado ? resultado[1] : 0,
    estado: resultado ? 'FINALIZADO' : 'PROGRAMADO',
    cancha: ESTADIOS[local],
  };
}

const MOCK: Partido[] = [
  // Fecha 6 (10 al 12 de octubre). Resultados reales; los horarios son aproximados.
  p(1, 6, '2026-10-10T11:00:00', 'Arsenal', 'Leeds United', [2, 1]),
  p(2, 6, '2026-10-10T11:00:00', 'Aston Villa', 'Brentford', [2, 2]),
  p(3, 6, '2026-10-10T11:00:00', 'Chelsea', 'Bournemouth', [5, 1]),
  p(4, 6, '2026-10-10T11:00:00', 'Ipswich Town', 'Fulham', [2, 1]),
  p(5, 6, '2026-10-10T11:00:00', 'Manchester United', 'Tottenham', [1, 1]),
  p(6, 6, '2026-10-10T11:00:00', 'Sunderland', 'Brighton', [0, 2]),
  p(7, 6, '2026-10-11T11:00:00', 'Crystal Palace', 'Nottingham Forest', [3, 1]),
  p(8, 6, '2026-10-11T11:00:00', 'Hull City', 'Everton', [2, 2]),
  p(9, 6, '2026-10-11T11:00:00', 'Liverpool', 'Manchester City', [0, 3]),
  p(10, 6, '2026-10-12T16:00:00', 'Coventry City', 'Newcastle', [4, 1]),

  // Fecha 7 (17 al 19 de octubre)
  p(11, 7, '2026-10-17T08:30:00', 'Everton', 'Chelsea'),
  p(12, 7, '2026-10-17T11:00:00', 'Brentford', 'Liverpool'),
  p(13, 7, '2026-10-17T11:00:00', 'Fulham', 'Hull City'),
  p(14, 7, '2026-10-17T11:00:00', 'Manchester City', 'Ipswich Town'),
  p(15, 7, '2026-10-17T13:30:00', 'Newcastle', 'Aston Villa'),
  p(16, 7, '2026-10-18T10:00:00', 'Bournemouth', 'Sunderland'),
  p(17, 7, '2026-10-18T10:00:00', 'Brighton', 'Crystal Palace'),
  p(18, 7, '2026-10-18T10:00:00', 'Leeds United', 'Manchester United'),
  p(19, 7, '2026-10-18T12:30:00', 'Nottingham Forest', 'Arsenal'),
  p(20, 7, '2026-10-19T16:00:00', 'Tottenham', 'Coventry City'),

  // Fecha 8 (23 al 25 de octubre)
  p(21, 8, '2026-10-23T16:00:00', 'Ipswich Town', 'Nottingham Forest'),
  p(22, 8, '2026-10-24T08:30:00', 'Aston Villa', 'Manchester City'),
  p(23, 8, '2026-10-24T11:00:00', 'Arsenal', 'Everton'),
  p(24, 8, '2026-10-24T11:00:00', 'Coventry City', 'Fulham'),
  p(25, 8, '2026-10-24T13:30:00', 'Chelsea', 'Tottenham'),
  p(26, 8, '2026-10-25T11:00:00', 'Crystal Palace', 'Newcastle'),
  p(27, 8, '2026-10-25T11:00:00', 'Hull City', 'Brentford'),
  p(28, 8, '2026-10-25T11:00:00', 'Liverpool', 'Brighton'),
  p(29, 8, '2026-10-25T11:00:00', 'Manchester United', 'Bournemouth'),
  p(30, 8, '2026-10-25T13:30:00', 'Sunderland', 'Leeds United'),
];

// Endpoint supuesto (a acordar con el backend): GET /torneos/{id}/partidos
export async function getPartidos(torneoId: number): Promise<Partido[]> {
  if (USAR_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK;
  }
  const res = await fetch(`${API_URL}/torneos/${torneoId}/partidos`);
  if (!res.ok) throw new Error('No se pudieron cargar los partidos');
  return res.json();
}
