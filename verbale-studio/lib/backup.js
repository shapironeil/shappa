/**
 * Salvataggi a più livelli, per non perdere nulla:
 *  1. versioni: a ogni modifica rilevante si conserva la versione precedente del checkpoint
 *     (data/projects/<p>/checkpoints/<id>/versioni/), ripristinabile dall'app
 *  2. cestino: checkpoint e progetti eliminati finiscono in data/cestino/ e si possono recuperare
 *  3. backup giornaliero: copia di tutto l'archivio dati (senza video) in Backup/<data>/, ultimi 30 giorni
 *  4. copia aggiuntiva facoltativa: cartella scelta dall'utente (es. OneDrive) con copia di
 *     Archivio (testi e dati, senza video) e dei backup giornalieri
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const VIDEO_EXT = /\.(mp4|m4v|mov|webm|mkv|m4a|mp3|wav)$/i;
const KEEP_VERSIONS = 80;
const KEEP_DAILY = 30;
const SNAPSHOT_EVERY_MS = 3 * 60 * 1000;

let cfg = null; // { dataDir, workDir, archiveDir, backupDir, getMirror }
const status = { lastDaily: null, lastMirror: null, lastError: null };

function init(options) {
  cfg = options;
}

const stamp = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
};

async function copyTree(src, dest, { skipVideo = true, skipDirs = [] } = {}) {
  const entries = await fsp.readdir(src, { withFileTypes: true }).catch(() => []);
  await fsp.mkdir(dest, { recursive: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      if (!skipDirs.includes(e.name)) await copyTree(s, d, { skipVideo, skipDirs });
    } else if (!(skipVideo && VIDEO_EXT.test(e.name)) && !e.name.endsWith('.tmp') && !e.name.endsWith('.upload')) {
      await fsp.copyFile(s, d).catch(() => {});
    }
  }
}

async function prune(dir, keep) {
  const list = (await fsp.readdir(dir).catch(() => [])).sort();
  for (const name of list.slice(0, Math.max(0, list.length - keep))) await fsp.rm(path.join(dir, name), { recursive: true, force: true });
}

// ------------------------------------------------------------------ versioni

// Salva la versione precedente del checkpoint (al massimo ogni 3 minuti, sempre se reason è esplicita)
async function snapshot(checkpointDir, data, reason = 'auto') {
  const dir = path.join(checkpointDir, 'versioni');
  await fsp.mkdir(dir, { recursive: true });
  if (reason === 'auto') {
    const last = (await fsp.readdir(dir).catch(() => [])).sort().pop();
    if (last) {
      const st = await fsp.stat(path.join(dir, last)).catch(() => null);
      if (st && Date.now() - st.mtimeMs < SNAPSHOT_EVERY_MS) return null;
    }
  }
  const name = `${stamp()}_${reason}.json`;
  await fsp.writeFile(path.join(dir, name), JSON.stringify(data));
  await prune(dir, KEEP_VERSIONS);
  return name;
}

function describe(c) {
  const items = Object.values(c.summary || {}).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);
  return { cues: c.transcript?.cues?.length || 0, items, pins: c.pins?.length || 0, title: c.title, date: c.date };
}

async function listVersions(checkpointDir) {
  const dir = path.join(checkpointDir, 'versioni');
  const files = (await fsp.readdir(dir).catch(() => [])).filter((f) => f.endsWith('.json')).sort().reverse();
  const out = [];
  for (const f of files) {
    try {
      const c = JSON.parse(await fsp.readFile(path.join(dir, f), 'utf8'));
      const m = /^(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})_(.+)\.json$/.exec(f);
      out.push({ file: f, savedAt: m ? `${m[1]}T${m[2]}:${m[3]}:${m[4]}` : '', reason: m ? m[5] : '', ...describe(c) });
    } catch {
      /* versione illeggibile: ignorata */
    }
  }
  return out;
}

async function readVersion(checkpointDir, file) {
  if (!/^[\w-]+\.json$/.test(file)) throw Object.assign(new Error('Versione non valida'), { status: 400 });
  return JSON.parse(await fsp.readFile(path.join(checkpointDir, 'versioni', file), 'utf8'));
}

// ------------------------------------------------------------------ cestino

const trashDir = () => path.join(cfg.dataDir, 'cestino');

async function moveToTrash(srcDir, meta) {
  const id = `${stamp()}_${meta.kind}_${path.basename(srcDir)}`;
  const dest = path.join(trashDir(), id);
  await fsp.mkdir(trashDir(), { recursive: true });
  try {
    await fsp.rename(srcDir, dest);
  } catch {
    await copyTree(srcDir, dest, { skipVideo: false });
    await fsp.rm(srcDir, { recursive: true, force: true });
  }
  await fsp.writeFile(path.join(dest, 'cestino.json'), JSON.stringify({ ...meta, originalPath: srcDir, deletedAt: new Date().toISOString() }, null, 2));
  return id;
}

async function listTrash() {
  const out = [];
  for (const id of (await fsp.readdir(trashDir()).catch(() => [])).sort().reverse()) {
    try {
      out.push({ id, ...JSON.parse(await fsp.readFile(path.join(trashDir(), id, 'cestino.json'), 'utf8')) });
    } catch {
      /* ignorato */
    }
  }
  return out;
}

async function restoreFromTrash(id) {
  if (!/^[\w.-]+$/.test(id)) throw Object.assign(new Error('Elemento non valido'), { status: 400 });
  const src = path.join(trashDir(), id);
  const meta = JSON.parse(await fsp.readFile(path.join(src, 'cestino.json'), 'utf8'));
  let dest = meta.originalPath;
  if (fs.existsSync(dest)) dest = `${dest}-ripristinato-${Date.now().toString(36)}`;
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.rm(path.join(src, 'cestino.json'), { force: true });
  await fsp.rename(src, dest);
  return { ...meta, restoredTo: dest };
}

async function purgeTrash(id) {
  if (!/^[\w.-]+$/.test(id)) throw Object.assign(new Error('Elemento non valido'), { status: 400 });
  await fsp.rm(path.join(trashDir(), id), { recursive: true, force: true });
}

// ------------------------------------------------------------------ backup giornaliero + copia aggiuntiva

async function dailyBackup({ force } = {}) {
  const day = stamp().slice(0, 10);
  const existing = (await fsp.readdir(cfg.backupDir).catch(() => [])).filter((n) => n.startsWith(day));
  if (existing.length && !force) return null;
  const name = force ? stamp() : day;
  const dest = path.join(cfg.backupDir, name);
  try {
    // l'archivio dati (checkpoint, versioni, template, apprendimento), senza video né cestino
    await copyTree(cfg.dataDir, path.join(dest, 'data'), { skipDirs: ['cestino'] });
    await fsp.writeFile(
      path.join(dest, 'LEGGIMI.txt'),
      '﻿Backup automatico di Verbale Studio.\r\nPer ripristinarlo: chiudi l\'app e copia la cartella "data" al posto di quella nella cartella di Verbale Studio.\r\n'
    );
    await prune(cfg.backupDir, KEEP_DAILY);
    status.lastDaily = new Date().toISOString();
    const mirror = await cfg.getMirror();
    if (mirror) {
      await copyTree(dest, path.join(mirror, 'Backup', name));
      await copyTree(cfg.archiveDir, path.join(mirror, 'Archivio')); // testi e dati di tutti i checkpoint, senza video
      await prune(path.join(mirror, 'Backup'), KEEP_DAILY);
      status.lastMirror = new Date().toISOString();
    }
    return name;
  } catch (err) {
    status.lastError = `Backup: ${err.message}`;
    throw err;
  }
}

// Copia della cartella del checkpoint (testi e dati, senza video) nella cartella aggiuntiva
async function mirrorFolder(absFolder) {
  const mirror = await cfg.getMirror();
  if (!mirror || !absFolder) return;
  const rel = path.relative(cfg.workDir, absFolder);
  try {
    await copyTree(absFolder, path.join(mirror, rel));
    status.lastMirror = new Date().toISOString();
  } catch (err) {
    status.lastError = `Copia aggiuntiva: ${err.message}`;
  }
}

function startScheduler() {
  const run = () => dailyBackup().catch((err) => console.error('Backup giornaliero non riuscito:', err.message));
  setTimeout(run, 5000);
  setInterval(run, 60 * 60 * 1000).unref();
}

async function lastBackups() {
  return (await fsp.readdir(cfg.backupDir).catch(() => [])).sort().reverse().slice(0, 10);
}

module.exports = { init, status, snapshot, listVersions, readVersion, describe, moveToTrash, listTrash, restoreFromTrash, purgeTrash, dailyBackup, mirrorFolder, startScheduler, lastBackups, copyTree };
