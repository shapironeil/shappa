/**
 * Integrazione opzionale con Claude API.
 * L'app funziona interamente senza: questi endpoint vengono usati solo se è configurata una API key.
 */
// Caricato solo quando serve: senza `npm install` l'app funziona comunque in modalità manuale
let AnthropicSdk = null;
function sdk() {
  if (!AnthropicSdk) {
    try {
      const m = require('@anthropic-ai/sdk');
      AnthropicSdk = m.default || m;
    } catch {
      throw Object.assign(new Error('SDK Claude non installato: esegui "npm install" nella cartella verbale-studio.'), { status: 500 });
    }
  }
  return AnthropicSdk;
}
const DEFAULT_MODEL = 'claude-opus-5';

function getClient(settings) {
  const apiKey = settings.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('API key Claude non configurata (Impostazioni). Puoi comunque compilare tutto a mano.'), { status: 400 });
  }
  const Anthropic = sdk();
  return new Anthropic({ apiKey });
}

const fmtTime = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(sec).padStart(2, '0')}`;
};

const transcriptText = (cues) =>
  cues.map((c) => `[${fmtTime(c.start)}] ${c.speaker ? c.speaker + ': ' : ''}${c.text}`).join('\n');

async function callJson(settings, { system, user, schema, effort = 'high', maxTokens = 32000 }) {
  const client = getClient(settings);
  const base = {
    model: settings.model || DEFAULT_MODEL,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' },
    output_config: { effort, format: { type: 'json_schema', schema } },
    system,
    messages: [{ role: 'user', content: user }],
  };
  const Anthropic = sdk();
  let message;
  try {
    message = await client.beta.messages
      .stream({ ...base, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
      .finalMessage();
  } catch (err) {
    // Se il modello/configurazione non supporta i fallback, riprova con la richiesta standard
    if (err instanceof Anthropic.BadRequestError && /fallback/i.test(err.message)) {
      message = await client.messages.stream(base).finalMessage();
    } else {
      throw wrapError(err);
    }
  }
  if (message.stop_reason === 'refusal') throw Object.assign(new Error('Richiesta rifiutata dal modello.'), { status: 502 });
  if (message.stop_reason === 'max_tokens') throw Object.assign(new Error('Risposta troncata: transcript troppo lungo.'), { status: 502 });
  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('Risposta AI non valida'), { status: 502 });
  }
}

function wrapError(err) {
  const Anthropic = sdk();
  if (err instanceof Anthropic.AuthenticationError) return Object.assign(new Error('API key non valida.'), { status: 401 });
  if (err instanceof Anthropic.RateLimitError) return Object.assign(new Error('Limite di richieste/crediti raggiunto. Riprova più tardi.'), { status: 429 });
  if (err instanceof Anthropic.APIConnectionError) return Object.assign(new Error('Impossibile contattare Claude API (rete).'), { status: 502 });
  if (err instanceof Anthropic.APIError) return Object.assign(new Error(`Errore Claude API: ${err.message}`), { status: 502 });
  return err;
}

// ---------------------------------------------------------------------------

const strArr = { type: 'array', items: { type: 'string' } };
const noteItem = {
  type: 'object',
  properties: { text: { type: 'string' }, note: { type: 'string' } },
  required: ['text', 'note'],
  additionalProperties: false,
};
const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    completed: { type: 'array', items: noteItem },
    inProgress: { type: 'array', items: noteItem },
    nextSteps: { type: 'array', items: noteItem },
    nextStepsNote: { type: 'string' },
    attention: {
      type: 'array',
      items: {
        type: 'object',
        properties: { text: { type: 'string' }, owner: { type: 'string' }, deadline: { type: 'string' } },
        required: ['text', 'owner', 'deadline'],
        additionalProperties: false,
      },
    },
    closingNotes: strArr,
  },
  required: ['completed', 'inProgress', 'nextSteps', 'nextStepsNote', 'attention', 'closingNotes'],
  additionalProperties: false,
};

async function generateSummary({ settings, project, checkpoint, previous }) {
  const cues = checkpoint.transcript?.cues || [];
  if (!cues.length && !checkpoint.notes) throw Object.assign(new Error('Transcript vuoto.'), { status: 400 });
  const prev = previous
    .map((c) => `### Checkpoint ${c.date}\n${JSON.stringify(c.summary)}`)
    .join('\n\n');
  const system = `Sei l'assistente di una consulente che redige il riepilogo dei checkpoint di progetto con il cliente ${project.name}.
Estrai dal transcript revisionato i punti per l'email di riepilogo, con lo stesso stile dell'email di esempio: italiano professionale, frasi nominali sintetiche, termini tecnici corretti.
Regole:
- Riporta solo ciò che è stato effettivamente detto nella riunione; non inventare attività, owner o date.
- Usa i checkpoint precedenti per dare continuità (es. attività prima "in corso" ora completate) e per riconoscere i nomi.
- "note" contiene un eventuale aggiornamento/esito dell'attività (es. "mandato in review dal GdL ai referenti"), altrimenti stringa vuota.
- "nextStepsNote" è un paragrafo di dettaglio su blocchi o criticità dei prossimi passi, altrimenti stringa vuota.
- Deadline nel formato gg/mm/aaaa, owner come "ATAC", "GdL" o nome; stringa vuota se non detti.
- "closingNotes": accordi generali (date dei prossimi incontri, pause, ecc.).`;
  const user = `## Email di esempio (stile e struttura)\n${project.exampleEmail}\n\n## Checkpoint precedenti\n${prev || '(nessuno)'}\n\n## Glossario\n${project.glossary || '-'}\n\n## Note della consulente\n${checkpoint.notes || '-'}\n\n## Transcript del checkpoint del ${checkpoint.date}\n${transcriptText(cues)}`;
  return callJson(settings, { system, user, schema: SUMMARY_SCHEMA, effort: 'high' });
}

const PROOF_SCHEMA = {
  type: 'object',
  properties: {
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, text: { type: 'string' } },
        required: ['id', 'text'],
        additionalProperties: false,
      },
    },
  },
  required: ['corrections'],
  additionalProperties: false,
};

async function proofread({ settings, project, cues }) {
  const system = `Correggi un transcript automatico di Microsoft Teams in italiano: refusi, punteggiatura, maiuscole, nomi propri e termini tecnici (vedi glossario). Non riassumere, non cambiare il senso, non riformulare lo stile parlato oltre il necessario. Restituisci solo i blocchi che hai modificato, con il testo completo corretto.`;
  const out = [];
  for (let i = 0; i < cues.length; i += 150) {
    const chunk = cues.slice(i, i + 150);
    const user = `Glossario: ${project.glossary || '-'}\n\nBlocchi (JSON):\n${JSON.stringify(chunk.map((c) => ({ id: c.id, speaker: c.speaker, text: c.text })))}`;
    const res = await callJson(settings, { system, user, schema: PROOF_SCHEMA, effort: 'low', maxTokens: 32000 });
    const byId = new Map(chunk.map((c) => [c.id, c]));
    for (const c of res.corrections || []) if (byId.has(c.id) && byId.get(c.id).text !== c.text) out.push(c);
  }
  return out;
}

const FORECAST_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          rationale: { type: 'string' },
          owner: { type: 'string' },
          priority: { type: 'string', enum: ['alta', 'media', 'bassa'] },
        },
        required: ['title', 'rationale', 'owner', 'priority'],
        additionalProperties: false,
      },
    },
    risks: strArr,
    agendaNote: { type: 'string' },
  },
  required: ['items', 'risks', 'agendaNote'],
  additionalProperties: false,
};

async function forecast({ settings, project, checkpoints, today }) {
  const system = `Sei un PMO del progetto ${project.name}. Dallo storico dei checkpoint prevedi i temi del prossimo checkpoint: attività in corso da verificare, prossimi passi da chiudere, punti di attenzione con deadline vicine o scadute, dipendenze bloccanti. Sii concreto e basato sullo storico, in italiano.`;
  const user = `Oggi: ${today}\n\n${checkpoints
    .map((c) => `### ${c.date} — ${c.title}\n${JSON.stringify(c.summary)}`)
    .join('\n\n')}`;
  return callJson(settings, { system, user, schema: FORECAST_SCHEMA, effort: 'medium', maxTokens: 16000 });
}

module.exports = { DEFAULT_MODEL, generateSummary, proofread, forecast };
