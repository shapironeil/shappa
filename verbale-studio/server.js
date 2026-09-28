/**
 * Verbale Studio — server locale
 * - Serve l'interfaccia web (public/)
 * - Archivia progetti, checkpoint, transcript e video su disco (data/)
 * - Espone gli endpoint AI (Claude API) per riepilogo email, revisione transcript e previsione prossimi passi
 */
const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { exec } = require('child_process');
const ai = require('./lib/ai');

const PORT = Number(process.env.PORT) || 4310;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = process.env.VERBALE_DATA_DIR || path.join(ROOT, 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
};

const DEFAULT_EXAMPLE_EMAIL = `Ciao a tutti,

di seguito i punti discussi durante il checkpoint odierno.

• Attività completate:
   o Ingestion delle estrazioni dei dati dai database sorgente in formato CSV, dal livello bronze al livello silver;
   o Sviluppo del layer Gold (ETL) della Data Platform sulla base dei file ricevuti da ATAC;
   o Analisi delle modifiche al Terraform per abilitare la connettività ai sistemi on-premise di ATAC.

• Attività in corso (pianificate per questa settimana):
   o Definizione del documento di governance tramite template dedicato con identificazione di ruoli e responsabilità per la gestione e l’evoluzione della Data Platform e del relativo design; → mandato in review dal GdL ai referenti ATAC.
   o Definizione e strutturazione della libreria di Data Quality della Data Platform;
   o Definizione della roadmap use case e del modello target (To-Be);
   o Definizione e sviluppo delle dashboard a supporto dell’MVP della Data Platform.

• Prossimi passi
   o Ottenimento degli accessi alle fonti dati censite;
   o Verifica degli accessi ai database sorgente su Databricks;
   o Creazione e configurazione dei job all’interno della Virtual Network;

Per il secondo e terzo punto → Attualmente non è possibile effettuare il ping necessario al controllo della raggiungibilità dei database sorgente. Il problema sembra essere riconducibile alla fase di creazione dei cluster di calcolo; è necessario verificare se si tratti di un’anomalia nella configurazione di Azure Databricks oppure di una limitazione legata alla disponibilità di risorse sui server nelle regioni North Europe/East Europe. Si rende quindi necessario pianificare uno slot con Genesio di Sabatino per analizzare i log prodotti e disponibili su Microsoft Azure, al fine di identificare la causa del problema e definire le opportune azioni correttive.

• Punti di attenzione:
   1. Pianificare, nel rispetto delle scadenze progettuali, riunioni di assessment con i vendor finalizzate alla selezione della piattaforma più idonea.
      (Owner- ATAC) → Deadline: 18/05/2026
   2. Consistenza delle estrazioni dati dai database sorgente in formato CSV (Dado e BITP): rilevate anomalie sui dati ricevuti, in attesa della trasmissione dei dataset corretti. → Deadline: 24/07/2026

È stato concordato che il checkpoint di oggi costituisce l’ultimo incontro prima della pausa estiva e che i successivi checkpoint riprenderanno da lunedì 7 settembre.

In allegato trovate le slide discusse durante la riunione; come sempre, vi chiedo cortesemente di estendere la presente a chi riteniate opportuno.

A disposizione,
Grazie
Lucrezia`;

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const safeId = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80);
const slugify = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'progetto';

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2));
  await fsp.rename(tmp, file);
}

const projectDir = (pid) => path.join(PROJECTS_DIR, safeId(pid));
const projectFile = (pid) => path.join(projectDir(pid), 'project.json');
const checkpointDir = (pid, cid) => path.join(projectDir(pid), 'checkpoints', safeId(cid));
const checkpointFile = (pid, cid) => path.join(checkpointDir(pid, cid), 'checkpoint.json');
const forecastFile = (pid) => path.join(projectDir(pid), 'forecast.json');

async function getSettings() {
  return readJson(SETTINGS_FILE, { apiKey: '', model: ai.DEFAULT_MODEL, author: 'Lucrezia' });
}

function publicSettings(s) {
  const key = s.apiKey || process.env.ANTHROPIC_API_KEY || '';
  return {
    model: s.model || ai.DEFAULT_MODEL,
    author: s.author || '',
    hasApiKey: Boolean(key),
    apiKeySource: s.apiKey ? 'impostazioni' : process.env.ANTHROPIC_API_KEY ? 'variabile ambiente' : null,
    apiKeyHint: key ? `…${key.slice(-4)}` : '',
  };
}

async function ensureSeed() {
  await fsp.mkdir(PROJECTS_DIR, { recursive: true });
  const entries = await fsp.readdir(PROJECTS_DIR).catch(() => []);
  if (entries.length === 0) {
    await writeJson(projectFile('atac'), {
      id: 'atac',
      name: 'ATAC',
      description: 'Data Platform — checkpoint settimanali',
      recipients: '',
      subjectTemplate: 'ATAC | Checkpoint {data} — punti discussi',
      glossary: 'ATAC, Databricks, Azure, Terraform, Virtual Network, Data Platform, bronze, silver, gold, ETL, MVP, Data Quality, GdL, Dado, BITP',
      exampleEmail: DEFAULT_EXAMPLE_EMAIL,
      createdAt: new Date().toISOString(),
    });
  }
}

async function listProjects() {
  const entries = await fsp.readdir(PROJECTS_DIR, { withFileTypes: true }).catch(() => []);
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = await readJson(projectFile(e.name), null);
    if (p) out.push(p);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function checkpointSummary(c) {
  const cues = c.transcript?.cues || [];
  const s = c.summary || {};
  return {
    id: c.id,
    projectId: c.projectId,
    date: c.date,
    title: c.title,
    status: c.status,
    updatedAt: c.updatedAt,
    hasVideo: Boolean(c.video),
    cueCount: cues.length,
    reviewedCount: cues.filter((q) => q.reviewed).length,
    flaggedCount: cues.filter((q) => q.flagged).length,
    duration: cues.length ? cues[cues.length - 1].end : 0,
    counts: {
      completed: (s.completed || []).length,
      inProgress: (s.inProgress || []).length,
      nextSteps: (s.nextSteps || []).length,
      attention: (s.attention || []).length,
    },
  };
}

async function loadCheckpoints(pid) {
  const dir = path.join(projectDir(pid), 'checkpoints');
  const entries = await fsp.readdir(dir, { withFileTypes: true }).catch(() => []);
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const c = await readJson(path.join(dir, e.name, 'checkpoint.json'), null);
    if (c) out.push(c);
  }
  // Più recenti prima
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// ---------------------------------------------------------------------------
// DOCX → testo (lettore ZIP minimale, nessuna dipendenza)
// ---------------------------------------------------------------------------

function unzipEntry(buf, wanted) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('File DOCX non valido');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) break;
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nameLen);
    if (name === wanted) {
      const lNameLen = buf.readUInt16LE(localOff + 26);
      const lExtraLen = buf.readUInt16LE(localOff + 28);
      const start = localOff + 30 + lNameLen + lExtraLen;
      const data = buf.subarray(start, start + compSize);
      return method === 8 ? zlib.inflateRawSync(data) : data;
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`${wanted} non trovato nel DOCX`);
}

function docxToText(buf) {
  const xml = unzipEntry(buf, 'word/document.xml').toString('utf8');
  const decode = (s) =>
    s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&amp;/g, '&');
  return xml
    .split(/<\/w:p>/)
    .map((p) =>
      decode(
        p
          .replace(/<w:tab\/>/g, '\t')
          .replace(/<w:br[^>]*\/>/g, '\n')
          .replace(/<[^>]+>/g, '')
      )
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

async function readBody(req, limit = 50 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Payload troppo grande'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJsonBody(req) {
  const buf = await readBody(req);
  if (!buf.length) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    throw Object.assign(new Error('JSON non valido'), { status: 400 });
  }
}

async function serveFile(req, res, file, { download } = {}) {
  let stat;
  try {
    stat = await fsp.stat(file);
  } catch {
    return send(res, 404, 'Non trovato');
  }
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  if (download) headers['Content-Disposition'] = `attachment; filename="${path.basename(file)}"`;
  const range = req.headers.range;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
    if (m && !m[1] && m[2]) {
      start = stat.size - parseInt(m[2], 10);
      end = stat.size - 1;
    }
    if (start >= stat.size || end >= stat.size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, 'Content-Length': stat.size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const routes = [];
const route = (method, pattern, handler) => {
  const keys = [];
  const re = new RegExp(
    '^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$'
  );
  routes.push({ method, re, keys, handler });
};

route('GET', '/api/state', async (req, res) => {
  const settings = await getSettings();
  send(res, 200, { projects: await listProjects(), settings: publicSettings(settings) });
});

route('PUT', '/api/settings', async (req, res) => {
  const body = await readJsonBody(req);
  const current = await getSettings();
  const next = { ...current };
  if (typeof body.apiKey === 'string') next.apiKey = body.apiKey.trim();
  if (typeof body.model === 'string' && body.model.trim()) next.model = body.model.trim();
  if (typeof body.author === 'string') next.author = body.author;
  await writeJson(SETTINGS_FILE, next);
  send(res, 200, publicSettings(next));
});

route('POST', '/api/projects', async (req, res) => {
  const body = await readJsonBody(req);
  const name = String(body.name || '').trim();
  if (!name) return send(res, 400, { error: 'Nome progetto obbligatorio' });
  let id = slugify(name);
  let i = 2;
  while (fs.existsSync(projectDir(id))) id = `${slugify(name)}-${i++}`;
  const project = {
    id,
    name,
    description: body.description || '',
    recipients: '',
    subjectTemplate: `${name} | Checkpoint {data} — punti discussi`,
    glossary: '',
    exampleEmail: DEFAULT_EXAMPLE_EMAIL,
    createdAt: new Date().toISOString(),
  };
  await writeJson(projectFile(id), project);
  send(res, 201, project);
});

route('PUT', '/api/projects/:pid', async (req, res, { pid }) => {
  const current = await readJson(projectFile(pid), null);
  if (!current) return send(res, 404, { error: 'Progetto non trovato' });
  const body = await readJsonBody(req);
  const allowed = ['name', 'description', 'recipients', 'subjectTemplate', 'glossary', 'exampleEmail'];
  for (const k of allowed) if (typeof body[k] === 'string') current[k] = body[k];
  current.updatedAt = new Date().toISOString();
  await writeJson(projectFile(pid), current);
  send(res, 200, current);
});

route('DELETE', '/api/projects/:pid', async (req, res, { pid }) => {
  if (!fs.existsSync(projectFile(pid))) return send(res, 404, { error: 'Progetto non trovato' });
  await fsp.rm(projectDir(pid), { recursive: true, force: true });
  send(res, 200, { ok: true });
});

route('GET', '/api/projects/:pid/checkpoints', async (req, res, { pid }) => {
  const list = await loadCheckpoints(pid);
  send(res, 200, list.map(checkpointSummary));
});

// Storico completo (riepiloghi) per la vista timeline
route('GET', '/api/projects/:pid/history', async (req, res, { pid }) => {
  const list = await loadCheckpoints(pid);
  send(res, 200, {
    checkpoints: list.map((c) => ({ ...checkpointSummary(c), summary: c.summary || null, notes: c.notes || '' })),
    forecast: await readJson(forecastFile(pid), null),
  });
});

route('POST', '/api/projects/:pid/checkpoints', async (req, res, { pid }) => {
  if (!fs.existsSync(projectFile(pid))) return send(res, 404, { error: 'Progetto non trovato' });
  const body = await readJsonBody(req);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ? body.date : new Date().toISOString().slice(0, 10);
  const id = `${date}-${crypto.randomBytes(2).toString('hex')}`;
  const now = new Date().toISOString();
  const checkpoint = {
    id,
    projectId: safeId(pid),
    date,
    title: String(body.title || 'Checkpoint'),
    status: 'bozza',
    createdAt: now,
    updatedAt: now,
    video: null,
    transcript: { sourceName: '', cues: [] },
    notes: '',
    summary: null,
    email: { subject: '', body: '', edited: false },
  };
  await writeJson(checkpointFile(pid, id), checkpoint);
  send(res, 201, checkpoint);
});

route('GET', '/api/projects/:pid/checkpoints/:cid', async (req, res, { pid, cid }) => {
  const c = await readJson(checkpointFile(pid, cid), null);
  if (!c) return send(res, 404, { error: 'Checkpoint non trovato' });
  send(res, 200, c);
});

route('PUT', '/api/projects/:pid/checkpoints/:cid', async (req, res, { pid, cid }) => {
  const current = await readJson(checkpointFile(pid, cid), null);
  if (!current) return send(res, 404, { error: 'Checkpoint non trovato' });
  const body = await readJsonBody(req);
  const allowed = ['date', 'title', 'status', 'transcript', 'notes', 'summary', 'email', 'reviewState'];
  for (const k of allowed) if (k in body) current[k] = body[k];
  current.updatedAt = new Date().toISOString();
  await writeJson(checkpointFile(pid, cid), current);
  send(res, 200, { ok: true, updatedAt: current.updatedAt });
});

route('DELETE', '/api/projects/:pid/checkpoints/:cid', async (req, res, { pid, cid }) => {
  const dir = checkpointDir(pid, cid);
  if (!fs.existsSync(dir)) return send(res, 404, { error: 'Checkpoint non trovato' });
  await fsp.rm(dir, { recursive: true, force: true });
  send(res, 200, { ok: true });
});

// Upload video in streaming (può essere di diversi GB)
route('PUT', '/api/projects/:pid/checkpoints/:cid/video', async (req, res, { pid, cid }) => {
  const current = await readJson(checkpointFile(pid, cid), null);
  if (!current) return send(res, 404, { error: 'Checkpoint non trovato' });
  const url = new URL(req.url, 'http://x');
  const original = url.searchParams.get('name') || 'video.mp4';
  const ext = (path.extname(original).toLowerCase().match(/^\.[a-z0-9]{1,5}$/) || ['.mp4'])[0];
  const target = path.join(checkpointDir(pid, cid), `video${ext}`);
  const tmp = `${target}.upload`;
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(tmp);
    req.pipe(out);
    out.on('finish', resolve);
    out.on('error', reject);
    req.on('error', reject);
  });
  if (current.video?.file && current.video.file !== path.basename(target)) {
    await fsp.rm(path.join(checkpointDir(pid, cid), current.video.file), { force: true });
  }
  await fsp.rename(tmp, target);
  const stat = await fsp.stat(target);
  current.video = { file: path.basename(target), name: original, size: stat.size, uploadedAt: new Date().toISOString() };
  current.updatedAt = new Date().toISOString();
  await writeJson(checkpointFile(pid, cid), current);
  send(res, 200, current.video);
});

route('DELETE', '/api/projects/:pid/checkpoints/:cid/video', async (req, res, { pid, cid }) => {
  const current = await readJson(checkpointFile(pid, cid), null);
  if (!current) return send(res, 404, { error: 'Checkpoint non trovato' });
  if (current.video?.file) await fsp.rm(path.join(checkpointDir(pid, cid), current.video.file), { force: true });
  current.video = null;
  await writeJson(checkpointFile(pid, cid), current);
  send(res, 200, { ok: true });
});

route('GET', '/media/:pid/:cid', async (req, res, { pid, cid }) => {
  const current = await readJson(checkpointFile(pid, cid), null);
  if (!current?.video?.file) return send(res, 404, 'Nessun video');
  serveFile(req, res, path.join(checkpointDir(pid, cid), path.basename(current.video.file)));
});

route('POST', '/api/docx-text', async (req, res) => {
  const buf = await readBody(req);
  try {
    send(res, 200, { text: docxToText(buf) });
  } catch (err) {
    send(res, 400, { error: err.message });
  }
});

// ------------------------------- AI ---------------------------------------

async function aiContext(pid, cid) {
  const project = await readJson(projectFile(pid), null);
  if (!project) throw Object.assign(new Error('Progetto non trovato'), { status: 404 });
  const all = await loadCheckpoints(pid);
  const settings = await getSettings();
  const current = cid ? all.find((c) => c.id === safeId(cid)) : null;
  if (cid && !current) throw Object.assign(new Error('Checkpoint non trovato'), { status: 404 });
  return { project, all, settings, current };
}

route('POST', '/api/ai/summary', async (req, res) => {
  const body = await readJsonBody(req);
  const { project, all, settings, current } = await aiContext(body.projectId, body.checkpointId);
  const previous = all.filter((c) => c.id !== current.id && (c.date || '') <= (current.date || '') && c.summary).slice(0, 4);
  const summary = await ai.generateSummary({ settings, project, checkpoint: current, previous });
  send(res, 200, { summary });
});

route('POST', '/api/ai/proofread', async (req, res) => {
  const body = await readJsonBody(req);
  const { project, settings, current } = await aiContext(body.projectId, body.checkpointId);
  const cues = Array.isArray(body.cues) && body.cues.length ? body.cues : current.transcript?.cues || [];
  const corrections = await ai.proofread({ settings, project, cues });
  send(res, 200, { corrections });
});

route('POST', '/api/ai/forecast', async (req, res) => {
  const body = await readJsonBody(req);
  const { project, all, settings } = await aiContext(body.projectId);
  const withSummary = all.filter((c) => c.summary).slice(0, 8);
  if (!withSummary.length) return send(res, 400, { error: 'Serve almeno un checkpoint con il riepilogo compilato.' });
  const result = await ai.forecast({ settings, project, checkpoints: withSummary, today: new Date().toISOString().slice(0, 10) });
  const forecast = { ...result, generatedAt: new Date().toISOString(), basedOn: withSummary.map((c) => c.id), source: 'ai' };
  await writeJson(forecastFile(body.projectId), forecast);
  send(res, 200, forecast);
});

route('PUT', '/api/projects/:pid/forecast', async (req, res, { pid }) => {
  const body = await readJsonBody(req);
  await writeJson(forecastFile(pid), { ...body, savedAt: new Date().toISOString() });
  send(res, 200, { ok: true });
});

// ---------------------------------------------------------------------------

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  for (const r of routes) {
    if (r.method !== req.method && !(r.method === 'GET' && req.method === 'HEAD')) continue;
    const m = r.re.exec(pathname);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, m[i + 1]]));
    return r.handler(req, res, params);
  }

  if (pathname.startsWith('/api/')) return send(res, 404, { error: 'Endpoint non trovato' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Metodo non consentito');

  const rel = pathname === '/' ? '/index.html' : pathname;
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'Vietato');
  return serveFile(req, res, file);
}

async function main() {
  await ensureSeed();
  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      const status = err.status || 500;
      if (status >= 500) console.error(err);
      if (!res.headersSent) send(res, status, { error: err.message || 'Errore interno' });
      else res.end();
    });
  });
  server.requestTimeout = 0; // upload video e chiamate AI possono durare a lungo
  server.listen(PORT, '127.0.0.1', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n  Verbale Studio attivo su ${url}\n  Dati salvati in ${DATA_DIR}\n`);
    if (process.argv.includes('--open')) {
      const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
      exec(cmd, () => {});
    }
  });
}

if (require.main === module) main();

module.exports = { docxToText, unzipEntry };
