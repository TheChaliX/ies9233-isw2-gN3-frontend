import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Boton } from '@/components/boton';
import { Campo } from '@/components/campo';
import { Chip } from '@/components/chip';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { crearJugador, type Equipo, getEquipos, getJugadoresDeEquipo } from '@/services/catalogo';

const TORNEO_ID = 1;

export default function JugadorNuevo() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [usadas, setUsadas] = useState<number[]>([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [camiseta, setCamiseta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; error: boolean } | null>(null);

  useEffect(() => {
    getEquipos(TORNEO_ID).then(setEquipos).catch((e: Error) => setAviso({ texto: e.message, error: true }));
  }, []);

  // Muestra las camisetas ya ocupadas del equipo elegido (el backend rechaza repetidas).
  async function cargarUsadas(id: number) {
    try {
      const js = await getJugadoresDeEquipo(id);
      setUsadas(js.map((j) => j.numeroCamiseta).sort((a, b) => a - b));
    } catch {
      setUsadas([]);
    }
  }

  async function guardar() {
    const n = Number(camiseta);
    if (equipoId == null) return setAviso({ texto: 'Elegí un equipo', error: true });
    if (!nombre.trim() || !apellido.trim() || !dni.trim()) return setAviso({ texto: 'Nombre, apellido y DNI son obligatorios', error: true });
    if (!Number.isInteger(n) || n < 1 || n > 99) return setAviso({ texto: 'La camiseta debe estar entre 1 y 99', error: true });
    setGuardando(true);
    setAviso(null);
    try {
      const j = await crearJugador({ equipoId, nombre: nombre.trim(), apellido: apellido.trim(), dni: dni.trim(), numeroCamiseta: n });
      setAviso({ texto: `Jugador ${j.nombre} ${j.apellido} creado`, error: false });
      setNombre(''); setApellido(''); setDni(''); setCamiseta('');
      cargarUsadas(equipoId);
    } catch (err) {
      setAviso({ texto: (err as Error).message, error: true });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Pantalla volver>
      <ThemedText type="subtitle">Alta de jugador</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Equipo *</ThemedText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {equipos.map((e) => (
          <Chip key={e.id} texto={e.nombre} activo={equipoId === e.id} onPress={() => { setEquipoId(e.id); cargarUsadas(e.id); }} />
        ))}
      </View>
      {equipoId != null && (
        <ThemedText type="small" themeColor="textSecondary">
          Camisetas ocupadas: {usadas.length ? usadas.join(', ') : 'ninguna'}
        </ThemedText>
      )}
      <Campo etiqueta="Nombre *" value={nombre} onChangeText={setNombre} maxLength={50} />
      <Campo etiqueta="Apellido *" value={apellido} onChangeText={setApellido} maxLength={50} />
      <Campo etiqueta="DNI *" value={dni} onChangeText={setDni} maxLength={10} keyboardType="number-pad" />
      <Campo etiqueta="Número de camiseta (1 a 99) *" value={camiseta} onChangeText={setCamiseta} maxLength={2} keyboardType="number-pad" />
      {aviso && <ThemedText style={{ color: aviso.error ? '#d93025' : '#1a8f3c' }}>{aviso.texto}</ThemedText>}
      <Boton texto="Guardar jugador" onPress={guardar} cargando={guardando} />
    </Pantalla>
  );
}
