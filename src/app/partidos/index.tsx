import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPartidos, type Partido } from '@/services/partidos';
import { ESTADOS, formatearHorario } from '@/utils/partidos';

const TORNEO_ID = 1;

// Arranca en la primera fecha que todavía tiene algo pendiente (o la última si ya terminó todo).
function fechaInicial(partidos: Partido[]) {
  if (partidos.length === 0) return null;
  const pendientes = partidos.filter((p) => p.estado !== 'FINALIZADO').map((p) => p.fecha);
  return pendientes.length > 0
    ? Math.min(...pendientes)
    : Math.max(...partidos.map((p) => p.fecha));
}

function PartidoCard({ p }: { p: Partido }) {
  const router = useRouter();
  const hayMarcador = p.estado === 'EN_JUEGO' || p.estado === 'FINALIZADO';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/partidos/[id]', params: { id: String(p.id) } })}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.marcador}>
          <ThemedText type="small" style={styles.local} numberOfLines={1}>
            {p.local}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.centro}>
            {hayMarcador ? `${p.golesLocal} - ${p.golesVisitante}` : 'vs'}
          </ThemedText>
          <ThemedText type="small" style={styles.visitante} numberOfLines={1}>
            {p.visitante}
          </ThemedText>
        </View>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={[styles.detalle, p.estado === 'EN_JUEGO' && styles.enVivo]}>
          {ESTADOS[p.estado]} · {formatearHorario(p.horario)} · {p.cancha}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function PartidosScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  const [partidos, setPartidos] = useState<Partido[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [soloEnVivo, setSoloEnVivo] = useState(false);
  const [fecha, setFecha] = useState<number | null>(null);

  // Se recarga cada vez que la pantalla vuelve a estar en foco (ej.: al volver del detalle),
  // y la fecha elegida se conserva: solo se calcula la inicial la primera vez.
  const cargar = useCallback(() => {
    getPartidos(TORNEO_ID)
      .then((data) => {
        setPartidos(data);
        setFecha((actual) => actual ?? fechaInicial(data));
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useFocusEffect(cargar);

  const fechas = Array.from(new Set((partidos ?? []).map((p) => p.fecha))).sort((a, b) => a - b);
  const visibles = (partidos ?? []).filter((p) =>
    soloEnVivo ? p.estado === 'EN_JUEGO' : p.fecha === fecha,
  );

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Partidos</ThemedText>

        <View style={styles.fila}>
          <Chip texto="Todos" activo={!soloEnVivo} onPress={() => setSoloEnVivo(false)} />
          <Chip texto="En vivo" activo={soloEnVivo} onPress={() => setSoloEnVivo(true)} />
        </View>

        {!soloEnVivo && fechas.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.fila}>
              {fechas.map((f) => (
                <Chip key={f} texto={`Fecha ${f}`} activo={f === fecha} onPress={() => setFecha(f)} />
              ))}
            </View>
          </ScrollView>
        )}

        {error && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
        {!error && !partidos && <ActivityIndicator style={styles.mensaje} />}
        {partidos && visibles.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.mensaje}>
            {soloEnVivo ? 'No hay partidos en vivo' : 'No hay partidos'}
          </ThemedText>
        )}

        {visibles.map((p) => (
          <PartidoCard key={p.id} p={p} />
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  fila: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  mensaje: {
    marginTop: Spacing.four,
    textAlign: 'center',
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  marcador: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  local: {
    flex: 1,
    textAlign: 'right',
  },
  visitante: {
    flex: 1,
  },
  centro: {
    width: 64,
    textAlign: 'center',
  },
  detalle: {
    textAlign: 'center',
  },
  enVivo: {
    color: '#d93025',
  },
});
