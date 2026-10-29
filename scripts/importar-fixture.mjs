// Carga las 38 fechas de la Premier (football-data.org) en TU backend.
// Uso (PowerShell, parado en la carpeta del frontend, con el backend corriendo):
//   $env:FOOTBALL_DATA_TOKEN="tu_token"; node scripts/importar-fixture.mjs
// Opcionales: BACKEND_URL (http://localhost:8080), TORNEO_ID (1), SEASON (ej. 2026),
//             SOLO_PROGRAMAR=true  -> programa todos los partidos pero NO carga resultados/goles.
// Es seguro volver a correrlo: los cruces que ya existen (por ejemplo las fechas 6 a 8 del seed) se saltean.

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080';
const TORNEO_ID = Number(process.env.TORNEO_ID ?? 1);
const SEASON = process.env.SEASON ? `?season=${process.env.SEASON}` : '';
const SOLO_PROGRAMAR = process.env.SOLO_PROGRAMAR === 'true';
if (!TOKEN) { console.error('Falta FOOTBALL_DATA_TOKEN'); process.exit(1); }

const ALIAS = {
  'newcastle united': 'newcastle', 'tottenham hotspur': 'tottenham', 'brighton & hove albion': 'brighton',
  'man city': 'manchester city', 'man united': 'manchester united', nottingham: 'nottingham forest',
};
const norm = (s = '') => {
  const n = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(a?fc)\b/g, '').replace(/[^a-z0-9& ]/g, '').replace(/\s+/g, ' ').trim();
  return ALIAS[n] ?? n;
};

async function fd(ruta) {
  const r = await fetch(`https://api.football-data.org/v4${ruta}`, { headers: { 'X-Auth-Token': TOKEN } });
  if (!r.ok) { console.error(`football-data respondió ${r.status} en ${ruta} (403 = token/plan, 429 = demasiados pedidos)`); process.exit(1); }
  return r.json();
}
async function be(metodo, ruta, cuerpo) {
  const res = await fetch(`${BACKEND}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  return { ok: res.ok, status: res.status, data, msg: data?.mensaje ?? data?.message ?? '' };
}

// UTC -> hora de Argentina (UTC-3), como LocalDateTime sin zona: "2026-10-24T11:00:00"
const pad = (n) => String(n).padStart(2, '0');
const aLocal = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`;
const inicioArg = (utc) => new Date(new Date(utc).getTime() - 3 * 3600 * 1000);

const { teams } = await fd(`/competitions/PL/teams${SEASON}`);
const { matches } = await fd(`/competitions/PL/matches${SEASON}`);
const venuePorEquipo = new Map(teams.map((t) => [t.id, t.venue]));

const equipos = (await be('GET', `/torneos/${TORNEO_ID}/equipos`)).data ?? [];
const canchas = (await be('GET', '/canchas')).data ?? [];
const arbitros = (await be('GET', '/arbitros')).data ?? [];
const existentes = (await be('GET', `/torneos/${TORNEO_ID}/partidos`)).data ?? [];
if (!equipos.length || !arbitros.length) { console.error('El backend no tiene equipos o árbitros: ¿está corriendo con el seed?'); process.exit(1); }

const equipoPorNorm = new Map(equipos.map((e) => [norm(e.nombre), e]));
const canchaPorNorm = new Map(canchas.map((c) => [norm(c.nombre), c.id]));
const yaExiste = new Set(existentes.map((p) => `${norm(p.local)}|${norm(p.visitante)}`));
const buscarEquipo = (t) => equipoPorNorm.get(norm(t.name)) ?? equipoPorNorm.get(norm(t.shortName));

async function canchaDe(t, equipo) {
  const nombre = (venuePorEquipo.get(t.id) ?? `Estadio de ${equipo.nombre}`).slice(0, 50);
  if (canchaPorNorm.has(norm(nombre))) return canchaPorNorm.get(norm(nombre));
  const r = await be('POST', '/canchas', { nombre, direccion: `Estadio de ${equipo.nombre}`.slice(0, 100), superficie: 'Césped natural' });
  if (!r.ok) return null;
  canchaPorNorm.set(norm(nombre), r.data.id);
  return r.data.id;
}

async function cargarResultado(partidoId, golesL, golesV, n) {
  await be('PATCH', `/partidos/${partidoId}/estado`, { estado: 'EN_JUEGO' });
  const { data: plantel } = await be('GET', `/partidos/${partidoId}/jugadores`);
  const elegir = (lista) => { const reales = lista.filter((j) => j.numeroCamiseta > 11); return reales.length ? reales : lista; };
  for (const [lista, goles, desfase] of [[elegir(plantel.local), golesL, 0], [elegir(plantel.visitante), golesV, 11]]) {
    for (let k = 0; k < goles && lista.length; k++) {
      const jugadorId = lista[(n + k * 4) % lista.length].id;
      const minuto = 8 + ((n * 7 + k * 23 + desfase) % 80);
      await be('POST', `/partidos/${partidoId}/eventos`, { jugadorId, tipo: 'GOL', minuto });
    }
  }
  await be('PATCH', `/partidos/${partidoId}/estado`, { estado: 'FINALIZADO' });
}

const ordenados = [...matches].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
const porHorario = new Map(); // cuántos partidos llevan asignados a ese horario (para repartir árbitros)
const sinEquipo = new Set();
let creados = 0, saltados = 0, fallos = 0, conResultado = 0, n = 0;

for (const m of ordenados) {
  n++;
  const local = buscarEquipo(m.homeTeam), visitante = buscarEquipo(m.awayTeam);
  if (!local || !visitante) { sinEquipo.add(!local ? m.homeTeam.name : m.awayTeam.name); continue; }
  if (yaExiste.has(`${norm(local.nombre)}|${norm(visitante.nombre)}`)) { saltados++; continue; }
  const canchaId = await canchaDe(m.homeTeam, local);
  if (!canchaId) { fallos++; console.log(`Sin cancha para ${local.nombre}`); continue; }

  const inicio = inicioArg(m.utcDate);
  const fin = new Date(inicio.getTime() + 2 * 3600 * 1000);
  const clave = aLocal(inicio);
  const base = porHorario.get(clave) ?? 0;
  porHorario.set(clave, base + 1);

  let r = null;
  for (let i = 0; i < arbitros.length; i++) { // si el árbitro está ocupado, prueba con el siguiente
    r = await be('POST', '/partidos', {
      torneoId: TORNEO_ID, nroFecha: m.matchday, inicio: clave, fin: aLocal(fin), canchaId,
      arbitroId: arbitros[(base + i) % arbitros.length].id, equipoLocalId: local.id, equipoVisitanteId: visitante.id,
    });
    if (r.ok || !/árbitro/i.test(r.msg)) break;
  }
  if (!r.ok) { fallos++; console.log(`Fecha ${m.matchday} ${local.nombre} vs ${visitante.nombre}: ${r.msg || r.status}`); continue; }
  creados++;

  if (!SOLO_PROGRAMAR && m.status === 'FINISHED' && m.score?.fullTime?.home != null) {
    await cargarResultado(r.data.id, m.score.fullTime.home, m.score.fullTime.away, n);
    conResultado++;
  }
  if (creados % 50 === 0) console.log(`... ${creados} partidos`);
}

console.log(`\nProgramados: ${creados} (con resultado: ${conResultado}) | ya existían: ${saltados} | con error: ${fallos}`);
if (sinEquipo.size) console.log('Sin equipo equivalente en tu base (agregalos al ALIAS):', [...sinEquipo].join(', '));
