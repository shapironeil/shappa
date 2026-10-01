/**
 * Crea l'eseguibile portatile di Verbale Studio (un solo file, nessuna installazione).
 * Usa Node "Single Executable Applications": il server e l'interfaccia vengono incorporati nel binario di Node.
 *
 *   node packaging/build-exe.js            → Windows (x64) + sistema corrente
 *   node packaging/build-exe.js win        → solo Windows
 *   node packaging/build-exe.js linux mac  → altri sistemi
 *
 * Output in dist/. L'eseguibile lavora nella cartella in cui viene messo (archivio in ./data).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const TMP = path.join(__dirname, '.tmp');
const CACHE = path.join(__dirname, '.cache');
const VERSION = process.version; // il blob SEA deve essere generato con la stessa versione di Node del binario
const FUSE = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';

const TARGETS = {
  win: { url: `https://nodejs.org/dist/${VERSION}/win-x64/node.exe`, out: 'VerbaleStudio.exe' },
  linux: { url: `https://nodejs.org/dist/${VERSION}/node-${VERSION}-linux-x64.tar.xz`, inner: `node-${VERSION}-linux-x64/bin/node`, out: 'VerbaleStudio-linux' },
  mac: { url: `https://nodejs.org/dist/${VERSION}/node-${VERSION}-darwin-arm64.tar.gz`, inner: `node-${VERSION}-darwin-arm64/bin/node`, out: 'VerbaleStudio-mac', macho: true },
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(download(res.headers.location, dest));
        }
        if (res.statusCode !== 200) return reject(new Error(`${url} → ${res.statusCode}`));
        const out = fs.createWriteStream(dest);
        res.pipe(out);
        out.on('finish', () => out.close(resolve));
        out.on('error', reject);
      })
      .on('error', reject);
  });
}

async function nodeBinary(name) {
  const t = TARGETS[name];
  fs.mkdirSync(CACHE, { recursive: true });
  const bin = path.join(CACHE, `${name}-${VERSION}${name === 'win' ? '.exe' : ''}`);
  if (fs.existsSync(bin)) return bin;
  if (name === process.platform.replace('win32', 'win').replace('darwin', 'mac') && process.arch === 'x64' && name !== 'mac') {
    fs.copyFileSync(process.execPath, bin);
    return bin;
  }
  console.log(`  download ${t.url}`);
  if (!t.inner) {
    await download(t.url, bin);
    return bin;
  }
  const archive = path.join(CACHE, path.basename(t.url));
  if (!fs.existsSync(archive)) await download(t.url, archive);
  execFileSync('tar', ['-xf', archive, '-C', CACHE, t.inner]);
  fs.renameSync(path.join(CACHE, t.inner), bin);
  return bin;
}

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const abs = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(abs, base) : [path.relative(base, abs).split(path.sep).join('/')];
  });
}

async function main() {
  const wanted = process.argv.slice(2).length ? process.argv.slice(2) : ['win', process.platform === 'darwin' ? 'mac' : 'linux'];
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });

  console.log('1. Bundle del server');
  require('esbuild').buildSync({
    entryPoints: [path.join(ROOT, 'server.js')],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    outfile: path.join(TMP, 'server.cjs'),
    logLevel: 'warning',
  });

  console.log('2. Blob SEA (server + interfaccia)');
  const assets = {};
  for (const f of listFiles(path.join(ROOT, 'public'))) assets[`public/${f}`] = path.join(ROOT, 'public', f);
  const config = {
    main: path.join(TMP, 'server.cjs'),
    output: path.join(TMP, 'sea.blob'),
    disableExperimentalSEAWarning: true,
    useCodeCache: false,
    useSnapshot: false,
    assets,
  };
  fs.writeFileSync(path.join(TMP, 'sea-config.json'), JSON.stringify(config, null, 2));
  execFileSync(process.execPath, ['--experimental-sea-config', path.join(TMP, 'sea-config.json')], { stdio: 'inherit' });

  const postject = path.join(ROOT, 'node_modules', 'postject', 'dist', 'cli.js');
  for (const name of wanted) {
    const t = TARGETS[name];
    if (!t) throw new Error(`Target sconosciuto: ${name}`);
    console.log(`3. Eseguibile ${name}`);
    const out = path.join(OUT, t.out);
    fs.copyFileSync(await nodeBinary(name), out);
    const args = [postject, out, 'NODE_SEA_BLOB', config.output, '--sentinel-fuse', FUSE];
    if (t.macho) args.push('--macho-segment-name', 'NODE_SEA');
    execFileSync(process.execPath, args, { stdio: 'inherit' });
    if (name !== 'win') fs.chmodSync(out, 0o755);
    if (name === 'mac') console.log('   Nota: su Mac va firmato con `codesign --sign - VerbaleStudio-mac` prima dell’uso.');
    console.log(`   → ${path.relative(ROOT, out)} (${Math.round(fs.statSync(out).size / 1e6)} MB)`);
  }
  // Versione "alternativa" per chi ha Node installato: un solo file server.cjs + interfaccia
  fs.mkdirSync(path.join(OUT, 'node'), { recursive: true });
  fs.copyFileSync(path.join(TMP, 'server.cjs'), path.join(OUT, 'node', 'server.cjs'));
  fs.rmSync(TMP, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
