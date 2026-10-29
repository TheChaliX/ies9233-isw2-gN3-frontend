import { Stack, useSegments } from 'expo-router';

import { AccesoRestringido } from '@/components/solo-admin';
import { useAdmin } from '@/hooks/use-admin';

// La pestaña "Partidos" tiene su propia navegación: la lista y, encima, el detalle.
// "Cargar eventos" es solo para administradores.
export default function PartidosLayout() {
  const { esAdmin } = useAdmin();
  const segmentos = useSegments() as string[];

  if (!esAdmin && segmentos.includes('cargar-evento')) return <AccesoRestringido />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
