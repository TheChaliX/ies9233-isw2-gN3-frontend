import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getGoleadores, type Goleador } from '@/services/goleadores';

const TORNEO_ID = 1;

export default function GoleadoresScreen() {
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

  const [filas, setFilas] = useState<Goleador[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGoleadores(TORNEO_ID)
      .then(setFilas)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Goleadores</ThemedText>
        <ThemedText themeColor="textSecondary">Pipicucu League</ThemedText>

        {error && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
        {!error && !filas && <ActivityIndicator style={styles.mensaje} />}
        {filas && filas.length === 0 && (
          <ThemedText style={styles.mensaje}>Todavía no hay goles registrados.</ThemedText>
        )}

        {filas && filas.length > 0 && (
          <ThemedView style={styles.tabla}>
            <ThemedView type="backgroundElement" style={styles.fila}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.pos}>
                #
              </ThemedText>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.jugador}>
                Jugador
              </ThemedText>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.num}>
                Goles
              </ThemedText>
            </ThemedView>

            {filas.map((g) => (
              <ThemedView key={g.jugadorId} style={styles.fila}>
                <ThemedText type="small" style={styles.pos}>
                  {g.posicion}
                </ThemedText>
                <ThemedView style={styles.jugador}>
                  <ThemedText type="small" numberOfLines={1}>
                    {g.nombre} {g.apellido}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {g.equipo}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="smallBold" style={styles.num}>
                  {g.goles}
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
  pos: {
    width: 22,
  },
  jugador: {
    flex: 1,
  },
  num: {
    width: 50,
    textAlign: 'center',
  },
});