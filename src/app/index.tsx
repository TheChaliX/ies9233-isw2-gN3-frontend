import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPosiciones, type Posicion } from '@/services/posiciones';

const TORNEO_ID = 1;

const MEDALLAS: Record<number, string> = { 1: '#F5B301', 2: '#B8C0CC', 3: '#CD7F32' };

const COLUMNAS = [
  { titulo: 'PJ', campo: 'pj' },
  { titulo: 'PG', campo: 'pg' },
  { titulo: 'PE', campo: 'pe' },
  { titulo: 'PP', campo: 'pp' },
  { titulo: 'DG', campo: 'dg' },
] as const;

const colorDG = (dg: number) => (dg > 0 ? '#16A34A' : dg < 0 ? '#DC2626' : undefined);

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
        <ThemedText themeColor="textSecondary">Pipicucu League</ThemedText>

        {error && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
        {!error && !filas && <ActivityIndicator style={styles.mensaje} />}

        {filas && (
          <ThemedView style={styles.lista}>
            <View style={styles.cabecera}>
              <View style={styles.pos} />
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
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                style={styles.ptsCabecera}>
                Pts
              </ThemedText>
            </View>

            {filas.map((p) => (
              <ThemedView key={p.equipo} type="backgroundElement" style={styles.tarjeta}>
                <View
                  style={[
                    styles.pos,
                    { backgroundColor: MEDALLAS[p.posicion] ?? 'rgba(128,128,128,0.25)' },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={MEDALLAS[p.posicion] ? { color: '#1A1A1A' } : undefined}>
                    {p.posicion}
                  </ThemedText>
                </View>

                <ThemedText type="smallBold" style={styles.equipo} numberOfLines={1}>
                  {p.equipo}
                </ThemedText>

                {COLUMNAS.map((c) => (
                  <ThemedText
                    key={c.campo}
                    type={c.campo === 'dg' ? 'smallBold' : 'small'}
                    style={[
                      styles.num,
                      c.campo === 'dg' && colorDG(p.dg) ? { color: colorDG(p.dg) } : null,
                    ]}>
                    {c.campo === 'dg' && p.dg > 0 ? `+${p.dg}` : p[c.campo]}
                  </ThemedText>
                ))}

                <View style={styles.ptsPill}>
                  <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                    {p.pts}
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
    gap: 6,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingBottom: 2,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
  },
  pos: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipo: {
    flex: 1,
    marginLeft: 4,
  },
  num: {
    width: 26,
    textAlign: 'center',
  },
  ptsCabecera: {
    width: 38,
    textAlign: 'center',
  },
  ptsPill: {
    width: 38,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#2F6FED',
    alignItems: 'center',
  },
});