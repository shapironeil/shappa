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
const ollama = require('./lib/ollama');

// Quando gira come eseguibile (Node SEA) l'interfaccia è incorporata nel file
// e la cartella di lavoro è quella in cui si trova l'eseguibile.
let sea = null;
try {
  sea = require('node:sea');
  if (!sea.isSea()) sea = null;
} catch {
  sea = null;
}

const PORT = Number(process.env.PORT) || 4310;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const argDir = process.argv.slice(2).find((a) => !a.startsWith('--'));
// Cartella di lavoro: argomento da riga di comando > variabile d'ambiente > cartella dell'eseguibile/app
const WORK_DIR = path.resolve(argDir || process.env.VERBALE_WORK_DIR || (sea ? path.dirname(process.execPath) : ROOT));
const DATA_DIR = process.env.VERBALE_DATA_DIR || path.join(WORK_DIR, 'data');
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
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
// Copie leggibili e ordinate dei file di ogni checkpoint: Archivio/<Progetto>/<data> <titolo>/
const ARCHIVE_DIR = path.join(WORK_DIR, 'Archivio');
// Windows estrae in %TEMP% un .exe aperto direttamente dallo zip: lì i dati andrebbero persi
const RUNNING_FROM_TEMP = Boolean(sea) && /[\\/](temp|tmp)[\\/]|Temp\d+_|\.zip[\\/]/i.test(process.execPath);

// Scritture su checkpoint.json serializzate per checkpoint (upload lunghi + salvataggi automatici)
const locks = new Map();
function withLock(key, fn) {
  const prev = locks.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => {}));
  return next;
}

const winSafe = (s) =>
  String(s || '')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')
    .slice(0, 80) || 'Senza titolo';
const folderName = (c) => `${c.date} ${winSafe(c.title)}`;

// Cartella ordinata del checkpoint dentro Archivio/, creata alla prima necessità
async function ensureFolder(pid, c) {
  if (c.folder) {
    const abs = workPath(c.folder);
    if (fs.existsSync(abs)) return abs;
  }
  const project = await readJson(projectFile(pid), null);
  const base = path.join(ARCHIVE_DIR, winSafe(project?.name || pid));
  let dir = path.join(base, folderName(c));
  for (let i = 2; fs.existsSync(dir); i++) dir = path.join(base, `${folderName(c)} (${i})`);
  await fsp.mkdir(dir, { recursive: true });
  c.folder = path.relative(WORK_DIR, dir);
  return dir;
}

// Se cambiano data o titolo, rinomina la cartella (se possibile) e aggiorna i riferimenti
async function renameFolderIfNeeded(c) {
  if (!c.folder) return;
  const abs = workPath(c.folder);
  const wanted = path.join(path.dirname(abs), folderName(c));
  if (path.basename(abs).startsWith(folderName(c)) || fs.existsSync(wanted) || !fs.existsSync(abs)) return;
  try {
    await fsp.rename(abs, wanted);
  } catch {
    return; // file in uso (es. video in riproduzione): si riproverà al prossimo salvataggio
  }
  const oldRel = c.folder;
  const newRel = path.relative(WORK_DIR, wanted);
  const fix = (rel) => (rel && rel.startsWith(oldRel + path.sep) ? newRel + rel.slice(oldRel.length) : rel);
  c.folder = newRel;
  if (c.video?.external) c.video.external = fix(c.video.external);
  if (c.transcriptFile) c.transcriptFile = fix(c.transcriptFile);
}

const fmtShort = (sec) => {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(sec % 60).padStart(2, '0')}`;
};

// Scrive nella cartella del checkpoint il transcript revisionato e l'email, leggibili senza l'app
async function writeExports(pid, c) {
  const cues = c.transcript?.cues || [];
  if (!c.folder && !cues.length && !c.video) return;
  const dir = await ensureFolder(pid, c);
  const project = await readJson(projectFile(pid), null);
  const header = `${project?.name || ''} — ${c.title} — ${c.date.split('-').reverse().join('/')}`;
  if (cues.length) {
    const txt = `${header}\r\n\r\n` + cues.map((q) => `[${fmtShort(q.start)}] ${q.speaker ? q.speaker + ': ' : ''}${q.text}`).join('\r\n') + '\r\n';
    await fsp.writeFile(path.join(dir, 'Transcript revisionato.txt'), '\ufeff' + txt);
  }
  if (c.email?.body?.trim()) {
    const txt = `Oggetto: ${c.email.subject || ''}\r\n\r\n${c.email.body.replace(/\r?\n/g, '\r\n')}\r\n`;
    await fsp.writeFile(path.join(dir, 'Email di riepilogo.txt'), '\ufeff' + txt);
  }
}

// Percorso relativo alla cartella di lavoro → assoluto, senza uscire dalla cartella
function workPath(rel) {
  const abs = path.resolve(WORK_DIR, String(rel || ''));
  if (abs !== WORK_DIR && !abs.startsWith(WORK_DIR + path.sep)) throw Object.assign(new Error('Percorso non valido'), { status: 400 });
  return abs;
}

async function getSettings() {
  return readJson(SETTINGS_FILE, { apiKey: '', model: ai.DEFAULT_MODEL, author: 'Lucrezia' });
}

function publicSettings(s) {
  const key = s.apiKey || process.env.ANTHROPIC_API_KEY || '';
  return {
    model: s.model || ai.DEFAULT_MODEL,
    author: s.author || '',
    ollamaModel: s.ollamaModel || '',
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
      templateId: 'checkpoint-settimanale',
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
    itemCount: Object.values(s).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0),
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
  send(res, 200, { projects: await listProjects(), settings: publicSettings(settings), workDir: WORK_DIR, dataDir: DATA_DIR, packaged: Boolean(sea), runningFromTemp: RUNNING_FROM_TEMP });
});

route('PUT', '/api/settings', async (req, res) => {
  const body = await readJsonBody(req);
  const current = await getSettings();
  const next = { ...current };
  if (typeof body.apiKey === 'string') next.apiKey = body.apiKey.trim();
  if (typeof body.model === 'string' && body.model.trim()) next.model = body.model.trim();
  if (typeof body.author === 'string') next.author = body.author;
  if (typeof body.ollamaModel === 'string') next.ollamaModel = body.ollamaModel.trim();
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
    templateId: String(body.templateId || 'checkpoint-settimanale'),
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
  const allowed = ['name', 'description', 'recipients', 'subjectTemplate', 'glossary', 'exampleEmail', 'templateId'];
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
    checkpoints: list.map((c) => ({ ...checkpointSummary(c), templateId: c.templateId || '', summary: c.summary || null })),
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
    templateId: String(body.templateId || ''),
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
  const body = await readJsonBody(req);
  const result = await withLock(`${pid}/${cid}`, async () => {
    const current = await readJson(checkpointFile(pid, cid), null);
    if (!current) return null;
    const allowed = ['date', 'title', 'status', 'templateId', 'transcript', 'notes', 'summary', 'email', 'analysis'];
    for (const k of allowed) if (k in body) current[k] = body[k];
    current.updatedAt = new Date().toISOString();
    await renameFolderIfNeeded(current);
    await writeExports(pid, current).catch((err) => console.error('Esportazione non riuscita:', err.message));
    await writeJson(checkpointFile(pid, cid), current);
    return current;
  });
  if (!result) return send(res, 404, { error: 'Checkpoint non trovato' });
  send(res, 200, { ok: true, updatedAt: result.updatedAt, folder: result.folder || '', video: result.video || null, transcriptFile: result.transcriptFile || '' });
});

route('DELETE', '/api/projects/:pid/checkpoints/:cid', async (req, res, { pid, cid }) => {
  const dir = checkpointDir(pid, cid);
  if (!fs.existsSync(dir)) return send(res, 404, { error: 'Checkpoint non trovato' });
  await fsp.rm(dir, { recursive: true, force: true });
  send(res, 200, { ok: true });
});

// Upload video in streaming (può essere di diversi GB): copia ordinata in Archivio/<Progetto>/<data> <titolo>/
route('PUT', '/api/projects/:pid/checkpoints/:cid/video', async (req, res, { pid, cid }) => {
  const initial = await readJson(checkpointFile(pid, cid), null);
  if (!initial) return send(res, 404, { error: 'Checkpoint non trovato' });
  const url = new URL(req.url, 'http://x');
  const original = path.basename(url.searchParams.get('name') || 'video.mp4');
  const ext = (path.extname(original).toLowerCase().match(/^\.[a-z0-9]{1,5}$/) || ['.mp4'])[0];
  const dir = await withLock(`${pid}/${cid}`, async () => {
    const c = await readJson(checkpointFile(pid, cid), null);
    const d = await ensureFolder(pid, c);
    await writeJson(checkpointFile(pid, cid), c);
    return d;
  });
  const target = path.join(dir, `Registrazione${ext}`);
  const tmp = `${target}.upload`;
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(tmp);
    req.pipe(out);
    out.on('finish', resolve);
    out.on('error', reject);
    req.on('error', reject);
  });
  const video = await withLock(`${pid}/${cid}`, async () => {
    // riletto dopo l'upload: nel frattempo il checkpoint può essere stato salvato
    const c = await readJson(checkpointFile(pid, cid), null);
    await removeOwnVideo(pid, cid, c, target);
    await fsp.rm(target, { force: true });
    await fsp.rename(tmp, target);
    const stat = await fsp.stat(target);
    c.video = { external: path.relative(WORK_DIR, target), copied: true, name: original, size: stat.size, uploadedAt: new Date().toISOString() };
    c.updatedAt = new Date().toISOString();
    await writeJson(checkpointFile(pid, cid), c);
    return c.video;
  });
  send(res, 200, video);
});

// Elimina il video solo se è una copia fatta dall'app (mai i file originali dell'utente)
async function removeOwnVideo(pid, cid, c, keep) {
  if (c.video?.file) await fsp.rm(path.join(checkpointDir(pid, cid), path.basename(c.video.file)), { force: true });
  if (c.video?.copied && c.video.external) {
    const abs = workPath(c.video.external);
    if (abs !== keep) await fsp.rm(abs, { force: true });
  }
}

// Copia del file transcript originale nella cartella del checkpoint
route('PUT', '/api/projects/:pid/checkpoints/:cid/transcript-file', async (req, res, { pid, cid }) => {
  const url = new URL(req.url, 'http://x');
  const fromRel = url.searchParams.get('rel'); // file già presente nella cartella di lavoro
  const original = path.basename(fromRel || url.searchParams.get('name') || 'transcript.vtt');
  const ext = (path.extname(original).toLowerCase().match(/^\.(vtt|srt|txt|docx)$/) || ['.txt'])[0];
  const buf = fromRel ? await fsp.readFile(workPath(fromRel)) : await readBody(req);
  const rel = await withLock(`${pid}/${cid}`, async () => {
    const c = await readJson(checkpointFile(pid, cid), null);
    if (!c) return null;
    const dir = await ensureFolder(pid, c);
    if (c.transcriptFile) await fsp.rm(workPath(c.transcriptFile), { force: true });
    const target = path.join(dir, `Transcript originale${ext}`);
    await fsp.writeFile(target, buf);
    c.transcriptFile = path.relative(WORK_DIR, target);
    await writeJson(checkpointFile(pid, cid), c);
    return c.transcriptFile;
  });
  if (!rel) return send(res, 404, { error: 'Checkpoint non trovato' });
  send(res, 200, { transcriptFile: rel });
});

route('DELETE', '/api/projects/:pid/checkpoints/:cid/video', async (req, res, { pid, cid }) => {
  const ok = await withLock(`${pid}/${cid}`, async () => {
    const c = await readJson(checkpointFile(pid, cid), null);
    if (!c) return false;
    await removeOwnVideo(pid, cid, c);
    c.video = null;
    await writeJson(checkpointFile(pid, cid), c);
    return true;
  });
  if (!ok) return send(res, 404, { error: 'Checkpoint non trovato' });
  send(res, 200, { ok: true });
});

route('GET', '/media/:pid/:cid', async (req, res, { pid, cid }) => {
  const current = await readJson(checkpointFile(pid, cid), null);
  if (current?.video?.external) return serveFile(req, res, workPath(current.video.external));
  if (!current?.video?.file) return send(res, 404, 'Nessun video');
  serveFile(req, res, path.join(checkpointDir(pid, cid), path.basename(current.video.file)));
});

// Collega un video già presente nella cartella di lavoro, senza copiarlo né spostarlo
route('POST', '/api/projects/:pid/checkpoints/:cid/video-link', async (req, res, { pid, cid }) => {
  const { rel } = await readJsonBody(req);
  const abs = workPath(rel);
  const stat = await fsp.stat(abs).catch(() => null);
  if (!stat?.isFile()) return send(res, 404, { error: 'File non trovato nella cartella' });
  const video = await withLock(`${pid}/${cid}`, async () => {
    const c = await readJson(checkpointFile(pid, cid), null);
    if (!c) return null;
    await removeOwnVideo(pid, cid, c, abs);
    c.video = { external: path.relative(WORK_DIR, abs), name: path.basename(abs), size: stat.size, uploadedAt: new Date().toISOString() };
    c.updatedAt = new Date().toISOString();
    await ensureFolder(pid, c);
    await writeJson(checkpointFile(pid, cid), c);
    return c.video;
  });
  if (!video) return send(res, 404, { error: 'Checkpoint non trovato' });
  send(res, 200, video);
});

// ------------------------- Cartella di lavoro -------------------------------

const VIDEO_EXT = new Set(['.mp4', '.m4v', '.mov', '.webm', '.mkv', '.m4a', '.mp3', '.wav']);
const TRANSCRIPT_EXT = new Set(['.vtt', '.docx', '.srt', '.txt']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'public', 'lib', 'build', 'packaging', 'dist', 'release', 'Archivio', 'motore-mac', 'alternativa-node']);

async function scanFolder(dir, depth, out) {
  if (out.length > 2000) return;
  const entries = await fsp.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name.startsWith('~$')) continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (depth < 4 && !SKIP_DIRS.has(e.name) && path.resolve(abs) !== path.resolve(DATA_DIR)) await scanFolder(abs, depth + 1, out);
      continue;
    }
    const ext = path.extname(e.name).toLowerCase();
    const type = VIDEO_EXT.has(ext) ? 'video' : TRANSCRIPT_EXT.has(ext) ? 'transcript' : null;
    if (!type || /^(readme|license|changelog|leggimi|metti qui)/i.test(e.name)) continue;
    const stat = await fsp.stat(abs).catch(() => null);
    if (!stat) continue;
    out.push({ rel: path.relative(WORK_DIR, abs), name: e.name, dir: path.relative(WORK_DIR, dir), type, size: stat.size, mtime: stat.mtime.toISOString() });
  }
}

route('GET', '/api/folder', async (req, res) => {
  const files = [];
  await scanFolder(WORK_DIR, 0, files);
  // Quali file sono già collegati a un checkpoint
  const used = new Map();
  for (const p of await listProjects()) {
    for (const c of await loadCheckpoints(p.id)) {
      const mark = (rel) => rel && used.set(path.normalize(rel), { projectId: p.id, projectName: p.name, checkpointId: c.id, date: c.date, title: c.title });
      mark(c.video?.external);
      mark(c.transcript?.sourcePath);
    }
  }
  for (const f of files) f.usedBy = used.get(path.normalize(f.rel)) || null;
  files.sort((a, b) => b.mtime.localeCompare(a.mtime));
  send(res, 200, { workDir: WORK_DIR, dataDir: DATA_DIR, files });
});

route('POST', '/api/folder/read', async (req, res) => {
  const { rel } = await readJsonBody(req);
  const abs = workPath(rel);
  const buf = await fsp.readFile(abs).catch(() => null);
  if (!buf) return send(res, 404, { error: 'File non trovato' });
  const text = path.extname(abs).toLowerCase() === '.docx' ? docxToText(buf) : buf.toString('utf8');
  send(res, 200, { text, name: path.basename(abs), rel: path.relative(WORK_DIR, abs) });
});

route('POST', '/api/folder/open', async (req, res) => {
  // Apre la cartella di lavoro (o dei dati) in Esplora risorse / Finder
  const { which, rel } = await readJsonBody(req);
  const target = which === 'data' ? DATA_DIR : which === 'archive' ? ARCHIVE_DIR : rel ? workPath(rel) : WORK_DIR;
  await fsp.mkdir(target, { recursive: true }).catch(() => {});
  const cmd = process.platform === 'win32' ? `explorer "${target}"` : process.platform === 'darwin' ? `open "${target}"` : `xdg-open "${target}"`;
  exec(cmd, () => {});
  send(res, 200, { ok: true });
});

// --------------------- Apprendimento locale (per progetto) -----------------

const learningFile = (pid) => path.join(projectDir(pid), 'learning.json');
route('GET', '/api/projects/:pid/learning', async (req, res, { pid }) => {
  send(res, 200, await readJson(learningFile(pid), null));
});
route('PUT', '/api/projects/:pid/learning', async (req, res, { pid }) => {
  if (!fs.existsSync(projectFile(pid))) return send(res, 404, { error: 'Progetto non trovato' });
  await writeJson(learningFile(pid), await readJsonBody(req));
  send(res, 200, { ok: true });
});

// ------------------------------ AI locale (Ollama) --------------------------

// Esempi di addestramento: frase originale del transcript → voce approvata nel riepilogo
async function trainingExamples(pid) {
  const out = [];
  for (const c of await loadCheckpoints(pid)) {
    for (const v of Object.values(c.summary || {})) {
      if (!Array.isArray(v)) continue;
      for (const it of v) if (it?.ref?.source && it.text && it.ref.source.trim() !== it.text.trim()) out.push({ source: it.ref.source, text: it.text });
    }
  }
  return out;
}

route('GET', '/api/ollama/status', async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const pid = url.searchParams.get('projectId');
  const st = await ollama.status();
  send(res, 200, {
    ...st,
    recommended: ollama.RECOMMENDED,
    jobs: ollama.jobs,
    platform: process.platform,
    trainedModel: pid ? ollama.trainedName(pid) : null,
    trainingExamples: pid ? (await trainingExamples(pid)).length : 0,
  });
});
route('POST', '/api/ollama/install', async (req, res) => send(res, 200, ollama.install()));
route('POST', '/api/ollama/start', async (req, res) => {
  ollama.startApp();
  send(res, 200, { ok: true });
});
route('POST', '/api/ollama/pull', async (req, res) => {
  const { model } = await readJsonBody(req);
  if (!/^[\w.:/-]{2,80}$/.test(model || '')) return send(res, 400, { error: 'Nome modello non valido' });
  send(res, 200, ollama.pull(model));
});
route('POST', '/api/ollama/delete', async (req, res) => {
  const { model } = await readJsonBody(req);
  await ollama.removeModel(model);
  send(res, 200, { ok: true });
});
route('POST', '/api/ollama/train', async (req, res) => {
  const { projectId, base } = await readJsonBody(req);
  const project = await readJson(projectFile(projectId), null);
  if (!project) return send(res, 404, { error: 'Progetto non trovato' });
  const settings = await getSettings();
  const result = await ollama.train({ project, author: settings.author, base: base || settings.ollamaModel || 'qwen2.5:3b', examples: await trainingExamples(projectId) });
  send(res, 200, result);
});
route('POST', '/api/ollama/task', async (req, res) => {
  const body = await readJsonBody(req);
  const project = await readJson(projectFile(body.projectId), null);
  if (!project) return send(res, 404, { error: 'Progetto non trovato' });
  const settings = await getSettings();
  const model = body.model || settings.ollamaModel;
  if (!model) return send(res, 400, { error: 'Scegli un modello nella finestra “AI locale”.' });
  const text = await ollama.task({ model, project, author: settings.author, task: body.task, text: String(body.text || '').slice(0, 4000) });
  send(res, 200, { text });
});

// ------------------------------ Template -----------------------------------

route('GET', '/api/templates', async (req, res) => {
  send(res, 200, await readJson(TEMPLATES_FILE, []));
});

route('PUT', '/api/templates', async (req, res) => {
  const body = await readJsonBody(req);
  if (!Array.isArray(body)) return send(res, 400, { error: 'Formato non valido' });
  await writeJson(TEMPLATES_FILE, body);
  send(res, 200, { ok: true });
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
  const summary = await ai.generateSummary({ settings, project, checkpoint: current, previous, template: body.template });
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
  if (sea) {
    let asset;
    try {
      asset = sea.getAsset('public' + rel.replace(/\\/g, '/'));
    } catch {
      return send(res, 404, 'Non trovato');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    return res.end(Buffer.from(asset));
  }
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'Vietato');
  return serveFile(req, res, file);
}

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(cmd, () => {});
}

// Se sulla porta c'è già Verbale Studio per la stessa cartella, basta riaprire il browser
function existingInstance(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/api/state', timeout: 1500 }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body).workDir === WORK_DIR);
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => (req.destroy(), resolve(false)));
  });
}

async function main() {
  await ensureSeed();
  const shouldOpen = process.argv.includes('--open') || (sea && !process.argv.includes('--no-open'));
  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      const status = err.status || 500;
      if (status >= 500) console.error(err);
      if (!res.headersSent) send(res, status, { error: err.message || 'Errore interno' });
      else res.end();
    });
  });
  server.requestTimeout = 0; // upload video e chiamate AI possono durare a lungo

  for (let port = PORT; port < PORT + 10; port++) {
    const ok = await new Promise((resolve) => {
      server.once('error', () => resolve(false));
      server.listen(port, '127.0.0.1', () => resolve(true));
    });
    if (ok) {
      const url = `http://localhost:${port}`;
      console.log(`\n  Verbale Studio attivo su ${url}`);
      console.log(`  Cartella di lavoro: ${WORK_DIR}`);
      console.log(`  Archivio:           ${DATA_DIR}`);
      if (RUNNING_FROM_TEMP) {
        console.log(`\n  ATTENZIONE: l'app è stata aperta dall'interno dello zip.`);
        console.log(`  Chiudi questa finestra, estrai lo zip (tasto destro → Estrai tutto) e avvia VerbaleStudio.exe dalla cartella estratta.`);
      }
      console.log(`\n  Per chiudere l'app chiudi questa finestra.\n`);
      if (shouldOpen) openBrowser(url);
      return;
    }
    if (await existingInstance(port)) {
      console.log(`Verbale Studio è già aperto su http://localhost:${port}`);
      if (shouldOpen) openBrowser(`http://localhost:${port}`);
      setTimeout(() => process.exit(0), 500);
      return;
    }
  }
  console.error('Nessuna porta libera tra ' + PORT + ' e ' + (PORT + 9));
  process.exit(1);
}

if (sea || require.main === module) main();

module.exports = { docxToText, unzipEntry };
