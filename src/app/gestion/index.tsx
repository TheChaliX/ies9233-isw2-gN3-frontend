import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAdmin } from '@/hooks/use-admin';
import { useTheme } from '@/hooks/use-theme';
import { API_URL } from '@/services/api';
import { getTorneo, type Torneo } from '@/services/torneos';

const TORNEO_ID = 1;

// Pantallas que solo ve el administrador (archivos de src/app/gestion/).
const HERRAMIENTAS: { texto: string; detalle: string; href: Href }[] = [
  { texto: 'Alta de equipo', detalle: 'Agregar un equipo al torneo', href: '/gestion/equipo-nuevo' },
  { texto: 'Alta de jugador', detalle: 'Sumar un jugador a un equipo', href: '/gestion/jugador-nuevo' },
  { texto: 'Programar partido', detalle: 'Fecha, cancha y árbitro', href: '/gestion/partido-nuevo' },
];

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.fila}>
      <ThemedText type="small" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      <ThemedText type="small" style={styles.valor} numberOfLines={1}>
        {valor}
      </ThemedText>
    </View>
  );
}

export default function GestionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { esAdmin, entrar, salir } = useAdmin();

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [conexion, setConexion] = useState<'probando' | 'ok' | 'error'>('probando');
  const [clave, setClave] = useState('');
  const [errorClave, setErrorClave] = useState(false);

  // Sirve también como "probar conexión": si trae el torneo, el backend responde.
  function probarConexion() {
    setConexion('probando');
    getTorneo(TORNEO_ID)
      .then((t) => {
        setTorneo(t);
        setConexion('ok');
      })
      .catch(() => setConexion('error'));
  }

  useEffect(probarConexion, []);

  function ingresar() {
    const ok = entrar(clave);
    setErrorClave(!ok);
    setClave('');
  }

  return (
    <Pantalla>
      <ThemedText type="subtitle">Gestión</ThemedText>
      <ThemedText themeColor="textSecondary">Configuración de la Pipicucu League</ThemedText>

      {/* ---------- Para todos ---------- */}
      <ThemedText type="smallBold">General</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <Fila etiqueta="Torneo" valor={torneo ? torneo.nombre : '—'} />
        <Fila etiqueta="Temporada" valor={torneo ? torneo.temporada : '—'} />
        <Fila etiqueta="Servidor" valor={API_URL} />
        <Fila
          etiqueta="Estado"
          valor={conexion === 'ok' ? '● Conectado' : conexion === 'error' ? '● Sin conexión' : 'Probando…'}
        />
        <Boton texto="Probar conexión" variante="secundario" onPress={probarConexion} cargando={conexion === 'probando'} />
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.card}>
        <Fila etiqueta="App" valor="Pipicucu League 1.0" />
        <Fila etiqueta="Proyecto" valor="TP2 · IES N° 9233 · Grupo gN3" />
      </ThemedView>

      {/* ---------- Administrador ---------- */}
      <ThemedText type="smallBold">Administrador</ThemedText>
      {!esAdmin ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            Ingresá la contraseña para cargar equipos, jugadores, partidos y eventos.
          </ThemedText>
          <TextInput
            value={clave}
            onChangeText={(t) => {
              setClave(t);
              setErrorClave(false);
            }}
            onSubmitEditing={ingresar}
            placeholder="Contraseña"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          {errorClave && <ThemedText style={styles.error}>Contraseña incorrecta</ThemedText>}
          <Boton texto="Entrar como administrador" onPress={ingresar} deshabilitado={!clave} />
        </ThemedView>
      ) : (
        <>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold" style={styles.activo}>
              ✓ Modo administrador activo
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              En Partidos ahora podés cargar eventos y cambiar el estado de cada partido.
            </ThemedText>
          </ThemedView>

          {HERRAMIENTAS.map((h) => (
            <Pressable key={h.texto} onPress={() => router.push(h.href)} style={({ pressed }) => pressed && styles.presionado}>
              <ThemedView type="backgroundElement" style={styles.herramienta}>
                <View style={styles.textos}>
                  <ThemedText type="smallBold">{h.texto}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {h.detalle}
                  </ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">›</ThemedText>
              </ThemedView>
            </Pressable>
          ))}

          <Boton texto="Salir del modo administrador" variante="peligro" onPress={salir} />
        </>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  valor: {
    flexShrink: 1,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  error: {
    color: '#FF4D6D',
  },
  activo: {
    color: '#00E5FF',
  },
  herramienta: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  textos: {
    flex: 1,
    gap: Spacing.half,
  },
  presionado: {
    opacity: 0.7,
  },
});