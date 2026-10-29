import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { useAdmin } from '@/hooks/use-admin';

// Muestra lo de adentro solo si se entró como administrador.
// Uso: <SoloAdmin><Boton texto="Cargar eventos" ... /></SoloAdmin>
export function SoloAdmin({ children }: { children: ReactNode }) {
  const { esAdmin } = useAdmin();
  return esAdmin ? <>{children}</> : null;
}

// Pantalla que ve alguien que entra por link a una pantalla de administrador.
export function AccesoRestringido() {
  const router = useRouter();
  return (
    <Pantalla>
      <ThemedText type="subtitle">Solo administradores</ThemedText>
      <ThemedText themeColor="textSecondary">
        Para usar esta pantalla entrá como administrador desde Gestión.
      </ThemedText>
      <Boton texto="Ir a Gestión" onPress={() => router.replace('/gestion')} />
    </Pantalla>
  );
}
