/**
 * Crea release/VerbaleStudio.zip: la cartella completa da estrarre e usare, per Windows e Mac.
 *   node packaging/build-package.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const STAGE = path.join(__dirname, '.tmp-package', 'VerbaleStudio');
const OUT = path.join(ROOT, 'release', 'VerbaleStudio.zip');

const CRLF = (s) => s.replace(/\r?\n/g, '\r\n');

execFileSync(process.execPath, [path.join(__dirname, 'build-exe.js'), 'win', 'mac'], { stdio: 'inherit' });

fs.rmSync(path.dirname(STAGE), { recursive: true, force: true });
const put = (rel, content, mode) => {
  const abs = path.join(STAGE, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (Buffer.isBuffer(content) || typeof content === 'string') fs.writeFileSync(abs, content);
  else fs.copyFileSync(content.from, abs);
  if (mode) fs.chmodSync(abs, mode);
};

put('VerbaleStudio.exe', { from: path.join(DIST, 'VerbaleStudio.exe') });
put('motore-mac/VerbaleStudio-mac', { from: path.join(DIST, 'VerbaleStudio-mac') }, 0o755);
put(
  'Avvia su Mac.command',
  `#!/bin/bash
# Avvia Verbale Studio su Mac usando questa cartella come cartella di lavoro
cd "$(dirname "$0")"
APP="motore-mac/VerbaleStudio-mac"
xattr -dr com.apple.quarantine . 2>/dev/null
codesign --sign - --force "$APP" >/dev/null 2>&1
"./$APP" "$(pwd)" --open
`,
  0o755
);
put('alternativa-node/server.cjs', { from: path.join(DIST, 'node', 'server.cjs') });
for (const f of fs.readdirSync(path.join(ROOT, 'public'))) put(`alternativa-node/public/${f}`, { from: path.join(ROOT, 'public', f) });
put(
  'alternativa-node/Avvia con Node (Windows).bat',
  CRLF(`@echo off
rem Alternativa all'eseguibile: richiede Node.js (https://nodejs.org)
where node >nul 2>nul || (echo Node.js non trovato: installalo da https://nodejs.org & pause & exit /b)
node "%~dp0server.cjs" "%~dp0.." --open
pause
`)
);
put(
  'alternativa-node/Avvia con Node (Mac).command',
  `#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js non trovato: installalo da https://nodejs.org"; read; exit 1; }
node server.cjs "$(cd .. && pwd)" --open
`,
  0o755
);
put('Registrazioni/Metti qui video e transcript di Teams.txt', CRLF(`Copia in questa cartella i file scaricati da Teams:
- la registrazione della riunione (.mp4)
- il transcript (.vtt oppure .docx)

In Verbale Studio li trovi nella sezione "Cartella di lavoro".
In alternativa trascinali direttamente nella finestra dell'app: verranno copiati in
Archivio\\<progetto>\\<data> <titolo>\\ insieme al transcript revisionato e all'email.
`));
put('LEGGIMI.txt', CRLF(`VERBALE STUDIO
==============

IMPORTANTE: prima estrai lo zip!
  Windows: tasto destro sul file zip -> "Estrai tutto..." -> scegli dove metterlo (es. Documenti).
  Se apri l'app direttamente dall'interno dello zip, quello che salvi va perso.

AVVIO
  Windows:  doppio clic su VerbaleStudio.exe
            Se compare "PC protetto da Windows": clic su "Ulteriori informazioni" -> "Esegui comunque".
            Si apre una finestra nera (e' il motore dell'app: lasciala aperta) e il browser.
  Mac:      tasto destro su "Avvia su Mac.command" -> Apri -> Apri (solo la prima volta).
            (Mac con processore Apple M1/M2/M3/M4)

  Per chiudere l'app chiudi la finestra nera / del Terminale.

SE L'ESEGUIBILE E' BLOCCATO (es. PC aziendale)
  Installa Node.js da https://nodejs.org e usa "alternativa-node\\Avvia con Node (Windows).bat".

COSA C'E' NELLA CARTELLA
  VerbaleStudio.exe    l'app per Windows (nessuna installazione)
  Registrazioni\\       metti qui i video e i transcript scaricati da Teams
  Archivio\\            creata dall'app: una cartella per ogni checkpoint, ordinata per progetto e data,
                       con registrazione, transcript originale, transcript revisionato ed email
  data\\                creata dall'app: archivio interno (checkpoint, template, apprendimento)

  Tutto resta su questo computer. Per il backup copia l'intera cartella VerbaleStudio.
`));

// zip con i permessi di esecuzione per i file Mac
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.rmSync(OUT, { force: true });
execFileSync('python3', [
  '-c',
  `
import os, sys, zipfile, stat
root, out = sys.argv[1], sys.argv[2]
base = os.path.dirname(root)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for d, _, files in os.walk(root):
        for f in sorted(files):
            p = os.path.join(d, f)
            info = zipfile.ZipInfo.from_file(p, os.path.relpath(p, base))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (os.stat(p).st_mode & 0xFFFF) << 16
            with open(p, 'rb') as fh:
                z.writestr(info, fh.read(), compresslevel=9)
`,
  STAGE,
  OUT,
]);
fs.rmSync(path.dirname(STAGE), { recursive: true, force: true });
console.log(`\n→ ${path.relative(ROOT, OUT)} (${Math.round(fs.statSync(OUT).size / 1e6)} MB)`);
