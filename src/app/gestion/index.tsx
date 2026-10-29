import { useRouter } from 'expo-router';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';

export default function Gestion() {
  const router = useRouter();
  return (
    <Pantalla>
      <ThemedText type="subtitle">Gestión</ThemedText>
      <ThemedText themeColor="textSecondary">Altas y programación de la liga.</ThemedText>
      <Boton texto="Alta de equipo" onPress={() => router.push('/gestion/equipo-nuevo')} />
      <Boton texto="Alta de jugador" onPress={() => router.push('/gestion/jugador-nuevo')} />
      <Boton texto="Programar partido" onPress={() => router.push('/gestion/partido-nuevo')} />
    </Pantalla>
  );
}
