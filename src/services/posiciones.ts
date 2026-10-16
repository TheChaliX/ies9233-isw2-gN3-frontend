// Una fila de la tabla de posiciones.
// El backend es quien calcula todo (puntos, desempate, orden); la app solo lo muestra.
export type Posicion = {
  posicion: number;
  equipo: string;
  pj: number; // partidos jugados
  pg: number; // ganados
  pe: number; // empatados
  pp: number; // perdidos
  dg: number; // diferencia de gol
  pts: number; // puntos
};

// Mientras el backend no tenga el endpoint, dejar en true.
const USAR_MOCK = true;

// Android emulator: http://10.0.2.2:8080 — celular real: la IP de tu PC en la red.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

// Premier League 2026-27, tabla al 15/10/2026 (después de la fecha 6).
const MOCK: Posicion[] = [
  { posicion: 1, equipo: 'Manchester City', pj: 6, pg: 6, pe: 0, pp: 0, dg: 11, pts: 18 },
  { posicion: 2, equipo: 'Arsenal', pj: 6, pg: 5, pe: 0, pp: 1, dg: 5, pts: 15 },
  { posicion: 3, equipo: 'Brighton', pj: 6, pg: 4, pe: 1, pp: 1, dg: 13, pts: 13 },
  { posicion: 4, equipo: 'Brentford', pj: 6, pg: 2, pe: 4, pp: 0, dg: 6, pts: 10 },
  { posicion: 5, equipo: 'Everton', pj: 6, pg: 2, pe: 4, pp: 0, dg: 3, pts: 10 },
  { posicion: 6, equipo: 'Chelsea', pj: 6, pg: 3, pe: 1, pp: 2, dg: 2, pts: 10 },
  { posicion: 7, equipo: 'Leeds United', pj: 6, pg: 2, pe: 3, pp: 1, dg: 3, pts: 9 },
  { posicion: 8, equipo: 'Hull City', pj: 6, pg: 2, pe: 3, pp: 1, dg: 2, pts: 9 },
  { posicion: 9, equipo: 'Liverpool', pj: 6, pg: 2, pe: 3, pp: 1, dg: 0, pts: 9 },
  { posicion: 10, equipo: 'Ipswich Town', pj: 6, pg: 3, pe: 0, pp: 3, dg: -3, pts: 9 },
  { posicion: 11, equipo: 'Newcastle', pj: 6, pg: 2, pe: 2, pp: 2, dg: -3, pts: 8 },
  { posicion: 12, equipo: 'Crystal Palace', pj: 6, pg: 2, pe: 1, pp: 3, dg: -3, pts: 7 },
  { posicion: 13, equipo: 'Manchester United', pj: 6, pg: 1, pe: 3, pp: 2, dg: 0, pts: 6 },
  { posicion: 14, equipo: 'Coventry City', pj: 6, pg: 2, pe: 0, pp: 4, dg: -6, pts: 6 },
  { posicion: 15, equipo: 'Nottingham Forest', pj: 6, pg: 1, pe: 2, pp: 3, dg: -3, pts: 5 },
  { posicion: 16, equipo: 'Aston Villa', pj: 6, pg: 1, pe: 2, pp: 3, dg: -5, pts: 5 },
  { posicion: 17, equipo: 'Sunderland', pj: 6, pg: 1, pe: 1, pp: 4, dg: -6, pts: 4 },
  { posicion: 18, equipo: 'Bournemouth', pj: 6, pg: 0, pe: 3, pp: 3, dg: -6, pts: 3 },
  { posicion: 19, equipo: 'Tottenham', pj: 6, pg: 0, pe: 3, pp: 3, dg: -6, pts: 3 },
  { posicion: 20, equipo: 'Fulham', pj: 6, pg: 0, pe: 2, pp: 4, dg: -4, pts: 2 },
];

// Endpoint supuesto (a acordar con el backend): GET /torneos/{id}/posiciones
export async function getPosiciones(torneoId: number): Promise<Posicion[]> {
  if (USAR_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK;
  }
  const res = await fetch(`${API_URL}/torneos/${torneoId}/posiciones`);
  if (!res.ok) throw new Error('No se pudo cargar la tabla de posiciones');
  return res.json();
}
