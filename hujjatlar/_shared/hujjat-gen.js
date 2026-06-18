/* ============================================================
   UMUMIY HUJJAT GENERATORI (bitta turdagi hujjatlar uchun)
   window.HUJJAT konfiguratsiyasini o'qiydi.
   previewType: 'document' (shapka o'ngda + matn) | 'narrative' (tekis matn)
   Bog'liqliklar: translit.js, exceptions.js, jszip.min.js, <doc>-config.js
   ============================================================ */
(function () {
  'use strict';
  if (window.UzTranslit && window.UZ_EXCEPTIONS && UzTranslit.loadExceptions) {
    UzTranslit.loadExceptions(window.UZ_EXCEPTIONS);
  }
  var C = window.HUJJAT;
  if (!C) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isMobile = function () { return window.matchMedia('(max-width: 860px)').matches; };

  var state = { yozuv: 'lat', qadam: 0, qiymat: {} };
  var TITLE = C.title, TITLE_CYR = C.titleCyr || C.title;
  var SHAPKA_INDENT = 4900;

  var elForm = $('#formArea'), elPreview = $('#previewBody');
  var elSteps = $('#stepDots'), elNav = $('#stepNav');

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── Maydon ── */
  function fieldHtml(key) {
    var m = C.maydonlar[key];
    var val = (state.qiymat[key] || '').replace(/"/g, '&quot;');
    var hint = m.hint ? '<small class="fld-hint">' + m.hint + '</small>' : '';
    var input = m.type === 'kop'
      ? '<textarea class="fld" data-k="' + key + '" rows="3" placeholder="' + m.placeholder + '">' + (state.qiymat[key] || '') + '</textarea>'
      : '<input class="fld" type="text" data-k="' + key + '" placeholder="' + m.placeholder + '" value="' + val + '" autocomplete="off">';
    return '<label class="fld-row"><span class="fld-label">' + m.label + (m.required ? ' <i class="req">*</i>' : '') + '</span>' + input + hint + '</label>';
  }

  function renderForm() {
    if (isMobile()) {
      var q = C.qadamlar[state.qadam];
      elForm.innerHTML = '<div class="step-title">' + (state.qadam + 1) + '-qadam: ' + q.nom + '</div>' + q.maydonlar.map(fieldHtml).join('');
      renderStepDots(); renderStepNav();
      elSteps.hidden = false; elNav.hidden = false;
    } else {
      elForm.innerHTML = C.qadamlar.map(function (q, i) {
        return '<div class="form-group"><div class="fg-title" data-n="' + (i + 1) + '">' + q.nom + '</div>' + q.maydonlar.map(fieldHtml).join('') + '</div>';
      }).join('');
      elSteps.hidden = true; elNav.hidden = true;
    }
  }
  function renderStepDots() {
    var html = '';
    C.qadamlar.forEach(function (q, i) {
      if (i > 0) html += '<span class="line' + (i <= state.qadam ? ' done' : '') + '"></span>';
      html += '<span class="dot' + (i === state.qadam ? ' active' : (i < state.qadam ? ' done' : '')) + '">' + (i + 1) + '</span>';
    });
    elSteps.innerHTML = html;
  }
  function renderStepNav() {
    var last = state.qadam === C.qadamlar.length - 1;
    elNav.innerHTML = (state.qadam > 0 ? '<button class="step-btn ghost" id="prevStep">← Orqaga</button>' : '<span></span>') +
      (last ? '<button class="step-btn primary" id="toResult">Natijani ko\'rish →</button>' : '<button class="step-btn primary" id="nextStep">Keyingi →</button>');
  }

  /* ── Matnni qurish ── */
  function fillTemplate() {
    var q = state.qiymat;
    var get = function (k) { return (q[k] || '').trim(); };
    var data = {};
    Object.keys(C.maydonlar).forEach(function (k) { data[k] = get(k) || '________'; });
    // Konfiguratsiyaning maxsus bloklari (funksiya sifatida)
    if (C.bloklar) {
      var b = C.bloklar(get);
      Object.keys(b).forEach(function (k) { data[k] = b[k]; });
    }
    var raw = C.matn.replace(/\{\{hujjatSana\}\}\{\{imzo\}\}/g, '');
    var txt = raw.replace(/\{\{(\w+)\}\}/g, function (_, k) { return data[k] !== undefined ? data[k] : '________'; });
    return txt.replace(/\n{3,}/g, '\n\n').trim();
  }

  function buildParts() {
    var get = function (k) { return (state.qiymat[k] || '').trim(); };
    var txt = fillTemplate();
    // Footer ustunlari: chap va o'ng (markaz doim "(imzo)")
    var fk = C.footerKeys || { left: C.fishKey || 'fish', right: C.sanaKey || 'hujjatSana' };
    var fish = get(fk.left) || '________';
    var sana = get(fk.right) || '________';

    var parts = { fish: fish, sana: sana, title: TITLE };
    if (C.previewType === 'document') {
      var lines = txt.split('\n');
      var ti = -1;
      lines.forEach(function (l, i) { if (ti < 0 && l.trim() === TITLE) ti = i; });
      var shapka = [], body = [];
      for (var i = 0; i < lines.length; i++) {
        var s = lines[i].trim();
        if (s === TITLE) continue;
        if (i < ti) { if (s) shapka.push(s); } else body.push(s);
      }
      while (body.length && !body[body.length - 1]) body.pop();
      while (body.length && !body[0]) body.shift();
      parts.shapka = shapka; parts.body = body;
    } else {
      // narrative: butun matn (sarlavhadan keyin) tana
      var lines2 = txt.split('\n').filter(function (l, i) { return l.trim() !== TITLE; });
      parts.body = lines2;
      parts.shapka = [];
    }
    if (state.yozuv === 'cyr' && window.UzTranslit) {
      parts.shapka = parts.shapka.map(function (x) { return UzTranslit.latToCyr(x); });
      parts.body = parts.body.map(function (x) { return UzTranslit.latToCyr(x); });
      parts.fish = UzTranslit.latToCyr(fish);
      parts.sana = UzTranslit.latToCyr(sana);
      parts.title = TITLE_CYR;
    }
    return parts;
  }

  function buildText() {
    var p = buildParts();
    var out = '';
    if (p.shapka.length) out += p.shapka.join('\n') + '\n\n';
    out += p.title + '\n\n' + p.body.join('\n');
    if (C.imzo !== false) out += '\n\n' + p.sana + '\t\t_______________ (' + p.fish + ')';
    return out.replace(/\n{3,}/g, '\n\n');
  }

  /* ── Jonli ko'rinish ── */
  function renderPreview() {
    var p = buildParts();
    var html = '';
    if (C.previewType === 'document' && p.shapka.length) {
      var shJc = C.shapkaJc || 'right';
      html += '<div class="pv-shapka pv-shapka-' + shJc + '">' + p.shapka.map(function (s) { return '<p>' + (s ? esc(s) : '&nbsp;') + '</p>'; }).join('') + '</div>';
    }
    html += '<p class="pv-title">' + p.title + '</p>';
    var bodyCls = C.previewType === 'narrative' ? 'pv-body pv-narrative' : 'pv-body';
    html += '<div class="' + bodyCls + '">' + p.body.map(function (s) { return '<p>' + (s ? esc(s) : '&nbsp;') + '</p>'; }).join('') + '</div>';
    if (C.imzo !== false) {
      html += '<div class="pv-footer"><span class="pv-fish">' + esc(p.fish) + '</span><span class="pv-imzo">(imzo)</span><span class="pv-sana">' + esc(p.sana) + '</span></div>';
    }
    elPreview.innerHTML = html;
  }
  function refresh() { renderPreview(); }

  /* ── DOCX ── */
  var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  function rpr(o) { o = o || {}; return '<w:rPr>' + (o.b ? '<w:b/>' : '') + '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr>'; }
  function para(t, o) {
    o = o || {};
    var jc = o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '';
    var ind = o.indent ? '<w:ind w:left="' + o.indent + '"/>' : '';
    var run = t ? '<w:r>' + rpr(o) + '<w:t xml:space="preserve">' + esc(t) + '</w:t></w:r>' : '';
    return '<w:p><w:pPr>' + jc + ind + '<w:spacing w:after="' + (o.after != null ? o.after : 120) + '" w:line="276" w:lineRule="auto"/></w:pPr>' + run + '</w:p>';
  }
  function footerPara(fish, sana) {
    var tabs = '<w:tabs><w:tab w:val="center" w:pos="4677"/><w:tab w:val="right" w:pos="9355"/></w:tabs>';
    var r = function (t) { return '<w:r>' + rpr() + '<w:t xml:space="preserve">' + esc(t) + '</w:t></w:r>'; };
    return '<w:p><w:pPr>' + tabs + '<w:spacing w:before="360" w:line="276" w:lineRule="auto"/></w:pPr>' + r(fish) + '<w:r>' + rpr() + '<w:tab/></w:r>' + r(C.imzoLabel || '(imzo)') + '<w:r>' + rpr() + '<w:tab/></w:r>' + r(sana) + '</w:p>';
  }
  function docxWrap(bodyXml) {
    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + bodyXml +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701"/></w:sectPr></w:body></w:document>';
    var zip = new JSZip();
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file('word/document.xml', doc);
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  function makeDocx() {
    var p = buildParts();
    var xml = '';
    if (C.previewType === 'document' && p.shapka.length) {
      var shJc = C.shapkaJc || 'right';
      if (shJc === 'right') p.shapka.forEach(function (s) { xml += para(s, { indent: SHAPKA_INDENT, jc: 'right', after: 40 }); });
      else p.shapka.forEach(function (s) { xml += para(s, { after: 40 }); });
      xml += para('', { after: 80 });
    }
    xml += para(p.title, { jc: 'center', b: true, after: 200 });
    p.body.forEach(function (s) { xml += para(s, { jc: 'both', after: 120 }); });
    if (C.imzo !== false) xml += footerPara(p.fish, p.sana);
    return docxWrap(xml);
  }

  function fname(ext) { return C.fileBase + '-' + (state.yozuv === 'cyr' ? 'krill' : 'lotin') + '-toolbase.uz.' + ext; }
  function dl(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }
  function toast(msg) { var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 1800); }

  /* ── Hodisalar ── */
  elForm.addEventListener('input', function (e) {
    var f = e.target.closest('.fld'); if (!f) return;
    state.qiymat[f.dataset.k] = f.value; refresh();
  });
  elNav.addEventListener('click', function (e) {
    if (e.target.closest('#nextStep')) { if (state.qadam < C.qadamlar.length - 1) { state.qadam++; renderForm(); refresh(); scrollTop(); } }
    else if (e.target.closest('#prevStep')) { if (state.qadam > 0) { state.qadam--; renderForm(); refresh(); scrollTop(); } }
    else if (e.target.closest('#toResult')) { showPane('result'); }
  });
  function scrollTop() { var ws = $('#workspace'); if (ws) ws.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function showPane(which) {
    if (!isMobile()) return;
    $('#formPane').hidden = which !== 'form';
    $('#resultPane').hidden = which !== 'result';
    scrollTop();
  }
  var bb = $('#btnBackForm'); if (bb) bb.addEventListener('click', function () { showPane('form'); });
  $$('.yozuv-btn').forEach(function (b) { b.addEventListener('click', function () {
    state.yozuv = b.dataset.yozuv;
    $$('.yozuv-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
    refresh();
  }); });
  $$('[data-act="docx"]').forEach(function (b) { b.addEventListener('click', function () { makeDocx().then(function (bl) { dl(bl, fname('docx')); toast('Word yuklab olindi ✓'); }); }); });
  $$('[data-act="txt"]').forEach(function (b) { b.addEventListener('click', function () { dl(new Blob([buildText()], { type: 'text/plain;charset=utf-8' }), fname('txt')); toast('Matn yuklab olindi ✓'); }); });
  $$('[data-act="copy"]').forEach(function (b) { b.addEventListener('click', function () { navigator.clipboard.writeText(buildText()).then(function () { toast('Nusxalandi ✓'); }); }); });
  $$('[data-act="print"]').forEach(function (b) { b.addEventListener('click', function () {
    var p = buildParts();
    var sh = (C.previewType === 'document' && p.shapka.length) ? '<div class="shapka">' + p.shapka.map(function (s) { return '<div>' + (s ? esc(s) : '&nbsp;') + '</div>'; }).join('') + '</div>' : '';
    var bd = p.body.map(function (s) { return '<div>' + (s ? esc(s) : '&nbsp;') + '</div>'; }).join('');
    var ft = C.imzo !== false ? '<div class="footer"><span>' + esc(p.fish) + '</span><span>' + (C.imzoLabel || '(imzo)') + '</span><span>' + esc(p.sana) + '</span></div>' : '';
    var w = window.open('', '_blank');
    w.document.write('<html><head><meta charset="utf-8"><title>' + p.title + '</title><style>@page{size:A4;margin:2.5cm 2cm 2cm 3cm}body{font-family:"Times New Roman",serif;font-size:14pt;line-height:1.6}.shapka{width:52%;margin-left:48%;text-align:right}.title{text-align:center;font-weight:bold;margin:22px 0}.body{text-align:justify;margin-bottom:30px}.footer{display:flex;justify-content:space-between;margin-top:40px}</style></head><body>' + sh + '<div class="title">' + p.title + '</div><div class="body">' + bd + '</div>' + ft + '</body></html>');
    w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 350);
  }); });

  var wasMobile = isMobile();
  window.addEventListener('resize', function () {
    if (isMobile() !== wasMobile) {
      wasMobile = isMobile(); state.qadam = 0;
      if (!isMobile()) { $('#formPane').hidden = false; $('#resultPane').hidden = false; }
      else showPane('form');
      renderForm(); refresh();
    }
  });

  // Yozuv tugmasi yo'q bo'lsa (RU) — yashirish konfiguratsiyada
  renderForm(); refresh();
  if (isMobile()) { $('#formPane').hidden = false; $('#resultPane').hidden = true; }
})();
