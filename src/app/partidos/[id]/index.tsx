import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { SoloAdmin } from '@/components/solo-admin';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getEventos, getPartido, type EventoPartido, type Partido } from '@/services/partidos';
import { ESTADOS, formatearHorario, textoEvento } from '@/utils/partidos';

// Mientras el partido está EN_JUEGO se vuelve a pedir cada tanto, así se ve el "en vivo".
const REFRESCO_MS = 15000;

const COLOR_ESTADO: Record<string, string> = {
  EN_JUEGO: '#DC2626',
  FINALIZADO: '#16A34A',
};
const COLOR_ESTADO_DEFECTO = '#6B7280';

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
      <View style={styles.minutoPill}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {`${e.minuto}'`}
        </ThemedText>
      </View>
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
            <View
              style={[
                styles.badge,
                { backgroundColor: COLOR_ESTADO[partido.estado] ?? COLOR_ESTADO_DEFECTO },
              ]}>
              <ThemedText type="smallBold" style={styles.badgeTexto}>
                {partido.estado === 'EN_JUEGO' ? '● En vivo' : ESTADOS[partido.estado]}
              </ThemedText>
            </View>

            <View style={styles.marcador}>
              <ThemedText type="smallBold" style={styles.equipoLocal} numberOfLines={2}>
                {partido.local}
              </ThemedText>
              <View style={styles.golesPill}>
                <ThemedText type="subtitle" style={styles.goles}>
                  {hayMarcador ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'vs'}
                </ThemedText>
              </View>
              <ThemedText type="smallBold" style={styles.equipoVisitante} numberOfLines={2}>
                {partido.visitante}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Lo ve cualquiera */}
          <Boton
            texto="Ver formaciones"
            variante="secundario"
            onPress={() =>
              router.push({
                pathname: '/partidos/[id]/formacion',
                params: { id: String(partido.id) },
              })
            }
          />

          {/* Solo administradores (Gestión → Entrar como administrador) */}
          <SoloAdmin>
            {admiteEventos && (
              <Boton
                texto="Cargar eventos"
                onPress={() =>
                  router.push({
                    pathname: '/partidos/[id]/cargar-evento',
                    params: { id: String(partido.id) },
                  })
                }
              />
            )}
          </SoloAdmin>

          <ThemedText type="smallBold">Eventos</ThemedText>
          {eventos && eventos.length === 0 && (
            <ThemedText themeColor="textSecondary">Todavía no hay eventos</ThemedText>
          )}
          {eventos && eventos.length > 0 && (
            <ThemedView type="backgroundElement" style={styles.eventosCard}>
              {eventos.map((e) => (
                <FilaEvento key={e.id} e={e} />
              ))}
            </ThemedView>
          )}
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
  marcadorCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeTexto: {
    color: '#FFFFFF',
  },
  marcador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  equipoLocal: {
    flex: 1,
    textAlign: 'right',
  },
  equipoVisitante: {
    flex: 1,
  },
  golesPill: {
    minWidth: 104,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  goles: {
    textAlign: 'center',
  },
  eventosCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  filaEvento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ladoLocal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ladoVisitante: {
    flex: 1,
    alignItems: 'flex-start',
  },
  minutoPill: {
    minWidth: 44,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.25)',
  },
});