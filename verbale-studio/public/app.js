/* Verbale Studio — logica dell'interfaccia */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('vs.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('vs.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  const state = {
    projects: [],
    settings: {},
    workDir: '',
    project: null,
    checkpoints: [],
    history: null, // storico del progetto (riepiloghi di tutti i checkpoint)
    learning: null, // modello di apprendimento locale del progetto
    ollama: null, // stato AI locale
    cp: null,
    tpl: null,
    view: 'workspace',
    search: '',
    filter: 'all',
    activeIdx: -1,
    activeWord: -1,
    editingId: null,
    suggestions: new Map(),
    cueRoles: new Map(),
    lastUserScroll: 0,
    undo: null,
    analysisFilter: 'all',
    showDuplicates: false,
  };

  const video = $('#video');
  const trEl = $('#transcript');
  const ROLE_CLASS = { done: 'r-done', doing: 'r-doing', next: 'r-next', risk: 'r-risk', decision: 'r-decision', info: 'r-info' };

  // ------------------------------------------------------------------ utils
  async function api(method, url, body, raw) {
    const opts = { method, headers: {} };
    if (raw) opts.body = raw;
    else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers['Content-Type'] = 'application/json'; }
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Errore ${res.status}`);
    return data;
  }

  function toast(msg, { error, action, onAction, ms = 3500 } = {}) {
    const el = document.createElement('div');
    el.className = 'toast' + (error ? ' err' : '');
    el.textContent = msg;
    if (action) {
      const b = document.createElement('button');
      b.className = 'btn btn-sm btn-ghost';
      b.style.cssText = 'margin-left:10px;color:inherit;padding:1px 8px';
      b.textContent = action;
      b.onclick = () => { onAction(); el.remove(); };
      el.appendChild(b);
    }
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), action ? 8000 : ms);
  }

  function dialog(title, bodyHtml, { okText = 'OK', danger, wide } = {}) {
    const dlg = $('#dialog');
    $('#dlgTitle').textContent = title;
    $('#dlgBody').innerHTML = bodyHtml;
    $('#dlgOk').textContent = okText;
    $('#dlgOk').hidden = okText === null;
    $('#dlgOk').classList.toggle('danger', Boolean(danger));
    dlg.classList.toggle('wide', Boolean(wide));
    dlg.returnValue = '';
    dlg.showModal();
    const first = $('#dlgBody input, #dlgBody textarea, #dlgBody select');
    if (first) setTimeout(() => { first.focus(); first.select?.(); }, 30);
    return new Promise((resolve) => {
      dlg.addEventListener('close', () => {
        if (dlg.returnValue !== 'ok') return resolve(null);
        const values = {};
        $$('#dlgBody [name]').forEach((i) => (values[i.name] = i.type === 'checkbox' ? i.checked : i.value));
        resolve(values);
      }, { once: true });
    });
  }
  const confirmDlg = (title, text, okText = 'Conferma', danger = false) =>
    dialog(title, `<p class="muted">${esc(text)}</p>`, { okText, danger }).then((v) => v !== null);

  async function busy(btn, fn) {
    btn.classList.add('busy');
    btn.disabled = true;
    try { return await fn(); } catch (e) { toast(e.message, { error: true }); } finally { btn.classList.remove('busy'); btn.disabled = false; }
  }

  const today = () => new Date().toISOString().slice(0, 10);
  const itDate = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
  const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const monthLabel = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
  const longDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtT = (s) => Transcript.fmtShort(s);
  const fmtSize = (b) => (b > 1e9 ? (b / 1e9).toFixed(1) + ' GB' : b > 1e6 ? Math.round(b / 1e6) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB');
  const parseItDate = (s) => {
    const m = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s || '');
    if (!m) return null;
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return new Date(y, Number(m[2]) - 1, Number(m[1]), 12);
  };
  const similar = (a, b) => Analysis.similarity(a, b);
  const hashKey = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return 'k' + (h >>> 0).toString(36); };
  function cleanSentence(t) {
    let s = String(t).replace(/^\s*((allora|quindi|ok(ay)?|sì|no|ecco|diciamo|praticamente|comunque|poi|e|ma|però|niente|va bene)[,\s]+)+/i, '').trim();
    s = s.replace(/\s+/g, ' ');
    return s ? s[0].toUpperCase() + s.slice(1) : s;
  }
  function download(name, content, type = 'text/plain;charset=utf-8') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const roleLabel = (r) => Templates.ROLES[r] || r;
  const rolePill = (r) => `<span class="pill role ${ROLE_CLASS[r] || ''}">${esc(roleLabel(r))}</span>`;
  const tplFor = (c) => Templates.get(c?.templateId || state.project?.templateId);

  // ------------------------------------------------------------------ theme & sidebar
  function applyTheme(t) {
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    $$('#themeSeg .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.theme === t));
    LS.set('theme', t);
  }
  function setSidebar(open) {
    $('#app').classList.toggle('sb-collapsed', !open);
    LS.set('sidebar', open);
  }
  const sidebarOpen = () => !$('#app').classList.contains('sb-collapsed');

  // ------------------------------------------------------------------ save
  let saveTimer = null;
  let saving = Promise.resolve();
  function markDirty() {
    if (!state.cp) return;
    $('#saveState').textContent = 'Modifiche non salvate…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 700);
  }
  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!state.cp) return saving;
    const cp = state.cp;
    const payload = { title: cp.title, date: cp.date, status: cp.status, templateId: cp.templateId, transcript: cp.transcript, notes: cp.notes, summary: cp.summary, email: cp.email, analysis: cp.analysis };
    saving = saving.then(() =>
      api('PUT', `/api/projects/${cp.projectId}/checkpoints/${cp.id}`, payload)
        .then((r) => {
          if (state.cp === cp) { cp.folder = r.folder; cp.transcriptFile = r.transcriptFile; if (r.video) cp.video = r.video; }
          $('#saveState').textContent = `Salvato ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
          const s = state.checkpoints.find((c) => c.id === cp.id);
          if (s) { Object.assign(s, { title: cp.title, date: cp.date, status: cp.status }); renderCheckpointList(); }
          state.history = null; // lo storico va ricaricato
        })
        .catch((e) => { $('#saveState').textContent = 'Errore di salvataggio'; toast(e.message, { error: true }); })
    );
    return saving;
  }
  window.addEventListener('beforeunload', (e) => {
    if (saveTimer) { saveNow(); e.preventDefault(); }
  });

  let learnTimer = null;
  function learnFrom(text, role) {
    if (!state.project || !text) return;
    state.learning = Analysis.learn(state.learning, text, role);
    clearTimeout(learnTimer);
    const pid = state.project.id;
    learnTimer = setTimeout(() => api('PUT', `/api/projects/${pid}/learning`, state.learning).catch(() => {}), 1500);
  }

  // ------------------------------------------------------------------ bootstrap
  async function init() {
    applyTheme(LS.get('theme', 'auto'));
    setSidebar(LS.get('sidebar', window.innerWidth > 1100));
    restoreSizes();
    bindEvents();
    const [data, custom] = await Promise.all([api('GET', '/api/state'), api('GET', '/api/templates')]);
    Templates.setCustom(custom);
    state.projects = data.projects;
    state.settings = data.settings;
    state.workDir = data.workDir;
    if (data.runningFromTemp) $('#tempBanner').hidden = false;
    applySettings();
    refreshOllama();
    const pid = LS.get('project', null);
    await selectProject(state.projects.find((p) => p.id === pid) ? pid : state.projects[0]?.id);
    setView(LS.get('view', 'workspace'));
  }

  function applySettings() {
    document.body.classList.toggle('no-ai', !state.settings.hasApiKey);
  }

  async function refreshOllama() {
    try {
      state.ollama = await api('GET', `/api/ollama/status?projectId=${state.project?.id || ''}`);
    } catch {
      state.ollama = { running: false, models: [] };
    }
    const ready = state.ollama.running && state.settings.ollamaModel && state.ollama.models.some((m) => m.name === state.settings.ollamaModel || m.name.startsWith(state.settings.ollamaModel + ':'));
    document.body.classList.toggle('no-local-ai', !ready);
    return state.ollama;
  }

  async function localAi(task, text) {
    const res = await api('POST', '/api/ollama/task', { projectId: state.project.id, task, text });
    return res.text;
  }

  async function loadHistory(force) {
    if (!state.history || force) state.history = await api('GET', `/api/projects/${state.project.id}/history`);
    return state.history;
  }
  // Storico con le voci di ogni checkpoint classificate per ruolo (cronologico)
  function historyItems(h) {
    return h.checkpoints
      .map((c) => ({ id: c.id, date: c.date, title: c.title, status: c.status, duration: c.duration, cueCount: c.cueCount, tpl: tplFor(c), summary: c.summary }))
      .map((c) => ({ ...c, items: Templates.roleItems(c.summary ? Templates.normalize(c.summary, c.tpl) : null, c.tpl) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async function selectProject(pid) {
    await saveNow();
    state.project = state.projects.find((p) => p.id === pid) || null;
    state.history = null;
    LS.set('project', pid);
    renderProjectSelect();
    if (!state.project) return;
    const [list, learning] = await Promise.all([api('GET', `/api/projects/${pid}/checkpoints`), api('GET', `/api/projects/${pid}/learning`)]);
    state.checkpoints = list;
    state.learning = learning;
    renderCheckpointList();
    const lastCp = LS.get('cp.' + pid, null);
    const target = state.checkpoints.find((c) => c.id === lastCp) || state.checkpoints[0];
    if (target) await openCheckpoint(target.id, { keepView: true });
    else showNoCheckpoint();
    setView(state.view);
  }

  function renderProjectSelect() {
    $('#projectSelect').innerHTML = state.projects.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    if (state.project) $('#projectSelect').value = state.project.id;
    const dir = state.workDir.split(/[\\/]/).filter(Boolean).pop() || state.workDir;
    $('#localInfo').textContent = `Cartella: ${dir}`;
    $('#localInfo').title = state.workDir;
  }

  function renderCheckpointList() {
    const q = $('#cpFilter').value.trim().toLowerCase();
    const list = state.checkpoints
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((c) => !q || c.title.toLowerCase().includes(q) || itDate(c.date).includes(q));
    let html = '';
    let month = '';
    for (const c of list) {
      const m = monthLabel(c.date);
      if (m !== month) { html += `<div class="sb-month">${m}</div>`; month = m; }
      html += `<button class="cp-item ${state.cp?.id === c.id ? 'active' : ''}" data-id="${c.id}" title="${esc(c.status)}">
        <span class="cp-date">${c.date.slice(8, 10)}/${c.date.slice(5, 7)}</span>
        <span class="cp-title">${esc(c.title)}</span>
        <span class="status-dot" data-s="${esc(c.status)}"></span></button>`;
    }
    $('#checkpointList').innerHTML = html || `<div class="sb-month">Nessun checkpoint</div>`;
  }

  function showNoCheckpoint() {
    state.cp = null;
    $('#noCheckpoint').hidden = false;
    $('.tb-title').style.visibility = 'hidden';
    $('.tb-right').style.visibility = 'hidden';
    video.removeAttribute('src');
    video.load();
  }

  async function openCheckpoint(id, { keepView } = {}) {
    await saveNow();
    const cp = await api('GET', `/api/projects/${state.project.id}/checkpoints/${id}`);
    cp.templateId = cp.templateId || state.project.templateId || 'checkpoint-settimanale';
    state.tpl = Templates.get(cp.templateId);
    cp.summary = Templates.normalize(cp.summary, state.tpl);
    cp.email = cp.email || { subject: '', body: '', edited: false };
    cp.transcript = cp.transcript || { sourceName: '', cues: [] };
    cp.analysis = cp.analysis || { dismissed: [], added: [] };
    state.cp = cp;
    state.activeIdx = -1;
    state.editingId = null;
    state.suggestions.clear();
    state.cueRoles.clear();
    state.undo = null;
    LS.set('cp.' + state.project.id, id);
    $('#noCheckpoint').hidden = true;
    $('.tb-title').style.visibility = '';
    $('.tb-right').style.visibility = '';
    $('#cpTitle').value = cp.title;
    $('#cpDate').value = cp.date;
    $('#cpStatus').value = cp.status;
    $('#notes').value = cp.notes || '';
    $('#saveState').textContent = cp.updatedAt ? `Salvato ${new Date(cp.updatedAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : '';
    loadVideo();
    renderTplSelect();
    renderTranscript();
    renderSummaryEditor();
    renderEmail();
    renderCheckpointList();
    refreshAnalysisPanels();
    if (!keepView && state.view !== 'workspace') setView('workspace');
    if (window.innerWidth <= 1100) setSidebar(false);
  }

  // ------------------------------------------------------------------ views
  function setView(v) {
    if (!state.cp && v === 'workspace') showNoCheckpoint();
    state.view = v;
    LS.set('view', v);
    $$('.view').forEach((el) => (el.hidden = el.id !== `view-${v}`));
    $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
    const ws = v === 'workspace';
    $('.tb-title').style.visibility = ws && state.cp ? '' : 'hidden';
    $('.tb-right').style.visibility = ws && state.cp ? '' : 'hidden';
    const render = { history: renderHistory, forecast: renderForecastView, settings: renderSettings, folder: renderFolder, templates: renderTemplates, localai: renderLocalAi }[v];
    if (render) Promise.resolve(render()).catch((e) => toast(e.message, { error: true }));
    if (!ws) video.pause();
    if (window.innerWidth <= 1100) setSidebar(false);
  }

  // ------------------------------------------------------------------ video
  function loadVideo() {
    const pane = $('#videoPane');
    if (state.cp?.video) {
      video.src = `/media/${state.cp.projectId}/${state.cp.id}?v=${encodeURIComponent(state.cp.video.uploadedAt || '')}`;
      pane.classList.remove('empty');
    } else {
      video.removeAttribute('src');
      video.load();
      pane.classList.add('empty');
    }
    updateTime();
  }

  function uploadVideo(file) {
    if (!state.cp) return toast('Crea prima un checkpoint', { error: true });
    const cp = state.cp;
    const bar = $('#uploadBar');
    bar.hidden = false;
    video.src = URL.createObjectURL(file); // anteprima immediata mentre viene copiato
    $('#videoPane').classList.remove('empty');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/projects/${cp.projectId}/checkpoints/${cp.id}/video?name=${encodeURIComponent(file.name)}`);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const p = Math.round((e.loaded / e.total) * 100);
      $('#uploadFill').style.width = p + '%';
      $('#uploadText').textContent = `Copia in Archivio/${state.project.name}… ${p}%`;
    };
    xhr.onload = () => {
      bar.hidden = true;
      if (xhr.status >= 300) return toast('Errore nel salvataggio del video', { error: true });
      const v = JSON.parse(xhr.responseText);
      if (state.cp?.id === cp.id) state.cp.video = v;
      toast(`Video copiato in ${v.external}`);
    };
    xhr.onerror = () => { bar.hidden = true; toast('Errore nel caricamento del video', { error: true }); };
    xhr.send(file);
  }

  function togglePlay() {
    if (!video.src) return;
    video.paused ? video.play() : video.pause();
  }
  function seekTo(t, play) {
    if (!video.src) return;
    video.currentTime = Math.max(0, t);
    if (play) video.play();
    syncTranscript(true);
  }
  let seeking = false;
  function updateTime() {
    const d = Number.isFinite(video.duration) ? video.duration : 0;
    $('#timeLabel').textContent = `${fmtT(video.currentTime || 0)} / ${fmtT(d)}`;
    if (!seeking) $('#seek').value = d ? Math.round((video.currentTime / d) * 1000) : 0;
    $('#playIcon').innerHTML = video.paused ? '<path d="M6 4.5v11l9-5.5z"/>' : '<path d="M6.5 4.5v11M13.5 4.5v11"/>';
  }
  // Salta a un momento del transcript anche se il video non c'è
  function jumpTo(t, play = true) {
    if (video.src) seekTo(t, play);
    const i = findActive(t);
    const el = cueEl(i);
    if (el) {
      if (state.view !== 'workspace') setView('workspace');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      state.lastUserScroll = Date.now();
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 1200);
    }
  }

  // ------------------------------------------------------------------ transcript
  const SPEAKER_COLORS = ['#c96442', '#4f7d9c', '#5c8a4f', '#9a6fb0', '#b7791f', '#3f8f8a', '#b0506f', '#6f7a3a'];
  let speakerCache = [];
  function speakerColor(name) {
    const i = speakerCache.findIndex((s) => s.name === name);
    return SPEAKER_COLORS[(i < 0 ? 0 : i) % SPEAKER_COLORS.length];
  }
  function speakersList() {
    const map = new Map();
    for (const c of cues()) {
      if (!c.speaker) continue;
      const s = map.get(c.speaker) || { name: c.speaker, count: 0, time: 0 };
      s.count++;
      s.time += c.end - c.start;
      map.set(c.speaker, s);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  const cues = () => state.cp?.transcript.cues || [];

  function highlight(text) {
    const safe = esc(text);
    if (!state.search) return safe;
    const q = state.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return safe.replace(new RegExp(esc(q), 'gi'), (m) => `<mark>${m}</mark>`);
  }

  function cueHtml(c, i) {
    const sugg = state.suggestions.get(c.id);
    const role = state.cueRoles.get(c.id);
    const cls = ['cue', c.flagged && 'flagged', c.reviewed && 'reviewed', i === state.activeIdx && 'active'].filter(Boolean).join(' ');
    return `<div class="${cls}" data-id="${c.id}" data-i="${i}">
      <button class="cue-time" data-act="seek" title="Vai a questo punto">${fmtT(c.start)}</button>
      <div class="cue-body">
        ${c.speaker ? `<span class="cue-speaker" data-act="speaker" style="color:${speakerColor(c.speaker)}">${esc(c.speaker)}</span>` : ''}
        ${role ? `<span class="cue-role ${ROLE_CLASS[role]}" data-act="analysis" title="Punto rilevato: apri l'analisi">${esc(roleLabel(role))}</span>` : ''}
        <div class="cue-text" data-act="edit">${i === state.activeIdx ? wordsHtml(c) : highlight(c.text)}</div>
        ${sugg != null ? suggHtml(c.text, sugg) : ''}
      </div>
      <div class="cue-tools">
        <button class="icon-btn flag-btn" data-act="flag" title="Segna da verificare"><svg viewBox="0 0 20 20"><path d="M5 17V3.5M5 4h9l-2 3.5 2 3.5H5"/></svg></button>
        <button class="icon-btn local-ai-only" data-act="fix" title="Correggi con AI locale"><svg viewBox="0 0 20 20"><path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/></svg></button>
        <button class="icon-btn" data-act="merge" title="Unisci con il successivo"><svg viewBox="0 0 20 20"><path d="M10 4v12M6 12l4 4 4-4"/></svg></button>
        <button class="icon-btn" data-act="delete" title="Elimina blocco"><svg viewBox="0 0 20 20"><path d="M5 6h10M8 6V4h4v2M6.5 6l.7 10h5.6l.7-10"/></svg></button>
      </div>
    </div>`;
  }

  function renderTranscript() {
    const list = cues();
    speakerCache = speakersList();
    if (!list.length) {
      trEl.innerHTML = `<div class="tr-empty"><strong>Nessun transcript</strong>Trascina qui il file scaricato da Teams (.vtt o .docx),<br>usa il pulsante <em>Transcript</em> in alto oppure la <em>Cartella di lavoro</em>.</div>`;
      $('#speakers').innerHTML = '';
      updateProgress();
      return;
    }
    let html = '';
    let matches = 0;
    const q = state.search.toLowerCase();
    list.forEach((c, i) => {
      if (state.filter === 'flagged' && !c.flagged) return;
      if (state.filter === 'points' && !state.cueRoles.has(c.id)) return;
      if (q) {
        const hay = (c.text + ' ' + c.speaker).toLowerCase();
        if (!hay.includes(q)) return;
        matches += hay.split(q).length - 1;
      }
      html += cueHtml(c, i);
    });
    trEl.innerHTML = html || `<div class="tr-empty">Nessun risultato</div>`;
    $('#searchCount').textContent = q ? `${matches} risultat${matches === 1 ? 'o' : 'i'}` : '';
    $('#speakers').innerHTML = speakerCache
      .map((s) => `<span class="speaker-chip" data-speaker="${esc(s.name)}" title="Clic per rinominare"><i style="background:${speakerColor(s.name)}"></i>${esc(s.name)} <small>${Math.max(1, Math.round(s.time / 60))} min</small></span>`)
      .join('');
    trEl.classList.toggle('follow-mode', state.activeIdx >= 0 && !q && state.filter === 'all');
    updateProgress();
    renderSuggestBar();
  }

  function updateProgress() {
    const list = cues();
    const rev = list.filter((c) => c.reviewed).length;
    const flagged = list.filter((c) => c.flagged).length;
    const pct = list.length ? Math.round((rev / list.length) * 100) : 0;
    $('#reviewFill').style.width = pct + '%';
    $('#reviewLabel').textContent = list.length
      ? `Revisionati ${rev}/${list.length} blocchi (${pct}%)${flagged ? ` · ⚑ ${flagged} da verificare` : ''}${state.cp.transcript.sourceName ? ` · ${state.cp.transcript.sourceName}` : ''}`
      : '';
  }

  // --- parole con timing stimato (effetto "testo della canzone")
  function wordTimes(c) {
    const words = c.text.split(/(\s+)/).filter((w) => w.length);
    const tokens = words.filter((w) => !/^\s+$/.test(w));
    const weights = tokens.map((w) => w.length + 2);
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    const starts = weights.map((w) => { const s = acc / total; acc += w; return s; });
    return { words, starts };
  }
  function wordsHtml(c) {
    const { words } = wordTimes(c);
    let wi = 0;
    return words.map((w) => (/^\s+$/.test(w) ? w : `<span class="w" data-w="${wi++}">${highlight(w)}</span>`)).join('');
  }

  function findActive(t) {
    const list = cues();
    let lo = 0, hi = list.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid].start <= t + 0.05) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  }

  const cueEl = (i) => trEl.querySelector(`.cue[data-i="${i}"]`);

  function setActive(idx) {
    const list = cues();
    const prev = state.activeIdx;
    if (prev === idx) return;
    // Un blocco ascoltato fino alla fine si considera revisionato
    if (prev >= 0 && idx === prev + 1 && !video.paused && list[prev] && !list[prev].reviewed) {
      list[prev].reviewed = true;
      cueEl(prev)?.classList.add('reviewed');
      updateProgress();
      markDirty();
    }
    const pe = cueEl(prev);
    if (pe) {
      pe.classList.remove('active');
      if (state.editingId !== list[prev]?.id) pe.querySelector('.cue-text').innerHTML = highlight(list[prev].text);
    }
    state.activeIdx = idx;
    state.activeWord = -1;
    const el = cueEl(idx);
    if (el) {
      el.classList.add('active');
      if (state.editingId !== list[idx].id) el.querySelector('.cue-text').innerHTML = wordsHtml(list[idx]);
    }
    trEl.classList.toggle('follow-mode', idx >= 0 && !state.search && state.filter === 'all');
    autoScroll();
  }

  function autoScroll(force) {
    if (!$('#followToggle').checked || state.editingId) return;
    if (!force && Date.now() - state.lastUserScroll < 4000) return;
    const el = cueEl(state.activeIdx);
    if (!el) return;
    trEl.scrollTo({ top: el.offsetTop - trEl.clientHeight * 0.32, behavior: force ? 'auto' : 'smooth' });
  }

  function syncTranscript(force) {
    if (!state.cp) return;
    const t = video.currentTime || 0;
    const idx = findActive(t);
    if (force) state.lastUserScroll = 0;
    setActive(idx);
    if (force) autoScroll(true);
    const c = cues()[idx];
    if (!c || state.editingId === c.id) return;
    const dur = Math.max(0.3, c.end - c.start);
    const frac = Math.min(1, Math.max(0, (t - c.start) / dur));
    const { starts } = wordTimes(c);
    let w = 0;
    while (w + 1 < starts.length && starts[w + 1] <= frac) w++;
    if (t > c.end) w = starts.length;
    if (w === state.activeWord) return;
    state.activeWord = w;
    const el = cueEl(idx);
    if (!el) return;
    el.querySelectorAll('.w').forEach((s) => {
      const k = Number(s.dataset.w);
      s.classList.toggle('on', k < w);
      s.classList.toggle('now', k === w);
    });
  }

  let rafId = null;
  function loop() {
    syncTranscript();
    updateTime();
    rafId = video.paused ? null : requestAnimationFrame(loop);
  }

  // --- modifica dei blocchi
  function startEdit(id) {
    const list = cues();
    const i = list.findIndex((c) => c.id === id);
    if (i < 0) return;
    if (state.editingId) commitEdit();
    const el = cueEl(i);
    if (!el) return;
    state.editingId = id;
    const box = el.querySelector('.cue-text');
    const ta = document.createElement('textarea');
    ta.className = 'cue-edit';
    ta.value = list[i].text;
    ta.spellcheck = true;
    box.replaceWith(ta);
    const fit = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
    fit();
    ta.addEventListener('input', fit);
    ta.focus();
    ta.addEventListener('blur', () => setTimeout(() => { if (state.editingId === id) commitEdit(); }, 0));
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); commitEdit(); trEl.focus(); }
      else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        const j = i + (e.shiftKey ? -1 : 1);
        if (list[j]) { startEdit(list[j].id); cueEl(j)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      }
    });
  }

  function commitEdit() {
    const id = state.editingId;
    if (!id) return;
    state.editingId = null;
    const list = cues();
    const i = list.findIndex((c) => c.id === id);
    const el = cueEl(i);
    const ta = el?.querySelector('.cue-edit');
    if (i >= 0 && ta) {
      const val = ta.value.replace(/\s+/g, ' ').trim();
      if (val && val !== list[i].text) { list[i].text = val; state.suggestions.delete(id); }
      list[i].reviewed = true;
      markDirty();
      el.outerHTML = cueHtml(list[i], i);
      state.activeWord = -1;
      updateProgress();
    }
  }

  function snapshot() {
    state.undo = { cues: JSON.parse(JSON.stringify(cues())) };
  }
  function offerUndo(msg) {
    toast(msg, {
      action: 'Annulla',
      onAction: () => {
        if (!state.undo) return;
        state.cp.transcript.cues = state.undo.cues;
        state.undo = null;
        renderTranscript();
        markDirty();
      },
    });
  }

  async function renameSpeaker(old) {
    const v = await dialog('Rinomina speaker', `<p class="muted small">Tutti i blocchi di “${esc(old)}” verranno aggiornati.</p><input class="input" name="name" value="${esc(old)}" />`, { okText: 'Rinomina' });
    if (!v || !v.name.trim() || v.name.trim() === old) return;
    snapshot();
    cues().forEach((c) => { if (c.speaker === old) c.speaker = v.name.trim(); });
    renderTranscript();
    markDirty();
    offerUndo('Speaker rinominato');
  }

  const FILLERS = /(^|[\s,])(?:e+hm+|e+h+|u+hm+|u+h+|m+h+m+|mmm+|ehm+)(?=[\s,.?!]|$)[,]?/gi;
  function cleanupText(t) {
    let s = ' ' + t + ' ';
    s = s.replace(FILLERS, '$1');
    s = s.replace(/\b(\p{L}+)(\s+\1\b)+/giu, '$1'); // parole ripetute "il il"
    s = s.replace(/\s+([,.;:?!])/g, '$1').replace(/([,.;:?!])(?=\p{L})/gu, '$1 ').replace(/,\s*,/g, ',').replace(/\s{2,}/g, ' ').trim();
    s = s.replace(/^[,;.\s]+/, '');
    if (s) s = s[0].toUpperCase() + s.slice(1);
    return s;
  }

  // --- suggerimenti di correzione (AI)
  function wordDiff(a, b) {
    const A = a.split(/\s+/), B = b.split(/\s+/);
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    let i = 0, j = 0, out = '';
    while (i < n && j < m) {
      if (A[i] === B[j]) { out += esc(A[i]) + ' '; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out += `<del>${esc(A[i])}</del> `; i++; }
      else { out += `<ins>${esc(B[j])}</ins> `; j++; }
    }
    while (i < n) out += `<del>${esc(A[i++])}</del> `;
    while (j < m) out += `<ins>${esc(B[j++])}</ins> `;
    return out;
  }
  function suggHtml(orig, sugg) {
    return `<div class="sugg">${wordDiff(orig, sugg)}<div class="row"><button class="btn btn-sm btn-primary" data-act="accept">Accetta</button><button class="btn btn-sm btn-ghost" data-act="reject">Rifiuta</button></div></div>`;
  }
  function renderSuggestBar() {
    const n = state.suggestions.size;
    $('#suggestBar').hidden = !n;
    $('#suggestText').textContent = `${n} correzion${n === 1 ? 'e' : 'i'} suggerit${n === 1 ? 'a' : 'e'}`;
  }
  function applySuggestion(id, accept) {
    const list = cues();
    const i = list.findIndex((c) => c.id === id);
    if (accept && i >= 0) { list[i].text = state.suggestions.get(id); markDirty(); }
    state.suggestions.delete(id);
    const el = cueEl(i);
    if (el) el.outerHTML = cueHtml(list[i], i);
    renderSuggestBar();
  }

  // --- import
  function applyTranscript(text, sourceName, sourcePath) {
    const parsed = Transcript.parseTranscript(text);
    state.cp.transcript = { sourceName, sourcePath: sourcePath || '', importedAt: new Date().toISOString(), cues: parsed };
    state.activeIdx = -1;
    state.suggestions.clear();
    if (state.cp.status === 'bozza') { state.cp.status = 'in revisione'; $('#cpStatus').value = state.cp.status; }
    renderTranscript();
    syncTranscript(true);
    refreshAnalysisPanels();
    markDirty();
    toast(`Importati ${parsed.length} blocchi da ${sourceName}`);
  }
  async function confirmReplaceTranscript(name) {
    return !cues().length || confirmDlg('Sostituire il transcript?', `Il checkpoint contiene già ${cues().length} blocchi. Verranno sostituiti da quelli di “${name}”.`, 'Sostituisci', true);
  }
  // Copia il file transcript originale nella cartella del checkpoint (Archivio/…), dopo il salvataggio
  function archiveTranscript({ file, rel }) {
    const cp = state.cp;
    saveNow();
    saving = saving.then(() => {
      const q = rel ? `rel=${encodeURIComponent(rel)}` : `name=${encodeURIComponent(file.name)}`;
      return api('PUT', `/api/projects/${cp.projectId}/checkpoints/${cp.id}/transcript-file?${q}`, undefined, file || '')
        .then((r) => { cp.transcriptFile = r.transcriptFile; })
        .catch((e) => toast('Copia del transcript non riuscita: ' + e.message, { error: true }));
    });
  }

  async function importTranscriptFile(file) {
    if (!state.cp) return toast('Crea prima un checkpoint', { error: true });
    try {
      const text = /\.docx$/i.test(file.name) ? (await api('POST', '/api/docx-text', undefined, file)).text : await file.text();
      Transcript.parseTranscript(text); // valida prima di chiedere conferma
      if (!(await confirmReplaceTranscript(file.name))) return;
      applyTranscript(text, file.name);
      archiveTranscript({ file });
    } catch (e) {
      toast(e.message, { error: true });
    }
  }

  function routeFile(file) {
    if (/\.(vtt|srt|txt|docx)$/i.test(file.name)) importTranscriptFile(file);
    else if (/^(video|audio)\//.test(file.type) || /\.(mp4|m4v|mov|webm|mkv|m4a|mp3|wav)$/i.test(file.name)) uploadVideo(file);
    else toast(`Formato non supportato: ${file.name}`, { error: true });
  }

  // ------------------------------------------------------------------ template & punti discussi
  function renderTplSelect() {
    const opts = Templates.all().map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
    $('#tplSelect').innerHTML = opts;
    $('#tplSelect').value = state.cp?.templateId || '';
  }

  async function changeTemplate(id) {
    const from = state.tpl;
    const to = Templates.get(id);
    const hasContent = Templates.roleItems(state.cp.summary, from).length > 0;
    if (hasContent && !(await confirmDlg('Cambiare template?', `Le voci verranno spostate nelle sezioni equivalenti di “${to.name}” (stesso ruolo: completato, in corso, prossimo passo…).`, 'Cambia'))) {
      $('#tplSelect').value = from.id;
      return;
    }
    state.cp.summary = Templates.convert(state.cp.summary, from, to);
    state.cp.templateId = to.id;
    state.tpl = to;
    state.cp.email.edited = false;
    renderSummaryEditor();
    renderEmail(true);
    refreshAnalysisPanels();
    markDirty();
  }

  function autosize(ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }

  function relatedFor(text) {
    if (!state.history) return [];
    return Analysis.related(text, historyItems(state.history).filter((c) => c.date <= state.cp.date), state.cp.id);
  }

  function renderSummaryEditor() {
    const tpl = state.tpl;
    const s = state.cp.summary;
    const itemSecs = Templates.itemSections(tpl);
    let html = '';
    for (const sec of tpl.sections) {
      if (sec.kind === 'paragraph') {
        html += `<div class="sum-section" data-para-sec="${sec.key}"><div class="sum-head"><h4>${esc(sec.title)}</h4>${rolePill(sec.role)}</div>
          <textarea class="sum-para" data-para="${sec.key}" placeholder="${esc(sec.hint || 'Testo facoltativo…')}">${esc(s[sec.key])}</textarea></div>`;
        continue;
      }
      const n = itemSecs.indexOf(sec) + 1;
      const items = s[sec.key];
      html += `<div class="sum-section" data-sec="${sec.key}">
        <div class="sum-head"><h4>${esc(sec.title)}</h4><span class="count">${items.length}</span>${rolePill(sec.role)}
          ${n <= 9 ? `<span class="hint">Alt+${n}</span>` : ''}
          <button class="icon-btn" data-add="${sec.key}" title="Aggiungi voce"><svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg></button></div>`;
      if (!items.length) html += `<div class="sum-empty">Nessuna voce</div>`;
      items.forEach((it, i) => {
        const rel = relatedFor(it.text);
        html += `<div class="sum-item" draggable="true" data-sec="${sec.key}" data-i="${i}">
          <span class="bullet" title="Trascina per spostare">${sec.kind === 'list' ? '⋮⋮' : i + 1 + '.'}</span>
          <div class="sum-fields">
            <textarea rows="1" data-field="text" placeholder="Descrizione…">${esc(it.text)}</textarea>
            ${sec.kind === 'actions'
              ? `<div class="sum-meta"><input class="owner" data-field="owner" placeholder="Owner (es. ATAC)" value="${esc(it.owner)}" /><input class="deadline" data-field="deadline" placeholder="Deadline gg/mm/aaaa" value="${esc(it.deadline)}" /></div>`
              : sec.note ? `<input class="note" data-field="note" placeholder="→ aggiornamento / esito (facoltativo)" value="${esc(it.note)}" />` : ''}
            <div class="sum-links">
              ${it.ref?.start != null ? `<button class="link" data-jump="${it.ref.start}" title="${esc(it.ref.source || '')}">⏱ ${fmtT(it.ref.start)} nel transcript</button>` : ''}
              ${it.ref?.fromDate ? `<span class="muted">↩ dal ${itDate(it.ref.fromDate)}</span>` : ''}
              ${rel.length ? `<button class="link" data-related title="Voci collegate nei checkpoint precedenti">↺ ${rel.length} collegat${rel.length === 1 ? 'a' : 'e'}</button>` : ''}
            </div>
          </div>
          <div class="row">
            <button class="icon-btn rm local-ai-only" data-rewrite title="Riformula con AI locale"><svg viewBox="0 0 20 20"><path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/></svg></button>
            ${sec.role !== 'done' && itemSecs.some((x) => x.role === 'done') ? `<button class="icon-btn rm" data-done title="Segna come completata"><svg viewBox="0 0 20 20"><path d="m4.5 10.5 3.5 3.5 7.5-8"/></svg></button>` : ''}
            <button class="icon-btn rm" data-rm title="Rimuovi"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5 5 15"/></svg></button>
          </div>
        </div>`;
      });
      html += `</div>`;
    }
    $('#summaryEditor').innerHTML = html;
    $$('#summaryEditor textarea').forEach(autosize);
  }

  function summaryChanged() {
    markDirty();
    if (!state.cp.email.edited) renderEmail(true);
  }

  function sectionForRole(role) {
    const secs = Templates.itemSections(state.tpl);
    return secs.find((s) => s.role === role) || (role === 'decision' ? secs.find((s) => s.role === 'info') : null) || secs.find((s) => s.role === 'next') || secs[0];
  }

  function addToSection(key, text = '', extra = {}) {
    const sec = state.tpl.sections.find((s) => s.key === key);
    if (!sec || sec.kind === 'paragraph') return;
    const item = sec.kind === 'actions' ? { text, owner: extra.owner || '', deadline: extra.deadline || '' } : { text, note: extra.note || '' };
    if (extra.ref) item.ref = extra.ref;
    state.cp.summary[key].push(item);
    renderSummaryEditor();
    summaryChanged();
    if (!text) {
      const items = $$(`#summaryEditor .sum-item[data-sec="${key}"] textarea`);
      items[items.length - 1]?.focus();
    }
  }

  async function carryOver() {
    const prev = state.checkpoints
      .filter((c) => c.id !== state.cp.id && c.date <= state.cp.date)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!prev) return toast('Nessun checkpoint precedente', { error: true });
    const p = await api('GET', `/api/projects/${state.project.id}/checkpoints/${prev.id}`);
    const ptpl = tplFor(p);
    const items = Templates.roleItems(Templates.normalize(p.summary, ptpl), ptpl).filter((it) => ['doing', 'next', 'risk'].includes(it.role) && !it.paragraph);
    let n = 0;
    for (const it of items) {
      const sec = sectionForRole(it.role);
      const list = state.cp.summary[sec.key];
      if (Templates.roleItems(state.cp.summary, state.tpl).some((x) => similar(x.text, it.text) > 0.8)) continue;
      list.push({ text: it.text, note: it.note || '', owner: it.owner || '', deadline: it.deadline || '', ref: { fromCp: p.id, fromDate: p.date } });
      n++;
    }
    state.cp.summary = Templates.normalize(state.cp.summary, state.tpl);
    renderSummaryEditor();
    summaryChanged();
    toast(n ? `Riportate ${n} voci dal checkpoint del ${itDate(p.date)}: segna con ✓ quelle concluse (vedi anche la scheda Analisi).` : 'Nessuna voce nuova da riportare');
  }

  async function showRelated(text) {
    const rel = relatedFor(text);
    await dialog('Voci collegate', `<p class="muted small">Come si è evoluta questa voce nei checkpoint precedenti.</p>
      <div class="rel-list">${rel.map((r) => `<div class="rel-row"><span class="rel-date">${itDate(r.date)}</span>${rolePill(r.role)}<span>${esc(r.text)}</span></div>`).join('') || '<p class="muted">Nessuna.</p>'}</div>`, { okText: null, wide: true });
  }

  // ------------------------------------------------------------------ analisi
  function previousCheckpoint() {
    if (!state.history) return null;
    const list = historyItems(state.history).filter((c) => c.id !== state.cp.id && c.date <= state.cp.date && c.items.length);
    return list[list.length - 1] || null;
  }

  function analysisData() {
    const cp = state.cp;
    const list = cues();
    const orgs = (state.project.glossary || '').split(/[,;\n]/).map((x) => x.trim()).filter((x) => /^[A-Z]{2,}/.test(x));
    const existing = Templates.roleItems(cp.summary, state.tpl).map((x) => x.text);
    const prev = previousCheckpoint();
    const prevItems = prev ? prev.items.filter((it) => ['doing', 'next', 'risk'].includes(it.role) && !it.paragraph) : [];
    const touched = list.length ? Analysis.touchedItems(prevItems, list) : [];
    const cands = list.length
      ? Analysis.candidates(list, { date: cp.date, orgs, existing, model: state.learning, dismissed: new Set(cp.analysis.dismissed) })
      : [];
    const glossary = (state.project.glossary || '').split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
    const topics = list.length ? Analysis.topics(list, glossary) : [];
    return { prev, touched, cands, topics };
  }

  async function refreshAnalysisPanels() {
    if (!state.cp) return;
    await loadHistory().catch(() => null);
    state.analysisCache = analysisData();
    // marcatori nel transcript
    state.cueRoles.clear();
    for (const c of state.analysisCache.cands) if (!c.duplicate) state.cueRoles.set(c.cueIds[0], c.role);
    renderTranscript();
    syncTranscript();
    renderSummaryEditor();
    renderAnalysis();
    renderMiniForecast();
  }

  function addButtons(role, payload) {
    const secs = Templates.itemSections(state.tpl);
    const main = sectionForRole(role);
    return `<div class="add-btns"><button class="btn btn-sm btn-primary" data-addto="${main.key}" ${payload}>+ ${esc(main.title)}</button>
      <select class="select select-sm" data-addsel ${payload}><option value="">Altra sezione…</option>${secs.filter((s) => s !== main).map((s) => `<option value="${s.key}">${esc(s.title)}</option>`).join('')}</select></div>`;
  }

  function renderAnalysis() {
    const el = $('#analysisBody');
    if (!state.cp) return;
    const a = state.analysisCache;
    if (!cues().length) {
      el.innerHTML = `<p class="muted">Importa il transcript per vedere i punti toccati, i nuovi punti rilevati e gli argomenti principali.</p>`;
      return;
    }
    const added = new Set(state.cp.analysis.added);
    const learnedN = state.learning?.examples || 0;
    let html = `<div class="an-intro">${a.prev ? `<b>${a.touched.filter((t) => t.discussed).length}/${a.touched.length}</b> temi del ${itDate(a.prev.date)} ripresi · ` : ''}<b>${a.cands.filter((c) => !c.duplicate).length}</b> nuovi punti rilevati · ${learnedN >= 8 ? `rilevatore addestrato su ${learnedN} tue scelte` : `il rilevatore impara dalle tue scelte (${learnedN}/8)`}</div>`;

    // 1. temi dei checkpoint precedenti
    if (a.prev) {
      html += `<h4 class="an-h">Temi del checkpoint del ${itDate(a.prev.date)}</h4>`;
      const OUT = { done: 'Sembra completato', doing: 'Sembra in corso', risk: 'Sembra bloccato / critico' };
      for (const t of a.touched) {
        const key = 'prev:' + hashKey(t.text);
        const isAdded = added.has(key) || Templates.roleItems(state.cp.summary, state.tpl).some((x) => similar(x.text, t.text) > 0.8);
        html += `<div class="an-card ${t.discussed ? '' : 'muted-card'} ${isAdded ? 'is-added' : ''}">
          <div class="an-top">${rolePill(t.role)}<span class="an-text">${esc(t.text)}</span></div>
          <div class="an-meta">${t.discussed
            ? `<span class="pill ok">Discusso</span>${t.outcome ? `<span class="pill ${ROLE_CLASS[t.outcome]}">${OUT[t.outcome] || ''}</span>` : ''}${t.mentions.map((m) => `<button class="link" data-jump="${m.start}">⏱ ${fmtT(m.start)}</button>`).join('')}`
            : '<span class="pill">Non menzionato nel transcript</span>'}</div>
          ${t.evidence ? `<blockquote data-jump="${t.evidence.start}">“${esc(t.evidence.text)}” <span class="muted">— ${esc(t.evidence.speaker || '')}</span></blockquote>` : ''}
          ${isAdded ? '<div class="an-added">✓ Nel riepilogo</div>' : addButtons(t.outcome || t.role, `data-src="prev" data-key="${key}" data-text="${esc(t.text)}"`)}
        </div>`;
      }
    }

    // 2. nuovi punti
    const roles = ['all', 'done', 'doing', 'next', 'risk', 'decision'];
    const visible = a.cands.filter((c) => (state.showDuplicates || !c.duplicate) && !added.has(c.key) && (state.analysisFilter === 'all' || c.role === state.analysisFilter));
    html += `<h4 class="an-h">Nuovi punti rilevati nel transcript</h4>
      <div class="an-filters"><div class="seg">${roles.map((r) => `<button class="seg-btn ${state.analysisFilter === r ? 'active' : ''}" data-anfilter="${r}">${r === 'all' ? 'Tutti' : esc(roleLabel(r))} <small>${r === 'all' ? a.cands.filter((c) => !c.duplicate).length : a.cands.filter((c) => c.role === r && !c.duplicate).length}</small></button>`).join('')}</div>
      <label class="toggle"><input type="checkbox" id="showDupToggle" ${state.showDuplicates ? 'checked' : ''}/><span>Mostra già nel riepilogo</span></label></div>`;
    if (!visible.length) html += `<p class="muted small">Nessun punto da rivedere con questo filtro.</p>`;
    for (const c of visible) {
      html += `<div class="an-card" data-key="${esc(c.key)}">
        <div class="an-top">${rolePill(c.role)}<span class="pill conf-${c.confidence}">${c.confidence}</span>${c.duplicate ? '<span class="pill">già nel riepilogo</span>' : ''}
          <button class="link" data-jump="${c.start}">⏱ ${fmtT(c.start)}</button><span class="muted small">${esc(c.speaker || '')}</span>
          <button class="icon-btn an-x" data-dismiss="${esc(c.key)}" title="Non è un punto rilevante (il rilevatore impara)"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5 5 15"/></svg></button></div>
        <div class="an-edit" contenteditable="true" spellcheck="true" data-edit-key="${esc(c.key)}">${esc(cleanSentence(c.text))}</div>
        ${c.deadline || c.owner ? `<div class="an-meta">${c.deadline ? `<span class="pill soon">Deadline ${esc(c.deadline)}${c.deadlineApprox ? ' (stimata)' : ''}</span>` : ''}${c.owner ? `<span class="pill">Owner: ${esc(c.owner)}</span>` : ''}</div>` : ''}
        <div class="row gap-6">${addButtons(c.role, `data-src="cand" data-key="${esc(c.key)}"`)}<button class="btn btn-sm btn-ghost local-ai-only" data-rewrite-cand="${esc(c.key)}">✨ Riformula</button></div>
      </div>`;
    }

    // 3. argomenti
    if (a.topics.length) {
      html += `<h4 class="an-h">Argomenti principali</h4><div class="topics">${a.topics
        .map((t) => `<button class="topic ${t.glossary ? 'gl' : ''}" data-topic="${esc(t.label)}" title="Prima menzione ${fmtT(t.first)}">${esc(t.label)} <small>${t.count}</small></button>`)
        .join('')}</div>`;
    }
    el.innerHTML = html;
  }

  function addFromAnalysis(btn, sectionKey) {
    const src = btn.dataset.src;
    const key = btn.dataset.key;
    const sec = state.tpl.sections.find((s) => s.key === sectionKey);
    if (src === 'prev') {
      const t = state.analysisCache.touched.find((x) => 'prev:' + hashKey(x.text) === key);
      addToSection(sectionKey, t.text, { owner: t.owner, deadline: t.deadline, note: t.note, ref: { fromDate: state.analysisCache.prev.date, ...(t.evidence ? { start: t.evidence.start, source: t.evidence.text } : {}) } });
      if (t.evidence) learnFrom(t.evidence.text, sec.role);
    } else {
      const c = state.analysisCache.cands.find((x) => x.key === key);
      const text = $(`.an-edit[data-edit-key="${CSS.escape(key)}"]`)?.innerText.trim() || cleanSentence(c.text);
      addToSection(sectionKey, text, { owner: c.owner, deadline: c.deadline, ref: { start: c.start, source: c.text } });
      learnFrom(c.text, sec.role);
    }
    state.cp.analysis.added.push(key);
    markDirty();
    renderAnalysis();
    toast(`Aggiunto a “${sec.title}”`);
  }

  // ------------------------------------------------------------------ email
  function emailVars() {
    return { firma: state.settings.author || '', data: itDate(state.cp.date), progetto: state.project?.name || '', titolo: state.cp.title };
  }
  function defaultSubject() {
    return Templates.fill(state.project?.subjectTemplate || '{progetto} | {titolo} {data}', emailVars());
  }
  function renderEmail(fromSummary) {
    const e = state.cp.email;
    if (!e.subject) e.subject = defaultSubject();
    if (fromSummary || !e.body) e.body = Email.toText(state.cp.summary, state.tpl, emailVars());
    $('#emailSubject').value = e.subject;
    $('#emailBody').value = e.body;
    $('#emailFoot').textContent = e.edited
      ? 'Testo modificato a mano: le modifiche ai punti non lo aggiornano più (usa “Rigenera dai punti”).'
      : `Il testo si aggiorna automaticamente dai “Punti discussi” (template: ${state.tpl.name}). Puoi modificarlo liberamente.`;
    if (fromSummary) markDirty();
  }
  async function copyEmail() {
    const text = $('#emailBody').value;
    const html = Email.textToHtml(text);
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) })]);
    } catch {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.innerHTML = html;
      div.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(div);
      const r = document.createRange();
      r.selectNodeContents(div);
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      document.execCommand('copy');
      div.remove();
    }
    toast('Email copiata: incollala in Outlook (Ctrl+V)');
  }

  // ------------------------------------------------------------------ previsione (locale)
  function localForecast(hist, beforeDate, excludeId) {
    const list = hist.filter((c) => c.items.length && c.id !== excludeId && (!beforeDate || c.date <= beforeDate));
    if (!list.length) return null;
    const last = list[list.length - 1];
    const threads = Analysis.threads(list);
    const recurrence = (text) => {
      const th = threads.find((t) => t.entries.some((e) => e.cpId === last.id && e.text === text));
      return th ? th.entries.length : 1;
    };
    const now = new Date();
    const items = [];
    for (const it of last.items) {
      if (it.paragraph || !['doing', 'next', 'risk'].includes(it.role)) continue;
      const n = recurrence(it.text);
      const d = parseItDate(it.deadline);
      const days = d ? Math.round((d - now) / 86400000) : null;
      let priority = 'media';
      let why = '';
      if (days != null) {
        priority = days <= 14 ? 'alta' : 'media';
        why = days < 0 ? `Deadline scaduta da ${-days} giorni (${it.deadline})` : `Deadline tra ${days} giorni (${it.deadline})`;
      } else if (it.role === 'risk') why = 'Punto di attenzione aperto';
      else if (it.role === 'next') { why = n > 1 ? `Prossimo passo ricorrente da ${n} checkpoint: verificare lo sblocco` : 'Prossimo passo concordato nell\'ultimo incontro'; priority = n > 1 ? 'alta' : 'media'; }
      else { why = n > 2 ? `In corso da ${n} checkpoint: chiedere stato e data di completamento` : 'Attività in corso: aggiornamento sullo stato'; priority = n > 2 ? 'alta' : 'bassa'; }
      items.push({ title: it.text, rationale: why, owner: it.owner, priority, kind: roleLabel(it.role), overdue: days != null && days < 0 });
    }
    const order = { alta: 0, media: 1, bassa: 2 };
    items.sort((a, b) => order[a.priority] - order[b.priority]);
    const risks = last.items.filter((it) => it.paragraph && it.role === 'risk').map((it) => it.text);
    return { items, risks, last, agendaNote: `Basata sul checkpoint del ${itDate(last.date)} e su ${list.length - 1} precedent${list.length - 1 === 1 ? 'e' : 'i'}.` };
  }

  function forecastItemsHtml(items) {
    return items.map((it) => `<div class="fc-item"><input type="checkbox" />
      <div><div class="t">${esc(it.title)}</div><div class="r">${esc(it.rationale)}</div></div>
      <div class="fc-meta">${it.kind ? `<span class="pill">${esc(it.kind)}</span>` : ''}${it.owner ? `<span class="pill">${esc(it.owner)}</span>` : ''}<span class="pill ${it.priority} ${it.overdue ? 'overdue' : ''}">${esc(it.priority)}</span></div></div>`).join('');
  }

  let lastForecast = null;
  async function renderForecastView() {
    const body = $('#forecastBody');
    body.innerHTML = '<p class="muted">Caricamento…</p>';
    const h = await loadHistory(true);
    const local = localForecast(historyItems(h));
    let html = '';
    if (h.forecast?.items?.length) {
      html += `<h2 class="h2">Previsione AI <span class="muted small">· ${new Date(h.forecast.generatedAt || h.forecast.savedAt).toLocaleString('it-IT')}</span></h2>`;
      if (h.forecast.agendaNote) html += `<div class="note-box">${esc(h.forecast.agendaNote)}</div>`;
      html += forecastItemsHtml(h.forecast.items);
    }
    if (local) {
      html += `<h2 class="h2">Temi previsti dallo storico</h2><div class="note-box">${esc(local.agendaNote)}</div>${forecastItemsHtml(local.items)}`;
      if (local.risks.length) html += `<h2 class="h2">Criticità segnalate</h2>${local.risks.map((r) => `<div class="note-box">${esc(r)}</div>`).join('')}`;
    } else {
      html = `<div class="card"><p class="muted">Compila i “Punti discussi” di almeno un checkpoint: la previsione del prossimo incontro si costruisce da lì.</p></div>`;
    }
    lastForecast = { local, ai: h.forecast };
    body.innerHTML = html;
  }

  function renderMiniForecast() {
    const el = $('#miniForecast');
    if (!state.cp || !state.history) return;
    const f = localForecast(historyItems(state.history), state.cp.date, state.cp.id);
    el.innerHTML = f
      ? `<p class="muted small">Temi attesi in questo checkpoint in base allo storico (${esc(f.agendaNote)}) Usali come traccia durante la revisione.</p>${forecastItemsHtml(f.items)}`
      : `<p class="muted">Nessun checkpoint precedente con punti compilati: la previsione sarà disponibile dal prossimo incontro.</p>`;
  }

  // ------------------------------------------------------------------ storico
  async function renderHistory() {
    const h = await loadHistory(true);
    const hist = historyItems(h);
    const list = hist.slice().reverse(); // più recenti prima
    $('#historySub').textContent = `${state.project.name} · ${list.length} checkpoint archiviati`;
    const latest = list.find((c) => c.items.length);
    const att = [];
    list.forEach((c) => c.items.filter((it) => it.role === 'risk' && !it.paragraph).forEach((a) => {
      if (att.some((x) => similar(x.text, a.text) > 0.6)) return;
      att.push({ ...a, date: c.date, stillOpen: latest && c.id === latest.id });
    }));
    const now = new Date();
    let overdue = 0;
    const attHtml = att.map((a) => {
      const d = parseItDate(a.deadline);
      const days = d ? Math.round((d - now) / 86400000) : null;
      if (days != null && days < 0 && a.stillOpen) overdue++;
      const cls = days == null ? '' : days < 0 ? 'overdue' : days <= 14 ? 'soon' : '';
      return `<div class="att-row"><div>${esc(a.text)}<div class="from">${a.stillOpen ? 'Aperto nell\'ultimo checkpoint' : 'Non ripreso nell\'ultimo checkpoint'} · ${itDate(a.date)}</div></div>
        <div>${a.owner ? `<span class="pill">${esc(a.owner)}</span>` : ''}</div>
        <div>${a.deadline ? `<span class="pill ${cls}">Deadline ${esc(a.deadline)}</span>` : ''}</div></div>`;
    }).join('');
    $('#openAttention').innerHTML = att.length ? `<div class="att-list">${attHtml}</div>` : '<p class="muted">Nessun punto di attenzione registrato.</p>';
    const doneCount = hist.reduce((n, c) => n + c.items.filter((i) => i.role === 'done').length, 0);
    const minutes = Math.round(hist.reduce((a, c) => a + (c.duration || 0), 0) / 60);
    $('#historyStats').innerHTML = [
      [list.length, 'checkpoint'],
      [doneCount, 'attività completate'],
      [att.filter((a) => a.stillOpen).length, 'punti di attenzione aperti'],
      [overdue, 'deadline scadute'],
      [minutes, 'minuti di riunione archiviati'],
    ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');

    // filo delle attività: voci che ricorrono in più checkpoint
    const threads = Analysis.threads(hist).filter((t) => t.length >= 2).sort((a, b) => b.last.date.localeCompare(a.last.date));
    $('#threads').innerHTML = threads.length
      ? threads.map((t) => `<div class="thread"><div class="thread-title">${esc(t.title)}</div><div class="thread-steps">${t.entries.map((e) => `<span class="step ${ROLE_CLASS[e.role]}" title="${esc(e.text)}"><b>${itDate(e.date).slice(0, 5)}</b> ${esc(roleLabel(e.role))}</span>`).join('<span class="arrow">→</span>')}</div></div>`).join('')
      : '<p class="muted">Le attività che compaiono in più checkpoint verranno collegate qui automaticamente.</p>';

    const col = (title, items) => items.length ? `<div><h5>${esc(title)}</h5><ul>${items.map((i) => `<li>${esc(i.text)}${i.note ? ` <span class="muted">→ ${esc(i.note)}</span>` : ''}${i.deadline ? ` <span class="muted">(${esc(i.deadline)})</span>` : ''}</li>`).join('')}</ul></div>` : '';
    $('#timeline').innerHTML = list.map((c) => {
      const bySec = c.tpl.sections.filter((s) => s.kind !== 'paragraph').map((s) => col(s.title, c.items.filter((i) => i.key === s.key))).join('');
      return `<div class="tl-item"><div class="tl-card">
        <header><h3>${esc(c.title)}</h3><span class="muted">${longDate(c.date)} · ${esc(c.status)} · ${esc(c.tpl.name)}${c.cueCount ? ` · ${Math.round(c.duration / 60)} min` : ''}</span>
        <button class="btn btn-ghost btn-sm" data-open="${c.id}">Apri</button></header>
        ${c.items.length ? `<div class="tl-cols">${bySec}</div>` : '<p class="muted small">Punti non ancora compilati.</p>'}
      </div></div>`;
    }).join('') || '<p class="muted">Nessun checkpoint.</p>';
  }

  // ------------------------------------------------------------------ cartella di lavoro
  function guessDate(f) {
    const m = /(20\d{2})[-_.]?(\d{2})[-_.]?(\d{2})/.exec(f.name);
    if (m && Number(m[2]) <= 12 && Number(m[3]) <= 31) return `${m[1]}-${m[2]}-${m[3]}`;
    return f.mtime.slice(0, 10);
  }
  let folderData = null;
  async function renderFolder() {
    const body = $('#folderBody');
    body.innerHTML = '<p class="muted">Ricerca dei file…</p>';
    folderData = await api('GET', '/api/folder');
    $('#folderPath').textContent = folderData.workDir;
    if (!folderData.files.length) {
      body.innerHTML = `<div class="card"><p class="muted">Nessun video o transcript trovato. Copia qui i file scaricati da Teams (.mp4, .vtt, .docx) e premi “Aggiorna”.</p></div>`;
      return;
    }
    body.innerHTML = `<div class="file-table">${folderData.files.map((f, i) => `
      <div class="file-row">
        <span class="file-ico ft-${f.type}">${f.type === 'video' ? '▶' : '¶'}</span>
        <div class="file-main"><div class="file-name" title="${esc(f.rel)}">${esc(f.name)}</div>
          <div class="muted small">${f.dir ? esc(f.dir) + ' · ' : ''}${fmtSize(f.size)} · ${itDate(guessDate(f))}${f.usedBy ? ` · <span class="pill ok">collegato a ${esc(f.usedBy.projectName)} ${itDate(f.usedBy.date)}</span>` : ''}</div></div>
        <div class="row gap-6">
          <button class="btn btn-ghost btn-sm" data-use="${i}" ${state.cp ? '' : 'disabled'} title="Usa nel checkpoint aperto">Usa nel checkpoint aperto</button>
          <button class="btn btn-sm" data-newcp="${i}">Nuovo checkpoint</button>
        </div>
      </div>`).join('')}</div>`;
  }

  async function useFolderFile(f) {
    if (f.type === 'video') {
      const v = await api('POST', `/api/projects/${state.cp.projectId}/checkpoints/${state.cp.id}/video-link`, { rel: f.rel });
      state.cp.video = v;
      loadVideo();
      toast(`Video collegato: ${f.name}`);
    } else {
      const r = await api('POST', '/api/folder/read', { rel: f.rel });
      Transcript.parseTranscript(r.text);
      if (!(await confirmReplaceTranscript(f.name))) return;
      applyTranscript(r.text, r.name, r.rel);
      archiveTranscript({ rel: r.rel });
    }
  }

  async function newCheckpointFromFile(f) {
    const date = guessDate(f);
    const v = await dialog('Nuovo checkpoint dal file', `<p class="muted small">${esc(f.name)}</p>${newCpFields(date)}`, { okText: 'Crea' });
    if (!v) return;
    const cp = await api('POST', `/api/projects/${state.project.id}/checkpoints`, v);
    state.checkpoints = await api('GET', `/api/projects/${state.project.id}/checkpoints`);
    await openCheckpoint(cp.id);
    await useFolderFile(f);
    // collega automaticamente il file "gemello" (stesso giorno o stesso nome, tipo diverso)
    const base = (n) => n.replace(/\.[^.]+$/, '').replace(/[-_ ]*(registrazione|recording|transcript|trascrizione).*$/i, '').toLowerCase();
    const twin = folderData.files.find((g) => g.type !== f.type && !g.usedBy && (base(g.name) === base(f.name) || guessDate(g) === date));
    if (twin && (await confirmDlg('File collegato trovato', `Vuoi usare anche “${twin.name}” per questo checkpoint?`, 'Sì, usalo'))) await useFolderFile(twin);
    setView('workspace');
  }

  // ------------------------------------------------------------------ template (vista)
  let tplEditing = null;
  function renderTemplates() {
    const list = Templates.all();
    if (!tplEditing || !list.some((t) => t.id === tplEditing.id)) tplEditing = JSON.parse(JSON.stringify(state.tpl || list[0]));
    $('#tplList').innerHTML = list.map((t) => `<button class="tpl-item ${t.id === tplEditing.id ? 'active' : ''}" data-tpl="${esc(t.id)}"><b>${esc(t.name)}</b><span class="muted small">${t.builtin ? 'Predefinito' : 'Personalizzato'} · ${t.sections.length} sezioni</span></button>`).join('')
      + `<button class="btn btn-ghost btn-sm" id="tplNew">+ Nuovo template</button>`;
    renderTplEditor();
  }
  function renderTplEditor() {
    const t = tplEditing;
    const ro = Templates.BUILTIN.some((b) => b.id === t.id) && !Templates.getCustom().some((c) => c.id === t.id);
    const opt = (obj, v) => Object.entries(obj).map(([k, l]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${esc(l)}</option>`).join('');
    const sample = state.cp && state.cp.templateId === t.id ? state.cp.summary : Object.fromEntries(t.sections.map((s) => [s.key, s.kind === 'paragraph' ? `(${s.title})` : [{ text: `Esempio di voce “${s.title}”`, note: '', owner: s.kind === 'actions' ? 'ATAC' : '', deadline: s.kind === 'actions' ? '30/10/2026' : '' }]]));
    $('#tplEditor').innerHTML = `<div class="card">
      ${ro ? `<div class="note-box">Template predefinito: per modificarlo crea una copia con “Duplica”.</div>` : ''}
      <fieldset ${ro ? 'disabled' : ''} class="tpl-fields">
      <div class="grid2"><label class="field"><span>Nome</span><input class="input" data-tf="name" value="${esc(t.name)}"/></label>
      <label class="field"><span>Descrizione</span><input class="input" data-tf="description" value="${esc(t.description || '')}"/></label></div>
      <div class="grid2"><label class="field"><span>Saluto</span><input class="input" data-tf="greeting" value="${esc(t.greeting)}"/></label>
      <label class="field"><span>Introduzione ({data}, {progetto}, {titolo})</span><input class="input" data-tf="intro" value="${esc(t.intro)}"/></label></div>
      <h3>Sezioni</h3>
      <div class="sec-table"><div class="sec-row head"><span>Nome nell'app</span><span>Titolo nell'email</span><span>Tipo</span><span>Ruolo</span><span>Esito</span><span></span></div>
      ${t.sections.map((s, i) => `<div class="sec-row" data-si="${i}">
        <input class="input input-sm" data-sf="title" value="${esc(s.title)}"/>
        <input class="input input-sm" data-sf="label" value="${esc(s.label)}" placeholder="${s.kind === 'paragraph' ? '(nessun titolo)' : ''}"/>
        <select class="select select-sm" data-sf="kind">${opt(Templates.KINDS, s.kind)}</select>
        <select class="select select-sm" data-sf="role">${opt(Templates.ROLES, s.role)}</select>
        <label class="toggle" title="Campo “→ aggiornamento / esito” per ogni voce"><input type="checkbox" data-sf="note" ${s.note ? 'checked' : ''} ${s.kind !== 'list' && s.kind !== 'numbered' ? 'disabled' : ''}/></label>
        <span class="row"><button class="icon-btn" data-smove="-1" title="Su">↑</button><button class="icon-btn" data-smove="1" title="Giù">↓</button><button class="icon-btn" data-sdel title="Elimina">✕</button></span>
      </div>`).join('')}</div>
      <button class="btn btn-ghost btn-sm" id="secAdd">+ Aggiungi sezione</button>
      <div class="grid2" style="margin-top:12px"><label class="field"><span>Chiusura</span><textarea class="input" rows="3" data-tf="closing">${esc(t.closing || '')}</textarea></label>
      <label class="field"><span>Firma ({firma} = nome nelle impostazioni)</span><textarea class="input" rows="3" data-tf="signoff">${esc(t.signoff || '')}</textarea></label></div>
      </fieldset>
      <div class="row between"><div class="row gap-6">
        <button class="btn btn-ghost btn-sm" id="tplDup">Duplica</button>
        ${!ro && !Templates.BUILTIN.some((b) => b.id === t.id) ? '<button class="btn btn-ghost btn-sm danger" id="tplDel">Elimina</button>' : ''}
        ${!ro && Templates.BUILTIN.some((b) => b.id === t.id) ? '<button class="btn btn-ghost btn-sm" id="tplReset">Ripristina originale</button>' : ''}
      </div><div class="row gap-6">
        ${state.cp ? '<button class="btn btn-ghost btn-sm" id="tplApply">Usa nel checkpoint aperto</button>' : ''}
        ${ro ? '' : '<button class="btn btn-primary btn-sm" id="tplSave">Salva template</button>'}
      </div></div>
    </div>
    <div class="card"><h3>Anteprima email</h3><pre class="tpl-preview">${esc(Email.toText(sample, t, state.cp ? emailVars() : { firma: state.settings.author, data: itDate(today()), progetto: state.project?.name || '', titolo: 'Checkpoint' }))}</pre></div>`;
  }
  async function saveCustomTemplates(list) {
    await api('PUT', '/api/templates', list);
    Templates.setCustom(list);
    renderTplSelect();
  }

  // ------------------------------------------------------------------ AI locale (vista)
  let aiPoll = null;
  async function renderLocalAi() {
    const st = await refreshOllama();
    const body = $('#localAiBody');
    const running = st.running;
    const inst = st.jobs?.install;
    const pull = st.jobs?.pull;
    const installed = st.models.map((m) => m.name);
    const current = state.settings.ollamaModel;
    const trained = st.trainedModel && installed.find((n) => n.startsWith(st.trainedModel));
    const pct = (j) => (j?.total ? Math.round((j.completed / j.total) * 100) : 0);
    body.innerHTML = `
      <div class="card"><h3>1 · Ollama</h3>
        ${running ? `<p><span class="pill ok">In esecuzione</span> versione ${esc(st.version)}</p>` : `<p><span class="pill overdue">Non attivo</span> Ollama non risulta in esecuzione su questo computer.</p>
          <div class="row gap-6"><button class="btn btn-primary btn-sm" id="olInstall">${st.platform === 'win32' ? 'Scarica e installa Ollama' : 'Installa Ollama'}</button>
          <button class="btn btn-ghost btn-sm" id="olStart">È già installato: avvialo</button></div>`}
        ${inst ? `<div class="job ${inst.state}"><div class="job-bar"><i style="width:${pct(inst)}%"></i></div><span>${esc(inst.message)}${inst.total ? ` (${pct(inst)}%)` : ''}</span></div>` : ''}
      </div>
      <div class="card ${running ? '' : 'disabled-card'}"><h3>2 · Modello</h3>
        <p class="muted small">Scarica un modello (una volta sola, poi funziona anche offline) e scegli quale usare.</p>
        <div class="model-list">${st.recommended.map((m) => {
          const has = installed.some((n) => n === m.name || n.startsWith(m.name + ':'));
          return `<div class="model-row"><div><b>${esc(m.name)}</b> <span class="muted small">${esc(m.size)}</span><div class="muted small">${esc(m.note)}</div></div>
            <div class="row gap-6">${has ? `${current === m.name ? '<span class="pill ok">In uso</span>' : `<button class="btn btn-sm" data-usemodel="${esc(m.name)}">Usa</button>`}<button class="icon-btn" data-delmodel="${esc(m.name)}" title="Elimina">✕</button>` : `<button class="btn btn-sm btn-primary" data-pull="${esc(m.name)}" ${running && pull?.state !== 'running' ? '' : 'disabled'}>Scarica</button>`}</div></div>`;
        }).join('')}
        ${installed.filter((n) => !st.recommended.some((m) => n === m.name || n.startsWith(m.name + ':'))).map((n) => `<div class="model-row"><div><b>${esc(n)}</b>${n.startsWith('verbale-') ? ' <span class="pill r-done">personalizzato</span>' : ''}</div><div class="row gap-6">${current === n ? '<span class="pill ok">In uso</span>' : `<button class="btn btn-sm" data-usemodel="${esc(n)}">Usa</button>`}<button class="icon-btn" data-delmodel="${esc(n)}" title="Elimina">✕</button></div></div>`).join('')}
        </div>
        ${pull ? `<div class="job ${pull.state}"><div class="job-bar"><i style="width:${pct(pull)}%"></i></div><span>${esc(pull.model || '')}: ${esc(pull.message)}${pull.total ? ` (${pct(pull)}%)` : ''}</span></div>` : ''}
      </div>
      <div class="card ${running && installed.length ? '' : 'disabled-card'}"><h3>3 · Addestramento sul progetto ${esc(state.project?.name || '')}</h3>
        <p class="muted small">Crea un modello personalizzato <b>${esc(st.trainedModel || '')}</b> che conosce il tuo stile, il glossario del progetto e gli esempi presi dai tuoi verbali: ogni punto che aggiungi dall'analisi o con <kbd>Alt</kbd>+<kbd>1..9</kbd> e poi sistemi a mano diventa un esempio (frase originale → voce approvata). Riaddestralo ogni tanto per farlo migliorare.</p>
        <p><b>${st.trainingExamples}</b> esempi disponibili${trained ? ` · modello personalizzato presente` : ''}</p>
        <div class="row gap-6"><select class="select select-sm" id="olBase">${installed.filter((n) => !n.startsWith('verbale-')).map((n) => `<option ${n === current ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        <button class="btn btn-primary btn-sm" id="olTrain" ${installed.length ? '' : 'disabled'}>Addestra modello personalizzato</button></div>
        <hr class="sep"/>
        <p class="muted small">Rilevatore dei punti (senza AI): impara ogni volta che aggiungi o scarti un punto nella scheda Analisi. <b>${state.learning?.examples || 0}</b> scelte registrate.</p>
        <button class="btn btn-ghost btn-sm" id="resetLearning">Azzera apprendimento del rilevatore</button>
      </div>
      <div class="card ${current && running ? '' : 'disabled-card'}"><h3>4 · Prova</h3>
        <textarea class="input" id="olTestIn" rows="3" placeholder="Incolla una frase del transcript, es. “allora noi la settimana prossima dobbiamo chiudere la parte di data quality e poi mandiamo il documento ad ATAC”"></textarea>
        <div class="row gap-6" style="margin-top:8px"><button class="btn btn-sm btn-primary" id="olTestRewrite">Riformula come voce del verbale</button><button class="btn btn-sm btn-ghost" id="olTestFix">Correggi</button></div>
        <pre class="tpl-preview" id="olTestOut" hidden></pre>
      </div>`;
    clearTimeout(aiPoll);
    if (state.view === 'localai' && (inst?.state === 'running' || pull?.state === 'running' || (inst?.state === 'done' && !running))) aiPoll = setTimeout(renderLocalAi, 2000);
  }

  // ------------------------------------------------------------------ impostazioni
  function renderSettings() {
    const p = state.project;
    if (p) {
      $('#pName').value = p.name; $('#pDesc').value = p.description || ''; $('#pRecipients').value = p.recipients || '';
      $('#pSubject').value = p.subjectTemplate || ''; $('#pGlossary').value = p.glossary || ''; $('#pExample').value = p.exampleEmail || '';
      $('#pTemplate').innerHTML = Templates.all().map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
      $('#pTemplate').value = p.templateId || 'checkpoint-settimanale';
    }
    $('#sAuthor').value = state.settings.author || '';
    $('#sModel').value = state.settings.model || '';
    $('#sKey').value = '';
    $('#sKeyInfo').textContent = state.settings.hasApiKey
      ? `API key configurata (${state.settings.apiKeySource}, ${state.settings.apiKeyHint}). Lascia il campo vuoto per mantenerla.`
      : 'Nessuna API key: l\'app funziona completamente in modalità manuale; i pulsanti “Claude” compaiono quando ne inserisci una.';
  }

  // ------------------------------------------------------------------ splitters
  function restoreSizes() {
    const w = LS.get('leftW', null);
    if (w) $('#paneLeft').style.width = w;
    const h = LS.get('videoH', null);
    if (h) $('#videoPane').style.height = h;
  }
  function dragSplitter(handle, onMove, onEnd) {
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handle.classList.add('dragging');
      handle.setPointerCapture(e.pointerId);
      const move = (ev) => onMove(ev);
      const up = () => { handle.classList.remove('dragging'); handle.removeEventListener('pointermove', move); onEnd(); };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up, { once: true });
    });
  }

  function newCpFields(date) {
    const tplId = state.project?.templateId || 'checkpoint-settimanale';
    return `<label class="field"><span>Data della riunione</span><input class="input" type="date" name="date" value="${date || today()}" /></label>
      <label class="field"><span>Titolo</span><input class="input" name="title" value="Checkpoint settimanale" /></label>
      <label class="field"><span>Template</span><select class="select" name="templateId">${Templates.all().map((t) => `<option value="${esc(t.id)}" ${t.id === tplId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>`;
  }

  // ------------------------------------------------------------------ events
  function bindEvents() {
    // sidebar
    $('#sbClose').onclick = () => setSidebar(false);
    $('#sbOpen').onclick = () => setSidebar(true);
    $('#scrim').onclick = () => setSidebar(false);
    $$('.nav-item').forEach((b) => (b.onclick = () => setView(b.dataset.view)));
    $('#projectSelect').onchange = (e) => selectProject(e.target.value);
    $('#cpFilter').oninput = renderCheckpointList;
    $('#checkpointList').onclick = (e) => { const b = e.target.closest('.cp-item'); if (b) openCheckpoint(b.dataset.id); };

    const newCp = async () => {
      if (!state.project) return;
      const v = await dialog('Nuovo checkpoint', newCpFields(), { okText: 'Crea' });
      if (!v) return;
      const cp = await api('POST', `/api/projects/${state.project.id}/checkpoints`, v);
      state.checkpoints = await api('GET', `/api/projects/${state.project.id}/checkpoints`);
      await openCheckpoint(cp.id);
      setView('workspace');
    };
    $('#newCheckpointBtn').onclick = newCp;
    $('#emptyNewBtn').onclick = newCp;
    $('#newProjectBtn').onclick = async () => {
      const v = await dialog('Nuovo progetto', `<label class="field"><span>Nome del cliente / progetto</span><input class="input" name="name" placeholder="Es. ATAC" /></label>`, { okText: 'Crea' });
      if (!v?.name?.trim()) return;
      const p = await api('POST', '/api/projects', { name: v.name.trim() });
      state.projects.push(p);
      await selectProject(p.id);
    };

    // topbar
    $('#cpTitle').oninput = (e) => { state.cp.title = e.target.value; markDirty(); };
    $('#cpDate').onchange = (e) => { if (e.target.value) { state.cp.date = e.target.value; markDirty(); } };
    $('#cpStatus').onchange = (e) => { state.cp.status = e.target.value; markDirty(); };
    $('#importTranscriptBtn').onclick = () => $('#transcriptFile').click();
    $('#importVideoBtn').onclick = () => $('#videoFile').click();
    $('#videoPick').onclick = () => $('#videoFile').click();
    $('#transcriptFile').onchange = (e) => { const f = e.target.files[0]; if (f) importTranscriptFile(f); e.target.value = ''; };
    $('#videoFile').onchange = (e) => { const f = e.target.files[0]; if (f) uploadVideo(f); e.target.value = ''; };
    $('#moreBtn').onclick = (e) => { e.stopPropagation(); $('#moreMenu').hidden = !$('#moreMenu').hidden; };
    document.addEventListener('click', () => ($('#moreMenu').hidden = true));
    $('#moreMenu').onclick = async (e) => {
      const act = e.target.dataset.act;
      if (!act || !state.cp) return;
      const base = `${state.project.name}_${state.cp.date}`.replace(/[^\w-]+/g, '_');
      const header = `${state.project.name} — ${state.cp.title} — ${itDate(state.cp.date)}`;
      if (act === 'open-folder') {
        await saveNow();
        if (!state.cp.folder) return toast('La cartella del checkpoint viene creata quando aggiungi video o transcript');
        return api('POST', '/api/folder/open', { rel: state.cp.folder });
      }
      if (act === 'export-txt') download(`${base}_transcript.txt`, Transcript.toTxt(cues(), header));
      if (act === 'export-vtt') download(`${base}_transcript.vtt`, Transcript.toVtt(cues()));
      if (act === 'export-json') download(`${base}_checkpoint.json`, JSON.stringify(state.cp, null, 2), 'application/json');
      if (act === 'remove-video' && state.cp.video && await confirmDlg('Scollegare il video?', state.cp.video.external ? 'Il video resta nella cartella di lavoro: viene solo scollegato dal checkpoint.' : 'Il file video verrà eliminato dall\'archivio locale. Transcript e punti restano salvati.', 'Conferma', true)) {
        await api('DELETE', `/api/projects/${state.cp.projectId}/checkpoints/${state.cp.id}/video`);
        state.cp.video = null;
        loadVideo();
      }
      if (act === 'delete-checkpoint' && await confirmDlg('Eliminare il checkpoint?', `“${state.cp.title}” del ${itDate(state.cp.date)} verrà eliminato definitivamente dall'archivio (i file nella cartella di lavoro non vengono toccati).`, 'Elimina', true)) {
        clearTimeout(saveTimer); saveTimer = null;
        await api('DELETE', `/api/projects/${state.cp.projectId}/checkpoints/${state.cp.id}`);
        state.checkpoints = state.checkpoints.filter((c) => c.id !== state.cp.id);
        state.cp = null;
        state.history = null;
        renderCheckpointList();
        if (state.checkpoints[0]) openCheckpoint(state.checkpoints[0].id); else showNoCheckpoint();
      }
    };

    // player
    $('#playBtn').onclick = togglePlay;
    $('#backBtn').onclick = () => seekTo(video.currentTime - 5);
    $('#fwdBtn').onclick = () => seekTo(video.currentTime + 5);
    $('#rate').onchange = (e) => { video.playbackRate = Number(e.target.value); LS.set('rate', e.target.value); };
    $('#rate').value = LS.get('rate', '1');
    video.addEventListener('loadedmetadata', () => { video.playbackRate = Number($('#rate').value); updateTime(); });
    video.addEventListener('play', () => { if (!rafId) rafId = requestAnimationFrame(loop); });
    video.addEventListener('pause', updateTime);
    video.addEventListener('seeked', () => syncTranscript(true));
    video.addEventListener('timeupdate', () => { if (video.paused) { syncTranscript(); updateTime(); } });
    video.addEventListener('error', () => { if (state.cp?.video?.external) toast(`Video non trovato nella cartella: ${state.cp.video.external}`, { error: true }); });
    const seek = $('#seek');
    seek.addEventListener('pointerdown', () => (seeking = true));
    seek.addEventListener('change', () => { seeking = false; if (video.duration) seekTo((seek.value / 1000) * video.duration); });
    seek.addEventListener('input', () => { if (Number.isFinite(video.duration)) $('#timeLabel').textContent = `${fmtT((seek.value / 1000) * video.duration)} / ${fmtT(video.duration)}`; });

    // tabs
    $$('.tab').forEach((t) => (t.onclick = () => {
      $$('.tab').forEach((x) => x.classList.toggle('active', x === t));
      $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${t.dataset.tab}`));
      LS.set('tab', t.dataset.tab);
      if (!state.cp) return;
      if (t.dataset.tab === 'email') renderEmail();
      if (t.dataset.tab === 'points') $$('#summaryEditor textarea').forEach(autosize);
      if (t.dataset.tab === 'analysis') renderAnalysis();
    }));
    $(`.tab[data-tab="${LS.get('tab', 'points')}"]`)?.click();

    // transcript
    trEl.addEventListener('click', async (e) => {
      const cueNode = e.target.closest('.cue');
      if (!cueNode) return;
      const act = e.target.closest('[data-act]')?.dataset.act;
      const id = cueNode.dataset.id;
      const i = Number(cueNode.dataset.i);
      const c = cues()[i];
      if (act === 'seek') seekTo(c.start, true);
      else if (act === 'speaker') renameSpeaker(c.speaker);
      else if (act === 'analysis') $('.tab[data-tab="analysis"]').click();
      else if (act === 'edit') {
        if (!getSelection().isCollapsed) return; // selezione per Alt+1..9
        startEdit(id);
      } else if (act === 'flag') {
        c.flagged = !c.flagged;
        cueNode.classList.toggle('flagged', c.flagged);
        updateProgress();
        markDirty();
      } else if (act === 'fix') {
        const btn = e.target.closest('button');
        await busy(btn, async () => {
          const fixed = await localAi('proofread', c.text);
          if (fixed && fixed !== c.text) { state.suggestions.set(c.id, fixed); cueNode.outerHTML = cueHtml(c, i); renderSuggestBar(); }
          else toast('Nessuna correzione proposta');
        });
      } else if (act === 'merge') {
        const next = cues()[i + 1];
        if (!next) return;
        snapshot();
        c.text = `${c.text} ${next.text}`.trim();
        c.end = next.end;
        cues().splice(i + 1, 1);
        renderTranscript();
        markDirty();
        offerUndo('Blocchi uniti');
      } else if (act === 'delete') {
        snapshot();
        cues().splice(i, 1);
        state.activeIdx = -1;
        renderTranscript();
        syncTranscript();
        markDirty();
        offerUndo('Blocco eliminato');
      } else if (act === 'accept' || act === 'reject') applySuggestion(id, act === 'accept');
    });
    ['wheel', 'touchmove'].forEach((ev) => trEl.addEventListener(ev, () => (state.lastUserScroll = Date.now()), { passive: true }));
    $('#speakers').onclick = (e) => { const s = e.target.closest('.speaker-chip'); if (s) renameSpeaker(s.dataset.speaker); };
    $('#followToggle').onchange = (e) => { LS.set('follow', e.target.checked); if (e.target.checked) autoScroll(true); };
    $('#followToggle').checked = LS.get('follow', true);

    let searchTimer;
    const setSearch = (q) => { state.search = q; state.activeIdx = -1; state.searchPos = -1; renderTranscript(); syncTranscript(); };
    $('#search').oninput = (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => setSearch(e.target.value.trim()), 150); };
    $('#search').onkeydown = (e) => {
      if (e.key === 'Enter') {
        const marks = $$('mark', trEl);
        if (!marks.length) return;
        state.searchPos = ((state.searchPos ?? -1) + 1) % marks.length;
        marks[state.searchPos].scrollIntoView({ block: 'center', behavior: 'smooth' });
        state.lastUserScroll = Date.now();
      }
      if (e.key === 'Escape') { e.target.value = ''; setSearch(''); syncTranscript(true); }
    };
    $('#replaceAllBtn').onclick = () => {
      const q = $('#search').value;
      if (!q) return toast('Scrivi prima il testo da cercare', { error: true });
      const rep = $('#replace').value;
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      snapshot();
      let n = 0;
      cues().forEach((c) => { c.text = c.text.replace(re, () => (n++, rep)); if (c.speaker) c.speaker = c.speaker.replace(re, () => (n++, rep)); });
      if (!n) return toast('Nessuna occorrenza');
      renderTranscript();
      markDirty();
      offerUndo(`${n} sostituzion${n === 1 ? 'e' : 'i'}`);
    };
    $$('.seg-btn[data-filter]').forEach((b) => (b.onclick = () => {
      state.filter = b.dataset.filter;
      $$('.seg-btn[data-filter]').forEach((x) => x.classList.toggle('active', x === b));
      state.activeIdx = -1;
      renderTranscript();
      syncTranscript();
    }));
    $('#cleanupBtn').onclick = () => {
      snapshot();
      let n = 0;
      cues().forEach((c) => { const t = cleanupText(c.text); if (t !== c.text) { c.text = t; n++; } });
      if (!n) return toast('Niente da pulire');
      state.activeIdx = -1;
      renderTranscript();
      syncTranscript();
      markDirty();
      offerUndo(`Puliti ${n} blocchi`);
    };
    $('#acceptAllBtn').onclick = () => { snapshot(); [...state.suggestions.keys()].forEach((id) => { const c = cues().find((x) => x.id === id); if (c) c.text = state.suggestions.get(id); }); state.suggestions.clear(); renderTranscript(); markDirty(); offerUndo('Correzioni applicate'); };
    $('#rejectAllBtn').onclick = () => { state.suggestions.clear(); renderTranscript(); };

    // punti discussi
    $('#tplSelect').onchange = (e) => changeTemplate(e.target.value);
    const se = $('#summaryEditor');
    se.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.para) state.cp.summary[t.dataset.para] = t.value;
      else {
        const item = t.closest('.sum-item');
        if (!item) return;
        state.cp.summary[item.dataset.sec][Number(item.dataset.i)][t.dataset.field] = t.value;
      }
      if (t.tagName === 'TEXTAREA') autosize(t);
      summaryChanged();
    });
    se.addEventListener('keydown', (e) => {
      const item = e.target.closest('.sum-item');
      if (item && e.key === 'Enter' && !e.shiftKey && e.target.dataset.field === 'text') { e.preventDefault(); addToSection(item.dataset.sec); }
    });
    se.addEventListener('click', async (e) => {
      const add = e.target.closest('[data-add]');
      if (add) return addToSection(add.dataset.add);
      const jump = e.target.closest('[data-jump]');
      if (jump) return jumpTo(Number(jump.dataset.jump));
      const item = e.target.closest('.sum-item');
      if (!item) return;
      const list = state.cp.summary[item.dataset.sec];
      const i = Number(item.dataset.i);
      if (e.target.closest('[data-related]')) return showRelated(list[i].text);
      if (e.target.closest('[data-rm]')) { list.splice(i, 1); renderSummaryEditor(); summaryChanged(); }
      if (e.target.closest('[data-done]')) {
        const [it] = list.splice(i, 1);
        const doneSec = Templates.itemSections(state.tpl).find((s) => s.role === 'done');
        state.cp.summary[doneSec.key].push({ text: it.text, note: '', owner: '', deadline: '', ...(it.ref ? { ref: it.ref } : {}) });
        state.cp.summary = Templates.normalize(state.cp.summary, state.tpl);
        renderSummaryEditor();
        summaryChanged();
      }
      const rw = e.target.closest('[data-rewrite]');
      if (rw) await busy(rw, async () => {
        const src = list[i].ref?.source || list[i].text;
        const out = await localAi('rewrite', src);
        if (!out || out === '-') return toast('Nessuna proposta');
        list[i].ref = { ...(list[i].ref || {}), source: src };
        list[i].text = out;
        renderSummaryEditor();
        summaryChanged();
      });
    });
    let dragSrc = null;
    se.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.sum-item');
      if (!item || (item.contains(document.activeElement) && /TEXTAREA|INPUT/.test(document.activeElement.tagName))) return e.preventDefault();
      dragSrc = { sec: item.dataset.sec, i: Number(item.dataset.i) };
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    se.addEventListener('dragover', (e) => { if (dragSrc && e.target.closest('.sum-section[data-sec]')) e.preventDefault(); });
    se.addEventListener('drop', (e) => {
      const secEl = e.target.closest('.sum-section[data-sec]');
      if (!dragSrc || !secEl) return;
      e.preventDefault();
      const s = state.cp.summary;
      const [it] = s[dragSrc.sec].splice(dragSrc.i, 1);
      const target = secEl.dataset.sec;
      const over = e.target.closest('.sum-item');
      const at = over && over.dataset.sec === target ? Number(over.dataset.i) : s[target].length;
      s[target].splice(at, 0, { owner: '', deadline: '', note: '', ...it });
      state.cp.summary = Templates.normalize(s, state.tpl);
      const role = state.tpl.sections.find((x) => x.key === target)?.role;
      if (it.ref?.source && role) learnFrom(it.ref.source, role);
      dragSrc = null;
      renderSummaryEditor();
      summaryChanged();
    });
    se.addEventListener('dragend', () => { dragSrc = null; $$('.sum-item.dragging').forEach((x) => x.classList.remove('dragging')); });
    $('#carryOverBtn').onclick = () => carryOver().catch((e) => toast(e.message, { error: true }));

    // analisi
    const an = $('#analysisBody');
    an.addEventListener('click', async (e) => {
      const jump = e.target.closest('[data-jump]');
      if (jump && !e.target.closest('.an-edit')) return jumpTo(Number(jump.dataset.jump));
      const addto = e.target.closest('[data-addto]');
      if (addto) return addFromAnalysis(addto, addto.dataset.addto);
      const f = e.target.closest('[data-anfilter]');
      if (f) { state.analysisFilter = f.dataset.anfilter; return renderAnalysis(); }
      const topic = e.target.closest('[data-topic]');
      if (topic) { $('#search').value = topic.dataset.topic; state.search = topic.dataset.topic; renderTranscript(); return; }
      const dis = e.target.closest('[data-dismiss]');
      if (dis) {
        const c = state.analysisCache.cands.find((x) => x.key === dis.dataset.dismiss);
        state.cp.analysis.dismissed.push(dis.dataset.dismiss);
        if (c) learnFrom(c.text, 'none');
        markDirty();
        state.analysisCache.cands = state.analysisCache.cands.filter((x) => x.key !== dis.dataset.dismiss);
        state.cueRoles.delete(c?.cueIds[0]);
        return renderAnalysis();
      }
      const rw = e.target.closest('[data-rewrite-cand]');
      if (rw) await busy(rw, async () => {
        const c = state.analysisCache.cands.find((x) => x.key === rw.dataset.rewriteCand);
        const out = await localAi('rewrite', c.text);
        const box = $(`.an-edit[data-edit-key="${CSS.escape(c.key)}"]`);
        if (out && out !== '-' && box) box.innerText = out;
      });
    });
    an.addEventListener('change', (e) => {
      if (e.target.id === 'showDupToggle') { state.showDuplicates = e.target.checked; renderAnalysis(); }
      if (e.target.dataset.addsel !== undefined && e.target.value) addFromAnalysis(e.target, e.target.value);
    });

    // email
    $('#emailBody').oninput = (e) => { state.cp.email.body = e.target.value; if (!state.cp.email.edited) { state.cp.email.edited = true; $('#emailFoot').textContent = 'Testo modificato a mano: le modifiche ai punti non lo aggiornano più (usa “Rigenera dai punti”).'; } markDirty(); };
    $('#emailSubject').oninput = (e) => { state.cp.email.subject = e.target.value; markDirty(); };
    $('#regenEmailBtn').onclick = async () => {
      if (state.cp.email.edited && !(await confirmDlg('Rigenerare il testo?', 'Le modifiche fatte a mano al testo dell\'email verranno sostituite.', 'Rigenera', true))) return;
      state.cp.email.edited = false;
      renderEmail(true);
    };
    $('#copyEmailBtn').onclick = copyEmail;
    $('#emlBtn').onclick = () => download(`Riepilogo_${state.project.name}_${state.cp.date}.eml`.replace(/\s+/g, '_'), Email.toEml({ to: state.project.recipients, subject: $('#emailSubject').value, text: $('#emailBody').value }), 'message/rfc822');

    $('#notes').oninput = (e) => { state.cp.notes = e.target.value; markDirty(); };

    // AI Claude (facoltativa)
    $('#aiSummaryBtn').onclick = (e) => busy(e.currentTarget, async () => {
      await saveNow();
      const has = Templates.roleItems(state.cp.summary, state.tpl).length > 0;
      if (has && !(await confirmDlg('Sostituire i punti?', 'I punti attuali verranno sostituiti con la proposta AI.', 'Sostituisci', true))) return;
      const res = await api('POST', '/api/ai/summary', { projectId: state.project.id, checkpointId: state.cp.id, template: state.tpl });
      state.cp.summary = Templates.normalize(res.summary, state.tpl);
      state.cp.email.edited = false;
      renderSummaryEditor();
      renderEmail(true);
      toast('Punti compilati: rivedili prima di inviare');
    });
    $('#aiProofBtn').onclick = (e) => busy(e.currentTarget, async () => {
      if (!cues().length) return toast('Nessun transcript', { error: true });
      await saveNow();
      const res = await api('POST', '/api/ai/proofread', { projectId: state.project.id, checkpointId: state.cp.id });
      state.suggestions = new Map(res.corrections.map((c) => [c.id, c.text]));
      renderTranscript();
      toast(res.corrections.length ? `${res.corrections.length} correzioni proposte` : 'Nessuna correzione necessaria');
    });
    $('#aiForecastBtn').onclick = (e) => busy(e.currentTarget, async () => {
      await saveNow();
      await api('POST', '/api/ai/forecast', { projectId: state.project.id });
      await renderForecastView();
    });
    $('#copyAgendaBtn').onclick = async () => {
      const f = lastForecast;
      const items = [...(f?.ai?.items || []), ...(f?.local?.items || [])];
      if (!items.length) return toast('Nessun tema da copiare', { error: true });
      const seen = [];
      const lines = items.filter((it) => (seen.some((s) => similar(s, it.title) > 0.7) ? false : seen.push(it.title))).map((it) => `• ${it.title}${it.owner ? ` (${it.owner})` : ''}`);
      await navigator.clipboard.writeText(`Agenda prossimo checkpoint ${state.project.name}\n\n${lines.join('\n')}`);
      toast('Agenda copiata');
    };

    // storico
    $('#timeline').onclick = (e) => { const b = e.target.closest('[data-open]'); if (b) openCheckpoint(b.dataset.open); };

    // cartella
    $('#refreshFolderBtn').onclick = () => renderFolder().catch((e) => toast(e.message, { error: true }));
    $('#openWorkDirBtn').onclick = () => api('POST', '/api/folder/open', { which: 'work' });
    $('#openDataDirBtn').onclick = () => api('POST', '/api/folder/open', { which: 'archive' });
    $('#folderBody').onclick = async (e) => {
      const use = e.target.closest('[data-use]');
      const nc = e.target.closest('[data-newcp]');
      try {
        if (use) { await useFolderFile(folderData.files[Number(use.dataset.use)]); setView('workspace'); }
        if (nc) await newCheckpointFromFile(folderData.files[Number(nc.dataset.newcp)]);
      } catch (err) { toast(err.message, { error: true }); }
    };

    // template
    $('#tplList').onclick = (e) => {
      if (e.target.closest('#tplNew')) {
        tplEditing = { id: 'custom-' + Date.now().toString(36), name: 'Nuovo template', description: '', greeting: 'Ciao a tutti,', intro: 'di seguito i punti discussi durante la riunione odierna.', sections: [{ key: 's1', title: 'Punti discussi', label: 'Punti discussi:', kind: 'list', role: 'info', note: true }], closing: '', signoff: 'Grazie,\n{firma}' };
        Templates.setCustom([...Templates.getCustom(), tplEditing]);
        renderTemplates();
        return;
      }
      const b = e.target.closest('[data-tpl]');
      if (b) { tplEditing = JSON.parse(JSON.stringify(Templates.get(b.dataset.tpl))); renderTemplates(); }
    };
    const tplEd = $('#tplEditor');
    tplEd.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.tf) tplEditing[t.dataset.tf] = t.value;
      const row = t.closest('[data-si]');
      if (row && t.dataset.sf) {
        const sec = tplEditing.sections[Number(row.dataset.si)];
        sec[t.dataset.sf] = t.type === 'checkbox' ? t.checked : t.value;
        if (t.dataset.sf === 'kind') renderTplEditor();
      }
      $('.tpl-preview', tplEd).textContent = Email.toText(state.cp?.templateId === tplEditing.id ? state.cp.summary : {}, tplEditing, state.cp ? emailVars() : { firma: state.settings.author });
    });
    tplEd.addEventListener('change', (e) => { if (e.target.dataset.sf === 'kind' || e.target.dataset.sf === 'role') tplEd.dispatchEvent(new Event('input')); });
    tplEd.addEventListener('click', async (e) => {
      const row = e.target.closest('[data-si]');
      const secs = tplEditing.sections;
      if (row && e.target.closest('[data-smove]')) {
        const i = Number(row.dataset.si);
        const j = i + Number(e.target.closest('[data-smove]').dataset.smove);
        if (j >= 0 && j < secs.length) [secs[i], secs[j]] = [secs[j], secs[i]];
        return renderTplEditor();
      }
      if (row && e.target.closest('[data-sdel]')) { secs.splice(Number(row.dataset.si), 1); return renderTplEditor(); }
      if (e.target.closest('#secAdd')) {
        secs.push({ key: 's' + Date.now().toString(36), title: 'Nuova sezione', label: 'Nuova sezione:', kind: 'list', role: 'info', note: false });
        return renderTplEditor();
      }
      if (e.target.closest('#tplDup')) {
        tplEditing = { ...JSON.parse(JSON.stringify(tplEditing)), id: 'custom-' + Date.now().toString(36), name: tplEditing.name + ' (copia)', builtin: false };
        await saveCustomTemplates([...Templates.getCustom(), tplEditing]);
        toast('Template duplicato: ora puoi modificarlo');
        return renderTemplates();
      }
      if (e.target.closest('#tplSave')) {
        if (!secs.length) return toast('Serve almeno una sezione', { error: true });
        const t = { ...tplEditing, builtin: false };
        const list = Templates.getCustom().filter((c) => c.id !== t.id).concat(t);
        await saveCustomTemplates(list);
        if (state.cp?.templateId === t.id) { state.tpl = Templates.get(t.id); state.cp.summary = Templates.normalize(state.cp.summary, state.tpl); renderSummaryEditor(); renderEmail(!state.cp.email.edited); }
        toast('Template salvato');
        return renderTemplates();
      }
      if (e.target.closest('#tplDel') && (await confirmDlg('Eliminare il template?', `“${tplEditing.name}” verrà eliminato. I checkpoint che lo usano passeranno al template predefinito del progetto.`, 'Elimina', true))) {
        await saveCustomTemplates(Templates.getCustom().filter((c) => c.id !== tplEditing.id));
        tplEditing = null;
        return renderTemplates();
      }
      if (e.target.closest('#tplReset')) {
        await saveCustomTemplates(Templates.getCustom().filter((c) => c.id !== tplEditing.id));
        tplEditing = JSON.parse(JSON.stringify(Templates.get(tplEditing.id)));
        return renderTemplates();
      }
      if (e.target.closest('#tplApply')) {
        setView('workspace');
        $('#tplSelect').value = tplEditing.id;
        return changeTemplate(tplEditing.id);
      }
    });

    // AI locale
    $('#localAiBody').addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      try {
        if (b.id === 'olInstall') await api('POST', '/api/ollama/install');
        else if (b.id === 'olStart') { await api('POST', '/api/ollama/start'); toast('Avvio di Ollama…'); await new Promise((r) => setTimeout(r, 2500)); }
        else if (b.dataset.pull) await api('POST', '/api/ollama/pull', { model: b.dataset.pull });
        else if (b.dataset.usemodel) { state.settings = await api('PUT', '/api/settings', { ollamaModel: b.dataset.usemodel }); toast(`Modello in uso: ${b.dataset.usemodel}`); }
        else if (b.dataset.delmodel) {
          if (!(await confirmDlg('Eliminare il modello?', `${b.dataset.delmodel} verrà rimosso dal computer.`, 'Elimina', true))) return;
          await api('POST', '/api/ollama/delete', { model: b.dataset.delmodel });
        } else if (b.id === 'olTrain') {
          await busy(b, async () => {
            const r = await api('POST', '/api/ollama/train', { projectId: state.project.id, base: $('#olBase').value });
            state.settings = await api('PUT', '/api/settings', { ollamaModel: r.model });
            toast(`Modello ${r.model} creato con ${r.examples} esempi e impostato come predefinito`);
          });
        } else if (b.id === 'resetLearning') {
          if (!(await confirmDlg('Azzerare l\'apprendimento?', 'Il rilevatore dei punti dimenticherà le scelte fatte su questo progetto.', 'Azzera', true))) return;
          state.learning = null;
          await api('PUT', `/api/projects/${state.project.id}/learning`, null);
        } else if (b.id === 'olTestRewrite' || b.id === 'olTestFix') {
          await busy(b, async () => {
            const out = await localAi(b.id === 'olTestRewrite' ? 'rewrite' : 'proofread', $('#olTestIn').value);
            $('#olTestOut').hidden = false;
            $('#olTestOut').textContent = out;
          });
          return;
        } else return;
      } catch (err) { toast(err.message, { error: true }); }
      renderLocalAi();
    });

    // impostazioni
    $('#saveProjectBtn').onclick = (e) => busy(e.currentTarget, async () => {
      const p = await api('PUT', `/api/projects/${state.project.id}`, {
        name: $('#pName').value, description: $('#pDesc').value, recipients: $('#pRecipients').value, templateId: $('#pTemplate').value,
        subjectTemplate: $('#pSubject').value, glossary: $('#pGlossary').value, exampleEmail: $('#pExample').value,
      });
      Object.assign(state.project, p);
      renderProjectSelect();
      toast('Progetto salvato');
    });
    $('#deleteProjectBtn').onclick = async () => {
      if (!(await confirmDlg('Eliminare il progetto?', `Tutti i checkpoint e i transcript di “${state.project.name}” verranno eliminati dall'archivio (i file nella cartella di lavoro non vengono toccati).`, 'Elimina', true))) return;
      await api('DELETE', `/api/projects/${state.project.id}`);
      state.projects = state.projects.filter((p) => p.id !== state.project.id);
      await selectProject(state.projects[0]?.id);
    };
    $('#saveSettingsBtn').onclick = (e) => busy(e.currentTarget, async () => {
      const body = { author: $('#sAuthor').value, model: $('#sModel').value };
      if ($('#sKey').value.trim()) body.apiKey = $('#sKey').value.trim();
      state.settings = await api('PUT', '/api/settings', body);
      applySettings();
      renderSettings();
      toast('Impostazioni salvate');
    });
    $$('#themeSeg .seg-btn').forEach((b) => (b.onclick = () => applyTheme(b.dataset.theme)));

    // splitters
    const split = $('#split');
    dragSplitter($('#vSplitter'), (e) => {
      const r = split.getBoundingClientRect();
      $('#paneLeft').style.width = Math.min(75, Math.max(25, ((e.clientX - r.left) / r.width) * 100)) + '%';
    }, () => LS.set('leftW', $('#paneLeft').style.width));
    dragSplitter($('#hSplitter'), (e) => {
      const r = $('#paneLeft').getBoundingClientRect();
      $('#videoPane').style.height = Math.min(r.height - 160, Math.max(120, e.clientY - r.top)) + 'px';
    }, () => LS.set('videoH', $('#videoPane').style.height));

    // drag & drop file ovunque
    let dragDepth = 0;
    window.addEventListener('dragenter', (e) => { if (e.dataTransfer?.types.includes('Files')) { dragDepth++; $('#videoPane').classList.add('drag-over'); } });
    window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('#videoPane').classList.remove('drag-over'); } });
    window.addEventListener('dragover', (e) => { if (e.dataTransfer?.types.includes('Files')) e.preventDefault(); });
    window.addEventListener('drop', (e) => {
      if (!e.dataTransfer?.files.length) return;
      e.preventDefault();
      dragDepth = 0;
      $('#videoPane').classList.remove('drag-over');
      [...e.dataTransfer.files].forEach(routeFile);
    });

    // tastiera
    document.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); setSidebar(!sidebarOpen()); return; }
      if (state.view !== 'workspace' || !state.cp) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); $('#search').focus(); $('#search').select(); return; }
      if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); togglePlay(); return; }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); seekTo(video.currentTime - 3, !video.paused); return; }
      if (e.altKey && /^Digit[1-9]$/.test(e.code)) {
        const sel = getSelection();
        const txt = sel.toString().replace(/\s+/g, ' ').trim();
        if (!txt) return toast('Seleziona prima una frase nel transcript');
        const sec = Templates.itemSections(state.tpl)[Number(e.code.slice(5)) - 1];
        if (!sec) return;
        e.preventDefault();
        const cueNode = sel.anchorNode?.parentElement?.closest('.cue');
        const c = cueNode ? cues()[Number(cueNode.dataset.i)] : null;
        addToSection(sec.key, cleanSentence(txt), c ? { ref: { start: c.start, source: txt } } : {});
        learnFrom(txt, sec.role);
        sel.removeAllRanges();
        toast(`Aggiunto a “${sec.title}”`);
        return;
      }
      if (typing) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo(video.currentTime - 5); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); seekTo(video.currentTime + 5); }
    });
  }

  init().catch((e) => toast('Impossibile avviare: ' + e.message, { error: true }));
})();
