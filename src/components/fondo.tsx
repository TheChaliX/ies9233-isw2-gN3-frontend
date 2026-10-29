import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

// Fondo fijo de toda la app: líneas estilo Premier a la derecha y el logo de la liga a la izquierda.
// pointerEvents="none" para que no tape los toques de la pantalla.
export function Fondo() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require('@/assets/images/lineas-premier.png')}
        style={styles.lineas}
        contentFit="cover"
        contentPosition="top right"
      />
      <View style={styles.ladoIzquierdo}>
        <Image source={require('@/assets/images/logo-liga.png')} style={styles.logo} contentFit="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lineas: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '55%',
    opacity: 0.55, // más alto = líneas más fuertes
  },
  ladoIzquierdo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '2%',
    width: '40%',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    maxWidth: 460,
    aspectRatio: 1,
    opacity: 0.18, // más alto = logo más visible
  },
});
