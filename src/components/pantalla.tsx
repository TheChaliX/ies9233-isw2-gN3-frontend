import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, estiloGradiente, MaxContentWidth, Spacing } from '@/constants/theme';
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
      <View
        pointerEvents="none"
        style={[styles.brillo, estiloGradiente('linear-gradient(180deg, rgba(0,229,255,0.22) 0%, rgba(124,77,255,0.12) 45%, transparent 100%)')]}
      />
      <View style={styles.container}>
        {volver && (
          <Pressable onPress={irAtras} hitSlop={Spacing.two} style={styles.volver}>
            <ThemedText type="linkPrimary">‹ Volver</ThemedText>
          </Pressable>
        )}
        {children}
      </View>
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
  brillo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  volver: {
    alignSelf: 'flex-start',
  },
});
