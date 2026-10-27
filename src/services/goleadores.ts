import { API_URL, mensajeError, pedir } from './api';

export type Goleador = {
  posicion: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  equipo: string;
  goles: number;
};

// true = datos de mentira en memoria (sin backend); false = habla con el backend real.
const USAR_MOCK = false;

const MOCK: Goleador[] = [
  { posicion: 1, jugadorId: 1, nombre: 'Juan', apellido: 'Pérez', equipo: 'Los Tigres', goles: 9 },
  { posicion: 2, jugadorId: 2, nombre: 'Martín', apellido: 'Gómez', equipo: 'Deportivo Sur', goles: 7 },
  { posicion: 3, jugadorId: 3, nombre: 'Lucas', apellido: 'Díaz', equipo: 'Los Tigres', goles: 6 },
];

// GET /torneos/{id}/goleadores
export async function getGoleadores(torneoId: number): Promise<Goleador[]> {
  if (USAR_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK;
  }
  const res = await pedir(`${API_URL}/torneos/${torneoId}/goleadores`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudieron cargar los goleadores'));
  return res.json();
}