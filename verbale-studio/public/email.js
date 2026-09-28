/* Composizione dell'email di riepilogo a partire dai punti strutturati */
(function () {
  const SECTIONS = [
    { key: 'completed', label: 'Attività completate:' },
    { key: 'inProgress', label: 'Attività in corso (pianificate per questa settimana):' },
    { key: 'nextSteps', label: 'Prossimi passi' },
  ];

  const emptySummary = () => ({ completed: [], inProgress: [], nextSteps: [], nextStepsNote: '', attention: [], closingNotes: [] });

  function normalize(s) {
    const out = emptySummary();
    if (!s) return out;
    for (const k of ['completed', 'inProgress', 'nextSteps']) {
      out[k] = (s[k] || []).map((x) => (typeof x === 'string' ? { text: x, note: '' } : { text: x.text || '', note: x.note || '' }));
    }
    out.nextStepsNote = s.nextStepsNote || '';
    out.attention = (s.attention || []).map((a) => ({ text: a.text || '', owner: a.owner || '', deadline: a.deadline || '' }));
    out.closingNotes = Array.isArray(s.closingNotes) ? s.closingNotes.filter(Boolean) : s.closingNotes ? [s.closingNotes] : [];
    return out;
  }

  // Punteggiatura in stile elenco: ";" su tutte le voci, "." sull'ultima
  function punct(text, last) {
    const t = text.trim().replace(/[;.,:]+$/, '');
    return t + (last ? '.' : ';');
  }

  function itemLine(item, last) {
    return item.note ? `${item.text.trim().replace(/[;.]+$/, '')}; → ${item.note.trim()}` : punct(item.text, last);
  }

  function attentionTail(a) {
    const parts = [];
    if (a.owner) parts.push(`(Owner – ${a.owner})`);
    if (a.deadline) parts.push(`→ Deadline: ${a.deadline}`);
    return parts.join(' ');
  }

  function toText(summary, { author } = {}) {
    const s = normalize(summary);
    const L = ['Ciao a tutti,', '', 'di seguito i punti discussi durante il checkpoint odierno.', ''];
    for (const sec of SECTIONS) {
      const items = s[sec.key].filter((i) => i.text.trim());
      if (!items.length) continue;
      L.push(`• ${sec.label}`);
      items.forEach((it, i) => L.push(`   o ${itemLine(it, i === items.length - 1)}`));
      L.push('');
      if (sec.key === 'nextSteps' && s.nextStepsNote.trim()) L.push(s.nextStepsNote.trim(), '');
    }
    const att = s.attention.filter((a) => a.text.trim());
    if (att.length) {
      L.push('• Punti di attenzione:');
      att.forEach((a, i) => {
        L.push(`   ${i + 1}. ${a.text.trim().replace(/[;.]*$/, '.')}`);
        const tail = attentionTail(a);
        if (tail) L.push(`      ${tail}`);
      });
      L.push('');
    }
    for (const n of s.closingNotes) L.push(n.trim(), '');
    L.push(
      'In allegato trovate le slide discusse durante la riunione; come sempre, vi chiedo cortesemente di estendere la presente a chi riteniate opportuno.',
      '',
      'A disposizione,',
      'Grazie',
      author || ''
    );
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
  }

  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Converte il testo (anche modificato a mano) in HTML con elenchi veri, per incollarlo in Outlook
  function textToHtml(text) {
    const lines = text.split('\n');
    let html = '';
    let i = 0;
    const font = 'font-family:Aptos,Calibri,Arial,sans-serif;font-size:11pt;';
    while (i < lines.length) {
      const line = lines[i];
      const bullet = /^\s*[•*]\s+(.*)$/.exec(line);
      if (bullet) {
        let inner = '';
        i++;
        const subs = [];
        let ordered = false;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
          const sub = /^\s+(?:o|-|◦|(\d+)\.)\s+(.*)$/.exec(lines[i]);
          if (sub) {
            if (sub[1]) ordered = true;
            subs.push(esc(sub[2]));
          } else if (subs.length) {
            subs[subs.length - 1] += '<br>' + esc(lines[i].trim());
          }
          i++;
        }
        if (subs.length) {
          const tag = ordered ? 'ol' : 'ul';
          inner = `<${tag} style="margin:4px 0 4px 0;${ordered ? '' : 'list-style-type:circle;'}">${subs.map((s) => `<li style="margin-bottom:2px">${s.replace(/→/g, '&rarr;')}</li>`).join('')}</${tag}>`;
        }
        html += `<ul style="margin:8px 0;"><li><b>${esc(bullet[1])}</b>${inner}</li></ul>`;
        continue;
      }
      html += line.trim() ? `<p style="margin:0 0 0 0">${esc(line).replace(/→/g, '&rarr;')}</p>` : '<p style="margin:0">&nbsp;</p>';
      i++;
    }
    return `<div style="${font}">${html}</div>`;
  }

  function toEml({ to, subject, text }) {
    const html = textToHtml(text);
    const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/.{76}/g, '$&\r\n');
    const boundary = 'vs' + Math.random().toString(36).slice(2);
    return [
      `To: ${to || ''}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject || '')))}?=`,
      'X-Unsent: 1',
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(text),
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(`<html><body>${html}</body></html>`),
      `--${boundary}--`,
      '',
    ].join('\r\n');
  }

  window.Email = { SECTIONS, emptySummary, normalize, toText, textToHtml, toEml };
})();
