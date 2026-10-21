// Dirección del backend. Android emulator: http://10.0.2.2:8080 — celular real: la IP de tu PC en la red.
// Se puede cambiar sin tocar código con la variable EXPO_PUBLIC_API_URL.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://172.20.10.9:8080';

// El backend responde los errores como { estado, mensaje }. Devuelve ese mensaje para mostrarlo en pantalla
// ("El partido no está en juego", "El jugador no pertenece a este partido"...) o el texto por defecto.
export async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  try {
    const cuerpo = await res.json();
    if (cuerpo && typeof cuerpo.mensaje === 'string' && cuerpo.mensaje) return cuerpo.mensaje;
  } catch {
    // la respuesta no era JSON
  }
  return porDefecto;
}

// fetch que convierte "no se pudo conectar" en un mensaje entendible.
export async function pedir(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
  }
}
