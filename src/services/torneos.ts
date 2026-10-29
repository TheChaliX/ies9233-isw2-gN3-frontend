import { API_URL, mensajeError, pedir } from './api';

export type Torneo = {
  id: number;
  nombre: string;
  temporada: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
};

// GET /torneos/{id}
export async function getTorneo(id: number): Promise<Torneo> {
  const res = await pedir(`${API_URL}/torneos/${id}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el torneo'));
  return res.json();
}
