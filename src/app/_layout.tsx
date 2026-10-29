import { DarkTheme, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Fondo } from '@/components/fondo';
import { ColorFondo } from '@/constants/theme';
import { AdminProvider } from '@/hooks/use-admin';

SplashScreen.preventAutoHideAsync();

// background transparente: las pantallas dejan ver el <Fondo /> que está atrás.
const TEMA = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent', card: '#070638', border: '#1E1E7A', primary: '#00E5FF' },
};

export default function TabLayout() {
  return (
    <AdminProvider>
      <ThemeProvider value={TEMA}>
        {/* Título de la pestaña del navegador (solo web) */}
        <Head>
          <title>Pipicucu League</title>
        </Head>
        <View style={{ flex: 1, backgroundColor: ColorFondo }}>
          <Fondo />
          <AnimatedSplashOverlay />
          <AppTabs />
        </View>
      </ThemeProvider>
    </AdminProvider>
  );
}
