/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Paleta tipo "modern design": azul noche con acentos cian -> magenta.
// Claro y oscuro usan lo mismo para que la app se vea siempre igual.
// Color de fondo real de la app (lo pinta _layout.tsx, atrás del <Fondo />).
export const ColorFondo = '#070638';

const PALETA = {
  text: '#FFFFFF',
  background: 'transparent', // transparente para que se vea el fondo con líneas y logo
  backgroundElement: '#12125C',
  backgroundSelected: '#1E1E7A',
  textSecondary: '#A8B3F0',
} as const;

export const Colors = {
  light: PALETA,
  dark: PALETA,
} as const;

export const Acento = { cian: '#00E5FF', violeta: '#7C4DFF', magenta: '#E040FB' } as const;
export const GradienteMarca = 'linear-gradient(90deg, #00E5FF 0%, #7C4DFF 55%, #E040FB 100%)';

// En el celular RN usa experimental_backgroundImage; en la web, backgroundImage (CSS).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const estiloGradiente = (g: string = GradienteMarca): any => ({
  experimental_backgroundImage: g,
  backgroundImage: g,
});

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
