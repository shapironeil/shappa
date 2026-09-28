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

// Avvio con Node.js: cerca prima un Node "standalone" (zip estratto, senza installazione) dentro la cartella
function nodeLauncherBat(appRoot, serverPath) {
  return CRLF(`@echo off
setlocal
set "ROOT=${appRoot}"
set "NODE="
if exist "%ROOT%\\node\\node.exe" set "NODE=%ROOT%\\node\\node.exe"
rem Node.js standalone (zip estratto) dentro questa cartella, in "node\\" o nella cartella accanto (es. APPS\\node-v24…)
rem "Estrai tutto" di Windows crea spesso una cartella doppia: node-v…\\node-v…\\node.exe
for %%B in ("%ROOT%" "%ROOT%\\node" "%ROOT%\\..") do (
  for /d %%A in ("%%~B\\node-v*-win-x64") do (
    if not defined NODE if exist "%%~A\\node.exe" set "NODE=%%~A\\node.exe"
    if not defined NODE for /d %%D in ("%%~A\\node-v*-win-x64") do if exist "%%~D\\node.exe" set "NODE=%%~D\\node.exe"
  )
)
if not defined NODE (where node >nul 2>nul && set "NODE=node")
if not defined NODE (
  echo.
  echo  Node.js non trovato.
  echo.
  echo  Non serve installarlo: scarica lo zip "standalone" da
  echo    https://nodejs.org/dist/v22.22.2/node-v22.22.2-win-x64.zip
  echo  estrailo e metti la cartella "node-v22.22.2-win-x64" dentro la cartella VerbaleStudio
  echo  oppure accanto a essa ^(nella stessa cartella che contiene VerbaleStudio^).
  echo  Poi riavvia questo file.
  echo.
  start "" "https://nodejs.org/dist/v22.22.2/node-v22.22.2-win-x64.zip"
  pause
  exit /b
)
"%NODE%" "${serverPath}" "%ROOT%" --open
pause
`);
}


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
put('alternativa-node/Avvia con Node (Windows).bat', nodeLauncherBat('%~dp0..', '%~dp0server.cjs'));
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
  Non serve installare nulla: scarica Node.js "standalone" (zip)
    https://nodejs.org/dist/v22.22.2/node-v22.22.2-win-x64.zip
  estrailo, metti la cartella "node-v22.22.2-win-x64" dentro questa cartella VerbaleStudio
  e avvia "alternativa-node\\Avvia con Node (Windows).bat".

COSA C'E' NELLA CARTELLA
  VerbaleStudio.exe    l'app per Windows (nessuna installazione)
  Registrazioni\\       metti qui i video e i transcript scaricati da Teams
  Archivio\\            creata dall'app: una cartella per ogni checkpoint, ordinata per progetto e data,
                       con registrazione, transcript originale, transcript revisionato ed email
  data\\                creata dall'app: archivio interno (checkpoint, template, apprendimento)

  Tutto resta su questo computer. Per il backup copia l'intera cartella VerbaleStudio.
`));

// zip con i permessi di esecuzione per i file Mac
function zipDir(dir, out) {
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.rmSync(out, { force: true });
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
  dir,
  out,
]);
console.log(`→ ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`);
}
zipDir(STAGE, OUT);

// Versione leggera (senza eseguibili): Node.js standalone + app, piccola abbastanza da inviare via email/chat
const LIGHT = path.join(path.dirname(STAGE), 'light', 'VerbaleStudio');
const lput = (rel, content, mode) => {
  const abs = path.join(LIGHT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (typeof content === 'string') fs.writeFileSync(abs, content);
  else fs.copyFileSync(content.from, abs);
  if (mode) fs.chmodSync(abs, mode);
};
lput('app/server.cjs', { from: path.join(DIST, 'node', 'server.cjs') });
for (const f of fs.readdirSync(path.join(ROOT, 'public'))) lput(`app/public/${f}`, { from: path.join(ROOT, 'public', f) });
lput('Avvia Verbale Studio (Windows).bat', nodeLauncherBat('%~dp0.', '%~dp0app\\server.cjs'));
lput(
  'Avvia Verbale Studio (Mac).command',
  `#!/bin/bash
cd "$(dirname "$0")"
NODE=$(ls -d node*/bin/node 2>/dev/null | head -1)
[ -z "$NODE" ] && NODE=$(command -v node)
[ -z "$NODE" ] && { echo "Node.js non trovato: scarica lo zip standalone da https://nodejs.org e mettilo in questa cartella"; open https://nodejs.org/en/download; read; exit 1; }
"$NODE" app/server.cjs "$(pwd)" --open
`,
  0o755
);
lput('Registrazioni/Metti qui video e transcript di Teams.txt', fs.readFileSync(path.join(STAGE, 'Registrazioni', 'Metti qui video e transcript di Teams.txt'), 'utf8'));
lput('LEGGIMI.txt', CRLF(`VERBALE STUDIO - versione leggera
==================================

Funziona con Node.js "standalone": NON serve installare niente (va bene anche sui PC aziendali).

1. Estrai questo zip (tasto destro -> "Estrai tutto..."), ad esempio in Documenti.
2. Scarica Node.js standalone per Windows (e' uno zip, non un installer):
     https://nodejs.org/dist/v22.22.2/node-v22.22.2-win-x64.zip
   Estrailo e sposta la cartella "node-v22.22.2-win-x64" DENTRO la cartella VerbaleStudio:

     VerbaleStudio\
       Avvia Verbale Studio (Windows).bat
       node-v22.22.2-win-x64\     <- qui
       app\
       Registrazioni\

3. Doppio clic su "Avvia Verbale Studio (Windows).bat".
   Si apre una finestra nera (lasciala aperta) e il browser con l'app.
   Per chiudere l'app chiudi la finestra nera.

Registrazioni\  metti qui video e transcript di Teams (oppure trascinali nell'app)
Archivio\       creata dall'app: una cartella per ogni checkpoint (progetto / data titolo)
data\           creata dall'app: archivio interno

Tutto resta su questo computer. Backup: copia l'intera cartella VerbaleStudio.
`));
zipDir(LIGHT, path.join(ROOT, 'release', 'VerbaleStudio-leggero.zip'));
fs.rmSync(path.dirname(STAGE), { recursive: true, force: true });
