import { API_URL, mensajeError, pedir } from './api';

export type Equipo = { id: number; torneoId: number; nombre: string; barrio: string | null; colorCamiseta: string | null; delegado: string | null };
export type JugadorCat = { id: number; nombre: string; apellido: string; numeroCamiseta: number };
export type Cancha = { id: number; nombre: string; direccion: string; barrio: string | null; superficie: string | null };
export type Arbitro = { id: number; nombre: string; apellido: string; dni: string; telefono: string | null };

export type NuevoEquipo = { torneoId: number; nombre: string; barrio?: string; colorCamiseta?: string; delegado?: string };
export type NuevoJugador = { equipoId: number; nombre: string; apellido: string; dni: string; numeroCamiseta: number };
export type DatosPartido = {
  torneoId: number; nroFecha: number; inicio: string; fin: string;
  canchaId: number; arbitroId: number; equipoLocalId: number; equipoVisitanteId: number;
};


async function leer<T>(ruta: string, error: string): Promise<T> {
  const res = await pedir(`${API_URL}${ruta}`);
  if (!res.ok) throw new Error(await mensajeError(res, error));
  return res.json();
}


async function enviar<T>(ruta: string, cuerpo: unknown, error: string): Promise<T> {
  const res = await pedir(`${API_URL}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  if (!res.ok) throw new Error(await mensajeError(res, error));
  return res.json();
}

export const getEquipos = (torneoId: number) => leer<Equipo[]>(`/torneos/${torneoId}/equipos`, 'No se pudieron cargar los equipos');
export const getJugadoresDeEquipo = (equipoId: number) => leer<JugadorCat[]>(`/equipos/${equipoId}/jugadores`, 'No se pudieron cargar los jugadores');
export const getCanchas = () => leer<Cancha[]>('/canchas', 'No se pudieron cargar las canchas');
export const getArbitros = () => leer<Arbitro[]>('/arbitros', 'No se pudieron cargar los árbitros');

export const crearEquipo = (n: NuevoEquipo) => enviar<Equipo>('/equipos', n, 'No se pudo crear el equipo');
export const crearJugador = (n: NuevoJugador) => enviar<JugadorCat>('/jugadores', n, 'No se pudo crear el jugador');
export const programarPartido = (d: DatosPartido) => enviar<{ id: number; local: string; visitante: string }>('/partidos', d, 'No se pudo programar el partido');