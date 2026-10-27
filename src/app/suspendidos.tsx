import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getSuspendidos, type Suspendido } from '@/services/suspendidos';

const TORNEO_ID = 1;

export default function SuspendidosScreen() {
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

  const [filas, setFilas] = useState<Suspendido[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSuspendidos(TORNEO_ID)
      .then(setFilas)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Jugadores suspendidos</ThemedText>
        <ThemedText themeColor="textSecondary">Pipicucu League</ThemedText>

        {error && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
        {!error && !filas && <ActivityIndicator style={styles.mensaje} />}
        {filas && filas.length === 0 && (
          <ThemedText style={styles.mensaje}>No hay jugadores suspendidos.</ThemedText>
        )}

        {filas && filas.length > 0 && (
          <ThemedView style={styles.tabla}>
            <ThemedView type="backgroundElement" style={styles.fila}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.jugador}>
                Jugador
              </ThemedText>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.num}>
                Suspensión
              </ThemedText>
            </ThemedView>

            {filas.map((s) => (
              <ThemedView key={s.jugadorId} style={styles.fila}>
                <ThemedView style={styles.jugador}>
                  <ThemedText type="small" numberOfLines={1}>
                    {s.nombre} {s.apellido}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {s.equipo} · {s.motivo}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="smallBold" style={styles.num}>
                  Fecha {s.fechaSuspension}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}
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
    gap: Spacing.two,
  },
  mensaje: {
    marginTop: Spacing.four,
    textAlign: 'center',
  },
  tabla: {
    marginTop: Spacing.three,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  jugador: {
    flex: 1,
  },
  num: {
    width: 90,
    textAlign: 'center',
  },
});