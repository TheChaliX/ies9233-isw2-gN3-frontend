import type { EstadoPartido, EventoPartido, Jugador, TipoEvento } from '@/services/partidos';

export const ESTADOS: Record<EstadoPartido, string> = {
  PROGRAMADO: 'Programado',
  EN_JUEGO: 'En vivo',
  FINALIZADO: 'Finalizado',
  SUSPENDIDO: 'Suspendido',
};

export const TIPOS_EVENTO: Record<TipoEvento, { etiqueta: string; icono: string }> = {
  GOL: { etiqueta: 'Gol', icono: '⚽' },
  GOL_EN_CONTRA: { etiqueta: 'Gol en contra', icono: '⚽' },
  AMARILLA: { etiqueta: 'Amarilla', icono: '🟨' },
  ROJA: { etiqueta: 'Roja', icono: '🟥' },
};

// "2026-10-16T16:00:00" -> "16/10 16:00"
export function formatearHorario(iso: string) {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)} ${iso.slice(11, 16)}`;
}

// "Lucas Gómez" -> "L. Gómez"
export function nombreJugador(j: Jugador) {
  return `${j.nombre.charAt(0)}. ${j.apellido}`;
}

// "⚽ L. Gómez" / "⚽ L. Gómez (en contra)" / "🟨 L. Gómez"
export function textoEvento(e: EventoPartido) {
  const base = `${TIPOS_EVENTO[e.tipo].icono} ${nombreJugador(e.jugador)}`;
  return e.tipo === 'GOL_EN_CONTRA' ? `${base} (en contra)` : base;
}
