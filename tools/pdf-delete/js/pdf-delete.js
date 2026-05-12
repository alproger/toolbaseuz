'use strict';
/* ================================================================
   toolbase.uz — PDF Sahifa O'chirish
   pdf-lib + PDF.js
   ================================================================ */
(function () {

  var MAX_MB    = 150;
  var MAX_BYTES = MAX_MB * 1024 * 1024;

  var currentFile   = null;  // { name, size, arrayBuffer, pageCount }
  var deletedPages  = new Set(); // Set of 0-indexed page numbers
  var isProcessing  = false;
  var activeMethod  = 'visual'; // 'visual' | 'range'

  var $ = function (id) { return document.getElementById(id); };
  var elDropZone    = $('dropZone');
  var elFileInput   = $('fileInput');
  var elFileInfo    = $('fileInfo');
  var elFileName    = $('fileName');
  var elFileMeta    = $('fileMeta');
  var elBtnRemove   = $('btnRemoveFile');
  var elPageSection = $('pageSection');
  var elPageGrid    = $('pageGrid');
  var elPageLoading = $('pageLoading');
  var elActionPanel = $('actionPanel');
  var elBtnProcess  = $('btnProcess');
  var elBtnReset    = $('btnReset');
  var elProgressWrap= $('progressWrap');
  var elProgressBar = $('progressBar');
  var elProgressLbl = $('progressLabel');
  var elErrorBox    = $('errorBox');
  var elResultBox   = $('resultBox');
  var elResultTitle = $('resultTitle');
  var elResultSub   = $('resultSub');
  var elBtnDownload = $('btnDownload');
  var elToast       = $('toast');
  var elSelBar      = $('selectionBar');
  var elSelCount    = $('selCount');
  var elTabVisual   = $('tabVisual');
  var elTabRange    = $('tabRange');
  var elRangePanel  = $('rangePanel');
  var elRangeFrom   = $('rangeFrom');
  var elRangeTo     = $('rangeTo');
  var elBtnApplyRange = $('btnApplyRange');
  var elTotalPagesHint = $('totalPagesHint');
  var elBtnSelAll   = $('btnSelAll');
  var elBtnSelNone  = $('btnSelNone');
  var elBtnRangeSelectAll = $('btnRangeSelectAll');
  var elBtnRangeClear = $('btnRangeClear');
  var toastTimer    = null;

  /* ── Helpers ───────────────────────────────────────────────── */
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
  function fmtSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }
  function setProgress(pct, label) { elProgressWrap.classList.toggle('show', pct >= 0 && pct < 100); elProgressBar.style.width = Math.min(100, pct) + '%'; elProgressLbl.textContent = label || ''; }
  function hideProgress() { elProgressWrap.classList.remove('show'); }
  function hideResult() { elResultBox.classList.remove('show'); }
  function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* ── File handling ─────────────────────────────────────────── */
  function handleFile(file) {
    clearError();
    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      showError('Faqat PDF fayllar qabul qilinadi.'); return;
    }
    if (file.size > MAX_BYTES) {
      showError('"' + file.name + '" — ' + fmtSize(file.size) + ' (limit: ' + MAX_MB + ' MB)'); return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      currentFile = { name: file.name, size: file.size, arrayBuffer: e.target.result, pageCount: null };
      elFileName.textContent = file.name;
      elFileMeta.textContent = fmtSize(file.size);
      elFileInfo.style.display = 'block';
      elDropZone.style.display = 'none';
      hideResult();
      deletedPages.clear();
      loadPagesPreview();
    };
    reader.readAsArrayBuffer(file);
  }

  function resetAll() {
    currentFile = null;
    deletedPages.clear();
    elFileInfo.style.display = 'none';
    elDropZone.style.display = '';
    elPageSection.style.display = 'none';
    elPageGrid.innerHTML = '';
    elActionPanel.style.display = 'none';
    elSelBar.style.display = 'none';
    hideResult();
    clearError();
    hideProgress();
    elFileInput.value = '';
  }

  /* ── Load pages preview ────────────────────────────────────── */
  function loadPagesPreview() {
    if (!currentFile || !window.pdfjsLib) return;
    elPageSection.style.display = 'block';
    elPageGrid.innerHTML = '';
    elPageLoading.style.display = 'block';
    elActionPanel.style.display = 'none';

    pdfjsLib.getDocument({ data: currentFile.arrayBuffer.slice(0) }).promise.then(function (pdfDoc) {
      currentFile.pageCount = pdfDoc.numPages;
      elFileMeta.textContent = fmtSize(currentFile.size) + ' · ' + pdfDoc.numPages + ' sahifa';
      elTotalPagesHint.textContent = pdfDoc.numPages;
      elRangeFrom.max = pdfDoc.numPages;
      elRangeTo.max = pdfDoc.numPages;
      elPageLoading.style.display = 'none';

      var renders = [];
      for (var p = 1; p <= pdfDoc.numPages; p++) {
        renders.push(renderThumb(pdfDoc, p));
      }
      Promise.all(renders).then(function () {
        updateSelBar();
        updateActionPanel();
      });
    }).catch(function (err) {
      elPageLoading.style.display = 'none';
      showError('PDF ochishda xatolik: ' + (err.message || err));
    });
  }

  function renderThumb(pdfDoc, pageNum) {
    return pdfDoc.getPage(pageNum).then(function (page) {
      var vp = page.getViewport({ scale: 0.3 });
      var canvas = document.createElement('canvas');
      canvas.width = vp.width;
      canvas.height = vp.height;

      return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(function () {
        var thumb = document.createElement('div');
        thumb.className = 'page-thumb';
        thumb.dataset.pageIdx = pageNum - 1;

        if (deletedPages.has(pageNum - 1)) thumb.classList.add('deleted');

        thumb.innerHTML =
          '<div class="page-canvas-wrap"></div>' +
          '<div class="page-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
          '<div class="page-delete-overlay"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></div>' +
          '<div class="page-num">S.' + pageNum + '</div>';

        thumb.querySelector('.page-canvas-wrap').appendChild(canvas);
        thumb.addEventListener('click', function () { togglePage(thumb, pageNum - 1); });
        elPageGrid.appendChild(thumb);
      });
    });
  }

  function togglePage(thumb, idx) {
    if (deletedPages.has(idx)) {
      deletedPages.delete(idx);
      thumb.classList.remove('deleted', 'selected');
    } else {
      deletedPages.add(idx);
      thumb.classList.add('deleted', 'selected');
    }
    updateSelBar();
    updateActionPanel();
  }

  function selectAll() {
    if (!currentFile) return;
    for (var i = 0; i < currentFile.pageCount; i++) deletedPages.add(i);
    elPageGrid.querySelectorAll('.page-thumb').forEach(function (t) { t.classList.add('deleted', 'selected'); });
    updateSelBar(); updateActionPanel();
  }
  function selectNone() {
    deletedPages.clear();
    elPageGrid.querySelectorAll('.page-thumb').forEach(function (t) { t.classList.remove('deleted', 'selected'); });
    updateSelBar(); updateActionPanel();
  }

  /* ── Range selection ───────────────────────────────────────── */
  function applyRange() {
    if (!currentFile) return;
    var from = parseInt(elRangeFrom.value);
    var to   = parseInt(elRangeTo.value);
    var total = currentFile.pageCount;

    if (isNaN(from) || isNaN(to)) { showError("Iltimos 'Dan' va 'Gacha' raqamlarini kiriting."); return; }
    if (from < 1 || to < 1) { showError('Sahifa raqamlari 1 dan katta bo\'lishi kerak.'); return; }
    if (from > total || to > total) { showError('Sahifa raqami ' + total + ' dan katta bo\'lishi mumkin emas.'); return; }
    if (from > to) { showError("'Dan' raqami 'Gacha' raqamidan kichik bo'lishi kerak."); return; }
    if (to - from + 1 >= total) { showError('Kamida 1 ta sahifa qolishi kerak — barcha sahifalarni tanlab bo\'lmaydi.'); return; }

    // Add to selection
    for (var i = from - 1; i <= to - 1; i++) deletedPages.add(i);

    // Update visual
    elPageGrid.querySelectorAll('.page-thumb').forEach(function (t) {
      var idx = parseInt(t.dataset.pageIdx);
      if (deletedPages.has(idx)) t.classList.add('deleted', 'selected');
      else t.classList.remove('deleted', 'selected');
    });

    updateSelBar(); updateActionPanel();
    showToast((to - from + 1) + " ta sahifa tanlandi ✓", 'ok');
  }

  /* ── UI state ───────────────────────────────────────────────── */
  function updateSelBar() {
    var count = deletedPages.size;
    elSelBar.style.display = count > 0 ? 'inline-flex' : 'none';
    elSelCount.textContent = count;
  }

  function updateActionPanel() {
    var show = currentFile && deletedPages.size > 0;
    elActionPanel.style.display = show ? 'flex' : 'none';
    if (show) elBtnProcess.disabled = isProcessing;
  }

  /* ── Mode tabs ──────────────────────────────────────────────── */
  function switchMethod(method) {
    activeMethod = method;
    elTabVisual.classList.toggle('active', method === 'visual');
    elTabRange.classList.toggle('active', method === 'range');
    elRangePanel.style.display = method === 'range' ? 'block' : 'none';
    elPageGrid.style.display = method === 'visual' ? '' : 'none';
    var hintEl = $('pageGridHint');
    if (hintEl) {
      if (method === 'range') hintEl.textContent = "Diapazon kiritib sahifalarni tanlang, keyin o'chiring";
      else hintEl.textContent = "Sahifani bosib o'chiring — qizil = o'chiriladi";
    }
  }

  /* ── Process ────────────────────────────────────────────────── */
  async function doDelete() {
    if (isProcessing || !currentFile) return;
    if (deletedPages.size === 0) { showError("O'chirish uchun sahifalarni tanlang."); return; }
    if (deletedPages.size >= currentFile.pageCount) {
      showError("Kamida 1 ta sahifa qolishi kerak — barcha sahifalarni o'chirib bo'lmaydi."); return;
    }

    isProcessing = true;
    hideResult();
    clearError();
    elBtnProcess.disabled = true;
    setProgress(5, 'Tayyorlanmoqda…');

    try {
      setProgress(20, 'PDF yuklanmoqda…');
      var doc = await PDFLib.PDFDocument.load(currentFile.arrayBuffer);
      var totalPages = doc.getPageCount();

      var keepIndices = [];
      for (var i = 0; i < totalPages; i++) {
        if (!deletedPages.has(i)) keepIndices.push(i);
      }

      setProgress(50, 'Sahifalar qayta ishlanmoqda…');
      var newDoc = await PDFLib.PDFDocument.create();
      var copied = await newDoc.copyPages(doc, keepIndices);
      copied.forEach(function (pg) { newDoc.addPage(pg); });

      setProgress(90, 'Fayl saqlanmoqda…');
      var outBytes = await newDoc.save();
      hideProgress();

      var deleted = deletedPages.size;
      var kept = keepIndices.length;

      showResult(deleted + " ta sahifa o'chirildi", kept + ' sahifa qoldi &nbsp;·&nbsp; ' + fmtSize(outBytes.byteLength), outBytes, 'tahrirlangan.pdf');
      showToast(deleted + " ta sahifa o'chirildi ✓", 'ok');

      // Reset selection
      deletedPages.clear();
      elPageGrid.querySelectorAll('.page-thumb').forEach(function (t) { t.classList.remove('deleted', 'selected'); });
      elSelBar.style.display = 'none';
      updateActionPanel();

    } catch (err) {
      hideProgress();
      showError("Xatolik: " + (err.message || err));
    } finally {
      isProcessing = false;
      elBtnProcess.disabled = false;
    }
  }

  function showResult(title, sub, bytes, filename) {
    elResultTitle.textContent = title;
    elResultSub.innerHTML = sub;
    elResultBox.classList.add('show');
    var newBtn = elBtnDownload.cloneNode(true);
    elBtnDownload.parentNode.replaceChild(newBtn, elBtnDownload);
    elBtnDownload = newBtn;
    elBtnDownload.addEventListener('click', function () {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      showToast('Yuklab olindi ✓', 'ok');
    });
  }

  /* ── Events ─────────────────────────────────────────────────── */
  elDropZone.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
  elDropZone.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
  elDropZone.addEventListener('drop', function (e) { e.preventDefault(); this.classList.remove('drag-over'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  elDropZone.addEventListener('click', function (e) { if (e.target === elFileInput) return; elFileInput.click(); });
  elFileInput.addEventListener('change', function () { if (this.files[0]) { handleFile(this.files[0]); this.value = ''; } });
  elBtnRemove.addEventListener('click', resetAll);
  elBtnReset.addEventListener('click', resetAll);
  elBtnProcess.addEventListener('click', doDelete);

  elTabVisual.addEventListener('click', function () { switchMethod('visual'); });
  elTabRange.addEventListener('click', function () { switchMethod('range'); });

  elBtnApplyRange.addEventListener('click', applyRange);
  elRangeFrom.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyRange(); });
  elRangeTo.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyRange(); });

  elBtnSelAll.addEventListener('click', selectAll);
  elBtnSelNone.addEventListener('click', selectNone);
  elBtnRangeSelectAll.addEventListener('click', function () {
    if (!currentFile) return;
    elRangeFrom.value = 1; elRangeTo.value = currentFile.pageCount - 1;
    applyRange();
  });
  elBtnRangeClear.addEventListener('click', selectNone);

  document.getElementById('year').textContent = new Date().getFullYear();

})();
