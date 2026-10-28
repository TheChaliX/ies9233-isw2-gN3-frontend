import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getGoleadores, type Goleador } from '@/services/goleadores';

const TORNEO_ID = 1;

const MEDALLAS: Record<number, string> = { 1: '#F5B301', 2: '#B8C0CC', 3: '#CD7F32' };

const iniciales = (nombre: string, apellido: string) =>
  `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();

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
          <ThemedView style={styles.lista}>
            {filas.map((g) => (
              <ThemedView key={g.jugadorId} type="backgroundElement" style={styles.tarjeta}>
                <View
                  style={[
                    styles.posicion,
                    { backgroundColor: MEDALLAS[g.posicion] ?? 'rgba(128,128,128,0.25)' },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={MEDALLAS[g.posicion] ? { color: '#1A1A1A' } : undefined}>
                    {g.posicion}
                  </ThemedText>
                </View>

                <View style={styles.avatar}>
                  <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                    {iniciales(g.nombre, g.apellido)}
                  </ThemedText>
                </View>

                <View style={styles.info}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {g.nombre} {g.apellido}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {g.equipo}
                  </ThemedText>
                </View>

                <View style={styles.golesPill}>
                  <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                    ⚽ {g.goles}
                  </ThemedText>
                </View>
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
  lista: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  posicion: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2F6FED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  golesPill: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
});