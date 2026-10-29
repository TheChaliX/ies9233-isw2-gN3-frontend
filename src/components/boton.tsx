import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { estiloGradiente, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  deshabilitado?: boolean;
  cargando?: boolean;
};

const NAVY = '#070638';
const ROJO = '#FF4D6D';

export function Boton({ texto, onPress, variante = 'primario', deshabilitado, cargando }: Props) {
  const theme = useTheme();
  const inactivo = deshabilitado || cargando;
  const primario = variante === 'primario';
  const fondo = variante === 'peligro' ? ROJO : theme.backgroundSelected;
  const colorTexto = primario ? NAVY : variante === 'peligro' ? '#FFFFFF' : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        primario ? estiloGradiente() : { backgroundColor: fondo },
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
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: { opacity: 0.8 },
  deshabilitado: { opacity: 0.4 },
});
