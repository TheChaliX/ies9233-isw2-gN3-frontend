import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getEventos, getPartido, type EventoPartido, type Partido } from '@/services/partidos';
import { ESTADOS, formatearHorario, textoEvento } from '@/utils/partidos';

// Mientras el partido está EN_JUEGO se vuelve a pedir cada tanto, así se ve el "en vivo".
const REFRESCO_MS = 15000;

// Los eventos del equipo local van a la izquierda y los del visitante a la derecha.
function FilaEvento({ e }: { e: EventoPartido }) {
  const texto = (
    <ThemedText type="small" numberOfLines={1}>
      {textoEvento(e)}
    </ThemedText>
  );
  return (
    <View style={styles.filaEvento}>
      <View style={styles.ladoLocal}>{e.lado === 'LOCAL' && texto}</View>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.minuto}>
        {`${e.minuto}'`}
      </ThemedText>
      <View style={styles.ladoVisitante}>{e.lado === 'VISITANTE' && texto}</View>
    </View>
  );
}

export default function PartidoDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const partidoId = Number(id);

  const [partido, setPartido] = useState<Partido | null>(null);
  const [eventos, setEventos] = useState<EventoPartido[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const enJuego = useRef(false);

  const cargar = useCallback(() => {
    Promise.all([getPartido(partidoId), getEventos(partidoId)])
      .then(([p, ev]) => {
        enJuego.current = p.estado === 'EN_JUEGO';
        setPartido(p);
        setEventos(ev);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [partidoId]);

  // Carga al entrar y al volver de "Cargar eventos"; refresca solo si el partido está en vivo.
  useFocusEffect(
    useCallback(() => {
      cargar();
      const t = setInterval(() => {
        if (enJuego.current) cargar();
      }, REFRESCO_MS);
      return () => clearInterval(t);
    }, [cargar]),
  );

  const hayMarcador = partido?.estado === 'EN_JUEGO' || partido?.estado === 'FINALIZADO';
  const admiteEventos = partido?.estado === 'PROGRAMADO' || partido?.estado === 'EN_JUEGO';

  return (
    <Pantalla volver>
      {error && !partido && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
      {!error && !partido && <ActivityIndicator style={styles.mensaje} />}

      {partido && (
        <>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
            Fecha {partido.fecha} · {formatearHorario(partido.horario)} · {partido.cancha}
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.marcadorCard}>
            <View style={styles.marcador}>
              <ThemedText type="smallBold" style={styles.equipoLocal} numberOfLines={2}>
                {partido.local}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.goles}>
                {hayMarcador ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'vs'}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.equipoVisitante} numberOfLines={2}>
                {partido.visitante}
              </ThemedText>
            </View>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={[styles.centrado, partido.estado === 'EN_JUEGO' && styles.enVivo]}>
              {partido.estado === 'EN_JUEGO' ? '● En vivo' : ESTADOS[partido.estado]}
            </ThemedText>
          </ThemedView>

          {/* TODO: mostrar solo si el usuario es el delegado de alguno de los dos equipos (todavía no hay login). */}
          {admiteEventos && (
            <Boton
              texto="Cargar eventos (delegado)"
              onPress={() =>
                router.push({
                  pathname: '/partidos/[id]/cargar-evento',
                  params: { id: String(partido.id) },
                })
              }
            />
          )}

          <ThemedText type="smallBold">Eventos</ThemedText>
          {eventos && eventos.length === 0 && (
            <ThemedText themeColor="textSecondary">Todavía no hay eventos</ThemedText>
          )}
          {eventos?.map((e) => <FilaEvento key={e.id} e={e} />)}
        </>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  mensaje: {
    marginTop: Spacing.four,
    textAlign: 'center',
  },
  centrado: {
    textAlign: 'center',
  },
  enVivo: {
    color: '#d93025',
  },
  marcadorCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  marcador: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipoLocal: {
    flex: 1,
    textAlign: 'right',
  },
  equipoVisitante: {
    flex: 1,
  },
  goles: {
    minWidth: 96,
    textAlign: 'center',
  },
  filaEvento: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ladoLocal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ladoVisitante: {
    flex: 1,
    alignItems: 'flex-start',
  },
  minuto: {
    width: 48,
    textAlign: 'center',
  },
});
