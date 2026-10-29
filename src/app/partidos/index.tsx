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

const COLOR_ESTADO: Record<string, string> = {
  EN_JUEGO: '#DC2626',
  FINALIZADO: '#16A34A',
};
const COLOR_ESTADO_DEFECTO = '#6B7280';

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
  const enVivo = p.estado === 'EN_JUEGO';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/partidos/[id]', params: { id: String(p.id) } })}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.cabecera}>
          <View
            style={[
              styles.badge,
              { backgroundColor: COLOR_ESTADO[p.estado] ?? COLOR_ESTADO_DEFECTO },
            ]}>
            <ThemedText type="smallBold" style={styles.badgeTexto}>
              {enVivo ? '● ' : ''}
              {ESTADOS[p.estado]}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.horario}>
            {formatearHorario(p.horario)}
          </ThemedText>
        </View>

        <View style={styles.marcador}>
          <ThemedText type="smallBold" style={styles.local} numberOfLines={1}>
            {p.local}
          </ThemedText>
          <View style={styles.resultado}>
            <ThemedText type="smallBold" style={hayMarcador ? styles.goles : styles.vs}>
              {hayMarcador ? `${p.golesLocal} - ${p.golesVisitante}` : 'vs'}
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.visitante} numberOfLines={1}>
            {p.visitante}
          </ThemedText>
        </View>

        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.cancha}>
          🏟️ {p.cancha}
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
    gap: Spacing.two,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeTexto: {
    color: '#FFFFFF',
  },
  horario: {
    flexShrink: 1,
  },
  marcador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  local: {
    flex: 1,
    textAlign: 'right',
  },
  visitante: {
    flex: 1,
  },
  resultado: {
    minWidth: 72,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  goles: {
    fontSize: 20,
    lineHeight: 26,
  },
  vs: {
    opacity: 0.7,
  },
  cancha: {
    textAlign: 'center',
  },
});