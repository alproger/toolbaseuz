/* ================================================================
   toolbase.uz — PDF Merge & Delete Pages
   pdf-lib CDN: https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js
   PDF.js CDN:  https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.min.mjs
   ================================================================ */
'use strict';

(function () {

  /* ── Konstantlar ───────────────────────────────────────────── */
  var MAX_FILES    = 5;
  var MAX_MB       = 50;
  var MAX_BYTES    = MAX_MB * 1024 * 1024;

  /* ── Holat ─────────────────────────────────────────────────── */
  var files        = [];   // { id, file, name, size, pageCount, arrayBuffer }
  var deletedPages = {};   // { fileId: Set<pageIndex> }  — faqat delete modeda
  var currentMode  = 'merge'; // 'merge' | 'delete'
  var dragSrcIdx   = null;
  var isProcessing = false;

  /* ── Elementlar ────────────────────────────────────────────── */
  var $ = function (id) { return document.getElementById(id); };

  var elDropZone    = $('dropZone');
  var elFileInput   = $('fileInput');
  var elFileList    = $('fileList');
  var elPageGrid    = $('pageGrid');
  var elPageSection = $('pageSection');
  var elMergeTab    = $('tabMerge');
  var elDeleteTab   = $('tabDelete');
  var elActionPanel = $('actionPanel');
  var elBtnProcess  = $('btnProcess');
  var elBtnClearAll = $('btnClearAll');
  var elBtnSelAll   = $('btnSelAll');
  var elBtnSelNone  = $('btnSelNone');
  var elSelBar      = $('selectionBar');
  var elSelCount    = $('selCount');
  var elProgressWrap= $('progressWrap');
  var elProgressBar = $('progressBar');
  var elProgressLbl = $('progressLabel');
  var elErrorBox    = $('errorBox');
  var elResultBox   = $('resultBox');
  var elResultTitle = $('resultTitle');
  var elResultSub   = $('resultSub');
  var elBtnDownload = $('btnDownload');
  var elFileCount   = $('fileCount');
  var elToast       = $('toast');
  var elYear        = $('year');

  /* ── PDF.js worker sozlash ─────────────────────────────────── */
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
  }

  var toastTimer = null;

  /* ══════════════════════════════════════════════════════════════
     YORDAMCHI FUNKSIYALAR
  ══════════════════════════════════════════════════════════════ */

  function showToast(msg, type) {
    elToast.textContent = msg;
    elToast.className = 'toast show' + (type ? ' toast-' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { elToast.className = 'toast'; }, 2500);
  }

  function showError(msg) {
    elErrorBox.textContent = msg;
    elErrorBox.style.display = 'block';
    setTimeout(function () { elErrorBox.style.display = 'none'; }, 6000);
  }

  function clearError() { elErrorBox.style.display = 'none'; }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function uniqueId() {
    return Math.random().toString(36).slice(2);
  }

  function setProgress(pct, label) {
    elProgressWrap.classList.toggle('show', pct >= 0 && pct < 100);
    elProgressBar.style.width = Math.min(100, pct) + '%';
    elProgressLbl.textContent = label || '';
  }

  function hideProgress() { elProgressWrap.classList.remove('show'); }

  function updateFileCountBadge() {
    elFileCount.textContent = files.length + '/' + MAX_FILES;
  }

  /* ══════════════════════════════════════════════════════════════
     FAYL QO'SHISH
  ══════════════════════════════════════════════════════════════ */

  function handleFiles(rawFiles) {
    clearError();
    var arr = Array.from(rawFiles).filter(function (f) {
      return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    });

    if (!arr.length) { showError('Faqat PDF fayllar qabul qilinadi.'); return; }

    var remaining = MAX_FILES - files.length;
    if (remaining <= 0) {
      showError('Maksimal ' + MAX_FILES + ' ta fayl birlashtiriladi. Avval birini o\'chiring.');
      return;
    }

    var toAdd = arr.slice(0, remaining);
    if (arr.length > remaining) {
      showToast('Faqat ' + remaining + ' ta fayl qo\'shildi (limit: ' + MAX_FILES + ')', 'error');
    }

    var oversized = toAdd.filter(function (f) { return f.size > MAX_BYTES; });
    if (oversized.length) {
      showError(oversized.map(function (f) {
        return '"' + f.name + '" — ' + fmtSize(f.size) + ' (limit: ' + MAX_MB + ' MB)';
      }).join('\n'));
      toAdd = toAdd.filter(function (f) { return f.size <= MAX_BYTES; });
    }

    if (!toAdd.length) return;

    toAdd.forEach(function (f) { loadFile(f); });
  }

  function loadFile(file) {
    var id = uniqueId();
    var entry = { id: id, file: file, name: file.name, size: file.size, pageCount: null, arrayBuffer: null };
    files.push(entry);
    deletedPages[id] = new Set();
    renderFileList();
    updateFileCountBadge();
    updateActionPanel();

    var reader = new FileReader();
    reader.onload = function (e) {
      entry.arrayBuffer = e.target.result;
      /* Sahifalar sonini aniqlash */
      if (window.pdfjsLib) {
        pdfjsLib.getDocument({ data: entry.arrayBuffer.slice(0) }).promise.then(function (doc) {
          entry.pageCount = doc.numPages;
          renderFileList();
        }).catch(function () { entry.pageCount = '?'; renderFileList(); });
      } else {
        entry.pageCount = '?';
        renderFileList();
      }
    };
    reader.readAsArrayBuffer(file);
  }

  /* ══════════════════════════════════════════════════════════════
     FAYL RO'YXATI RENDER
  ══════════════════════════════════════════════════════════════ */

  function renderFileList() {
    elFileList.innerHTML = '';

    if (!files.length) {
      updateActionPanel();
      return;
    }

    files.forEach(function (entry, idx) {
      var card = document.createElement('div');
      card.className = 'file-card';
      card.dataset.id = entry.id;
      card.dataset.idx = idx;
      card.draggable = true;

      var pagesText = entry.pageCount !== null
        ? '<span class="page-count">' + entry.pageCount + ' sahifa</span>'
        : '<span>yuklanmoqda…</span>';

      card.innerHTML =
        '<div class="drag-handle" title="Sudrab tartibla">' +
          svgIcon('drag') +
        '</div>' +
        '<div class="file-icon">' + svgIcon('pdf') + '</div>' +
        '<div class="file-info">' +
          '<div class="file-name">' + escHtml(entry.name) + '</div>' +
          '<div class="file-meta">' + fmtSize(entry.size) + ' &nbsp;·&nbsp; ' + pagesText + '</div>' +
        '</div>' +
        '<span class="file-badge">' + (idx + 1) + '</span>' +
        '<div class="file-actions">' +
          '<button class="file-act-btn danger" data-action="remove" data-id="' + entry.id + '" title="O\'chirish" aria-label="Faylni o\'chirish">' +
            svgIcon('trash') +
          '</button>' +
        '</div>';

      /* Drag-and-drop tartibga solish */
      card.addEventListener('dragstart', onDragStart);
      card.addEventListener('dragover',  onDragOver);
      card.addEventListener('dragleave', onDragLeave);
      card.addEventListener('drop',      onDrop);
      card.addEventListener('dragend',   onDragEnd);

      card.querySelector('[data-action="remove"]').addEventListener('click', function (e) {
        e.stopPropagation();
        removeFile(entry.id);
      });

      elFileList.appendChild(card);
    });

    updateActionPanel();
  }

  /* ══════════════════════════════════════════════════════════════
     DRAG & DROP — FAYLLAR TARTIBI
  ══════════════════════════════════════════════════════════════ */

  function onDragStart(e) {
    dragSrcIdx = parseInt(this.dataset.idx);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-target');
  }
  function onDragLeave() { this.classList.remove('drag-target'); }
  function onDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-target');
    var targetIdx = parseInt(this.dataset.idx);
    if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
    var moved = files.splice(dragSrcIdx, 1)[0];
    files.splice(targetIdx, 0, moved);
    renderFileList();
  }
  function onDragEnd() {
    document.querySelectorAll('.file-card').forEach(function (c) {
      c.classList.remove('dragging', 'drag-target');
    });
    dragSrcIdx = null;
  }

  /* ══════════════════════════════════════════════════════════════
     FAYL O'CHIRISH
  ══════════════════════════════════════════════════════════════ */

  function removeFile(id) {
    files = files.filter(function (f) { return f.id !== id; });
    delete deletedPages[id];
    renderFileList();
    updateFileCountBadge();
    updateActionPanel();
    /* delete modeda bo'lsa page gridni tozala */
    elPageGrid.innerHTML = '';
    elPageSection.style.display = 'none';
    elSelBar.classList.remove('show');
    hideResult();
    clearError();
  }

  /* ══════════════════════════════════════════════════════════════
     MODE (MERGE / DELETE)
  ══════════════════════════════════════════════════════════════ */

  function switchMode(mode) {
    currentMode = mode;
    elMergeTab.classList.toggle('active', mode === 'merge');
    elDeleteTab.classList.toggle('active', mode === 'delete');
    updateActionPanel();
    elPageGrid.innerHTML = '';
    elPageSection.style.display = 'none';
    elSelBar.classList.remove('show');
    hideResult();
    clearError();
  }

  function updateActionPanel() {
    var hasFiles = files.length > 0;
    var canMerge = files.length >= 2;
    var allLoaded = files.every(function (f) { return f.arrayBuffer !== null; });

    elActionPanel.style.display = hasFiles ? 'flex' : 'none';

    if (currentMode === 'merge') {
      elBtnProcess.textContent = '';
      elBtnProcess.appendChild(document.createTextNode(''));
      elBtnProcess.innerHTML =
        svgIcon('merge') + ' PDF Birlashtirish';
      elBtnProcess.disabled = !canMerge || !allLoaded || isProcessing;

      /* Seleksiya tugmalarini yashir */
      if (elBtnSelAll)  elBtnSelAll.style.display  = 'none';
      if (elBtnSelNone) elBtnSelNone.style.display = 'none';
    } else {
      elBtnProcess.innerHTML = svgIcon('delete') + ' Tanlangan sahifalarni o\'chirish';
      var selCount = getSelectedPageCount();
      elBtnProcess.disabled = selCount === 0 || isProcessing;

      if (elBtnSelAll)  elBtnSelAll.style.display  = '';
      if (elBtnSelNone) elBtnSelNone.style.display = '';
    }
  }

  function getSelectedPageCount() {
    var total = 0;
    Object.values(deletedPages).forEach(function (s) { total += s.size; });
    return total;
  }

  /* ══════════════════════════════════════════════════════════════
     SAHIFALAR GRID (DELETE MODE)
  ══════════════════════════════════════════════════════════════ */

  function buildPageGrid() {
    if (!files.length) { showError('Avval PDF fayl yuklang.'); return; }
    var allLoaded = files.every(function (f) { return f.arrayBuffer !== null; });
    if (!allLoaded) { showError('Fayllar hali yuklanmagan, biroz kuting.'); return; }

    elPageGrid.innerHTML = '';
    elPageSection.style.display = 'block';

    var globalPageNum = 0;

    var filePromises = files.map(function (entry, fileIdx) {
      return pdfjsLib.getDocument({ data: entry.arrayBuffer.slice(0) }).promise.then(function (doc) {
        var pagePromises = [];
        for (var p = 1; p <= doc.numPages; p++) {
          pagePromises.push(renderPageThumb(doc, p, entry.id, fileIdx, ++globalPageNum));
        }
        return Promise.all(pagePromises);
      });
    });

    Promise.all(filePromises).then(function () {
      updateSelectionBar();
    }).catch(function (err) {
      showError('Sahifalarni ko\'rsatishda xatolik: ' + err.message);
    });
  }

  function renderPageThumb(doc, pageNum, fileId, fileIdx, globalNum) {
    return doc.getPage(pageNum).then(function (page) {
      var vp = page.getViewport({ scale: 0.35 });
      var canvas = document.createElement('canvas');
      canvas.width  = vp.width;
      canvas.height = vp.height;

      return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(function () {
        var thumb = document.createElement('div');
        thumb.className = 'page-thumb';
        thumb.dataset.fileId   = fileId;
        thumb.dataset.pageIdx  = pageNum - 1; /* 0-indexed */
        thumb.dataset.globalNum = globalNum;

        var isDeleted = deletedPages[fileId] && deletedPages[fileId].has(pageNum - 1);
        if (isDeleted) thumb.classList.add('deleted');

        thumb.innerHTML =
          '<div class="page-canvas-wrap"></div>' +
          '<div class="page-check">' + svgIcon('check') + '</div>' +
          '<div class="page-delete-overlay">' + svgIcon('trashBig') + '</div>' +
          '<div class="page-num">S.' + globalNum +
            (files.length > 1 ? ' <span style="opacity:.6">(F.' + (fileIdx + 1) + ')</span>' : '') +
          '</div>';

        thumb.querySelector('.page-canvas-wrap').appendChild(canvas);

        thumb.addEventListener('click', function () { togglePageSelection(thumb); });
        elPageGrid.appendChild(thumb);
      });
    });
  }

  function togglePageSelection(thumb) {
    var fileId  = thumb.dataset.fileId;
    var pageIdx = parseInt(thumb.dataset.pageIdx);

    if (!deletedPages[fileId]) deletedPages[fileId] = new Set();

    if (deletedPages[fileId].has(pageIdx)) {
      deletedPages[fileId].delete(pageIdx);
      thumb.classList.remove('selected', 'deleted');
    } else {
      deletedPages[fileId].add(pageIdx);
      thumb.classList.add('selected', 'deleted');
    }

    updateSelectionBar();
    updateActionPanel();
  }

  function updateSelectionBar() {
    var count = getSelectedPageCount();
    elSelBar.classList.toggle('show', count > 0);
    if (elSelCount) elSelCount.textContent = count;
    updateActionPanel();
  }

  function selectAll() {
    elPageGrid.querySelectorAll('.page-thumb').forEach(function (thumb) {
      var fileId  = thumb.dataset.fileId;
      var pageIdx = parseInt(thumb.dataset.pageIdx);
      if (!deletedPages[fileId]) deletedPages[fileId] = new Set();
      deletedPages[fileId].add(pageIdx);
      thumb.classList.add('selected', 'deleted');
    });
    updateSelectionBar();
  }

  function selectNone() {
    elPageGrid.querySelectorAll('.page-thumb').forEach(function (thumb) {
      var fileId  = thumb.dataset.fileId;
      var pageIdx = parseInt(thumb.dataset.pageIdx);
      if (deletedPages[fileId]) deletedPages[fileId].delete(pageIdx);
      thumb.classList.remove('selected', 'deleted');
    });
    updateSelectionBar();
  }

  /* ══════════════════════════════════════════════════════════════
     PDF MERGE
  ══════════════════════════════════════════════════════════════ */

  async function doMerge() {
    if (isProcessing) return;
    if (files.length < 2) { showError('Birlashtirish uchun kamida 2 ta PDF kerak.'); return; }
    var notLoaded = files.filter(function (f) { return !f.arrayBuffer; });
    if (notLoaded.length) { showError('Ba\'zi fayllar hali yuklanmagan, kuting.'); return; }

    isProcessing = true;
    hideResult();
    clearError();
    elBtnProcess.disabled = true;
    setProgress(5, 'Tayyorlanmoqda…');

    try {
      var merged = await PDFLib.PDFDocument.create();
      var totalPages = 0;

      for (var i = 0; i < files.length; i++) {
        var entry = files[i];
        setProgress(10 + (i / files.length) * 80,
          (i + 1) + '/' + files.length + ' — ' + entry.name);

        var srcDoc = await PDFLib.PDFDocument.load(entry.arrayBuffer);
        var pageIndices = srcDoc.getPageIndices();
        var copiedPages = await merged.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(function (p) { merged.addPage(p); totalPages++; });
      }

      setProgress(95, 'Fayl saqlanmoqda…');
      var bytes = await merged.save();
      var sizeFmt = fmtSize(bytes.byteLength);

      setProgress(100, 'Tayyor!');
      hideProgress();
      showResult(
        files.length + ' ta PDF birlashtirildi',
        totalPages + ' sahifa &nbsp;·&nbsp; ' + sizeFmt,
        bytes,
        'birlashtrilgan.pdf'
      );
      showToast('Muvaffaqiyatli birlashtrildi ✓', 'ok');
    } catch (err) {
      hideProgress();
      showError('Birlashtrishda xatolik: ' + (err.message || err));
    } finally {
      isProcessing = false;
      updateActionPanel();
    }
  }

  /* ══════════════════════════════════════════════════════════════
     SAHIFA O'CHIRISH
  ══════════════════════════════════════════════════════════════ */

  async function doDeletePages() {
    if (isProcessing) return;
    var totalSel = getSelectedPageCount();
    if (!totalSel) { showError('O\'chirish uchun sahifalarni tanlang.'); return; }

    /* Har bir faylda barcha sahifalar o'chirilmasin */
    for (var i = 0; i < files.length; i++) {
      var entry = files[i];
      if (!entry.pageCount) continue;
      var del = deletedPages[entry.id] ? deletedPages[entry.id].size : 0;
      if (del >= entry.pageCount) {
        showError('"' + entry.name + '" faylidan barcha sahifalarni o\'chirib bo\'lmaydi. Kamida 1 ta sahifa qolishi kerak.');
        return;
      }
    }

    isProcessing = true;
    hideResult();
    clearError();
    elBtnProcess.disabled = true;

    try {
      /* Agar 1 ta fayl bo'lsa — uni o'zgartiramiz
         Agar bir nechta fayl bo'lsa — o'chirib, birlashtramiz */
      var outputDocs = [];

      for (var j = 0; j < files.length; j++) {
        var f = files[j];
        setProgress(10 + (j / files.length) * 80, (j + 1) + '/' + files.length + ' qayta ishlanmoqda…');

        var doc = await PDFLib.PDFDocument.load(f.arrayBuffer);
        var toDelete = deletedPages[f.id] || new Set();

        /* O'chirilmaydigan sahifalar indekslarini yig'amiz */
        var keepIndices = [];
        for (var p = 0; p < doc.getPageCount(); p++) {
          if (!toDelete.has(p)) keepIndices.push(p);
        }

        var newDoc = await PDFLib.PDFDocument.create();
        var copied = await newDoc.copyPages(doc, keepIndices);
        copied.forEach(function (pg) { newDoc.addPage(pg); });
        outputDocs.push(newDoc);
      }

      var finalDoc;
      var totalKept = 0;

      if (outputDocs.length === 1) {
        finalDoc = outputDocs[0];
        totalKept = finalDoc.getPageCount();
      } else {
        /* Bir nechta fayl → birlashtir */
        finalDoc = await PDFLib.PDFDocument.create();
        for (var k = 0; k < outputDocs.length; k++) {
          var d = outputDocs[k];
          var c = await finalDoc.copyPages(d, d.getPageIndices());
          c.forEach(function (pg) { finalDoc.addPage(pg); totalKept++; });
        }
      }

      setProgress(95, 'Fayl saqlanmoqda…');
      var outBytes = await finalDoc.save();
      hideProgress();

      showResult(
        totalSel + ' ta sahifa o\'chirildi',
        totalKept + ' sahifa qoldi &nbsp;·&nbsp; ' + fmtSize(outBytes.byteLength),
        outBytes,
        'tahrirlangan.pdf'
      );

      /* Seleksiyani tozala */
      Object.keys(deletedPages).forEach(function (id) { deletedPages[id] = new Set(); });
      elPageGrid.querySelectorAll('.page-thumb').forEach(function (t) {
        t.classList.remove('selected', 'deleted');
      });
      elSelBar.classList.remove('show');
      showToast(totalSel + ' ta sahifa o\'chirildi ✓', 'ok');
    } catch (err) {
      hideProgress();
      showError('Xatolik: ' + (err.message || err));
    } finally {
      isProcessing = false;
      updateActionPanel();
    }
  }

  /* ══════════════════════════════════════════════════════════════
     NATIJA KO'RSATISH VA YUKLAB OLISH
  ══════════════════════════════════════════════════════════════ */

  function showResult(title, sub, bytes, filename) {
    elResultTitle.textContent = title;
    elResultSub.innerHTML = sub;
    elResultBox.classList.add('show');

    /* Eski listener ni olib tashla */
    var newBtn = elBtnDownload.cloneNode(true);
    elBtnDownload.parentNode.replaceChild(newBtn, elBtnDownload);
    elBtnDownload = newBtn;

    elBtnDownload.addEventListener('click', function () {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      showToast('Yuklab olindi ✓', 'ok');
    });
  }

  function hideResult() { elResultBox.classList.remove('show'); }

  /* ══════════════════════════════════════════════════════════════
     SVG IKONALAR
  ══════════════════════════════════════════════════════════════ */

  function svgIcon(name) {
    var icons = {
      drag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/></svg>',
      pdf:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
      trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>',
      trashBig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>',
      merge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/><path d="M16 6h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
      delete:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="12" y1="12" x2="12" y2="18"/></svg>',
      download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      eye:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    };
    return icons[name] || '';
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ══════════════════════════════════════════════════════════════
     EVENTLAR
  ══════════════════════════════════════════════════════════════ */

  /* Drop zone — fayl tanlash */
  elDropZone.addEventListener('dragover', function (e) {
    e.preventDefault(); this.classList.add('drag-over');
  });
  elDropZone.addEventListener('dragleave', function () {
    this.classList.remove('drag-over');
  });
  elDropZone.addEventListener('drop', function (e) {
    e.preventDefault(); this.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  elDropZone.addEventListener('click', function (e) {
    if (e.target === elFileInput) return;
    elFileInput.click();
  });
  elFileInput.addEventListener('change', function () {
    if (this.files.length) { handleFiles(this.files); this.value = ''; }
  });

  /* Mode tugmalar */
  elMergeTab.addEventListener('click', function () { switchMode('merge'); });
  elDeleteTab.addEventListener('click', function () {
    switchMode('delete');
    if (files.length && files.every(function (f) { return f.arrayBuffer; })) {
      buildPageGrid();
    }
  });

  /* Asosiy tugma */
  elBtnProcess.addEventListener('click', function () {
    if (currentMode === 'merge') doMerge();
    else doDeletePages();
  });

  /* Tozalash */
  elBtnClearAll.addEventListener('click', function () {
    files = [];
    deletedPages = {};
    elFileList.innerHTML = '';
    elPageGrid.innerHTML = '';
    elPageSection.style.display = 'none';
    elSelBar.classList.remove('show');
    elActionPanel.style.display = 'none';
    hideResult();
    clearError();
    hideProgress();
    updateFileCountBadge();
  });

  /* Seleksiya */
  if (elBtnSelAll)  elBtnSelAll.addEventListener('click', selectAll);
  if (elBtnSelNone) elBtnSelNone.addEventListener('click', selectNone);

  /* Year */
  if (elYear) elYear.textContent = String(new Date().getFullYear());

  /* Boshlang'ich holat */
  updateFileCountBadge();

})();
