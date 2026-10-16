import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPosiciones, type Posicion } from '@/services/posiciones';

const TORNEO_ID = 1;

const COLUMNAS = [
  { titulo: 'PJ', campo: 'pj' },
  { titulo: 'PG', campo: 'pg' },
  { titulo: 'PE', campo: 'pe' },
  { titulo: 'PP', campo: 'pp' },
  { titulo: 'DG', campo: 'dg' },
  { titulo: 'Pts', campo: 'pts' },
] as const;

export default function TablaScreen() {
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

  const [filas, setFilas] = useState<Posicion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPosiciones(TORNEO_ID)
      .then(setFilas)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Tabla de posiciones</ThemedText>
        <ThemedText themeColor="textSecondary">Liga Amateur Santafesina</ThemedText>

        {error && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
        {!error && !filas && <ActivityIndicator style={styles.mensaje} />}

        {filas && (
          <ThemedView style={styles.tabla}>
            <ThemedView type="backgroundElement" style={styles.fila}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.pos}>
                #
              </ThemedText>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.equipo}>
                Equipo
              </ThemedText>
              {COLUMNAS.map((c) => (
                <ThemedText
                  key={c.campo}
                  type="smallBold"
                  themeColor="textSecondary"
                  style={styles.num}>
                  {c.titulo}
                </ThemedText>
              ))}
            </ThemedView>

            {filas.map((p) => (
              <ThemedView key={p.equipo} style={styles.fila}>
                <ThemedText type="small" style={styles.pos}>
                  {p.posicion}
                </ThemedText>
                <ThemedText type="small" style={styles.equipo} numberOfLines={1}>
                  {p.equipo}
                </ThemedText>
                {COLUMNAS.map((c) => (
                  <ThemedText
                    key={c.campo}
                    type={c.campo === 'pts' ? 'smallBold' : 'small'}
                    style={styles.num}>
                    {c.campo === 'dg' && p.dg > 0 ? `+${p.dg}` : p[c.campo]}
                  </ThemedText>
                ))}
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
    width: 24,
  },
  equipo: {
    flex: 1,
  },
  num: {
    width: 34,
    textAlign: 'center',
  },
});
