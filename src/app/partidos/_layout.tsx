import { Stack } from 'expo-router';

// Stack dentro de la pestaña "Partidos": lista -> detalle -> cargar evento.
// Sin header nativo: cada pantalla ya maneja sus márgenes y trae su propio "‹ Volver".
export default function PartidosLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
