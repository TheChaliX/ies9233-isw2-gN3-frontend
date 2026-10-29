import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Boton } from '@/components/boton';
import { Campo } from '@/components/campo';
import { Chip } from '@/components/chip';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { type Arbitro, type Cancha, type Equipo, getArbitros, getCanchas, getEquipos, programarPartido } from '@/services/catalogo';

const TORNEO_ID = 1;
const DURACION_HORAS = 2; // el backend pide "fin"; se calcula como inicio + 2 h

const pad = (n: number) => String(n).padStart(2, '0');
// LocalDateTime sin zona horaria: "2026-10-24T11:00:00"
const aIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

const fila = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

export default function PartidoNuevo() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [localId, setLocalId] = useState<number | null>(null);
  const [visitanteId, setVisitanteId] = useState<number | null>(null);
  const [canchaId, setCanchaId] = useState<number | null>(null);
  const [arbitroId, setArbitroId] = useState<number | null>(null);
  const [fecha, setFecha] = useState('');
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; error: boolean } | null>(null);

  useEffect(() => {
    Promise.all([getEquipos(TORNEO_ID), getCanchas(), getArbitros()])
      .then(([e, c, a]) => { setEquipos(e); setCanchas(c); setArbitros(a); })
      .catch((e: Error) => setAviso({ texto: e.message, error: true }));
  }, []);

  async function guardar() {
    const nro = Number(fecha);
    if (localId == null || visitanteId == null) return setAviso({ texto: 'Elegí local y visitante', error: true });
    if (localId === visitanteId) return setAviso({ texto: 'Un equipo no puede jugar contra sí mismo', error: true });
    if (canchaId == null || arbitroId == null) return setAviso({ texto: 'Elegí cancha y árbitro', error: true });
    if (!Number.isInteger(nro) || nro < 1 || nro > 38) return setAviso({ texto: 'La fecha debe estar entre 1 y 38', error: true });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || !/^\d{1,2}:\d{2}$/.test(hora)) return setAviso({ texto: 'Día: AAAA-MM-DD y hora: HH:MM', error: true });
    const [h, m] = hora.split(':').map(Number);
    const [y, mes, d] = dia.split('-').map(Number);
    const inicio = new Date(y, mes - 1, d, h, m);
    if (Number.isNaN(inicio.getTime())) return setAviso({ texto: 'Día u hora inválidos', error: true });
    const fin = new Date(inicio.getTime() + DURACION_HORAS * 3600 * 1000);

    setGuardando(true);
    setAviso(null);
    try {
      const p = await programarPartido({
        torneoId: TORNEO_ID, nroFecha: nro, inicio: aIso(inicio), fin: aIso(fin),
        canchaId, arbitroId, equipoLocalId: localId, equipoVisitanteId: visitanteId,
      });
      setAviso({ texto: `Programado: ${p.local} vs ${p.visitante}`, error: false });
      setLocalId(null); setVisitanteId(null);
    } catch (err) {
      setAviso({ texto: (err as Error).message, error: true });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Pantalla volver>
      <ThemedText type="subtitle">Programar partido</ThemedText>

      <ThemedText type="small" themeColor="textSecondary">Local *</ThemedText>
      <View style={fila}>
        {equipos.map((e) => <Chip key={e.id} texto={e.nombre} activo={localId === e.id} onPress={() => setLocalId(e.id)} />)}
      </View>

      <ThemedText type="small" themeColor="textSecondary">Visitante *</ThemedText>
      <View style={fila}>
        {equipos.map((e) => <Chip key={e.id} texto={e.nombre} activo={visitanteId === e.id} onPress={() => setVisitanteId(e.id)} />)}
      </View>

      <ThemedText type="small" themeColor="textSecondary">Cancha *</ThemedText>
      <View style={fila}>
        {canchas.map((c) => <Chip key={c.id} texto={c.nombre} activo={canchaId === c.id} onPress={() => setCanchaId(c.id)} />)}
      </View>

      <ThemedText type="small" themeColor="textSecondary">Árbitro *</ThemedText>
      <View style={fila}>
        {arbitros.map((a) => <Chip key={a.id} texto={`${a.nombre} ${a.apellido}`} activo={arbitroId === a.id} onPress={() => setArbitroId(a.id)} />)}
      </View>

      <Campo etiqueta="Nº de fecha (1 a 38) *" value={fecha} onChangeText={setFecha} maxLength={2} keyboardType="number-pad" />
      <Campo etiqueta="Día * (AAAA-MM-DD)" value={dia} onChangeText={setDia} maxLength={10} placeholder="2026-11-07" />
      <Campo etiqueta="Hora * (HH:MM)" value={hora} onChangeText={setHora} maxLength={5} placeholder="11:00" />

      {aviso && <ThemedText style={{ color: aviso.error ? '#d93025' : '#1a8f3c' }}>{aviso.texto}</ThemedText>}
      <Boton texto="Programar partido" onPress={guardar} cargando={guardando} />
    </Pantalla>
  );
}
