import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Chip } from '@/components/chip';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  cambiarEstadoPartido,
  crearEvento,
  eliminarEvento,
  getEventos,
  getJugadores,
  getPartido,
  type EstadoPartido,
  type EventoPartido,
  type Lado,
  type Partido,
  type Plantel,
  type TipoEvento,
} from '@/services/partidos';
import { ESTADOS, TIPOS_EVENTO, nombreJugador, textoEvento } from '@/utils/partidos';

const TIPOS = Object.keys(TIPOS_EVENTO) as TipoEvento[];
const MINUTO_MAX = 120; // CHECK (minuto BETWEEN 0 AND 120) de evento_partido

// Pantalla del delegado. Flujo para cargar rápido en la cancha:
// tipo -> equipo -> jugador -> minuto -> Guardar. Después de guardar se limpia solo el jugador.
// TODO: restringir el acceso al delegado de alguno de los dos equipos cuando haya login.
export default function CargarEventoScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const partidoId = Number(id);

  const [partido, setPartido] = useState<Partido | null>(null);
  const [eventos, setEventos] = useState<EventoPartido[] | null>(null);
  const [plantel, setPlantel] = useState<Plantel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TipoEvento>('GOL');
  const [lado, setLado] = useState<Lado>('LOCAL');
  const [jugadorId, setJugadorId] = useState<number | null>(null);
  const [minuto, setMinuto] = useState('1');

  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; esError: boolean } | null>(null);
  // Confirmación en dos toques (Alert.alert no funciona en web): 'FIN' o el id del evento a borrar.
  const [confirmando, setConfirmando] = useState<'FIN' | number | null>(null);

  useEffect(() => {
    Promise.all([getPartido(partidoId), getEventos(partidoId), getJugadores(partidoId)])
      .then(([p, ev, pl]) => {
        setPartido(p);
        setEventos(ev);
        setPlantel(pl);
        // Arranca en el minuto del último evento cargado.
        if (ev.length > 0) setMinuto(String(Math.max(...ev.map((e) => e.minuto))));
      })
      .catch((e: Error) => setError(e.message));
  }, [partidoId]);

  // Vuelve a pedir marcador y eventos después de guardar/borrar. Si falla, se deja lo que había:
  // la acción en sí ya se hizo.
  async function refrescar() {
    try {
      const [p, ev] = await Promise.all([getPartido(partidoId), getEventos(partidoId)]);
      setPartido(p);
      setEventos(ev);
    } catch {
      // se mantiene la última versión conocida
    }
  }

  const minutoNum = Number(minuto);
  const minutoValido =
    minuto !== '' && Number.isInteger(minutoNum) && minutoNum >= 0 && minutoNum <= MINUTO_MAX;
  const puedeGuardar = jugadorId !== null && minutoValido && !ocupado;

  function ajustarMinuto(delta: number) {
    const actual = minuto === '' ? 0 : minutoNum;
    setMinuto(String(Math.min(MINUTO_MAX, Math.max(0, actual + delta))));
  }

  function elegirLado(nuevo: Lado) {
    setLado(nuevo);
    setJugadorId(null); // el jugador elegido era del otro equipo
  }

  async function guardar() {
    if (jugadorId === null || !minutoValido) return;
    setOcupado(true);
    setAviso(null);
    try {
      const nuevo = await crearEvento(partidoId, { jugadorId, tipo, minuto: minutoNum });
      await refrescar();
      setJugadorId(null);
      setAviso({ texto: `Guardado: ${textoEvento(nuevo)} (${nuevo.minuto}')`, esError: false });
    } catch (e) {
      setAviso({ texto: (e as Error).message, esError: true });
    } finally {
      setOcupado(false);
    }
  }

  async function cambiarEstado(estado: EstadoPartido) {
    setOcupado(true);
    setAviso(null);
    try {
      setPartido(await cambiarEstadoPartido(partidoId, estado));
      setConfirmando(null);
    } catch (e) {
      setAviso({ texto: (e as Error).message, esError: true });
    } finally {
      setOcupado(false);
    }
  }

  async function borrar(evento: EventoPartido) {
    if (confirmando !== evento.id) {
      setConfirmando(evento.id);
      return;
    }
    setOcupado(true);
    setAviso(null);
    try {
      await eliminarEvento(partidoId, evento.id);
      await refrescar();
      setConfirmando(null);
    } catch (e) {
      setAviso({ texto: (e as Error).message, esError: true });
    } finally {
      setOcupado(false);
    }
  }

  const jugadores = plantel ? (lado === 'LOCAL' ? plantel.local : plantel.visitante) : [];
  const nombreEquipo = (l: Lado) => (l === 'LOCAL' ? partido?.local : partido?.visitante);
  const recientes = [...(eventos ?? [])].sort((a, b) => b.id - a.id);

  return (
    <Pantalla volver>
      <ThemedText type="subtitle">Cargar eventos</ThemedText>

      {error && !partido && <ThemedText style={styles.mensaje}>{error}</ThemedText>}
      {!error && (!partido || !plantel) && <ActivityIndicator style={styles.mensaje} />}

      {partido && plantel && (
        <>
          <ThemedView type="backgroundElement" style={styles.marcadorCard}>
            <View style={styles.marcador}>
              <ThemedText type="small" style={styles.equipoLocal} numberOfLines={1}>
                {partido.local}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.goles}>
                {`${partido.golesLocal} - ${partido.golesVisitante}`}
              </ThemedText>
              <ThemedText type="small" style={styles.equipoVisitante} numberOfLines={1}>
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

          {partido.estado === 'PROGRAMADO' && (
            <>
              <ThemedText themeColor="textSecondary" style={styles.centrado}>
                El partido todavía no empezó. Iniciálo para poder cargar eventos.
              </ThemedText>
              <Boton
                texto="Iniciar partido"
                cargando={ocupado}
                onPress={() => cambiarEstado('EN_JUEGO')}
              />
            </>
          )}

          {(partido.estado === 'FINALIZADO' || partido.estado === 'SUSPENDIDO') && (
            <ThemedText themeColor="textSecondary" style={styles.centrado}>
              Este partido está {ESTADOS[partido.estado].toLowerCase()}: ya no se pueden cargar
              eventos.
            </ThemedText>
          )}

          {partido.estado === 'EN_JUEGO' && (
            <>
              <ThemedText type="smallBold">Tipo de evento</ThemedText>
              <View style={styles.filaWrap}>
                {TIPOS.map((t) => (
                  <Chip
                    key={t}
                    texto={`${TIPOS_EVENTO[t].icono} ${TIPOS_EVENTO[t].etiqueta}`}
                    activo={tipo === t}
                    onPress={() => setTipo(t)}
                  />
                ))}
              </View>

              <ThemedText type="smallBold">
                {tipo === 'GOL_EN_CONTRA' ? 'Equipo del jugador que lo hizo' : 'Equipo'}
              </ThemedText>
              <View style={styles.filaWrap}>
                <Chip
                  texto={partido.local}
                  activo={lado === 'LOCAL'}
                  onPress={() => elegirLado('LOCAL')}
                />
                <Chip
                  texto={partido.visitante}
                  activo={lado === 'VISITANTE'}
                  onPress={() => elegirLado('VISITANTE')}
                />
              </View>

              <ThemedText type="smallBold">Jugador</ThemedText>
              <View style={styles.filaWrap}>
                {jugadores.map((j) => (
                  <Chip
                    key={j.id}
                    texto={`${j.numeroCamiseta} · ${nombreJugador(j)}`}
                    activo={jugadorId === j.id}
                    onPress={() => setJugadorId(j.id)}
                  />
                ))}
              </View>

              <ThemedText type="smallBold">Minuto</ThemedText>
              <View style={styles.filaMinuto}>
                <Boton texto="−1" variante="secundario" onPress={() => ajustarMinuto(-1)} />
                <TextInput
                  value={minuto}
                  onChangeText={(t) => setMinuto(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  selectTextOnFocus
                  style={[
                    styles.inputMinuto,
                    { color: theme.text, backgroundColor: theme.backgroundElement },
                  ]}
                />
                <Boton texto="+1" variante="secundario" onPress={() => ajustarMinuto(1)} />
                <Boton texto="+5" variante="secundario" onPress={() => ajustarMinuto(5)} />
              </View>
              {!minutoValido && (
                <ThemedText type="small" style={styles.error}>
                  El minuto debe estar entre 0 y {MINUTO_MAX}
                </ThemedText>
              )}

              <Boton
                texto={`Guardar ${TIPOS_EVENTO[tipo].etiqueta.toLowerCase()}`}
                deshabilitado={!puedeGuardar}
                cargando={ocupado}
                onPress={guardar}
              />
            </>
          )}

          {aviso && (
            <ThemedText
              type="small"
              style={[styles.centrado, aviso.esError ? styles.error : styles.ok]}>
              {aviso.texto}
            </ThemedText>
          )}

          {recientes.length > 0 && (
            <>
              <ThemedText type="smallBold">Eventos cargados</ThemedText>
              {recientes.map((e) => (
                <ThemedView key={e.id} type="backgroundElement" style={styles.filaEvento}>
                  <View style={styles.datosEvento}>
                    <ThemedText type="small" numberOfLines={1}>
                      {`${e.minuto}' · ${textoEvento(e)}`}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {nombreEquipo(e.lado)}
                    </ThemedText>
                  </View>
                  {partido.estado === 'EN_JUEGO' && (
                    <Boton
                      texto={confirmando === e.id ? '¿Seguro?' : 'Borrar'}
                      variante={confirmando === e.id ? 'peligro' : 'secundario'}
                      deshabilitado={ocupado}
                      onPress={() => borrar(e)}
                    />
                  )}
                </ThemedView>
              ))}
            </>
          )}

          {partido.estado === 'EN_JUEGO' &&
            (confirmando === 'FIN' ? (
              <>
                <ThemedText themeColor="textSecondary" style={styles.centrado}>
                  ¿Finalizar el partido? Después no se van a poder cargar más eventos.
                </ThemedText>
                <View style={styles.filaWrap}>
                  <Boton
                    texto="Sí, finalizar"
                    variante="peligro"
                    cargando={ocupado}
                    onPress={() => cambiarEstado('FINALIZADO')}
                  />
                  <Boton
                    texto="Cancelar"
                    variante="secundario"
                    deshabilitado={ocupado}
                    onPress={() => setConfirmando(null)}
                  />
                </View>
              </>
            ) : (
              <Boton
                texto="Finalizar partido"
                variante="secundario"
                deshabilitado={ocupado}
                onPress={() => setConfirmando('FIN')}
              />
            ))}
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
  error: {
    color: '#d93025',
  },
  ok: {
    color: '#188038',
  },
  marcadorCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
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
    width: 64,
    textAlign: 'center',
  },
  filaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  filaMinuto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inputMinuto: {
    width: 72,
    minHeight: 44,
    borderRadius: Spacing.three,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 600,
  },
  filaEvento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    paddingLeft: Spacing.three,
    borderRadius: Spacing.three,
  },
  datosEvento: {
    flex: 1,
  },
});
