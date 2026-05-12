'use strict';
/* ================================================================
   toolbase.uz — PDF Editor
   pdf-lib (overlay layers) + PDF.js (preview render)
   ================================================================ */
(function () {

  var MAX_MB = 100, MAX_BYTES = MAX_MB * 1024 * 1024;

  /* State */
  var pdfDoc      = null;   // pdf-lib PDFDocument
  var pdfJsDoc    = null;   // PDF.js document
  var currentPage = 1;
  var totalPages  = 0;
  var arrayBuffer = null;
  var fileName    = '';

  /* Per-page annotation layers: { pageNum: [ {type, ...props} ] } */
  var annotations = {};

  /* Drawing state */
  var activeTool  = 'text';  // text | draw | rect | line
  var activeColor = '#dc2626';
  var fontSize    = 16;
  var isDrawing   = false;
  var drawStart   = null;
  var drawPath    = [];

  /* Canvas references */
  var pdfCanvas     = null;
  var overlayCanvas = null;
  var overlayCtx    = null;

  var $ = function (id) { return document.getElementById(id); };
  var elDropZone     = $('dropZone');
  var elFileInput    = $('fileInput');
  var elEditorWS     = $('editorWorkspace');
  var elCanvasCont   = $('canvasContainer');
  var elPdfCanvas    = $('pdfCanvas');
  var elOverlay      = $('overlayCanvas');
  var elTextOverlay  = $('textOverlay');
  var elPageInfo     = $('pageInfo');
  var elBtnPrev      = $('btnPrevPage');
  var elBtnNext      = $('btnNextPage');
  var elBtnSave      = $('btnSavePDF');
  var elBtnNewFile   = $('btnNewFile');
  var elBtnUndo      = $('btnUndo');
  var elBtnClear     = $('btnClearPage');
  var elResultBox    = $('resultBox');
  var elResultTitle  = $('resultTitle');
  var elResultSub    = $('resultSub');
  var elBtnDownload  = $('btnDownload');
  var elErrorBox     = $('errorBox');
  var elToast        = $('toast');
  var elFontSize     = $('fontSize');
  var toastTimer     = null;

  /* ── Helpers ── */
  function showToast(msg, type) {
    elToast.textContent = msg;
    elToast.className = 'toast show' + (type ? ' toast-' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { elToast.className = 'toast'; }, 2500);
  }
  function showError(msg) {
    elErrorBox.textContent = msg;
    elErrorBox.style.display = 'block';
    setTimeout(function () { elErrorBox.style.display = 'none'; }, 7000);
  }
  function clearError() { elErrorBox.style.display = 'none'; }
  function fmtSize(b) { return b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
  function getPageAnnotations() { return annotations[currentPage] || (annotations[currentPage] = []); }

  /* ── File load ── */
  function handleFile(file) {
    clearError();
    if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      showError('Faqat PDF fayllar qabul qilinadi.'); return;
    }
    if (file.size > MAX_BYTES) { showError('"' + file.name + '" hajmi juda katta (maks ' + MAX_MB + ' MB).'); return; }
    fileName = file.name;
    var reader = new FileReader();
    reader.onload = function (e) { arrayBuffer = e.target.result; loadPDF(arrayBuffer); };
    reader.readAsArrayBuffer(file);
  }

  async function loadPDF(ab) {
    try {
      pdfDoc = await PDFLib.PDFDocument.load(ab);
      pdfJsDoc = await pdfjsLib.getDocument({ data: ab.slice(0) }).promise;
      totalPages = pdfJsDoc.numPages;
      currentPage = 1;
      annotations = {};
      elDropZone.style.display = 'none';
      elEditorWS.style.display = 'block';
      await renderPage(currentPage);
      updatePageNav();
      showToast('PDF yuklandi ✓', 'ok');
    } catch (err) {
      showError('PDF ochishda xatolik: ' + (err.message || err));
    }
  }

  /* ── Render page ── */
  async function renderPage(num) {
    var page = await pdfJsDoc.getPage(num);
    var vp = page.getViewport({ scale: 1.5 });

    elPdfCanvas.width  = vp.width;
    elPdfCanvas.height = vp.height;
    elOverlay.width  = vp.width;
    elOverlay.height = vp.height;
    elOverlay.style.width  = vp.width + 'px';
    elOverlay.style.height = vp.height + 'px';

    overlayCtx = elOverlay.getContext('2d');

    var ctx = elPdfCanvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    redrawAnnotations();
  }

  /* ── Redraw all annotations for current page ── */
  function redrawAnnotations() {
    if (!overlayCtx) return;
    overlayCtx.clearRect(0, 0, elOverlay.width, elOverlay.height);
    var list = getPageAnnotations();
    list.forEach(function (ann) { drawAnnotation(overlayCtx, ann); });
    elBtnUndo.disabled = list.length === 0;
  }

  function drawAnnotation(ctx, ann) {
    ctx.save();
    ctx.strokeStyle = ann.color;
    ctx.fillStyle   = ann.color;
    ctx.lineWidth   = ann.lineWidth || 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    if (ann.type === 'text') {
      ctx.font = ann.fontSize + 'px Arial, sans-serif';
      ctx.fillText(ann.text, ann.x, ann.y);
    } else if (ann.type === 'draw') {
      if (ann.path.length < 2) { ctx.restore(); return; }
      ctx.beginPath();
      ctx.moveTo(ann.path[0].x, ann.path[0].y);
      ann.path.forEach(function (p) { ctx.lineTo(p.x, p.y); });
      ctx.stroke();
    } else if (ann.type === 'rect') {
      ctx.strokeRect(ann.x, ann.y, ann.w, ann.h);
    } else if (ann.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(ann.x1, ann.y1);
      ctx.lineTo(ann.x2, ann.y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Canvas pointer events ── */
  function getPos(e) {
    var rect = elOverlay.getBoundingClientRect();
    var scaleX = elOverlay.width / rect.width;
    var scaleY = elOverlay.height / rect.height;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  elOverlay.addEventListener('mousedown', onPointerDown);
  elOverlay.addEventListener('touchstart', onPointerDown, { passive: false });
  elOverlay.addEventListener('mousemove', onPointerMove);
  elOverlay.addEventListener('touchmove', onPointerMove, { passive: false });
  elOverlay.addEventListener('mouseup', onPointerUp);
  elOverlay.addEventListener('touchend', onPointerUp);

  function onPointerDown(e) {
    e.preventDefault();
    var pos = getPos(e);

    if (activeTool === 'text') {
      showTextInput(pos.x, pos.y);
      return;
    }
    isDrawing = true;
    drawStart = pos;
    drawPath  = [pos];
  }

  function onPointerMove(e) {
    e.preventDefault();
    if (!isDrawing || activeTool === 'text') return;
    var pos = getPos(e);

    if (activeTool === 'draw') {
      drawPath.push(pos);
      redrawAnnotations();
      /* Live preview */
      overlayCtx.save();
      overlayCtx.strokeStyle = activeColor;
      overlayCtx.lineWidth = parseInt(elFontSize.value) / 8 + 1;
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
      overlayCtx.beginPath();
      overlayCtx.moveTo(drawPath[0].x, drawPath[0].y);
      drawPath.forEach(function (p) { overlayCtx.lineTo(p.x, p.y); });
      overlayCtx.stroke();
      overlayCtx.restore();
    } else {
      /* rect / line live preview */
      redrawAnnotations();
      overlayCtx.save();
      overlayCtx.strokeStyle = activeColor;
      overlayCtx.lineWidth = parseInt(elFontSize.value) / 8 + 1;
      if (activeTool === 'rect') {
        overlayCtx.strokeRect(drawStart.x, drawStart.y, pos.x - drawStart.x, pos.y - drawStart.y);
      } else if (activeTool === 'line') {
        overlayCtx.beginPath();
        overlayCtx.moveTo(drawStart.x, drawStart.y);
        overlayCtx.lineTo(pos.x, pos.y);
        overlayCtx.stroke();
      }
      overlayCtx.restore();
    }
  }

  function onPointerUp(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    var pos = e.changedTouches ? { x: getPos(e.changedTouches[0]).x, y: getPos(e.changedTouches[0]).y } : getPos(e);
    var lw = parseInt(elFontSize.value) / 8 + 1;

    if (activeTool === 'draw') {
      getPageAnnotations().push({ type: 'draw', path: drawPath.slice(), color: activeColor, lineWidth: lw });
    } else if (activeTool === 'rect') {
      getPageAnnotations().push({ type: 'rect', x: drawStart.x, y: drawStart.y, w: pos.x - drawStart.x, h: pos.y - drawStart.y, color: activeColor, lineWidth: lw });
    } else if (activeTool === 'line') {
      getPageAnnotations().push({ type: 'line', x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y, color: activeColor, lineWidth: lw });
    }
    drawPath = []; drawStart = null;
    redrawAnnotations();
    elBtnUndo.disabled = false;
  }

  /* ── Text input ── */
  function showTextInput(cx, cy) {
    var rect = elOverlay.getBoundingClientRect();
    var contRect = elCanvasCont.getBoundingClientRect();
    var scaleX = rect.width / elOverlay.width;
    var scaleY = rect.height / elOverlay.height;

    elTextOverlay.style.display = 'block';
    elTextOverlay.style.left = (rect.left - contRect.left + cx * scaleX) + 'px';
    elTextOverlay.style.top  = (rect.top  - contRect.top  + cy * scaleY) + 'px';
    elTextOverlay.style.fontSize = (parseInt(elFontSize.value) * scaleY) + 'px';
    elTextOverlay.style.color = activeColor;
    elTextOverlay.textContent = '';
    elTextOverlay.focus();

    elTextOverlay._canvasX = cx;
    elTextOverlay._canvasY = cy + parseInt(elFontSize.value);
  }

  elTextOverlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { elTextOverlay.style.display = 'none'; return; }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitText();
    }
  });
  elTextOverlay.addEventListener('blur', function () {
    if (elTextOverlay.textContent.trim()) commitText();
    else elTextOverlay.style.display = 'none';
  });

  function commitText() {
    var txt = elTextOverlay.textContent.trim();
    if (!txt) { elTextOverlay.style.display = 'none'; return; }
    getPageAnnotations().push({
      type: 'text',
      text: txt,
      x: elTextOverlay._canvasX,
      y: elTextOverlay._canvasY,
      color: activeColor,
      fontSize: parseInt(elFontSize.value)
    });
    elTextOverlay.style.display = 'none';
    elTextOverlay.textContent = '';
    redrawAnnotations();
    elBtnUndo.disabled = false;
  }

  /* ── Tool buttons ── */
  var toolBtns = { text: $('toolText'), draw: $('toolDraw'), rect: $('toolRect'), line: $('toolLine') };
  Object.keys(toolBtns).forEach(function (key) {
    toolBtns[key].addEventListener('click', function () {
      activeTool = key;
      Object.values(toolBtns).forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      elCanvasCont.className = 'canvas-container mode-' + (key === 'text' ? 'text' : 'draw');
    });
  });

  /* ── Color dots ── */
  document.querySelectorAll('.color-dot').forEach(function (dot) {
    dot.addEventListener('click', function () {
      document.querySelectorAll('.color-dot').forEach(function (d) { d.classList.remove('selected'); });
      this.classList.add('selected');
      activeColor = this.dataset.color;
      $('customColor').value = activeColor;
    });
  });
  $('customColor').addEventListener('input', function () {
    activeColor = this.value;
    document.querySelectorAll('.color-dot').forEach(function (d) { d.classList.remove('selected'); });
  });

  /* ── Undo ── */
  elBtnUndo.addEventListener('click', function () {
    var list = getPageAnnotations();
    if (list.length) { list.pop(); redrawAnnotations(); }
  });

  /* ── Clear page ── */
  elBtnClear.addEventListener('click', function () {
    annotations[currentPage] = [];
    redrawAnnotations();
    showToast('Sahifa tozalandi', 'ok');
  });

  /* ── Page nav ── */
  function updatePageNav() {
    elPageInfo.textContent = currentPage + ' / ' + totalPages;
    elBtnPrev.disabled = currentPage <= 1;
    elBtnNext.disabled = currentPage >= totalPages;
  }
  elBtnPrev.addEventListener('click', async function () {
    if (currentPage > 1) { elTextOverlay.style.display = 'none'; currentPage--; await renderPage(currentPage); updatePageNav(); }
  });
  elBtnNext.addEventListener('click', async function () {
    if (currentPage < totalPages) { elTextOverlay.style.display = 'none'; currentPage++; await renderPage(currentPage); updatePageNav(); }
  });

  /* ── Save PDF ── */
  elBtnSave.addEventListener('click', async function () {
    if (!pdfDoc) return;
    try {
      elBtnSave.disabled = true;
      elBtnSave.textContent = 'Saqlanmoqda…';

      var outputDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      var { rgb } = PDFLib;

      /* Embed Helvetica for text */
      var font = await outputDoc.embedFont(PDFLib.StandardFonts.Helvetica);

      for (var pageNum = 1; pageNum <= totalPages; pageNum++) {
        var list = annotations[pageNum];
        if (!list || !list.length) continue;

        var pdfPage = outputDoc.getPage(pageNum - 1);
        var { width: pW, height: pH } = pdfPage.getSize();

        /* Get canvas dimensions for this page to compute scale */
        var pjsPage = await pdfJsDoc.getPage(pageNum);
        var vp = pjsPage.getViewport({ scale: 1.5 });
        var scaleX = pW / vp.width;
        var scaleY = pH / vp.height;

        list.forEach(function (ann) {
          var c = hexToRGB(ann.color);
          var color = rgb(c.r, c.g, c.b);
          var lw = (ann.lineWidth || 2) * Math.min(scaleX, scaleY);

          if (ann.type === 'text') {
            var fs = (ann.fontSize || 16) * scaleY;
            pdfPage.drawText(ann.text, {
              x: ann.x * scaleX,
              y: pH - ann.y * scaleY,
              size: fs,
              font: font,
              color: color
            });
          } else if (ann.type === 'rect') {
            var x = ann.x * scaleX, y = pH - (ann.y + ann.h) * scaleY;
            var w = ann.w * scaleX, h = ann.h * scaleY;
            pdfPage.drawRectangle({ x: x, y: y, width: w, height: Math.abs(h), borderColor: color, borderWidth: lw, opacity: 0, borderOpacity: 1 });
          } else if (ann.type === 'line') {
            pdfPage.drawLine({ start: { x: ann.x1 * scaleX, y: pH - ann.y1 * scaleY }, end: { x: ann.x2 * scaleX, y: pH - ann.y2 * scaleY }, thickness: lw, color: color });
          } else if (ann.type === 'draw' && ann.path.length > 1) {
            for (var i = 0; i < ann.path.length - 1; i++) {
              pdfPage.drawLine({ start: { x: ann.path[i].x * scaleX, y: pH - ann.path[i].y * scaleY }, end: { x: ann.path[i+1].x * scaleX, y: pH - ann.path[i+1].y * scaleY }, thickness: lw, color: color });
            }
          }
        });
      }

      var bytes = await outputDoc.save();
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      var outName = fileName.replace(/\.pdf$/i, '') + '-edited.pdf';

      elResultTitle.textContent = 'PDF tayyor!';
      elResultSub.textContent = fmtSize(bytes.byteLength);
      elResultBox.classList.add('show');

      var newBtn = elBtnDownload.cloneNode(true);
      elBtnDownload.parentNode.replaceChild(newBtn, elBtnDownload);
      newBtn.addEventListener('click', function () {
        var a = document.createElement('a'); a.href = url; a.download = outName; a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
        showToast('Yuklab olindi ✓', 'ok');
      });

      showToast('PDF saqlandi ✓', 'ok');
    } catch (err) {
      showError('Saqlashda xatolik: ' + (err.message || err));
    } finally {
      elBtnSave.disabled = false;
      elBtnSave.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PDF sifatida saqlash';
    }
  });

  /* ── Reset ── */
  elBtnNewFile.addEventListener('click', function () {
    pdfDoc = null; pdfJsDoc = null; annotations = {}; arrayBuffer = null;
    elEditorWS.style.display = 'none';
    elDropZone.style.display = '';
    elResultBox.classList.remove('show');
    clearError();
    elFileInput.value = '';
  });

  /* ── Drag & Drop ── */
  elDropZone.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
  elDropZone.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
  elDropZone.addEventListener('drop', function (e) { e.preventDefault(); this.classList.remove('drag-over'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  elDropZone.addEventListener('click', function (e) { if (e.target === elFileInput) return; elFileInput.click(); });
  elFileInput.addEventListener('change', function () { if (this.files[0]) { handleFile(this.files[0]); this.value = ''; } });

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', function (e) {
    if (e.target === elTextOverlay) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); elBtnUndo.click(); }
  });

  /* ── Hex to RGB ── */
  function hexToRGB(hex) {
    var r = parseInt(hex.slice(1,3),16)/255;
    var g = parseInt(hex.slice(3,5),16)/255;
    var b = parseInt(hex.slice(5,7),16)/255;
    return { r: r, g: g, b: b };
  }

  document.getElementById('year').textContent = new Date().getFullYear();

})();
