import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  deshabilitado?: boolean;
  cargando?: boolean;
};

const AZUL = '#3c87f7';
const ROJO = '#d93025';

export function Boton({ texto, onPress, variante = 'primario', deshabilitado, cargando }: Props) {
  const theme = useTheme();
  const inactivo = deshabilitado || cargando;
  const fondo =
    variante === 'primario' ? AZUL : variante === 'peligro' ? ROJO : theme.backgroundSelected;
  const colorTexto = variante === 'secundario' ? theme.text : '#ffffff';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: fondo },
        pressed && styles.presionado,
        deshabilitado && styles.deshabilitado,
      ]}>
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <ThemedText type="smallBold" style={{ color: colorTexto }}>
          {texto}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: 0.7,
  },
  deshabilitado: {
    opacity: 0.4,
  },
});
