import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Misma estructura que usan Tabla y Partidos (scroll + márgenes de la tab bar), más un
// "‹ Volver" opcional para las pantallas que se abren dentro del stack de Partidos.
export function Pantalla({ volver, children }: { volver?: boolean; children: ReactNode }) {
  const router = useRouter();
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

  function irAtras() {
    if (router.canGoBack()) router.back();
    else router.replace('/partidos'); // por si se entró directo por link (web)
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInset={insets}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        {volver && (
          <Pressable onPress={irAtras} hitSlop={Spacing.two} style={styles.volver}>
            <ThemedText type="linkPrimary">‹ Volver</ThemedText>
          </Pressable>
        )}
        {children}
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
  volver: {
    alignSelf: 'flex-start',
  },
});
