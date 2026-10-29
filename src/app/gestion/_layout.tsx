import { Stack, useSegments } from 'expo-router';

import { AccesoRestringido } from '@/components/solo-admin';
import { useAdmin } from '@/hooks/use-admin';

// Stack de la pestaña "Gestión". El menú (index) lo ve cualquiera;
// las pantallas de alta (equipo, jugador, partido) solo los administradores.
export default function GestionLayout() {
  const { esAdmin } = useAdmin();
  const segmentos = useSegments() as string[];
  const subpantalla = segmentos[1];

  if (!esAdmin && subpantalla && subpantalla !== 'index') return <AccesoRestringido />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
