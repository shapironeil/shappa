/**
 * Integrazione con Ollama (AI locale, gratuita, gira sul tuo computer).
 * Usata per compiti semplici: riformulare una frase in stile verbale, correggere un blocco di transcript.
 * "Addestramento": crea un modello personalizzato (Modelfile) con il tuo stile, il glossario del progetto
 * e gli esempi presi dai verbali che hai approvato.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

const HOST = (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/$/, '');

const RECOMMENDED = [
  { name: 'qwen2.5:3b', size: '1,9 GB', note: 'Consigliato: veloce, buon italiano, va bene su un portatile' },
  { name: 'llama3.2:3b', size: '2,0 GB', note: 'Alternativa leggera' },
  { name: 'gemma3:4b', size: '3,3 GB', note: 'Più accurato, un po’ più lento' },
  { name: 'qwen2.5:7b', size: '4,7 GB', note: 'Qualità migliore, serve un PC con almeno 16 GB di RAM' },
];

const jobs = { install: null, pull: null, train: null };

async function call(pathname, body, { timeout = 120000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(HOST + pathname, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    if (!res.ok) throw Object.assign(new Error(`Ollama: ${text.slice(0, 200) || res.status}`), { status: 502 });
    return text ? JSON.parse(text) : {};
  } catch (err) {
    if (err.status) throw err;
    throw Object.assign(new Error('Ollama non è in esecuzione. Aprilo (o installalo) dalla finestra “AI locale”.'), { status: 503 });
  } finally {
    clearTimeout(t);
  }
}

async function status() {
  try {
    const [v, tags] = await Promise.all([call('/api/version', null, { timeout: 2500 }), call('/api/tags', null, { timeout: 2500 })]);
    return { running: true, version: v.version, models: (tags.models || []).map((m) => ({ name: m.name, size: m.size, modified: m.modified_at })) };
  } catch {
    return { running: false, models: [] };
  }
}

// ------------------------------------------------------------------ installazione

function download(url, dest, onProgress, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
          res.resume();
          return resolve(download(new URL(res.headers.location, url).toString(), dest, onProgress, redirects + 1));
        }
        if (res.statusCode !== 200) return reject(new Error(`Download fallito (${res.statusCode})`));
        const total = Number(res.headers['content-length']) || 0;
        let done = 0;
        const out = fs.createWriteStream(dest);
        res.on('data', (c) => {
          done += c.length;
          onProgress(done, total);
        });
        res.pipe(out);
        out.on('finish', () => out.close(resolve));
        out.on('error', reject);
      })
      .on('error', reject);
  });
}

function install() {
  if (jobs.install?.state === 'running') return jobs.install;
  const job = { state: 'running', message: 'Avvio…', completed: 0, total: 0 };
  jobs.install = job;
  (async () => {
    try {
      if (process.platform === 'win32') {
        const dest = path.join(os.tmpdir(), 'OllamaSetup.exe');
        job.message = 'Download di Ollama in corso…';
        await download('https://ollama.com/download/OllamaSetup.exe', dest, (d, t) => {
          job.completed = d;
          job.total = t;
        });
        job.message = 'Si apre l’installazione di Ollama: segui la procedura e poi torna qui.';
        exec(`start "" "${dest}"`);
        job.state = 'done';
      } else if (process.platform === 'darwin') {
        exec('open https://ollama.com/download/mac');
        job.message = 'Si apre la pagina di download: installa Ollama.app, aprila e torna qui.';
        job.state = 'done';
      } else {
        job.message = 'Su Linux esegui nel terminale: curl -fsSL https://ollama.com/install.sh | sh';
        job.state = 'done';
      }
    } catch (err) {
      job.state = 'error';
      job.message = err.message;
    }
  })();
  return job;
}

function startApp() {
  // Prova ad avviare Ollama se è installato ma non in esecuzione
  if (process.platform === 'win32') {
    const exe = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Ollama', 'ollama app.exe');
    exec(fs.existsSync(exe) ? `start "" "${exe}"` : 'start "" ollama serve');
  } else if (process.platform === 'darwin') exec('open -a Ollama');
  else exec('ollama serve');
}

// ------------------------------------------------------------------ modelli

function pull(model) {
  if (jobs.pull?.state === 'running') return jobs.pull;
  const job = { state: 'running', model, message: 'Avvio download…', completed: 0, total: 0 };
  jobs.pull = job;
  (async () => {
    try {
      const res = await fetch(HOST + '/api/pull', { method: 'POST', body: JSON.stringify({ model, stream: true }) });
      if (!res.ok) throw new Error(await res.text());
      const decoder = new TextDecoder();
      let buf = '';
      for await (const chunk of res.body) {
        buf += decoder.decode(chunk, { stream: true });
        let nl;
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const ev = JSON.parse(line);
          if (ev.error) throw new Error(ev.error);
          job.message = ev.status || job.message;
          if (ev.total) {
            job.total = ev.total;
            job.completed = ev.completed || 0;
          }
        }
      }
      job.state = 'done';
      job.message = `Modello ${model} pronto`;
    } catch (err) {
      job.state = 'error';
      job.message = err.message.includes('fetch') ? 'Ollama non è in esecuzione' : err.message;
    }
  })();
  return job;
}

async function removeModel(model) {
  const res = await fetch(HOST + '/api/delete', { method: 'DELETE', body: JSON.stringify({ model }) }).catch(() => null);
  if (!res?.ok) throw Object.assign(new Error('Impossibile eliminare il modello'), { status: 502 });
}

// ------------------------------------------------------------------ addestramento

const trainedName = (projectId) => `verbale-${String(projectId).replace(/[^a-z0-9-]/g, '')}`;

function systemPrompt(project, author) {
  return `Sei l'assistente di ${author || 'una consulente'} per i verbali delle riunioni di progetto con il cliente ${project.name}.
Scrivi in italiano professionale, conciso, con frasi nominali come nelle email di riepilogo (es. "Definizione della roadmap use case e del modello target (To-Be)").
Usa correttamente questi nomi e termini tecnici: ${project.glossary || '-'}.
Non inventare informazioni: se una frase non contiene un'attività o un punto utile, rispondi "-".
Rispondi solo con il testo richiesto, senza spiegazioni.`;
}

// examples: [{ source, text }] — frase originale del transcript → voce approvata dall'utente
async function train({ project, author, base, examples }) {
  const job = { state: 'running', message: 'Creazione del modello personalizzato…' };
  jobs.train = job;
  try {
    const messages = [];
    for (const ex of examples.slice(-40)) {
      messages.push({ role: 'user', content: `Riscrivi come voce del verbale: ${ex.source}` });
      messages.push({ role: 'assistant', content: ex.text });
    }
    await call('/api/create', { model: trainedName(project.id), from: base, system: systemPrompt(project, author), messages, stream: false }, { timeout: 600000 });
    job.state = 'done';
    job.message = `Modello ${trainedName(project.id)} creato con ${examples.length} esempi`;
    return { model: trainedName(project.id), examples: examples.length };
  } catch (err) {
    job.state = 'error';
    job.message = err.message;
    throw err;
  }
}

async function task({ model, project, author, task: kind, text, glossary }) {
  const trained = model.startsWith('verbale-');
  const system = trained ? undefined : systemPrompt(project, author);
  let prompt;
  if (kind === 'rewrite') prompt = `Riscrivi come voce del verbale: ${text}`;
  else if (kind === 'proofread')
    prompt = `Correggi solo refusi, punteggiatura, maiuscole e termini tecnici (${glossary || project.glossary || ''}) in questa frase trascritta automaticamente. Non riassumere e non cambiare il senso. Frase: ${text}`;
  else throw Object.assign(new Error('Compito non supportato'), { status: 400 });
  const messages = [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: prompt }];
  const res = await call('/api/chat', { model, messages, stream: false, options: { temperature: 0.2 } }, { timeout: 180000 });
  return String(res.message?.content || '').trim().replace(/^["«]|["»]$/g, '');
}

module.exports = { RECOMMENDED, jobs, status, install, startApp, pull, removeModel, train, task, trainedName };
