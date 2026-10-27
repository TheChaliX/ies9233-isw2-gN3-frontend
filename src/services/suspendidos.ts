import { API_URL, mensajeError, pedir } from './api';

export type Suspendido = {
  jugadorId: number;
  nombre: string;
  apellido: string;
  equipo: string;
  motivo: string;
  fechaSuspension: number; // fecha del torneo en la que cumple la suspensión
};

// true = datos de mentira en memoria (sin backend); false = habla con el backend real.
const USAR_MOCK = false;

const MOCK: Suspendido[] = [
  { jugadorId: 3, nombre: 'Lucas', apellido: 'Díaz', equipo: 'Los Tigres', motivo: 'Roja directa', fechaSuspension: 7 },
  { jugadorId: 4, nombre: 'Franco', apellido: 'Silva', equipo: 'Atlético Norte', motivo: 'Acumulación de amarillas', fechaSuspension: 7 },
];

// GET /torneos/{id}/suspendidos  (sin ?fecha= usa la fecha en curso del torneo)
export async function getSuspendidos(torneoId: number): Promise<Suspendido[]> {
  if (USAR_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK;
  }
  const res = await pedir(`${API_URL}/torneos/${torneoId}/suspendidos`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudieron cargar los suspendidos'));
  return res.json();
}