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

const MOCK: Posicion[] = [
  { posicion: 1, equipo: 'Deportivo Litoral', pj: 6, pg: 5, pe: 0, pp: 1, dg: 9, pts: 15 },
  { posicion: 2, equipo: 'Los Halcones', pj: 6, pg: 4, pe: 1, pp: 1, dg: 6, pts: 13 },
  { posicion: 3, equipo: 'Barrio Norte', pj: 6, pg: 3, pe: 2, pp: 1, dg: 3, pts: 11 },
  { posicion: 4, equipo: 'Juventud Unida', pj: 6, pg: 2, pe: 1, pp: 3, dg: -1, pts: 7 },
  { posicion: 5, equipo: 'Los Pumas FC', pj: 6, pg: 1, pe: 1, pp: 4, dg: -7, pts: 4 },
  { posicion: 6, equipo: 'Santa Rosa FC', pj: 6, pg: 0, pe: 1, pp: 5, dg: -10, pts: 1 },
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
