/* ============================================================
   ARIZA GENERATOR v4 — shapka o'ng yarmda, bo'sh shablon DOCX
   Bog'liqliklar: templates.js, translit.js, jszip.min.js
   ============================================================ */
(function () {
  'use strict';
  if (window.UzTranslit && window.UZ_EXCEPTIONS && UzTranslit.loadExceptions) {
    UzTranslit.loadExceptions(window.UZ_EXCEPTIONS);
  }
  var T = window.ARIZA_TURLARI;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var state = { turId: T[0].id, yozuv: 'lat', qadam: 0, qiymat: {} };
  var isMobile = function () { return window.matchMedia('(max-width: 860px)').matches; };
  var TITLE = 'ARIZA', TITLE_CYR = 'АРИЗА';

  var elSelect = $('#turSelect'), elForm = $('#formArea'), elPreview = $('#previewBody');
  var elSteps = $('#stepDots'), elNav = $('#stepNav');

  function tur() { return T.filter(function (t) { return t.id === state.turId; })[0]; }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── Tur dropdown ── */
  function renderSelect() {
    elSelect.innerHTML = T.map(function (t) {
      return '<option value="' + t.id + '"' + (t.id === state.turId ? ' selected' : '') + '>' + t.nom + '</option>';
    }).join('');
  }

  /* ── Maydon ── */
  function fieldHtml(key) {
    var m = tur().maydonlar[key];
    var val = (state.qiymat[key] || '').replace(/"/g, '&quot;');
    var hint = m.hint ? '<small class="fld-hint">' + m.hint + '</small>' : '';
    var input = m.type === 'kop'
      ? '<textarea class="fld" data-k="' + key + '" rows="3" placeholder="' + m.placeholder + '">' + (state.qiymat[key] || '') + '</textarea>'
      : '<input class="fld" type="text" data-k="' + key + '" placeholder="' + m.placeholder + '" value="' + val + '" autocomplete="off">';
    return '<label class="fld-row"><span class="fld-label">' + m.label + (m.required ? ' <i class="req">*</i>' : '') + '</span>' + input + hint + '</label>';
  }

  function renderForm() {
    var t = tur();
    if (isMobile()) {
      var q = t.qadamlar[state.qadam];
      elForm.innerHTML = '<div class="step-title">' + (state.qadam + 1) + '-qadam: ' + q.nom + '</div>' + q.maydonlar.map(fieldHtml).join('');
      renderStepDots(); renderStepNav();
      elSteps.hidden = false; elNav.hidden = false;
    } else {
      elForm.innerHTML = t.qadamlar.map(function (q, i) {
        return '<div class="form-group"><div class="fg-title" data-n="' + (i + 1) + '">' + q.nom + '</div>' + q.maydonlar.map(fieldHtml).join('') + '</div>';
      }).join('');
      elSteps.hidden = true; elNav.hidden = true;
    }
  }

  function renderStepDots() {
    var t = tur(), html = '';
    t.qadamlar.forEach(function (q, i) {
      if (i > 0) html += '<span class="line' + (i <= state.qadam ? ' done' : '') + '"></span>';
      html += '<span class="dot' + (i === state.qadam ? ' active' : (i < state.qadam ? ' done' : '')) + '">' + (i + 1) + '</span>';
    });
    elSteps.innerHTML = html;
  }
  function renderStepNav() {
    var t = tur(), last = state.qadam === t.qadamlar.length - 1;
    elNav.innerHTML = (state.qadam > 0 ? '<button class="step-btn ghost" id="prevStep">← Orqaga</button>' : '<span></span>') +
      (last ? '<button class="step-btn primary" id="toResult">Natijani ko\'rish →</button>' : '<button class="step-btn primary" id="nextStep">Keyingi →</button>');
  }

  /* ── Hujjatni qismlarga ajratish: {shapka, body, sana, imzoFish} ── */
  function buildParts() {
    var t = tur();
    var q = state.qiymat;
    var get = function (k) { return (q[k] || '').trim(); };
    var data = {};
    Object.keys(t.maydonlar).forEach(function (k) { data[k] = get(k) || '________'; });
    data.manzil_blok = get('manzil') ? get('manzil') + 'da yashovchi ' : '';
    data.telefon_blok = get('telefon') ? 'Tel: ' + get('telefon') + '\n' : '';
    data.sana_blok = get('sana') ? get('sana') + 'dan ' : '';
    data.kurs_blok = get('kurs') ? get('kurs') + 'iga ' : '';

    // Footer (sana + imzo) shablon oxiridan ajratiladi — alohida quriladi
    var rawMatn = t.matn.replace(/\{\{hujjatSana\}\}\{\{imzo\}\}/g, '');
    var txt = rawMatn.replace(/\{\{(\w+)\}\}/g, function (_, k) { return data[k] !== undefined ? data[k] : '________'; });
    txt = txt.replace(/\n{3,}/g, '\n\n').trim();

    var lines = txt.split('\n');
    var titleIdx = -1;
    lines.forEach(function (l, i) { if (titleIdx < 0 && l.trim() === TITLE) titleIdx = i; });

    var shapka = [], body = [];
    var fish = get('fish') || '________';
    var sana = get('hujjatSana') || '________';
    for (var i = 0; i < lines.length; i++) {
      var s = lines[i].trim();
      if (s === TITLE) continue;
      if (i < titleIdx) { if (s) shapka.push(s); }
      else { body.push(s); }
    }
    while (body.length && !body[body.length - 1]) body.pop();
    while (body.length && !body[0]) body.shift();

    var parts = { shapka: shapka, body: body, fish: fish, sana: sana };
    if (state.yozuv === 'cyr' && window.UzTranslit) {
      parts.shapka = shapka.map(function (x) { return UzTranslit.latToCyr(x); });
      parts.body = body.map(function (x) { return UzTranslit.latToCyr(x); });
      parts.fish = UzTranslit.latToCyr(fish);
      parts.sana = UzTranslit.latToCyr(sana);
      parts.title = TITLE_CYR;
    } else parts.title = TITLE;
    return parts;
  }

  /* ── Oddiy matn (txt/copy uchun) ── */
  function buildText() {
    var p = buildParts();
    var out = p.shapka.join('\n') + '\n\n' + p.title + '\n\n' + p.body.join('\n') + '\n\n' + p.sana + '\t\t_______________ (' + p.fish + ')';
    return out.replace(/\n{3,}/g, '\n\n');
  }

  /* ── Jonli ko'rinish ── */
  function renderPreview() {
    var p = buildParts();
    var html = '<div class="pv-shapka">' + p.shapka.map(function (s) { return '<p>' + (s ? esc(s) : '&nbsp;') + '</p>'; }).join('') + '</div>';
    html += '<p class="pv-title">' + p.title + '</p>';
    html += '<div class="pv-body">' + p.body.map(function (s) { return '<p>' + (s ? esc(s) : '&nbsp;') + '</p>'; }).join('') + '</div>';
    html += '<div class="pv-footer"><span class="pv-fish">' + esc(p.fish) + '</span><span class="pv-imzo">(imzo)</span><span class="pv-sana">' + esc(p.sana) + '</span></div>';
    elPreview.innerHTML = html;
  }
  function refresh() { renderPreview(); }

  /* ════════ DOCX yaratish ════════ */
  var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  function rpr(opt) {
    opt = opt || {};
    return '<w:rPr>' + (opt.b ? '<w:b/>' : '') + '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr>';
  }
  function para(text, opt) {
    opt = opt || {};
    var jc = opt.jc ? '<w:jc w:val="' + opt.jc + '"/>' : '';
    var ind = opt.indent ? '<w:ind w:left="' + opt.indent + '"/>' : '';
    var run = text ? '<w:r>' + rpr(opt) + '<w:t xml:space="preserve">' + esc(text) + '</w:t></w:r>' : '';
    return '<w:p><w:pPr>' + jc + ind + '<w:spacing w:after="' + (opt.after != null ? opt.after : 120) + '" w:line="276" w:lineRule="auto"/></w:pPr>' + run + '</w:p>';
  }
  // 3 ustunli footer (F.I.SH / imzo / sana) — tab bilan
  function footerPara(fish, sana) {
    var tabs = '<w:tabs><w:tab w:val="center" w:pos="4677"/><w:tab w:val="right" w:pos="9355"/></w:tabs>';
    var r = function (t) { return '<w:r>' + rpr() + '<w:t xml:space="preserve">' + esc(t) + '</w:t></w:r>'; };
    return '<w:p><w:pPr>' + tabs + '<w:spacing w:before="360" w:line="276" w:lineRule="auto"/></w:pPr>' +
      r(fish) + '<w:r>' + rpr() + '<w:tab/></w:r>' + r('(imzo)') + '<w:r>' + rpr() + '<w:tab/></w:r>' + r(sana) + '</w:p>';
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

  var SHAPKA_INDENT = 4900; // o'ng yarim
  function makeDocx() {
    var p = buildParts();
    var xml = '';
    p.shapka.forEach(function (s) { xml += para(s, { indent: SHAPKA_INDENT, jc: 'right', after: 40 }); });
    xml += para('', { after: 80 });
    xml += para(p.title, { jc: 'center', b: true, after: 200 });
    p.body.forEach(function (s) { xml += para(s, { jc: 'both', after: 120 }); });
    xml += footerPara(p.fish, p.sana);
    return docxWrap(xml);
  }

  /* ── Bo'sh shablon (foydalanuvchi qo'lda to'ldiradi) ── */
  function makeBlankDocx() {
    var cyr = state.yozuv === 'cyr';
    var L = function (lat, kr) { return cyr ? kr : lat; };
    var line = '__________________________';
    var xml = '';
    xml += para(L('(Manzil)', '(Манзил)') + line, { indent: SHAPKA_INDENT, jc: 'right', after: 60 });
    xml += para(L('(Kimga)', '(Кимга)') + '________________' + L('ga', 'га'), { indent: SHAPKA_INDENT, jc: 'right', after: 60 });
    xml += para(L('(Kimdan)', '(Кимдан)') + '______________' + L('dan', 'дан'), { indent: SHAPKA_INDENT, jc: 'right', after: 80 });
    xml += para('', { after: 80 });
    xml += para(cyr ? TITLE_CYR : TITLE, { jc: 'center', b: true, after: 220 });
    xml += para(L('Arizamning mazmuni shundan iboratkim, ', 'Аризамнинг мазмуни шундан иборатким, ') + '________________________', { jc: 'both', after: 60 });
    xml += para('______________________________________________________', { after: 60 });
    xml += para('________________________________' + L('so\u2019rayman.', 'сўрайман.'), { after: 200 });
    xml += footerPara(L('(Arizachining F.I.SH)', '(Аризачининг Ф.И.Ш)'), L('(Ariza yozilgan sana)', '(Ариза ёзилган сана)'));
    return docxWrap(xml);
  }

  /* ── Yuklab olish ── */
  function fname(ext, blank) {
    return 'ariza-' + (blank ? 'bosh-shablon' : tur().id) + '-' + (state.yozuv === 'cyr' ? 'krill' : 'lotin') + '-toolbase.uz.' + ext;
  }
  function dl(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }
  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  /* ── Hodisalar ── */
  elSelect.addEventListener('change', function () {
    state.turId = elSelect.value; state.qiymat = {}; state.qadam = 0;
    renderForm(); refresh();
    if (isMobile()) showPane('form');
  });
  elForm.addEventListener('input', function (e) {
    var f = e.target.closest('.fld'); if (!f) return;
    state.qiymat[f.dataset.k] = f.value; refresh();
  });
  elNav.addEventListener('click', function (e) {
    var t = tur();
    if (e.target.closest('#nextStep')) { if (state.qadam < t.qadamlar.length - 1) { state.qadam++; renderForm(); refresh(); scrollTop(); } }
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
  var btnBackForm = $('#btnBackForm');
  if (btnBackForm) btnBackForm.addEventListener('click', function () { showPane('form'); });

  $$('.yozuv-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      state.yozuv = b.dataset.yozuv;
      $$('.yozuv-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
      refresh();
    });
  });

  $$('[data-act="docx"]').forEach(function (b) { b.addEventListener('click', function () { makeDocx().then(function (bl) { dl(bl, fname('docx')); toast('Word yuklab olindi ✓'); }); }); });
  $$('[data-act="blank"]').forEach(function (b) { b.addEventListener('click', function () { makeBlankDocx().then(function (bl) { dl(bl, fname('docx', true)); toast('Bo\'sh shablon yuklab olindi ✓'); }); }); });
  $$('[data-act="txt"]').forEach(function (b) { b.addEventListener('click', function () { dl(new Blob([buildText()], { type: 'text/plain;charset=utf-8' }), fname('txt')); toast('Matn yuklab olindi ✓'); }); });
  $$('[data-act="copy"]').forEach(function (b) { b.addEventListener('click', function () { navigator.clipboard.writeText(buildText()).then(function () { toast('Nusxalandi ✓'); }); }); });
  $$('[data-act="print"]').forEach(function (b) { b.addEventListener('click', function () {
    var p = buildParts();
    var sh = p.shapka.map(function (s) { return '<div>' + (s ? esc(s) : '&nbsp;') + '</div>'; }).join('');
    var bd = p.body.map(function (s) { return '<div>' + (s ? esc(s) : '&nbsp;') + '</div>'; }).join('');
    var w = window.open('', '_blank');
    w.document.write('<html><head><meta charset="utf-8"><title>Ariza</title><style>@page{size:A4;margin:2.5cm 2cm 2cm 3cm}body{font-family:"Times New Roman",serif;font-size:14pt;line-height:1.6}.shapka{width:52%;margin-left:48%;text-align:right}.title{text-align:center;font-weight:bold;margin:22px 0}.body{margin-bottom:30px;text-align:justify}.footer{display:flex;justify-content:space-between;margin-top:40px}</style></head><body><div class="shapka">' + sh + '</div><div class="title">' + p.title + '</div><div class="body">' + bd + '</div><div class="footer"><span>' + esc(p.fish) + '</span><span>(imzo)</span><span>' + esc(p.sana) + '</span></div></body></html>');
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

  renderSelect(); renderForm(); refresh();
  if (isMobile()) { $('#formPane').hidden = false; $('#resultPane').hidden = true; }
})();
