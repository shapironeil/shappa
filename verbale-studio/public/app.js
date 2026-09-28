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
    project: null,
    checkpoints: [],
    cp: null,
    view: 'workspace',
    search: '',
    filter: 'all',
    activeIdx: -1,
    activeWord: -1,
    editingId: null,
    suggestions: new Map(),
    lastUserScroll: 0,
    undo: null,
  };

  const video = $('#video');
  const trEl = $('#transcript');

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

  function dialog(title, bodyHtml, { okText = 'OK', danger } = {}) {
    const dlg = $('#dialog');
    $('#dlgTitle').textContent = title;
    $('#dlgBody').innerHTML = bodyHtml;
    $('#dlgOk').textContent = okText;
    $('#dlgOk').classList.toggle('danger', Boolean(danger));
    dlg.returnValue = '';
    dlg.showModal();
    const first = $('#dlgBody input, #dlgBody textarea');
    if (first) setTimeout(() => { first.focus(); first.select?.(); }, 30);
    return new Promise((resolve) => {
      dlg.addEventListener('close', () => {
        if (dlg.returnValue !== 'ok') return resolve(null);
        const values = {};
        $$('#dlgBody [name]').forEach((i) => (values[i.name] = i.value));
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
  const longDate = (iso) => { const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
  const fmtT = (s) => Transcript.fmtShort(s);
  const parseItDate = (s) => {
    const m = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s || '');
    if (!m) return null;
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return new Date(y, Number(m[2]) - 1, Number(m[1]), 12);
  };
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
  function similar(a, b) {
    const A = new Set(norm(a)), B = new Set(norm(b));
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((w) => B.has(w) && inter++);
    return inter / Math.min(A.size, B.size);
  }
  function download(name, content, type = 'text/plain;charset=utf-8') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

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
    if (!state.cp) return saving;
    const cp = state.cp;
    const payload = { title: cp.title, date: cp.date, status: cp.status, transcript: cp.transcript, notes: cp.notes, summary: cp.summary, email: cp.email };
    saving = saving.then(() =>
      api('PUT', `/api/projects/${cp.projectId}/checkpoints/${cp.id}`, payload)
        .then(() => {
          $('#saveState').textContent = `Salvato ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
          const s = state.checkpoints.find((c) => c.id === cp.id);
          if (s) { Object.assign(s, { title: cp.title, date: cp.date, status: cp.status }); renderCheckpointList(); }
        })
        .catch((e) => { $('#saveState').textContent = 'Errore di salvataggio'; toast(e.message, { error: true }); })
    );
    return saving;
  }
  window.addEventListener('beforeunload', (e) => {
    if (saveTimer) { saveNow(); e.preventDefault(); }
  });

  // ------------------------------------------------------------------ bootstrap
  async function init() {
    applyTheme(LS.get('theme', 'auto'));
    setSidebar(LS.get('sidebar', window.innerWidth > 1100));
    restoreSizes();
    bindEvents();
    const data = await api('GET', '/api/state');
    state.projects = data.projects;
    state.settings = data.settings;
    applySettings();
    const pid = LS.get('project', null);
    await selectProject(state.projects.find((p) => p.id === pid) ? pid : state.projects[0]?.id);
    setView(LS.get('view', 'workspace'));
  }

  function applySettings() {
    document.body.classList.toggle('no-ai', !state.settings.hasApiKey);
  }

  async function selectProject(pid) {
    await saveNow();
    state.project = state.projects.find((p) => p.id === pid) || null;
    LS.set('project', pid);
    renderProjectSelect();
    if (!state.project) return;
    state.checkpoints = await api('GET', `/api/projects/${pid}/checkpoints`);
    renderCheckpointList();
    const lastCp = LS.get('cp.' + pid, null);
    const target = state.checkpoints.find((c) => c.id === lastCp) || state.checkpoints[0];
    if (target) await openCheckpoint(target.id);
    else showNoCheckpoint();
    if (state.view !== 'workspace') setView(state.view);
  }

  function renderProjectSelect() {
    $('#projectSelect').innerHTML = state.projects.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    if (state.project) $('#projectSelect').value = state.project.id;
    $('#localInfo').textContent = `Archivio locale · ${state.projects.length} progett${state.projects.length === 1 ? 'o' : 'i'}`;
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

  async function openCheckpoint(id) {
    await saveNow();
    const cp = await api('GET', `/api/projects/${state.project.id}/checkpoints/${id}`);
    cp.summary = Email.normalize(cp.summary);
    cp.email = cp.email || { subject: '', body: '', edited: false };
    cp.transcript = cp.transcript || { sourceName: '', cues: [] };
    state.cp = cp;
    state.activeIdx = -1;
    state.editingId = null;
    state.suggestions.clear();
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
    renderTranscript();
    renderSummaryEditor();
    renderEmail();
    renderMiniForecast();
    renderCheckpointList();
    if (state.view !== 'workspace') setView('workspace');
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
    if (v === 'history') renderHistory();
    if (v === 'forecast') renderForecastView();
    if (v === 'settings') renderSettings();
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
    // Anteprima immediata dal file locale mentre viene copiato nell'archivio
    video.src = URL.createObjectURL(file);
    $('#videoPane').classList.remove('empty');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/projects/${cp.projectId}/checkpoints/${cp.id}/video?name=${encodeURIComponent(file.name)}`);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const p = Math.round((e.loaded / e.total) * 100);
      $('#uploadFill').style.width = p + '%';
      $('#uploadText').textContent = `Copia nell'archivio locale… ${p}%`;
    };
    xhr.onload = () => {
      bar.hidden = true;
      if (xhr.status >= 300) return toast('Errore nel salvataggio del video', { error: true });
      const v = JSON.parse(xhr.responseText);
      if (state.cp?.id === cp.id) state.cp.video = v;
      const s = state.checkpoints.find((c) => c.id === cp.id);
      if (s) s.hasVideo = true;
      toast('Video salvato nell\'archivio');
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
  function updateTime() {
    const d = video.duration || 0;
    $('#timeLabel').textContent = `${fmtT(video.currentTime || 0)} / ${fmtT(d)}`;
    if (!seeking) $('#seek').value = d ? Math.round((video.currentTime / d) * 1000) : 0;
    $('#playIcon').innerHTML = video.paused ? '<path d="M6 4.5v11l9-5.5z"/>' : '<path d="M6.5 4.5v11M13.5 4.5v11"/>';
  }
  let seeking = false;

  // ------------------------------------------------------------------ transcript
  const SPEAKER_COLORS = ['#c96442', '#4f7d9c', '#5c8a4f', '#9a6fb0', '#b7791f', '#3f8f8a', '#b0506f', '#6f7a3a'];
  function speakerColor(name) {
    const list = speakersList();
    const i = list.findIndex((s) => s.name === name);
    return SPEAKER_COLORS[(i < 0 ? 0 : i) % SPEAKER_COLORS.length];
  }
  function speakersList() {
    const map = new Map();
    for (const c of state.cp?.transcript.cues || []) {
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
    const cls = ['cue', c.flagged && 'flagged', c.reviewed && 'reviewed', i === state.activeIdx && 'active'].filter(Boolean).join(' ');
    return `<div class="${cls}" data-id="${c.id}" data-i="${i}">
      <button class="cue-time" data-act="seek" title="Vai a questo punto">${fmtT(c.start)}</button>
      <div class="cue-body">
        ${c.speaker ? `<span class="cue-speaker" data-act="speaker" style="color:${speakerColor(c.speaker)}">${esc(c.speaker)}</span>` : ''}
        <div class="cue-text" data-act="edit">${i === state.activeIdx ? wordsHtml(c) : highlight(c.text)}</div>
        ${sugg != null ? suggHtml(c.text, sugg) : ''}
      </div>
      <div class="cue-tools">
        <button class="icon-btn flag-btn" data-act="flag" title="Segna da verificare"><svg viewBox="0 0 20 20"><path d="M5 17V3.5M5 4h9l-2 3.5 2 3.5H5"/></svg></button>
        <button class="icon-btn" data-act="merge" title="Unisci con il successivo"><svg viewBox="0 0 20 20"><path d="M10 4v12M6 12l4 4 4-4"/></svg></button>
        <button class="icon-btn" data-act="delete" title="Elimina blocco"><svg viewBox="0 0 20 20"><path d="M5 6h10M8 6V4h4v2M6.5 6l.7 10h5.6l.7-10"/></svg></button>
      </div>
    </div>`;
  }

  function renderTranscript() {
    const list = cues();
    if (!list.length) {
      trEl.innerHTML = `<div class="tr-empty"><strong>Nessun transcript</strong>Trascina qui il file scaricato da Teams (.vtt o .docx)<br>oppure usa il pulsante <em>Transcript</em> in alto.</div>`;
      $('#speakers').innerHTML = '';
      updateProgress();
      return;
    }
    let html = '';
    let matches = 0;
    const q = state.search.toLowerCase();
    list.forEach((c, i) => {
      if (state.filter === 'flagged' && !c.flagged) return;
      if (q) {
        const hay = (c.text + ' ' + c.speaker).toLowerCase();
        if (!hay.includes(q)) return;
        matches += hay.split(q).length - 1;
      }
      html += cueHtml(c, i);
    });
    trEl.innerHTML = html || `<div class="tr-empty">Nessun risultato</div>`;
    $('#searchCount').textContent = q ? `${matches} risultat${matches === 1 ? 'o' : 'i'}` : '';
    $('#speakers').innerHTML = speakersList()
      .map((s) => `<span class="speaker-chip" data-speaker="${esc(s.name)}" title="Clic per rinominare"><i style="background:${speakerColor(s.name)}"></i>${esc(s.name)} <small>${Math.round(s.time / 60)} min</small></span>`)
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
    // Revisione: un blocco ascoltato fino alla fine si considera revisionato
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
    const top = el.offsetTop - trEl.clientHeight * 0.32;
    trEl.scrollTo({ top, behavior: force ? 'auto' : 'smooth' });
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
    if (t > c.end) w = starts.length; // blocco concluso
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

  // --- editing
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
      if (e.key === 'Escape') { e.preventDefault(); commitEdit(); trEl.focus(); }
      else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); trEl.focus(); }
      else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        const next = list[i + (e.shiftKey ? -1 : 1)];
        if (next) { startEdit(next.id); cueEl(i + (e.shiftKey ? -1 : 1))?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
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

  function snapshot(label) {
    state.undo = { label, cues: JSON.parse(JSON.stringify(cues())) };
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

  // --- suggerimenti AI
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
  async function importTranscriptFile(file) {
    if (!state.cp) return toast('Crea prima un checkpoint', { error: true });
    try {
      let text;
      if (/\.docx$/i.test(file.name)) text = (await api('POST', '/api/docx-text', undefined, file)).text;
      else text = await file.text();
      const parsed = Transcript.parseTranscript(text);
      if (cues().length && !(await confirmDlg('Sostituire il transcript?', `Il checkpoint contiene già ${cues().length} blocchi. Verranno sostituiti da quelli di “${file.name}”.`, 'Sostituisci', true))) return;
      state.cp.transcript = { sourceName: file.name, importedAt: new Date().toISOString(), cues: parsed };
      state.activeIdx = -1;
      state.suggestions.clear();
      if (state.cp.status === 'bozza') { state.cp.status = 'in revisione'; $('#cpStatus').value = state.cp.status; }
      renderTranscript();
      syncTranscript(true);
      markDirty();
      toast(`Importati ${parsed.length} blocchi da ${file.name}`);
    } catch (e) {
      toast(e.message, { error: true });
    }
  }

  function routeFile(file) {
    if (/\.(vtt|srt|txt|docx)$/i.test(file.name)) importTranscriptFile(file);
    else if (/^(video|audio)\//.test(file.type) || /\.(mp4|m4v|mov|webm|mkv|m4a|mp3|wav)$/i.test(file.name)) uploadVideo(file);
    else toast(`Formato non supportato: ${file.name}`, { error: true });
  }

  // ------------------------------------------------------------------ summary editor
  const SEC_DEFS = [
    { key: 'completed', label: 'Attività completate', note: true },
    { key: 'inProgress', label: 'Attività in corso', note: true },
    { key: 'nextSteps', label: 'Prossimi passi', note: true },
    { key: 'attention', label: 'Punti di attenzione', attention: true },
  ];

  function autosize(ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }

  function renderSummaryEditor() {
    const s = state.cp.summary;
    let html = '';
    SEC_DEFS.forEach((sec, si) => {
      const items = s[sec.key];
      html += `<div class="sum-section" data-sec="${sec.key}">
        <div class="sum-head"><h4>${sec.label}</h4><span class="count">${items.length}</span>
          <span class="hint">Alt+${si + 1}</span>
          <button class="icon-btn" data-add="${sec.key}" title="Aggiungi voce"><svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg></button></div>`;
      if (!items.length) html += `<div class="sum-empty">Nessuna voce</div>`;
      items.forEach((it, i) => {
        html += `<div class="sum-item" draggable="true" data-sec="${sec.key}" data-i="${i}">
          <span class="bullet" title="Trascina per spostare">${sec.attention ? i + 1 + '.' : '⋮⋮'}</span>
          <div class="sum-fields">
            <textarea rows="1" data-field="text" placeholder="Descrizione…">${esc(it.text)}</textarea>
            ${sec.attention
              ? `<div class="sum-meta"><input class="owner" data-field="owner" placeholder="Owner (es. ATAC)" value="${esc(it.owner)}" /><input class="deadline" data-field="deadline" placeholder="Deadline gg/mm/aaaa" value="${esc(it.deadline)}" /></div>`
              : `<input class="note" data-field="note" placeholder="→ aggiornamento / esito (facoltativo)" value="${esc(it.note)}" />`}
          </div>
          <div class="row">
            ${sec.key === 'inProgress' || sec.key === 'nextSteps' ? `<button class="icon-btn rm" data-done title="Segna come completata"><svg viewBox="0 0 20 20"><path d="m4.5 10.5 3.5 3.5 7.5-8"/></svg></button>` : ''}
            <button class="icon-btn rm" data-rm title="Rimuovi"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5 5 15"/></svg></button>
          </div>
        </div>`;
      });
      if (sec.key === 'nextSteps') html += `<textarea class="sum-para" data-para="nextStepsNote" placeholder="Dettaglio sui prossimi passi / criticità (paragrafo facoltativo)…">${esc(s.nextStepsNote)}</textarea>`;
      html += `</div>`;
    });
    html += `<div class="sum-section"><div class="sum-head"><h4>Note di chiusura</h4></div>
      <textarea class="sum-para" data-para="closingNotes" placeholder="Es. È stato concordato che il prossimo checkpoint si terrà lunedì…">${esc(s.closingNotes.join('\n\n'))}</textarea></div>`;
    $('#summaryEditor').innerHTML = html;
    $$('#summaryEditor textarea').forEach(autosize);
  }

  function summaryChanged() {
    markDirty();
    if (!state.cp.email.edited) renderEmail(true);
  }

  function addToSection(key, text = '') {
    const item = key === 'attention' ? { text, owner: '', deadline: '' } : { text, note: '' };
    state.cp.summary[key].push(item);
    renderSummaryEditor();
    summaryChanged();
    const items = $$(`#summaryEditor .sum-item[data-sec="${key}"] textarea`);
    const last = items[items.length - 1];
    if (last && !text) last.focus();
  }

  function carryOver() {
    const prev = state.checkpoints
      .filter((c) => c.id !== state.cp.id && c.date <= state.cp.date)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!prev) return toast('Nessun checkpoint precedente', { error: true });
    api('GET', `/api/projects/${state.project.id}/checkpoints/${prev.id}`).then((p) => {
      const ps = Email.normalize(p.summary);
      const s = state.cp.summary;
      let n = 0;
      const addUnique = (key, items) => items.forEach((it) => {
        if (!s[key].some((x) => similar(x.text, it.text) > 0.8)) { s[key].push({ ...it }); n++; }
      });
      addUnique('inProgress', ps.inProgress);
      addUnique('nextSteps', ps.nextSteps);
      addUnique('attention', ps.attention);
      if (!s.nextStepsNote && ps.nextStepsNote) s.nextStepsNote = ps.nextStepsNote;
      renderSummaryEditor();
      summaryChanged();
      toast(`Riportate ${n} voci dal checkpoint del ${itDate(p.date)}. Aggiorna quelle concluse con ✓.`);
    }).catch((e) => toast(e.message, { error: true }));
  }

  // ------------------------------------------------------------------ email
  function defaultSubject() {
    const tpl = state.project?.subjectTemplate || '{data} — Checkpoint';
    return tpl.replace('{data}', itDate(state.cp.date));
  }
  function renderEmail(fromSummary) {
    const e = state.cp.email;
    if (!e.subject) e.subject = defaultSubject();
    if (fromSummary || !e.body) e.body = Email.toText(state.cp.summary, { author: state.settings.author });
    $('#emailSubject').value = e.subject;
    $('#emailBody').value = e.body;
    $('#emailFoot').textContent = e.edited
      ? 'Testo modificato a mano: le modifiche ai punti non lo aggiornano più (usa “Rigenera dai punti”).'
      : 'Il testo si aggiorna automaticamente dai “Punti discussi”. Puoi modificarlo liberamente.';
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

  // ------------------------------------------------------------------ forecast (locale)
  async function loadHistory() {
    return api('GET', `/api/projects/${state.project.id}/history`);
  }

  function localForecast(checkpoints) {
    const withSum = checkpoints.filter((c) => c.summary).map((c) => ({ ...c, summary: Email.normalize(c.summary) }));
    if (!withSum.length) return null;
    const [last, ...older] = withSum;
    const now = new Date();
    const items = [];
    const recurrence = (text) => {
      let n = 1;
      for (const c of older) {
        const s = c.summary;
        if ([...s.inProgress, ...s.nextSteps, ...s.attention].some((x) => similar(x.text, text) > 0.6)) n++;
        else break;
      }
      return n;
    };
    for (const a of last.summary.attention) {
      const d = parseItDate(a.deadline);
      const days = d ? Math.round((d - now) / 86400000) : null;
      const pr = days != null && days <= 14 ? 'alta' : 'media';
      const why = days == null ? 'Punto di attenzione aperto' : days < 0 ? `Deadline scaduta da ${-days} giorni (${a.deadline})` : `Deadline tra ${days} giorni (${a.deadline})`;
      items.push({ title: a.text, rationale: why, owner: a.owner, priority: pr, kind: 'Attenzione', overdue: days != null && days < 0 });
    }
    for (const it of last.summary.nextSteps) {
      const n = recurrence(it.text);
      items.push({ title: it.text, rationale: n > 1 ? `Prossimo passo ricorrente da ${n} checkpoint: verificare lo sblocco` : 'Prossimo passo concordato nell\'ultimo checkpoint', owner: '', priority: n > 1 ? 'alta' : 'media', kind: 'Prossimo passo' });
    }
    for (const it of last.summary.inProgress) {
      const n = recurrence(it.text);
      items.push({ title: it.text, rationale: n > 2 ? `In corso da ${n} checkpoint: chiedere stato e data di completamento` : 'Attività in corso: aggiornamento sullo stato', owner: '', priority: n > 2 ? 'alta' : 'bassa', kind: 'In corso' });
    }
    const order = { alta: 0, media: 1, bassa: 2 };
    items.sort((a, b) => order[a.priority] - order[b.priority]);
    const risks = [];
    if (last.summary.nextStepsNote) risks.push(last.summary.nextStepsNote);
    return { items, risks, basedOn: last, agendaNote: `Basata sul checkpoint del ${itDate(last.date)} e su ${older.length} precedent${older.length === 1 ? 'e' : 'i'}.` };
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
    const h = await loadHistory();
    const local = localForecast(h.checkpoints);
    let html = '';
    if (h.forecast?.items?.length) {
      html += `<h2 class="h2">Previsione AI <span class="muted small">· ${new Date(h.forecast.generatedAt || h.forecast.savedAt).toLocaleString('it-IT')}</span></h2>`;
      if (h.forecast.agendaNote) html += `<div class="note-box">${esc(h.forecast.agendaNote)}</div>`;
      html += forecastItemsHtml(h.forecast.items);
      if (h.forecast.risks?.length) html += `<h2 class="h2">Rischi</h2><ul>${h.forecast.risks.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`;
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

  async function renderMiniForecast() {
    const el = $('#miniForecast');
    if (!state.cp) return;
    const h = await loadHistory().catch(() => null);
    if (!h) return;
    const previous = h.checkpoints.filter((c) => c.id !== state.cp.id && c.date <= state.cp.date);
    const f = localForecast(previous);
    el.innerHTML = f
      ? `<p class="muted small">Temi attesi in questo checkpoint, in base allo storico (${esc(f.agendaNote)}) Usali come traccia durante la revisione.</p>${forecastItemsHtml(f.items)}`
      : `<p class="muted">Nessun checkpoint precedente con punti compilati: la previsione sarà disponibile dal prossimo incontro.</p>`;
  }

  // ------------------------------------------------------------------ history
  async function renderHistory() {
    const h = await loadHistory();
    const list = h.checkpoints.map((c) => ({ ...c, summary: c.summary ? Email.normalize(c.summary) : null }));
    $('#historySub').textContent = `${state.project.name} · ${list.length} checkpoint archiviati`;
    // punti di attenzione deduplicati (più recente vince)
    const att = [];
    list.forEach((c, ci) => (c.summary?.attention || []).forEach((a) => {
      if (att.some((x) => similar(x.text, a.text) > 0.6)) return;
      att.push({ ...a, date: c.date, cpId: c.id, stillOpen: ci === 0 });
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
    const totalCompleted = list.reduce((a, c) => a + (c.summary?.completed.length || 0), 0);
    const reviewedMin = Math.round(list.reduce((a, c) => a + (c.duration || 0), 0) / 60);
    $('#historyStats').innerHTML = [
      [list.length, 'checkpoint'],
      [totalCompleted, 'attività completate'],
      [att.filter((a) => a.stillOpen).length, 'punti di attenzione aperti'],
      [overdue, 'deadline scadute'],
      [reviewedMin, 'minuti di riunione archiviati'],
    ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
    const col = (title, items) => items.length ? `<div><h5>${title}</h5><ul>${items.map((i) => `<li>${esc(i.text)}${i.note ? ` <span class="muted">→ ${esc(i.note)}</span>` : ''}${i.deadline ? ` <span class="muted">(${esc(i.deadline)})</span>` : ''}</li>`).join('')}</ul></div>` : '';
    $('#timeline').innerHTML = list.map((c) => `<div class="tl-item"><div class="tl-card">
      <header><h3>${esc(c.title)}</h3><span class="muted">${longDate(c.date)} · ${esc(c.status)}${c.cueCount ? ` · ${Math.round(c.duration / 60)} min` : ''}</span>
      <button class="btn btn-ghost btn-sm" data-open="${c.id}">Apri</button></header>
      ${c.summary ? `<div class="tl-cols">${col('Completate', c.summary.completed)}${col('In corso', c.summary.inProgress)}${col('Prossimi passi', c.summary.nextSteps)}${col('Attenzione', c.summary.attention)}</div>` : '<p class="muted small">Punti non ancora compilati.</p>'}
    </div></div>`).join('') || '<p class="muted">Nessun checkpoint.</p>';
  }

  // ------------------------------------------------------------------ settings
  function renderSettings() {
    const p = state.project;
    if (p) {
      $('#pName').value = p.name; $('#pDesc').value = p.description || ''; $('#pRecipients').value = p.recipients || '';
      $('#pSubject').value = p.subjectTemplate || ''; $('#pGlossary').value = p.glossary || ''; $('#pExample').value = p.exampleEmail || '';
    }
    $('#sAuthor').value = state.settings.author || '';
    $('#sModel').value = state.settings.model || '';
    $('#sKey').value = '';
    $('#sKeyInfo').textContent = state.settings.hasApiKey
      ? `API key configurata (${state.settings.apiKeySource}, ${state.settings.apiKeyHint}). Lascia il campo vuoto per mantenerla.`
      : 'Nessuna API key: l\'app funziona completamente in modalità manuale; i pulsanti AI compaiono quando ne inserisci una.';
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
      const v = await dialog('Nuovo checkpoint', `<label class="field"><span>Data della riunione</span><input class="input" type="date" name="date" value="${today()}" /></label>
        <label class="field"><span>Titolo</span><input class="input" name="title" value="Checkpoint settimanale" /></label>`, { okText: 'Crea' });
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
      if (act === 'export-txt') download(`${base}_transcript.txt`, Transcript.toTxt(cues(), header));
      if (act === 'export-vtt') download(`${base}_transcript.vtt`, Transcript.toVtt(cues()));
      if (act === 'export-json') download(`${base}_checkpoint.json`, JSON.stringify(state.cp, null, 2), 'application/json');
      if (act === 'remove-video' && state.cp.video && await confirmDlg('Rimuovere il video?', 'Il file video verrà eliminato dall\'archivio locale. Transcript e punti restano salvati.', 'Rimuovi', true)) {
        await api('DELETE', `/api/projects/${state.cp.projectId}/checkpoints/${state.cp.id}/video`);
        state.cp.video = null;
        loadVideo();
      }
      if (act === 'delete-checkpoint' && await confirmDlg('Eliminare il checkpoint?', `“${state.cp.title}” del ${itDate(state.cp.date)} verrà eliminato definitivamente con video e transcript.`, 'Elimina', true)) {
        clearTimeout(saveTimer); saveTimer = null;
        await api('DELETE', `/api/projects/${state.cp.projectId}/checkpoints/${state.cp.id}`);
        state.checkpoints = state.checkpoints.filter((c) => c.id !== state.cp.id);
        state.cp = null;
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
    const seek = $('#seek');
    seek.addEventListener('pointerdown', () => (seeking = true));
    seek.addEventListener('change', () => { seeking = false; if (video.duration) seekTo((seek.value / 1000) * video.duration); });
    seek.addEventListener('input', () => { if (video.duration) $('#timeLabel').textContent = `${fmtT((seek.value / 1000) * video.duration)} / ${fmtT(video.duration)}`; });

    // tabs
    $$('.tab').forEach((t) => (t.onclick = () => {
      $$('.tab').forEach((x) => x.classList.toggle('active', x === t));
      $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${t.dataset.tab}`));
      LS.set('tab', t.dataset.tab);
      if (t.dataset.tab === 'email') renderEmail();
      if (t.dataset.tab === 'points') $$('#summaryEditor textarea').forEach(autosize);
    }));
    $(`.tab[data-tab="${LS.get('tab', 'points')}"]`)?.click();

    // transcript interactions
    trEl.addEventListener('click', (e) => {
      const cueNode = e.target.closest('.cue');
      if (!cueNode) return;
      const actEl = e.target.closest('[data-act]');
      const act = actEl?.dataset.act;
      const id = cueNode.dataset.id;
      const i = Number(cueNode.dataset.i);
      const c = cues()[i];
      if (act === 'seek') seekTo(c.start, true);
      else if (act === 'speaker') renameSpeaker(c.speaker);
      else if (act === 'edit') {
        if (!getSelection().isCollapsed) return; // selezione per Alt+1..4
        startEdit(id);
      } else if (act === 'flag') {
        c.flagged = !c.flagged;
        cueNode.classList.toggle('flagged', c.flagged);
        updateProgress();
        markDirty();
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
    $('#search').oninput = (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.search = e.target.value.trim(); state.activeIdx = -1; renderTranscript(); syncTranscript(); }, 150); };
    $('#search').onkeydown = (e) => {
      if (e.key === 'Enter') {
        const marks = $$('mark', trEl);
        if (!marks.length) return;
        state.searchPos = ((state.searchPos ?? -1) + 1) % marks.length;
        marks[state.searchPos].scrollIntoView({ block: 'center', behavior: 'smooth' });
        state.lastUserScroll = Date.now();
      }
      if (e.key === 'Escape') { e.target.value = ''; state.search = ''; renderTranscript(); syncTranscript(true); }
    };
    $('#replaceAllBtn').onclick = () => {
      const q = $('#search').value;
      if (!q) return toast('Scrivi prima il testo da cercare', { error: true });
      const rep = $('#replace').value;
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      snapshot();
      let n = 0;
      cues().forEach((c) => { const t = c.text.replace(re, () => (n++, rep)); c.text = t; if (c.speaker) c.speaker = c.speaker.replace(re, () => (n++, rep)); });
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

    // summary editor
    const se = $('#summaryEditor');
    se.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.para) {
        state.cp.summary[t.dataset.para] = t.dataset.para === 'closingNotes' ? t.value.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean) : t.value;
      } else {
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
    se.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) return addToSection(add.dataset.add);
      const item = e.target.closest('.sum-item');
      if (!item) return;
      const list = state.cp.summary[item.dataset.sec];
      const i = Number(item.dataset.i);
      if (e.target.closest('[data-rm]')) { list.splice(i, 1); renderSummaryEditor(); summaryChanged(); }
      if (e.target.closest('[data-done]')) {
        const [it] = list.splice(i, 1);
        state.cp.summary.completed.push({ text: it.text, note: '' });
        renderSummaryEditor();
        summaryChanged();
      }
    });
    let dragSrc = null;
    se.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.sum-item');
      if (!item || /TEXTAREA|INPUT/.test(document.activeElement?.tagName) && item.contains(document.activeElement)) return e.preventDefault();
      dragSrc = { sec: item.dataset.sec, i: Number(item.dataset.i) };
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    se.addEventListener('dragover', (e) => { if (dragSrc && e.target.closest('.sum-section[data-sec]')) e.preventDefault(); });
    se.addEventListener('drop', (e) => {
      const sec = e.target.closest('.sum-section[data-sec]');
      if (!dragSrc || !sec) return;
      e.preventDefault();
      const s = state.cp.summary;
      const [it] = s[dragSrc.sec].splice(dragSrc.i, 1);
      const target = sec.dataset.sec;
      const conv = target === 'attention' ? { text: it.text, owner: it.owner || '', deadline: it.deadline || '' } : { text: it.text, note: it.note || '' };
      const over = e.target.closest('.sum-item');
      let at = over && over.dataset.sec === target ? Number(over.dataset.i) : s[target].length;
      s[target].splice(at, 0, conv);
      dragSrc = null;
      renderSummaryEditor();
      summaryChanged();
    });
    se.addEventListener('dragend', () => { dragSrc = null; $$('.sum-item.dragging').forEach((x) => x.classList.remove('dragging')); });
    $('#carryOverBtn').onclick = carryOver;

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

    // notes
    $('#notes').oninput = (e) => { state.cp.notes = e.target.value; markDirty(); };

    // AI
    $('#aiSummaryBtn').onclick = (e) => busy(e.currentTarget, async () => {
      await saveNow();
      const s = state.cp.summary;
      const has = ['completed', 'inProgress', 'nextSteps', 'attention'].some((k) => s[k].length);
      if (has && !(await confirmDlg('Sostituire i punti?', 'I punti attuali verranno sostituiti con la proposta AI.', 'Sostituisci', true))) return;
      const res = await api('POST', '/api/ai/summary', { projectId: state.project.id, checkpointId: state.cp.id });
      state.cp.summary = Email.normalize(res.summary);
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

    // history
    $('#timeline').onclick = (e) => { const b = e.target.closest('[data-open]'); if (b) openCheckpoint(b.dataset.open).then(() => setView('workspace')); };

    // settings
    $('#saveProjectBtn').onclick = (e) => busy(e.currentTarget, async () => {
      const p = await api('PUT', `/api/projects/${state.project.id}`, {
        name: $('#pName').value, description: $('#pDesc').value, recipients: $('#pRecipients').value,
        subjectTemplate: $('#pSubject').value, glossary: $('#pGlossary').value, exampleEmail: $('#pExample').value,
      });
      Object.assign(state.project, p);
      renderProjectSelect();
      toast('Progetto salvato');
    });
    $('#deleteProjectBtn').onclick = async () => {
      if (!(await confirmDlg('Eliminare il progetto?', `Tutti i checkpoint, i video e i transcript di “${state.project.name}” verranno eliminati definitivamente.`, 'Elimina', true))) return;
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
      const pct = Math.min(75, Math.max(25, ((e.clientX - r.left) / r.width) * 100));
      $('#paneLeft').style.width = pct + '%';
    }, () => LS.set('leftW', $('#paneLeft').style.width));
    dragSplitter($('#hSplitter'), (e) => {
      const r = $('#paneLeft').getBoundingClientRect();
      const h = Math.min(r.height - 160, Math.max(120, e.clientY - r.top));
      $('#videoPane').style.height = h + 'px';
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
      const tag = e.target.tagName;
      const typing = /INPUT|TEXTAREA|SELECT/.test(tag) || e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); setSidebar(!sidebarOpen()); return; }
      if (state.view !== 'workspace' || !state.cp) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); $('#search').focus(); $('#search').select(); return; }
      if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); togglePlay(); return; }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); seekTo(video.currentTime - 3, !video.paused); return; }
      if (e.altKey && /^Digit[1-4]$/.test(e.code)) {
        const txt = getSelection().toString().replace(/\s+/g, ' ').trim();
        if (!txt) return toast('Seleziona prima una frase nel transcript');
        e.preventDefault();
        const key = SEC_DEFS[Number(e.code.slice(5)) - 1].key;
        addToSection(key, txt.charAt(0).toUpperCase() + txt.slice(1));
        getSelection().removeAllRanges();
        toast(`Aggiunto a “${SEC_DEFS.find((s) => s.key === key).label}”`);
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
