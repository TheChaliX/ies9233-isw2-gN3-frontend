import { useState } from 'react';

import { Boton } from '@/components/boton';
import { Campo } from '@/components/campo';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { crearEquipo } from '@/services/catalogo';

const TORNEO_ID = 1;

export default function EquipoNuevo() {
  const [nombre, setNombre] = useState('');
  const [barrio, setBarrio] = useState('');
  const [color, setColor] = useState('');
  const [delegado, setDelegado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; error: boolean } | null>(null);

  async function guardar() {
    if (!nombre.trim()) return setAviso({ texto: 'El nombre es obligatorio', error: true });
    setGuardando(true);
    setAviso(null);
    try {
      const e = await crearEquipo({
        torneoId: TORNEO_ID,
        nombre: nombre.trim(),
        barrio: barrio.trim() || undefined,
        colorCamiseta: color.trim() || undefined,
        delegado: delegado.trim() || undefined,
      });
      setAviso({ texto: `Equipo "${e.nombre}" creado`, error: false });
      setNombre(''); setBarrio(''); setColor(''); setDelegado('');
    } catch (err) {
      setAviso({ texto: (err as Error).message, error: true });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Pantalla volver>
      <ThemedText type="subtitle">Alta de equipo</ThemedText>
      <Campo etiqueta="Nombre *" value={nombre} onChangeText={setNombre} maxLength={50} />
      <Campo etiqueta="Barrio" value={barrio} onChangeText={setBarrio} maxLength={50} />
      <Campo etiqueta="Color de camiseta" value={color} onChangeText={setColor} maxLength={20} />
      <Campo etiqueta="Delegado" value={delegado} onChangeText={setDelegado} maxLength={50} />
      {aviso && <ThemedText style={{ color: aviso.error ? '#d93025' : '#1a8f3c' }}>{aviso.texto}</ThemedText>}
      <Boton texto="Guardar equipo" onPress={guardar} cargando={guardando} />
    </Pantalla>
  );
}
