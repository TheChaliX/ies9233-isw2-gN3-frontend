// Importa jugadores reales de la Premier (football-data.org) a TU backend, una sola vez.
// Uso (PowerShell, parado en la carpeta del frontend, con el backend corriendo):
//   $env:FOOTBALL_DATA_TOKEN="tu_token"; node scripts/importar-premier.mjs
// Opcionales: BACKEND_URL (default http://localhost:8080), TORNEO_ID (default 1), SEASON (ej. 2026)

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080';
const TORNEO_ID = Number(process.env.TORNEO_ID ?? 1);
const SEASON = process.env.SEASON;
if (!TOKEN) { console.error('Falta FOOTBALL_DATA_TOKEN'); process.exit(1); }

// Nombres de football-data -> nombres usados en la base (los que no coincidan se listan al final).
const ALIAS = {
  'newcastle united': 'newcastle',
  'tottenham hotspur': 'tottenham',
  'brighton & hove albion': 'brighton',
  'man city': 'manchester city',
  'man united': 'manchester united',
  'nottingham': 'nottingham forest',
};
const norm = (s) => {
  const n = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b(a?fc)\b/g, '').replace(/[^a-z0-9& ]/g, '').replace(/\s+/g, ' ').trim();
  return ALIAS[n] ?? n;
};
const partirNombre = (full) => {
  const t = full.trim().split(/\s+/);
  return t.length === 1
    ? { nombre: t[0].slice(0, 50), apellido: t[0].slice(0, 50) }
    : { nombre: t[0].slice(0, 50), apellido: t.slice(1).join(' ').slice(0, 50) };
};
// Posición de football-data ("Goalkeeper", "Centre-Back", "Defensive Midfield", "Right Winger"...) -> ARQ/DEF/MED/DEL
const posicionDe = (pos = '') => {
  const p = (pos ?? '').toLowerCase();
  if (p.includes('goalkeeper')) return 'ARQ';
  if (p.includes('back') || p.includes('defen')) return 'DEF';
  if (p.includes('midfield')) return 'MED';
  if (p.includes('forward') || p.includes('winger') || p.includes('offence') || p.includes('striker') || p.includes('attack')) return 'DEL';
  return null;
};

const q = SEASON ? `?season=${SEASON}` : '';
const r = await fetch(`https://api.football-data.org/v4/competitions/PL/teams${q}`, { headers: { 'X-Auth-Token': TOKEN } });
if (!r.ok) { console.error(`football-data respondió ${r.status} (403 = token/plan, 429 = demasiados pedidos)`); process.exit(1); }
const { teams } = await r.json();

const mios = await (await fetch(`${BACKEND}/torneos/${TORNEO_ID}/equipos`)).json();
let creados = 0, omitidos = 0;
const sinMatch = [];

for (const t of teams) {
  const equipo = mios.find((e) => [norm(t.name), norm(t.shortName ?? '')].includes(norm(e.nombre)));
  if (!equipo) { sinMatch.push(t.name); continue; }
  const squad = t.squad ?? [];
  if (!squad.length) console.log(`(sin plantel en la API para ${t.name})`);

  // Camisetas 1..11 ya las usa el seed: los reales arrancan después del mayor número usado.
  const actuales = await (await fetch(`${BACKEND}/equipos/${equipo.id}/jugadores`)).json();
  let camiseta = Math.max(11, ...actuales.map((j) => j.numeroCamiseta)) + 1;
  let creadosEquipo = 0;

  for (const p of squad) {
    if (camiseta > 99) break;
    const res = await fetch(`${BACKEND}/jugadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // La API no trae DNI: se usa un identificador provisorio y único "PL<id>".
      body: JSON.stringify({
        equipoId: equipo.id, ...partirNombre(p.name), dni: `PL${p.id}`.slice(0, 10),
        numeroCamiseta: camiseta, posicion: posicionDe(p.position),
      }),
    });
    if (res.ok) { creados++; creadosEquipo++; camiseta++; } else { omitidos++; }
  }
  console.log(`${equipo.nombre}: ${creadosEquipo} jugadores`);
}
console.log(`\nCreados: ${creados} | omitidos (ya existían o error): ${omitidos}`);
if (sinMatch.length) console.log('Sin equipo equivalente en tu base (agregalos al ALIAS):', sinMatch.join(', '));
