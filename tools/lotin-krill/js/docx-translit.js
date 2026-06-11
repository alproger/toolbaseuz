/**
 * Toolbase.uz — Word (.docx) hujjatni lotin ⇄ krill o'girish moduli
 * - UzTranslit yadrosidan foydalanadi (translit.js oldin yuklangan bo'lishi shart)
 * - JSZip lokal fayldan lazy yuklanadi (faqat fayl tanlanganida)
 * - Yo'nalish FAQAT qo'lda tanlanadi — fayl uchun avto-aniqlash yo'q
 * - Formatlash to'liq saqlanadi: faqat <w:t> matn tugunlari o'zgaradi
 * - Fayl serverga yuborilmaydi — butun jarayon brauzerda
 *
 * Sahifa talablari:
 *   #dxDrop #dxFile #dxPanel #dxName #dxInfo #dxReset
 *   #dxDirLat (Lotin→Krill) #dxDirCyr (Krill→Lotin) #dxGo #dxStatus
 *   window.DX_I18N — sahifa tilidagi xabarlar (pastdagi defaultlar o'zbekcha)
 */
(function () {
  'use strict';

  var I18N = Object.assign({
    converting: "O'girilmoqda…",
    done: "Tayyor! {name} yuklab olindi ✓",
    errDoc: "Eski .doc format. Word'da ochib «.docx sifatida saqlash» qiling, so'ng yuklang.",
    errType: "Faqat .docx fayl qabul qilinadi.",
    errEmpty: "Hujjatda matn topilmadi. Skan hujjat bo'lsa, matn rasm ko'rinishida — bunda OCR kerak.",
    errBroken: "Hujjat o'qilmadi — fayl buzilgan yoki shifrlangan bo'lishi mumkin.",
    errLib: "Kutubxona yuklanmadi. Sahifani yangilab qayta urinib ko'ring.",
    suffixLat: "-lotin",
    suffixCyr: "-krill"
  }, window.DX_I18N || {});

  var $ = function (id) { return document.getElementById(id); };
  var drop = $('dxDrop'), fileInp = $('dxFile'), panel = $('dxPanel');
  if (!drop || !fileInp) return; // bo'lim bo'lmagan sahifada jim chiqib ketadi

  var file = null;
  var dir = 'lat'; // default: Lotin → Krill (qo'lda o'zgartiriladi)

  /* ── JSZip lazy load (shu skript turgan papkadan) ── */
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.slice(0, s.lastIndexOf('/') + 1) : 'js/';
  })();
  var zipReady = null;
  function loadJSZip() {
    if (window.JSZip) return Promise.resolve();
    if (zipReady) return zipReady;
    zipReady = new Promise(function (res, rej) {
      var sc = document.createElement('script');
      sc.src = BASE + 'jszip.min.js';
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

  function pick(f) {
    if (!f) return;
    var name = f.name.toLowerCase();
    if (name.slice(-4) === '.doc') { setStatus(I18N.errDoc, 'err'); return; }
    if (name.slice(-5) !== '.docx') { setStatus(I18N.errType, 'err'); return; }
    file = f;
    $('dxName').textContent = f.name;
    $('dxInfo').textContent = (f.size / 1048576).toFixed(2) + ' MB';
    drop.hidden = true; panel.hidden = false;
    setStatus('');
    loadJSZip().catch(function(){}); // oldindan yuklab qo'yamiz
  }

  drop.addEventListener('click', function () { fileInp.click(); });
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
    $('dxDirLat').setAttribute('aria-pressed', d === 'lat');
    $('dxDirCyr').classList.toggle('active', d === 'cyr');
    $('dxDirCyr').setAttribute('aria-pressed', d === 'cyr');
  }
  $('dxDirLat').addEventListener('click', function () { setDir('lat'); });
  $('dxDirCyr').addEventListener('click', function () { setDir('cyr'); });

  /* ── XML matnini xavfsiz o'girish ──
     Faqat <w:t> teglari ICHIDAGI matn o'zgaradi; XML entity'lar
     (&amp; &#8217; ...) himoyalanadi — ular ichidagi harflar o'girilmaydi. */
  function convertXml(xml, fn) {
    return xml.replace(/(<w:t(?:\s[^>]*)?>)([\s\S]*?)(<\/w:t>)/g,
      function (m, open, text, close) {
        var parts = text.split(/(&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;)/);
        for (var i = 0; i < parts.length; i += 2) parts[i] = fn(parts[i]);
        return open + parts.join('') + close;
      });
  }

  // Matn turadigan barcha DOCX qismlari
  var TARGET_RE = /^word\/(document|header\d*|footer\d*|footnotes|endnotes|comments)\.xml$/;

  $('dxGo').addEventListener('click', function () {
    if (!file) return;
    var btn = $('dxGo');
    btn.disabled = true;
    setStatus(I18N.converting);

    var fn = dir === 'lat'
      ? function (t) { return UzTranslit.latToCyr(t); }
      : function (t) { return UzTranslit.cyrToLat(t); };

    loadJSZip()
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
              if (!hasText && /<w:t[^>]*>[^<]*[A-Za-z\u0400-\u04FF]/.test(xml)) hasText = true;
              zip.file(path, convertXml(xml, fn));
            });
          });
        });
        return chain.then(function () {
          if (!hasText) throw new Error('empty');
          return zip.generateAsync({ type: 'blob', compression: 'DEFLATE',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        });
      })
      .then(function (blob) {
        var suffix = dir === 'lat' ? I18N.suffixCyr : I18N.suffixLat;
        var name = file.name.replace(/(\.docx)$/i, suffix + '$1');
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        setStatus(I18N.done.replace('{name}', name), 'ok');
      })
      .catch(function (e) {
        setStatus(
          e && e.message === 'empty' ? I18N.errEmpty :
          e && e.message === 'lib' ? I18N.errLib : I18N.errBroken, 'err');
      })
      .then(function () { btn.disabled = false; });
  });
})();
