import { Stack } from 'expo-router';

// Stack dentro de la pestaña "Gestión": menú -> alta de equipo / alta de jugador / programar partido.
export default function GestionLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
