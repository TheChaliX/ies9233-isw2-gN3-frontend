import { API_URL, mensajeError, pedir } from './api';

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

export type TipoEvento = 'GOL' | 'GOL_EN_CONTRA' | 'AMARILLA' | 'ROJA';

// Equipo AL QUE PERTENECE EL JUGADOR del evento. En un GOL_EN_CONTRA el gol suma al rival.
export type Lado = 'LOCAL' | 'VISITANTE';

export type Jugador = {
  id: number;
  nombre: string;
  apellido: string;
  numeroCamiseta: number; // 1..99, único dentro del equipo
};

export type EventoPartido = {
  id: number;
  partidoId: number;
  tipo: TipoEvento;
  minuto: number; // 0..120 (CHECK de la tabla evento_partido)
  lado: Lado;
  jugador: Jugador;
};

// Lo que manda el delegado al cargar un evento. El lado lo deduce el backend por el jugador.
export type NuevoEvento = {
  jugadorId: number;
  tipo: TipoEvento;
  minuto: number;
};

export type Plantel = { local: Jugador[]; visitante: Jugador[] };

// true = datos de mentira en memoria (sin backend); false = habla con el backend real.
const USAR_MOCK = false;

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

// ---------------------------------------------------------------------------
// Mock de jugadores y eventos (vive en memoria: se pierde al recargar la app).
// ---------------------------------------------------------------------------
const EQUIPOS = Object.keys(ESTADIOS);
const NOMBRES = ['Lucas', 'Mateo', 'Tomás', 'Nicolás', 'Franco', 'Agustín', 'Bruno', 'Joaquín', 'Facundo', 'Santiago', 'Ezequiel'];
const APELLIDOS = ['Gómez', 'Fernández', 'Rodríguez', 'López', 'Díaz', 'Martínez', 'Pérez', 'Romero', 'Sosa', 'Álvarez', 'Torres'];

// 11 jugadores por equipo, con camiseta 1..11. Los índices avanzan de a 1 y de a 3 sobre
// listas de 11 (primo), así que dentro de un equipo no se repite ni nombre ni apellido.
function plantelMock(equipo: string): Jugador[] {
  const e = EQUIPOS.indexOf(equipo);
  return Array.from({ length: 11 }, (_, i) => ({
    id: (e + 1) * 100 + i + 1,
    nombre: NOMBRES[(i + e) % 11],
    apellido: APELLIDOS[(i * 3 + e * 2) % 11],
    numeroCamiseta: i + 1,
  }));
}

const EVENTOS_MOCK: EventoPartido[] = [];
let proximoEventoId = 1;

function agregarEventoMock(
  partido: Partido,
  lado: Lado,
  jugador: Jugador,
  tipo: TipoEvento,
  minuto: number,
): EventoPartido {
  const evento: EventoPartido = { id: proximoEventoId++, partidoId: partido.id, tipo, minuto, lado, jugador };
  EVENTOS_MOCK.push(evento);
  return evento;
}

// El backend real calcula el marcador a partir de los eventos; el mock hace lo mismo.
function recalcularMarcador(partido: Partido) {
  let local = 0;
  let visitante = 0;
  for (const e of EVENTOS_MOCK) {
    if (e.partidoId !== partido.id) continue;
    const sumaAlLocal = (e.tipo === 'GOL' && e.lado === 'LOCAL') || (e.tipo === 'GOL_EN_CONTRA' && e.lado === 'VISITANTE');
    const sumaAlVisitante = (e.tipo === 'GOL' && e.lado === 'VISITANTE') || (e.tipo === 'GOL_EN_CONTRA' && e.lado === 'LOCAL');
    if (sumaAlLocal) local++;
    if (sumaAlVisitante) visitante++;
  }
  partido.golesLocal = local;
  partido.golesVisitante = visitante;
}

function jugadorDelPartido(partido: Partido, jugadorId: number): { jugador: Jugador; lado: Lado } | null {
  const local = plantelMock(partido.local).find((j) => j.id === jugadorId);
  if (local) return { jugador: local, lado: 'LOCAL' };
  const visitante = plantelMock(partido.visitante).find((j) => j.id === jugadorId);
  return visitante ? { jugador: visitante, lado: 'VISITANTE' } : null;
}

// Los partidos ya jugados tienen sus goles como eventos (así el detalle no queda vacío).
for (const partido of MOCK) {
  if (partido.estado !== 'FINALIZADO') continue;
  const goles: [Lado, number][] = [
    ['LOCAL', partido.golesLocal],
    ['VISITANTE', partido.golesVisitante],
  ];
  for (const [lado, cantidad] of goles) {
    const plantel = plantelMock(lado === 'LOCAL' ? partido.local : partido.visitante);
    for (let k = 0; k < cantidad; k++) {
      const jugador = plantel[((partido.id + k * 4) % 10) + 1];
      const minuto = 8 + ((partido.id * 7 + k * 23 + (lado === 'LOCAL' ? 0 : 11)) % 80);
      agregarEventoMock(partido, lado, jugador, 'GOL', minuto);
    }
  }
  if (partido.id % 2 === 0) {
    agregarEventoMock(partido, 'LOCAL', plantelMock(partido.local)[5], 'AMARILLA', 55);
  }
}

// Un partido en vivo para poder probar la carga de eventos: Everton vs Chelsea (id 11).
const EN_VIVO = MOCK[10];
EN_VIVO.estado = 'EN_JUEGO';
agregarEventoMock(EN_VIVO, 'VISITANTE', plantelMock('Chelsea')[8], 'GOL', 12);
agregarEventoMock(EN_VIVO, 'LOCAL', plantelMock('Everton')[3], 'AMARILLA', 34);
agregarEventoMock(EN_VIVO, 'LOCAL', plantelMock('Everton')[9], 'GOL', 41);
recalcularMarcador(EN_VIVO);

// Transiciones válidas del estado: el delegado inicia y finaliza el partido.
const TRANSICIONES: Partial<Record<EstadoPartido, EstadoPartido>> = {
  PROGRAMADO: 'EN_JUEGO',
  EN_JUEGO: 'FINALIZADO',
};

function esperar(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

function buscarPartidoMock(id: number): Partido {
  const partido = MOCK.find((x) => x.id === id);
  if (!partido) throw new Error('Partido no encontrado');
  return partido;
}

// GET /torneos/{id}/partidos
export async function getPartidos(torneoId: number): Promise<Partido[]> {
  if (USAR_MOCK) {
    await esperar();
    return MOCK.map((x) => ({ ...x })); // copias: el mock se modifica en memoria
  }
  const res = await pedir(`${API_URL}/torneos/${torneoId}/partidos`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudieron cargar los partidos'));
  return res.json();
}

// GET /partidos/{id}
export async function getPartido(id: number): Promise<Partido> {
  if (USAR_MOCK) {
    await esperar();
    return { ...buscarPartidoMock(id) };
  }
  const res = await pedir(`${API_URL}/partidos/${id}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el partido'));
  return res.json();
}

// GET /partidos/{id}/eventos  (ordenados por minuto)
export async function getEventos(partidoId: number): Promise<EventoPartido[]> {
  if (USAR_MOCK) {
    await esperar();
    return EVENTOS_MOCK.filter((e) => e.partidoId === partidoId)
      .sort((a, b) => a.minuto - b.minuto || a.id - b.id)
      .map((e) => ({ ...e }));
  }
  const res = await pedir(`${API_URL}/partidos/${partidoId}/eventos`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudieron cargar los eventos'));
  return res.json();
}

// GET /partidos/{id}/jugadores -> { local: [...], visitante: [...] }
export async function getJugadores(partidoId: number): Promise<Plantel> {
  if (USAR_MOCK) {
    await esperar();
    const partido = buscarPartidoMock(partidoId);
    return { local: plantelMock(partido.local), visitante: plantelMock(partido.visitante) };
  }
  const res = await pedir(`${API_URL}/partidos/${partidoId}/jugadores`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudieron cargar los jugadores'));
  return res.json();
}

// POST /partidos/{id}/eventos  body: { jugadorId, tipo, minuto }
// El backend debería rechazarlo (4xx) si el partido no está EN_JUEGO o el jugador no es de ninguno de los dos equipos.
export async function crearEvento(partidoId: number, nuevo: NuevoEvento): Promise<EventoPartido> {
  if (USAR_MOCK) {
    await esperar();
    const partido = buscarPartidoMock(partidoId);
    if (partido.estado !== 'EN_JUEGO') throw new Error('El partido no está en juego');
    if (!Number.isInteger(nuevo.minuto) || nuevo.minuto < 0 || nuevo.minuto > 120) {
      throw new Error('El minuto debe estar entre 0 y 120');
    }
    const encontrado = jugadorDelPartido(partido, nuevo.jugadorId);
    if (!encontrado) throw new Error('El jugador no pertenece a este partido');
    const evento = agregarEventoMock(partido, encontrado.lado, encontrado.jugador, nuevo.tipo, nuevo.minuto);
    recalcularMarcador(partido);
    return { ...evento };
  }
  const res = await pedir(`${API_URL}/partidos/${partidoId}/eventos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevo),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo guardar el evento'));
  return res.json();
}

// DELETE /partidos/{id}/eventos/{eventoId}  (para corregir un evento mal cargado)
export async function eliminarEvento(partidoId: number, eventoId: number): Promise<void> {
  if (USAR_MOCK) {
    await esperar();
    const partido = buscarPartidoMock(partidoId);
    const i = EVENTOS_MOCK.findIndex((e) => e.id === eventoId && e.partidoId === partidoId);
    if (i === -1) throw new Error('Evento no encontrado');
    EVENTOS_MOCK.splice(i, 1);
    recalcularMarcador(partido);
    return;
  }
  const res = await pedir(`${API_URL}/partidos/${partidoId}/eventos/${eventoId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo borrar el evento'));
}

// PATCH /partidos/{id}/estado  body: { estado }
// Solo PROGRAMADO -> EN_JUEGO y EN_JUEGO -> FINALIZADO.
export async function cambiarEstadoPartido(partidoId: number, estado: EstadoPartido): Promise<Partido> {
  if (USAR_MOCK) {
    await esperar();
    const partido = buscarPartidoMock(partidoId);
    if (TRANSICIONES[partido.estado] !== estado) throw new Error('Ese cambio de estado no está permitido');
    partido.estado = estado;
    return { ...partido };
  }
  const res = await pedir(`${API_URL}/partidos/${partidoId}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cambiar el estado del partido'));
  return res.json();
}
