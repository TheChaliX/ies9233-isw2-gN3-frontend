import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getSuspendidos, type Suspendido } from '@/services/suspendidos';

const TORNEO_ID = 1;

const iniciales = (nombre: string, apellido: string) =>
  `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();

const esRoja = (motivo: string) => motivo.toLowerCase().includes('roja');

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
          <ThemedView style={styles.lista}>
            {filas.map((s) => (
              <ThemedView key={s.jugadorId} type="backgroundElement" style={styles.tarjeta}>
                <View style={styles.avatar}>
                  <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                    {iniciales(s.nombre, s.apellido)}
                  </ThemedText>
                </View>

                <View style={styles.info}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {s.nombre} {s.apellido}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {s.equipo}
                  </ThemedText>
                  <View
                    style={[
                      styles.motivo,
                      { backgroundColor: esRoja(s.motivo) ? '#DC2626' : '#F5B301' },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: esRoja(s.motivo) ? '#FFFFFF' : '#1A1A1A' }}>
                      {esRoja(s.motivo) ? '🟥' : '🟨'} {s.motivo}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.fechaPill}>
                  <ThemedText type="smallBold">Fecha {s.fechaSuspension}</ThemedText>
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
  motivo: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  fechaPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(128,128,128,0.25)',
  },
});