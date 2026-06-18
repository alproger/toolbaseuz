/* ============================================================
   OBYEKTIVKA (MA'LUMOTNOMA) GENERATORI — to'liq format
   Shaxsiy ma'lumotlar + Mehnat faoliyati + Qarindoshlar
   Rasm: canvas 3:4 → DOCX (suzuvchi, o'ng yuqori)
   Bog'liqliklar: translit.js, exceptions.js, jszip.min.js, config.js
   ============================================================ */
(function () {
  'use strict';
  if (window.UzTranslit && window.UZ_EXCEPTIONS && UzTranslit.loadExceptions) UzTranslit.loadExceptions(window.UZ_EXCEPTIONS);
  var C = window.OBYEKTIVKA; if (!C) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isMobile = function () { return window.matchMedia('(max-width: 860px)').matches; };

  var state = { yozuv: 'lat', shaxs: {}, work: [['', '']], qar: [['', '', '', '', '']], rasm: null };
  var elForm = $('#formArea'), elPreview = $('#previewBody'), elSteps = $('#stepDots'), elNav = $('#stepNav');

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function tr(s) { return (state.yozuv === 'cyr' && window.UzTranslit) ? UzTranslit.latToCyr(s) : s; }
  function TT() { return state.yozuv === 'cyr' ? (C.titleCyr || C.title) : C.title; }

  /* ════════════ FORMA ════════════ */
  function persFieldHtml(key) {
    var m = C.shaxs[key], val = escA(state.shaxs[key] || '');
    return '<label class="fld-row"><span class="fld-label">' + esc(m.label) + (m.required ? ' <i class="req">*</i>' : '') +
      '</span><input class="fld" type="text" data-sk="' + key + '" placeholder="' + escA(m.placeholder) + '" value="' + val + '" autocomplete="off"></label>';
  }
  function fotoHtml() {
    var has = state.rasm;
    return '<div class="fld-row foto-row"><span class="fld-label">' + esc(C.rasmLabel) + '</span>' +
      '<label class="foto-upload' + (has ? ' has' : '') + '">' +
      (has ? '<img src="' + state.rasm.dataUrl + '" alt="">' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span>Rasm tanlash (3\u00d74)</span>') +
      '<input type="file" accept="image/*" id="fotoInput" hidden></label>' +
      (has ? '<button type="button" class="foto-clear" id="fotoClear">Rasmni olib tashlash</button>' : '') + '</div>';
  }
  function workRowHtml(i) {
    var r = state.work[i];
    return '<div class="dyn-row" data-wi="' + i + '">' +
      '<input class="fld dyn" data-wk="' + i + '-0" placeholder="' + escA(C.ish.period.placeholder) + '" value="' + escA(r[0]) + '">' +
      '<input class="fld dyn dyn-wide" data-wk="' + i + '-1" placeholder="' + escA(C.ish.desc.placeholder) + '" value="' + escA(r[1]) + '">' +
      '<button type="button" class="dyn-del" data-wdel="' + i + '" title="O\'chirish">\u00d7</button></div>';
  }
  function qarRowHtml(i) {
    var r = state.qar[i];
    var inps = C.qar.map(function (c, j) {
      return '<input class="fld dyn" data-qk="' + i + '-' + j + '" placeholder="' + escA(c.ph) + '" value="' + escA(r[j]) + '">';
    }).join('');
    return '<div class="dyn-row qar-row" data-qi="' + i + '">' + inps +
      '<button type="button" class="dyn-del" data-qdel="' + i + '" title="O\'chirish">\u00d7</button></div>';
  }

  function renderForm() {
    var html = '';
    // 1) Shaxsiy
    html += '<div class="form-group"><div class="fg-title" data-n="1">Shaxsiy ma\'lumotlar</div>' +
      fotoHtml() + persFieldHtml('fish') +
      Object.keys(C.shaxs).filter(function (k) { return k !== 'fish'; }).map(persFieldHtml).join('') + '</div>';
    // 2) Mehnat faoliyati
    html += '<div class="form-group"><div class="fg-title" data-n="2">Mehnat faoliyati</div>' +
      '<div class="dyn-head"><span>Davr</span><span>Ish joyi va lavozimi</span></div>' +
      '<div id="workList">' + state.work.map(function (_, i) { return workRowHtml(i); }).join('') + '</div>' +
      '<button type="button" class="dyn-add" id="addWork">+ Qator qo\'shish</button></div>';
    // 3) Qarindoshlar
    html += '<div class="form-group"><div class="fg-title" data-n="3">Yaqin qarindoshlar</div>' +
      '<div class="dyn-head qar-head">' + C.qar.map(function (c) { return '<span>' + esc(c.label) + '</span>'; }).join('') + '</div>' +
      '<div id="qarList">' + state.qar.map(function (_, i) { return qarRowHtml(i); }).join('') + '</div>' +
      '<button type="button" class="dyn-add" id="addQar">+ Qarindosh qo\'shish</button></div>';
    elForm.innerHTML = html;
    elSteps.hidden = true; elNav.hidden = true;
    bindFoto();
  }

  /* ── Rasm ── */
  function bindFoto() {
    var inp = $('#fotoInput');
    if (inp) inp.addEventListener('change', function (e) { var f = e.target.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function (ev) { processImage(ev.target.result); }; rd.readAsDataURL(f); });
    var clr = $('#fotoClear'); if (clr) clr.addEventListener('click', function () { state.rasm = null; renderForm(); refresh(); });
  }
  function processImage(dataUrl) {
    var img = new Image();
    img.onload = function () {
      var tR = 3 / 4, w = img.width, h = img.height, r = w / h, sx = 0, sy = 0, sw = w, sh = h;
      if (r > tR) { sw = h * tR; sx = (w - sw) / 2; } else { sh = w / tR; sy = (h - sh) / 2; }
      var oW = 300, oH = 400, cv = document.createElement('canvas'); cv.width = oW; cv.height = oH;
      var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, oW, oH); ctx.drawImage(img, sx, sy, sw, sh, 0, 0, oW, oH);
      var jpeg = cv.toDataURL('image/jpeg', 0.85);
      state.rasm = { dataUrl: jpeg, b64: jpeg.split(',')[1] };
      renderForm(); refresh();
    };
    img.src = dataUrl;
  }

  /* ════════════ JONLI KO'RINISH ════════════ */
  function renderPreview() {
    var d = state.shaxs;
    var foto = state.rasm ? '<div class="pv-foto"><img src="' + state.rasm.dataUrl + '" alt=""></div>' : '<div class="pv-foto pv-foto-empty">3\u00d74<br>rasm</div>';
    var name = tr(d.fish || '__________');
    // personal rows
    var pi = '';
    C.layout.forEach(function (it) {
      if (it.type === 'pair') {
        pi += '<div class="pv-pair"><div class="pv-f"><b>' + esc(tr(C.shaxs[it.keys[0]].label)) + ':</b><br>' + esc(tr(d[it.keys[0]] || '')) + '</div>' +
          '<div class="pv-f"><b>' + esc(tr(C.shaxs[it.keys[1]].label)) + ':</b><br>' + esc(tr(d[it.keys[1]] || '')) + '</div></div>';
      } else if (it.type === 'inline') {
        pi += '<div class="pv-full"><b>' + esc(tr(C.shaxs[it.key].label)) + ':</b> ' + esc(tr(d[it.key] || '')) + '</div>';
      } else {
        pi += '<div class="pv-full"><b>' + esc(tr(C.shaxs[it.key].label)) + ':</b><br>' + esc(tr(d[it.key] || '')) + '</div>';
      }
    });
    // work
    var wrows = state.work.filter(function (r) { return r[0] || r[1]; }).map(function (r) {
      return '<tr><td>' + esc(tr(r[0])) + '</td><td>' + esc(tr(r[1])) + '</td></tr>';
    }).join('') || '<tr><td>&mdash;</td><td>&mdash;</td></tr>';
    // qar
    var qh = '<tr>' + C.sec.relHead.map(function (t) { return '<th>' + esc(tr(t)) + '</th>'; }).join('') + '</tr>';
    var qrows = state.qar.filter(function (r) { return r.some(function (x) { return x; }); }).map(function (r) {
      return '<tr>' + r.map(function (x) { return '<td>' + esc(tr(x)) + '</td>'; }).join('') + '</tr>';
    }).join('');

    elPreview.innerHTML =
      '<p class="pv-title">' + esc(tr(TT())) + '</p>' +
      '<div class="pv-name-row">' + foto + '<div class="pv-name">' + esc(name) + '</div></div>' +
      '<div class="pv-personal">' + pi + '</div>' +
      '<p class="pv-sec">' + esc(tr(C.sec.work)) + '</p>' +
      '<table class="pv-work"><tbody>' + wrows + '</tbody></table>' +
      '<p class="pv-sec">' + esc(name) + esc(tr(C.sec.relSuffix)) + ' ' + esc(tr(C.sec.relWord)) + '</p>' +
      '<table class="pv-qar"><tbody>' + qh + qrows + '</tbody></table>';
  }
  function refresh() { renderPreview(); }

  function buildText() {
    var d = state.shaxs, L = [];
    L.push(tr(TT())); L.push(''); L.push(tr(d.fish || '')); L.push('');
    C.layout.forEach(function (it) {
      (it.type === 'pair' ? it.keys : [it.key]).forEach(function (k) { L.push(tr(C.shaxs[k].label) + ': ' + tr(d[k] || '')); });
    });
    L.push(''); L.push(tr(C.sec.work));
    state.work.forEach(function (r) { if (r[0] || r[1]) L.push(tr(r[0]) + ' — ' + tr(r[1])); });
    L.push(''); L.push(tr(d.fish || '') + tr(C.sec.relSuffix) + ' ' + tr(C.sec.relWord));
    state.qar.forEach(function (r) { if (r.some(function (x) { return x; })) L.push(r.map(tr).join(' | ')); });
    return L.join('\n');
  }

  /* ════════════ DOCX (OOXML) ════════════ */
  var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  var CW = 9700;
  function rpr(o) { o = o || {}; return '<w:rPr>' + (o.b ? '<w:b/>' : '') + (o.color ? '<w:color w:val="' + o.color + '"/>' : '') + '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="' + (o.sz || 24) + '"/><w:szCs w:val="' + (o.sz || 24) + '"/></w:rPr>'; }
  function runT(t, o) { return '<w:r>' + rpr(o) + '<w:t xml:space="preserve">' + esc(t == null ? '' : t) + '</w:t></w:r>'; }
  function para(runs, o) { o = o || {}; var pPr = '<w:pPr>' + (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '') + '<w:spacing w:after="' + (o.after != null ? o.after : 0) + '" w:before="' + (o.before || 0) + '" w:line="' + (o.line || 240) + '" w:lineRule="auto"/></w:pPr>'; return '<w:p>' + pPr + (Array.isArray(runs) ? runs.join('') : runs) + '</w:p>'; }
  function tcB(inner, w, o) { o = o || {}; var sh = o.shade ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shade + '"/>' : ''; return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + sh + '<w:tcMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:left w:w="' + (o.ml || 90) + '" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>' + inner + '</w:tc>'; }
  function tcN(inner, w, span) { return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (span ? '<w:gridSpan w:val="' + span + '"/>' : '') + '<w:tcMar><w:top w:w="20" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>' + inner + '</w:tc>'; }
  function bAll() { return '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (s) { return '<w:' + s + ' w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; }).join('') + '</w:tblBorders>'; }
  function bNone() { return '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (s) { return '<w:' + s + ' w:val="none" w:sz="0" w:space="0" w:color="auto"/>'; }).join('') + '</w:tblBorders>'; }
  function imageAnchor() {
    if (!state.rasm) return '';
    var cx = 1080000, cy = 1440000;
    return '<w:r><w:rPr><w:noProof/></w:rPr><w:drawing>' +
      '<wp:anchor distT="0" distB="0" distL="114300" distR="114300" simplePos="0" relativeHeight="251658240" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">' +
      '<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="margin"><wp:align>right</wp:align></wp:positionH>' +
      '<wp:positionV relativeFrom="paragraph"><wp:posOffset>-90000</wp:posOffset></wp:positionV>' +
      '<wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:effectExtent l="0" t="0" r="0" b="0"/>' +
      '<wp:wrapSquare wrapText="left"/><wp:docPr id="1" name="Rasm"/><wp:cNvGraphicFramePr/>' +
      '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="rasm.jpg"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="rId100"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm>' +
      '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>' +
      '</a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>';
  }

  function buildBody(blank, blankBox) {
    var d = state.shaxs, out = '';
    out += para(runT(tr(TT()), { b: true, sz: 28 }), { jc: 'center', after: 200, before: 60 });
    out += para((blankBox ? '' : imageAnchor()) + runT(blank ? '' : tr(d.fish || ''), { b: true, sz: 28 }), { jc: 'center', after: 200, before: 40 });
    // personal borderless table
    var half = 4650, other = CW - half, rows = '';
    function fc(label, value) { return para(runT(label, { b: true }), { line: 252 }) + para(runT(value, {}), { line: 252, after: 80 }); }
    C.layout.forEach(function (it) {
      if (it.type === 'pair') {
        rows += '<w:tr>' + tcN(fc(tr(C.shaxs[it.keys[0]].label), blank ? '' : tr(d[it.keys[0]] || '')), half) +
          tcN(fc(tr(C.shaxs[it.keys[1]].label), blank ? '' : tr(d[it.keys[1]] || '')), other) + '</w:tr>';
      } else if (it.type === 'inline') {
        rows += '<w:tr>' + tcN(para([runT(tr(C.shaxs[it.key].label) + ':  ', { b: true }), runT(blank ? '' : tr(d[it.key] || ''), {})], { line: 252, after: 80 }), CW, 2) + '</w:tr>';
      } else {
        rows += '<w:tr>' + tcN(para(runT(tr(C.shaxs[it.key].label) + ':', { b: true }), { line: 252 }) + para(runT(blank ? '' : tr(d[it.key] || ''), {}), { line: 252, after: 60 }), CW, 2) + '</w:tr>';
      }
    });
    out += '<w:tbl><w:tblPr><w:tblW w:w="' + CW + '" w:type="dxa"/>' + bNone() + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="' + half + '"/><w:gridCol w:w="' + other + '"/></w:tblGrid>' + rows + '</w:tbl>';
    // work
    out += para(runT(tr(C.sec.work), { b: true, sz: 28 }), { jc: 'center', before: 200, after: 160 });
    var wP = 2300, wD = CW - wP, wrows = '';
    var wd = blank ? [['', ''], ['', ''], ['', ''], ['', '']] : state.work.filter(function (r) { return r[0] || r[1]; });
    if (!wd.length) wd = [['', '']];
    wd.forEach(function (r) { wrows += '<w:tr>' + tcB(para(runT(blank ? '' : tr(r[0]), { sz: 22 }), { line: 264 }), wP, { ml: 120 }) + tcB(para(runT(blank ? '' : tr(r[1]), { sz: 22 }), { line: 264 }), wD, { ml: 120 }) + '</w:tr>'; });
    out += '<w:tbl><w:tblPr><w:tblW w:w="' + CW + '" w:type="dxa"/>' + bAll() + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="' + wP + '"/><w:gridCol w:w="' + wD + '"/></w:tblGrid>' + wrows + '</w:tbl>';
    // page break + relatives
    out += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    out += para(runT((blank ? '__________' : tr(d.fish || '__________')) + tr(C.sec.relSuffix), { b: true, sz: 26 }), { jc: 'center', after: 0, before: 40, line: 276 });
    out += para(runT(tr(C.sec.relWord), { b: true, sz: 26 }), { jc: 'center', after: 160 });
    var rc = [1550, 2400, 2150, 2450, 1150], head = '';
    C.sec.relHead.forEach(function (t, i) { head += tcB(para(runT(tr(t), { b: true, sz: 22 }), { jc: 'center', line: 252 }), rc[i], { shade: 'F2F2F2' }); });
    var rrows = '<w:tr>' + head + '</w:tr>';
    var qd = blank ? [['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', '']] : state.qar.filter(function (r) { return r.some(function (x) { return x; }); });
    if (!qd.length) qd = [['', '', '', '', '']];
    qd.forEach(function (r) { var c = ''; for (var i = 0; i < 5; i++) c += tcB(para(runT(blank ? '' : tr(r[i] || ''), { sz: 22 }), { jc: 'center', line: 256 }), rc[i]); rrows += '<w:tr>' + c + '</w:tr>'; });
    out += '<w:tbl><w:tblPr><w:tblW w:w="' + CW + '" w:type="dxa"/>' + bAll() + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>' + rc.map(function (w) { return '<w:gridCol w:w="' + w + '"/>'; }).join('') + '</w:tblGrid>' + rrows + '</w:tbl>';
    return out;
  }

  function makeZip(blank, blankBox) {
    var withImg = !blank && state.rasm;
    var body = buildBody(blank, blankBox);
    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + body +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1200"/></w:sectPr></w:body></w:document>';
    var zip = new JSZip();
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' + (withImg ? '<Default Extension="jpg" ContentType="image/jpeg"/>' : '') + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file('word/document.xml', doc);
    zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + (withImg ? '<Relationship Id="rId100" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.jpg"/>' : '') + '</Relationships>');
    if (withImg) zip.file('word/media/image1.jpg', state.rasm.b64, { base64: true });
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  function makeDocx() { return makeZip(false, false); }
  function makeBlankDocx() { return makeZip(true, true); }

  /* ── Yuklab olish ── */
  function fname(ext, blank) { return C.fileBase + (blank ? '-bosh-shablon' : '') + '-' + (state.yozuv === 'cyr' ? 'krill' : 'lotin') + '-toolbase.uz.' + ext; }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000); }
  function toast(m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 1800); }

  /* ════════════ HODISALAR ════════════ */
  elForm.addEventListener('input', function (e) {
    var f = e.target;
    if (f.dataset.sk != null) { state.shaxs[f.dataset.sk] = f.value; refresh(); }
    else if (f.dataset.wk != null) { var p = f.dataset.wk.split('-'); state.work[+p[0]][+p[1]] = f.value; refresh(); }
    else if (f.dataset.qk != null) { var q = f.dataset.qk.split('-'); state.qar[+q[0]][+q[1]] = f.value; refresh(); }
  });
  elForm.addEventListener('click', function (e) {
    if (e.target.id === 'addWork') { state.work.push(['', '']); renderForm(); refresh(); }
    else if (e.target.id === 'addQar') { state.qar.push(['', '', '', '', '']); renderForm(); refresh(); }
    else if (e.target.dataset.wdel != null) { if (state.work.length > 1) { state.work.splice(+e.target.dataset.wdel, 1); renderForm(); refresh(); } }
    else if (e.target.dataset.qdel != null) { if (state.qar.length > 1) { state.qar.splice(+e.target.dataset.qdel, 1); renderForm(); refresh(); } }
  });
  function showPane(which) { if (!isMobile()) return; $('#formPane').hidden = which !== 'form'; $('#resultPane').hidden = which !== 'result'; var ws = $('#workspace'); if (ws) ws.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  var bb = $('#btnBackForm'); if (bb) bb.addEventListener('click', function () { showPane('form'); });
  $$('.yozuv-btn').forEach(function (b) { b.addEventListener('click', function () { state.yozuv = b.dataset.yozuv; $$('.yozuv-btn').forEach(function (x) { x.classList.toggle('active', x === b); }); refresh(); }); });
  $$('[data-act="docx"]').forEach(function (b) { b.addEventListener('click', function () { makeDocx().then(function (bl) { dl(bl, fname('docx', false)); toast('Word yuklab olindi \u2713'); }); }); });
  $$('[data-act="blank"]').forEach(function (b) { b.addEventListener('click', function () { makeBlankDocx().then(function (bl) { dl(bl, fname('docx', true)); toast('Bo\'sh shablon yuklab olindi \u2713'); }); }); });
  $$('[data-act="txt"]').forEach(function (b) { b.addEventListener('click', function () { dl(new Blob([buildText()], { type: 'text/plain;charset=utf-8' }), fname('txt', false)); toast('Matn yuklab olindi \u2713'); }); });
  $$('[data-act="copy"]').forEach(function (b) { b.addEventListener('click', function () { navigator.clipboard.writeText(buildText()).then(function () { toast('Nusxalandi \u2713'); }); }); });

  renderForm(); refresh();
  if (isMobile()) { $('#formPane').hidden = false; $('#resultPane').hidden = true; }
})();
