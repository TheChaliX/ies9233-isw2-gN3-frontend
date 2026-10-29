import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getJugadores, getPartido, type Jugador, type Partido, type Plantel } from '@/services/partidos';

// El backend puede mandar la posición (ARQ, DEF, MED, DEL). Si no viene, se arma por número de camiseta.
type Puesto = 'ARQ' | 'DEF' | 'MED' | 'DEL';
type JugadorConPuesto = Jugador & { posicion?: Puesto | null };

// Cuántos defensores, mediocampistas y delanteros (el arquero es siempre 1).
const FORMACIONES = {
  '4-3-3': [4, 3, 3],
  '4-4-2': [4, 4, 2],
  '3-5-2': [3, 5, 2],
} as const;
type NombreFormacion = keyof typeof FORMACIONES;

// Altura de cada línea en la cancha (% desde arriba): delanteros arriba, arquero abajo.
const ALTURA = { DEL: 14, MED: 40, DEF: 64, ARQ: 86 };

const COLOR = { local: '#00E5FF', visitante: '#E040FB' };

// Titulares = los primeros de cada puesto que pide la formación; el resto, suplentes.
function armarFormacion(jugadores: JugadorConPuesto[], formacion: NombreFormacion) {
  const [def, med, del] = FORMACIONES[formacion];
  const cupos: Record<Puesto, number> = { ARQ: 1, DEF: def, MED: med, DEL: del };
  const lineas: Record<Puesto, JugadorConPuesto[]> = { ARQ: [], DEF: [], MED: [], DEL: [] };
  const conPuesto = jugadores.some((j) => j.posicion);
  const orden: Puesto[] = ['ARQ', 'DEF', 'MED', 'DEL'];
  const resto: JugadorConPuesto[] = [];

  if (conPuesto) {
    for (const j of jugadores) {
      const p = j.posicion;
      if (p && lineas[p].length < cupos[p]) lineas[p].push(j);
      else resto.push(j);
    }
    // Si a algún puesto le faltan jugadores, se completa con los que sobran (sin repetir arqueros).
    for (const p of orden) {
      while (lineas[p].length < cupos[p]) {
        const i = resto.findIndex((j) => j.posicion !== 'ARQ');
        if (i < 0) break;
        lineas[p].push(resto.splice(i, 1)[0]);
      }
    }
  } else {
    // Sin posiciones: camiseta más baja al arco, después defensa, medio y delantera.
    const cola = [...jugadores];
    for (const p of orden) lineas[p] = cola.splice(0, cupos[p]);
    resto.push(...cola);
  }
  return { lineas, suplentes: resto };
}

function Ficha({ j, color }: { j: JugadorConPuesto; color: string }) {
  return (
    <View style={styles.ficha}>
      <View style={[styles.camiseta, { backgroundColor: color }]}>
        <ThemedText type="smallBold" style={styles.numero}>
          {j.numeroCamiseta}
        </ThemedText>
      </View>
      <ThemedText type="small" style={styles.nombreFicha} numberOfLines={1}>
        {j.apellido}
      </ThemedText>
    </View>
  );
}

function Cancha({ lineas, color }: { lineas: Record<Puesto, JugadorConPuesto[]>; color: string }) {
  return (
    <View style={styles.cancha}>
      {/* franjas del césped */}
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={[styles.franja, { top: `${i * 12.5}%` }, i % 2 === 0 && styles.franjaClara]} />
      ))}
      {/* líneas */}
      <View style={styles.lineaMedio} />
      <View style={styles.circulo} />
      <View style={[styles.area, styles.areaArriba]} />
      <View style={[styles.area, styles.areaAbajo]} />
      <View style={[styles.areaChica, styles.areaArriba]} />
      <View style={[styles.areaChica, styles.areaAbajo]} />

      {(['DEL', 'MED', 'DEF', 'ARQ'] as Puesto[]).map((p) => (
        <View key={p} style={[styles.linea, { top: `${ALTURA[p]}%` }]}>
          {lineas[p].map((j) => (
            <Ficha key={j.id} j={j} color={color} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function FormacionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [partido, setPartido] = useState<Partido | null>(null);
  const [plantel, setPlantel] = useState<Plantel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lado, setLado] = useState<'local' | 'visitante'>('local');
  const [formacion, setFormacion] = useState<NombreFormacion>('4-3-3');

  useEffect(() => {
    Promise.all([getPartido(Number(id)), getJugadores(Number(id))])
      .then(([p, j]) => {
        setPartido(p);
        setPlantel(j);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const jugadores = (plantel?.[lado] ?? []) as JugadorConPuesto[];
  const { lineas, suplentes } = armarFormacion(jugadores, formacion);
  const color = COLOR[lado];

  return (
    <Pantalla volver>
      <ThemedText type="subtitle">Formaciones</ThemedText>
      {partido && (
        <ThemedText themeColor="textSecondary">
          {partido.local} vs {partido.visitante} · Fecha {partido.fecha}
        </ThemedText>
      )}

      {error && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
      {!error && !plantel && <ActivityIndicator style={styles.mensaje} />}

      {partido && plantel && (
        <>
          <View style={styles.chips}>
            <Chip texto={partido.local} activo={lado === 'local'} onPress={() => setLado('local')} />
            <Chip texto={partido.visitante} activo={lado === 'visitante'} onPress={() => setLado('visitante')} />
          </View>
          <View style={styles.chips}>
            {(Object.keys(FORMACIONES) as NombreFormacion[]).map((f) => (
              <Chip key={f} texto={f} activo={f === formacion} onPress={() => setFormacion(f)} />
            ))}
          </View>

          {jugadores.length === 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.mensaje}>
              Este equipo no tiene jugadores cargados
            </ThemedText>
          ) : (
            <>
              <Cancha lineas={lineas} color={color} />

              <ThemedText type="smallBold">Suplentes ({suplentes.length})</ThemedText>
              <ThemedView type="backgroundElement" style={styles.suplentes}>
                {suplentes.length === 0 && <ThemedText themeColor="textSecondary">Sin suplentes</ThemedText>}
                {suplentes.map((j) => (
                  <View key={j.id} style={styles.suplente}>
                    <ThemedText type="smallBold" style={[styles.numSuplente, { color }]}>
                      {j.numeroCamiseta}
                    </ThemedText>
                    <ThemedText type="small" style={styles.nombreSuplente} numberOfLines={1}>
                      {j.nombre} {j.apellido}
                    </ThemedText>
                    {j.posicion && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {j.posicion}
                      </ThemedText>
                    )}
                  </View>
                ))}
              </ThemedView>
            </>
          )}
        </>
      )}
    </Pantalla>
  );
}

const BLANCO = 'rgba(255,255,255,0.55)';

const styles = StyleSheet.create({
  mensaje: { marginTop: Spacing.four, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cancha: {
    width: '100%',
    maxWidth: 440,
    aspectRatio: 0.68,
    alignSelf: 'center',
    backgroundColor: '#1F7A3A',
    borderRadius: Spacing.three,
    borderWidth: 2,
    borderColor: BLANCO,
    overflow: 'hidden',
  },
  franja: { position: 'absolute', left: 0, right: 0, height: '12.5%' },
  franjaClara: { backgroundColor: 'rgba(255,255,255,0.05)' },
  lineaMedio: { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, backgroundColor: BLANCO },
  circulo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 90,
    height: 90,
    marginLeft: -45,
    marginTop: -45,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: BLANCO,
  },
  area: { position: 'absolute', left: '20%', right: '20%', height: '16%', borderWidth: 2, borderColor: BLANCO },
  areaChica: { position: 'absolute', left: '36%', right: '36%', height: '6%', borderWidth: 2, borderColor: BLANCO },
  areaArriba: { top: -2 },
  areaAbajo: { bottom: -2 },
  linea: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: -26,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  ficha: { width: 74, alignItems: 'center', gap: 2 },
  camiseta: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  numero: { color: '#070638' },
  nombreFicha: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 3,
    maxWidth: 74,
  },
  suplentes: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  suplente: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  numSuplente: { width: 28 },
  nombreSuplente: { flex: 1 },
});
