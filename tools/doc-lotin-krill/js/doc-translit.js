/**
 * Toolbase.uz — Hujjat Lotin ⇄ Krill moduli
 * Formatlar: .docx .pptx .xlsx .txt
 * - UzTranslit yadrosi + UZ_EXCEPTIONS lug'ati (oldin yuklangan bo'lishi shart)
 * - JSZip lokal fayldan lazy yuklanadi (data-lib atributidagi papkadan)
 * - Yo'nalish FAQAT qo'lda tanlanadi
 * - OOXML: faqat matn tugunlari o'zgaradi, formatlash 100% saqlanadi
 * - TXT: UTF-8, eski fayllar uchun windows-1251 fallback
 * - Yuklanadigan fayl nomiga "toolbase.uz" qo'shiladi
 */
(function () {
  'use strict';

  var I18N = Object.assign({
    converting: "O'girilmoqda…",
    done: "Tayyor! {name} yuklab olindi ✓",
    errDoc: "Eski .doc format. Word'da ochib «.docx sifatida saqlash» qiling, so'ng yuklang.",
    errType: "Qabul qilinadigan formatlar: .docx, .pptx, .xlsx, .txt",
    errEmpty: "Hujjatda matn topilmadi. Skan hujjat bo'lsa, matn rasm ko'rinishida — bunda OCR kerak.",
    errBroken: "Hujjat o'qilmadi — fayl buzilgan yoki shifrlangan bo'lishi mumkin.",
    errLib: "Kutubxona yuklanmadi. Sahifani yangilab qayta urinib ko'ring.",
    suffixLat: "lotin",
    suffixCyr: "krill"
  }, window.DOC_I18N || {});

  if (typeof UzTranslit !== 'undefined' && window.UZ_EXCEPTIONS) {
    UzTranslit.loadExceptions(window.UZ_EXCEPTIONS);
  }

  var $ = function (id) { return document.getElementById(id); };
  var drop = $('dxDrop'), fileInp = $('dxFile'), panel = $('dxPanel');
  if (!drop || !fileInp) return;

  var file = null;
  var dir = 'lat'; // standart: Lotin → Krill

  /* ── JSZip lazy load ── */
  var LIB = (function () {
    var s = document.currentScript;
    var base = s && s.getAttribute('data-lib');
    return base || 'js/';
  })();
  var zipReady = null;
  function loadJSZip() {
    if (window.JSZip) return Promise.resolve();
    if (zipReady) return zipReady;
    zipReady = new Promise(function (res, rej) {
      var sc = document.createElement('script');
      sc.src = LIB + 'jszip.min.js';
      sc.onload = res; sc.onerror = rej;
      document.head.appendChild(sc);
    });
    return zipReady;
  }

  /* ── UI ── */
  function setStatus(msg, cls) {
    var s = $('dxStatus');
    s.textContent = msg || '';
    s.className = 'dx-status' + (cls ? ' ' + cls : '');
  }

  var EXT_RE = /\.(docx|pptx|xlsx|txt)$/i;

  function pick(f) {
    if (!f) return;
    var name = f.name.toLowerCase();
    if (/\.(doc|ppt|xls)$/.test(name)) { setStatus(I18N.errDoc, 'err'); return; }
    if (!EXT_RE.test(name)) { setStatus(I18N.errType, 'err'); return; }
    file = f;
    $('dxName').textContent = f.name;
    $('dxInfo').textContent = (f.size / 1048576).toFixed(2) + ' MB';
    drop.hidden = true; panel.hidden = false;
    setStatus('');
    if (!/\.txt$/.test(name)) loadJSZip().catch(function(){});
  }

  drop.addEventListener('click', function () { fileInp.click(); });
  drop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInp.click(); }
  });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
  drop.addEventListener('drop', function (e) {
    e.preventDefault(); drop.classList.remove('over');
    pick(e.dataTransfer.files[0]);
  });
  fileInp.addEventListener('change', function () { pick(fileInp.files[0]); });

  $('dxReset').addEventListener('click', function () {
    file = null; fileInp.value = '';
    panel.hidden = true; drop.hidden = false; setStatus('');
  });

  function setDir(d) {
    dir = d;
    $('dxDirLat').classList.toggle('active', d === 'lat');
    $('dxDirLat').setAttribute('aria-pressed', String(d === 'lat'));
    $('dxDirCyr').classList.toggle('active', d === 'cyr');
    $('dxDirCyr').setAttribute('aria-pressed', String(d === 'cyr'));
  }
  $('dxDirLat').addEventListener('click', function () { setDir('lat'); });
  $('dxDirCyr').addEventListener('click', function () { setDir('cyr'); });

  /* ── XML matnini xavfsiz o'girish ──
     <w:t> (Word), <a:t> (PowerPoint), <t> (Excel) teglari ichidagi matn.
     XML entity'lar (&amp; &#8217;) himoyalanadi. */
  function convertXml(xml, fn) {
    return xml.replace(/(<(w:t|a:t|t)(?:\s[^>]*)?>)([\s\S]*?)(<\/\2>)/g,
      function (m, open, tag, text, close) {
        var parts = text.split(/(&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;)/);
        for (var i = 0; i < parts.length; i += 2) parts[i] = fn(parts[i]);
        return open + parts.join('') + close;
      });
  }

  // Matn turadigan qismlar — format bo'yicha
  var TARGET_RE = new RegExp(
    '^word/(document|header\\d*|footer\\d*|footnotes|endnotes|comments)\\.xml$' +
    '|^ppt/(slides|notesSlides)/[^/]+\\.xml$' +
    '|^xl/sharedStrings\\.xml$' +
    '|^xl/worksheets/sheet\\d+\\.xml$'
  );

  var MIME = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain;charset=utf-8'
  };

  function outName(orig, suffix) {
    // hisobot.docx -> hisobot-krill-toolbase.uz.docx
    var m = orig.match(/^(.+)(\.\w+)$/);
    var base = m ? m[1] : orig, ext = m ? m[2] : '';
    return base + '-' + suffix + '-toolbase.uz' + ext;
  }

  function downloadBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  // TXT: UTF-8, xato bo'lsa windows-1251 (eski krill fayllar)
  function readTxt(buf) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch (e) {
      try { return new TextDecoder('windows-1251').decode(buf); }
      catch (e2) { return new TextDecoder('utf-8').decode(buf); }
    }
  }

  $('dxGo').addEventListener('click', function () {
    if (!file) return;
    var btn = $('dxGo');
    btn.disabled = true;
    setStatus(I18N.converting);

    var fn = dir === 'lat'
      ? function (t) { return UzTranslit.latToCyr(t); }
      : function (t) { return UzTranslit.cyrToLat(t); };
    var suffix = dir === 'lat' ? I18N.suffixCyr : I18N.suffixLat;
    var ext = file.name.toLowerCase().match(EXT_RE)[1];

    var job;
    if (ext === 'txt') {
      job = file.arrayBuffer().then(function (buf) {
        var text = readTxt(buf);
        if (!/[A-Za-z\u0400-\u04FF]/.test(text)) throw new Error('empty');
        return new Blob([fn(text)], { type: MIME.txt });
      });
    } else {
      job = loadJSZip()
        .catch(function () { throw new Error('lib'); })
        .then(function () { return file.arrayBuffer(); })
        .then(function (buf) { return JSZip.loadAsync(buf); })
        .then(function (zip) {
          var targets = Object.keys(zip.files).filter(function (p) { return TARGET_RE.test(p); });
          if (!targets.length) throw new Error('broken');
          var hasText = false;
          var chain = Promise.resolve();
          targets.forEach(function (path) {
            chain = chain.then(function () {
              return zip.files[path].async('string').then(function (xml) {
                if (!hasText && /<(?:w:t|a:t|t)(?:\s[^>]*)?>[^<]*[A-Za-z\u0400-\u04FF]/.test(xml)) hasText = true;
                zip.file(path, convertXml(xml, fn));
              });
            });
          });
          return chain.then(function () {
            if (!hasText) throw new Error('empty');
            return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', mimeType: MIME[ext] });
          });
        });
    }

    job.then(function (blob) {
      var name = outName(file.name, suffix);
      downloadBlob(blob, name);
      setStatus(I18N.done.replace('{name}', name), 'ok');
    }).catch(function (e) {
      setStatus(
        e && e.message === 'empty' ? I18N.errEmpty :
        e && e.message === 'lib' ? I18N.errLib : I18N.errBroken, 'err');
    }).then(function () { btn.disabled = false; });
  });
})();
