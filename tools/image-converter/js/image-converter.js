'use strict';
/* ================================================================
   toolbase.uz — Rasm Formatini O'zgartirish
   Canvas API + jsPDF + JSZip
   Supported output: JPG, PNG, WebP, BMP, GIF, ICO, PDF
   ================================================================ */
(function () {

  var MAX_FILES = 20;
  var MAX_MB    = 50;
  var MAX_BYTES = MAX_MB * 1024 * 1024;

  /* State */
  var files       = [];   /* { id, file, name, size, img, status, blob, mimeOut, extOut } */
  var targetFmt   = 'png';
  var isConverting = false;
  var convertedBlobs = []; /* for ZIP download */

  var $ = function (id) { return document.getElementById(id); };

  /* ── Format selection ── */
  document.querySelectorAll('.fmt-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.fmt-btn').forEach(function (b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      targetFmt = this.dataset.fmt;
      updateSettingsUI();
    });
  });

  function updateSettingsUI() {
    /* Quality slider: only for JPG and WebP */
    var qRow = $('qualityRow');
    qRow.classList.toggle('visible', targetFmt === 'jpg' || targetFmt === 'webp');

    /* PDF extra settings */
    $('pdfSettings').classList.toggle('visible', targetFmt === 'pdf');

    /* Resize default for ICO */
    if (targetFmt === 'ico') {
      $('resizeMode').value = '128';
    }
  }

  /* Quality slider */
  $('qualitySlider').addEventListener('input', function () {
    $('qualityVal').textContent = this.value + '%';
  });

  /* Init UI */
  updateSettingsUI();

  /* ── Helpers ── */
  function uid() { return Math.random().toString(36).slice(2); }
  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var toastTimer;
  function showToast(msg, type) {
    var el = $('toast');
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' toast-' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast'; }, 2800);
  }
  function showError(msg) {
    var el = $('errorBox');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; }, 7000);
  }
  function clearError() { $('errorBox').style.display = 'none'; }
  function setProgress(pct, label) {
    var wrap = $('progressWrap');
    wrap.classList.toggle('show', pct >= 0 && pct < 100);
    $('progressBar').style.width = Math.min(100, pct) + '%';
    $('progressLabel').textContent = label || '';
  }
  function hideProgress() { $('progressWrap').classList.remove('show'); }

  /* ── File handling ── */
  function handleFiles(rawFiles) {
    clearError();
    var arr = Array.from(rawFiles).filter(function (f) { return f.type.startsWith('image/') || f.name.match(/\.(svg|tiff?|avif|heic|heif)$/i); });
    if (!arr.length) { showError('Faqat rasm fayllari qabul qilinadi.'); return; }

    var remaining = MAX_FILES - files.length;
    if (remaining <= 0) { showError('Maksimal ' + MAX_FILES + ' ta rasm.'); return; }
    arr = arr.slice(0, remaining);
    if (arr.length < Array.from(rawFiles).length) {
      showToast('Faqat ' + remaining + ' ta rasm qo\'shildi (limit: ' + MAX_FILES + ')', 'error');
    }

    arr.forEach(function (f) {
      if (f.size > MAX_BYTES) { showError('"' + f.name + '" hajmi juda katta (maks ' + MAX_MB + ' MB)'); return; }
      var entry = { id: uid(), file: f, name: f.name, size: f.size, img: null, status: 'pending', blob: null, mimeOut: '', extOut: '' };
      files.push(entry);
      loadImageEntry(entry);
    });

    renderFileList();
    updatePanel();
  }

  function loadImageEntry(entry) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        entry.img = img;
        entry.naturalW = img.naturalWidth;
        entry.naturalH = img.naturalHeight;
        updateRowMeta(entry);
      };
      img.onerror = function () { entry.status = 'error'; updateRow(entry); };
      img.src = e.target.result;
      entry.dataUrl = e.target.result;
    };
    reader.readAsDataURL(entry.file);
  }

  /* ── Render file list ── */
  function renderFileList() {
    var list = $('imgFileList');
    list.innerHTML = '';
    files.forEach(function (entry) {
      var row = document.createElement('div');
      row.className = 'img-file-row' + (entry.status === 'done' ? ' done' : entry.status === 'error' ? ' error' : entry.status === 'converting' ? ' processing' : '');
      row.id = 'row-' + entry.id;

      /* Thumb */
      var thumbWrap = '';
      if (entry.dataUrl && entry.file.type.startsWith('image/') && !entry.file.type.includes('svg')) {
        thumbWrap = '<img class="img-thumb" src="' + entry.dataUrl + '" alt="" />';
      } else {
        var ext = entry.name.split('.').pop().toUpperCase().slice(0, 4);
        thumbWrap = '<div class="img-thumb-placeholder">' + ext + '</div>';
      }

      /* Status */
      var statusText = { pending: 'Kutmoqda', converting: 'O\'zgartirilmoqda…', done: 'Tayyor ✓', error: 'Xato!' };
      var dims = (entry.naturalW && entry.naturalH) ? entry.naturalW + '×' + entry.naturalH + 'px · ' : '';

      /* Action buttons */
      var dlBtn = entry.status === 'done'
        ? '<button class="img-act-btn dl" data-id="' + entry.id + '" title="Yuklab olish">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>'
        : '';
      var rmBtn = '<button class="img-act-btn rm" data-id="' + entry.id + '" title="O\'chirish">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>';

      row.innerHTML =
        thumbWrap +
        '<div class="img-info"><div class="img-name">' + escHtml(entry.name) + '</div>' +
        '<div class="img-meta">' + dims + fmtSize(entry.size) +
        (entry.status === 'done' && entry.blobSize ? ' → <strong>' + fmtSize(entry.blobSize) + '</strong>' : '') +
        '</div>' +
        (entry.status === 'converting' ? '<div class="img-progress"><div class="img-progress-fill" id="prog-' + entry.id + '"></div></div>' : '') +
        '</div>' +
        '<span class="img-status ' + entry.status + '">' + (statusText[entry.status] || '') + '</span>' +
        '<div class="img-row-actions">' + dlBtn + rmBtn + '</div>';

      list.appendChild(row);
    });

    /* Bind remove buttons */
    list.querySelectorAll('.img-act-btn.rm').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        files = files.filter(function (f) { return f.id !== id; });
        renderFileList();
        updatePanel();
        updateFileBadge();
      });
    });

    /* Bind download buttons */
    list.querySelectorAll('.img-act-btn.dl').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        var entry = files.find(function (f) { return f.id === id; });
        if (entry && entry.blob) downloadBlob(entry.blob, entry.outName);
      });
    });

    updateFileBadge();
  }

  function updateRowMeta(entry) {
    var row = $('row-' + entry.id);
    if (!row) return;
    var meta = row.querySelector('.img-meta');
    if (meta && entry.naturalW) {
      meta.innerHTML = entry.naturalW + '×' + entry.naturalH + 'px · ' + fmtSize(entry.size);
    }
  }

  function updateRow(entry) { renderFileList(); }

  function updateFileBadge() {
    var badge = $('fileCountBadge');
    if (files.length > 0) {
      badge.style.display = 'inline-flex';
      $('fileCountText').textContent = files.length + ' ta rasm';
    } else {
      badge.style.display = 'none';
    }
  }

  function updatePanel() {
    $('actionPanel').style.display = files.length > 0 ? 'flex' : 'none';
  }

  /* ── Canvas-based conversion ── */
  function getOutputMimeAndExt(fmt) {
    var map = {
      jpg:  { mime: 'image/jpeg', ext: 'jpg' },
      png:  { mime: 'image/png',  ext: 'png' },
      webp: { mime: 'image/webp', ext: 'webp' },
      bmp:  { mime: 'image/bmp',  ext: 'bmp' },
      gif:  { mime: 'image/gif',  ext: 'gif' },
      ico:  { mime: 'image/png',  ext: 'png' }, /* ICO via PNG at small size, then wrap */
      pdf:  { mime: 'application/pdf', ext: 'pdf' }
    };
    return map[fmt] || map['png'];
  }

  function convertEntryToBlob(entry, fmt) {
    return new Promise(function (resolve, reject) {
      if (!entry.img) { reject(new Error('Rasm yuklanmagan')); return; }

      var img = entry.img;
      var quality = parseInt($('qualitySlider').value) / 100;
      var bgColor = $('bgColorPicker').value;
      var resizeMode = $('resizeMode').value;

      /* Compute target dimensions */
      var origW = img.naturalWidth  || img.width  || 1;
      var origH = img.naturalHeight || img.height || 1;
      var targetW = origW, targetH = origH;

      if (resizeMode !== 'original') {
        var maxW = parseInt(resizeMode);
        if (origW > maxW) {
          var ratio = maxW / origW;
          targetW = maxW;
          targetH = Math.round(origH * ratio);
        }
      }

      /* Special: ICO — square, small */
      if (fmt === 'ico') {
        var icoSize = parseInt($('resizeMode').value) || 128;
        if (icoSize === 'original' || isNaN(icoSize)) icoSize = 128;
        targetW = icoSize; targetH = icoSize;
      }

      /* Create canvas */
      var canvas = document.createElement('canvas');
      canvas.width  = targetW;
      canvas.height = targetH;
      var ctx = canvas.getContext('2d');

      /* Fill background for formats that don't support alpha */
      if (fmt === 'jpg' || fmt === 'bmp' || fmt === 'gif' || fmt === 'ico') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      /* Draw image */
      ctx.drawImage(img, 0, 0, targetW, targetH);

      /* Get blob */
      var info = getOutputMimeAndExt(fmt);
      var mimeType = (fmt === 'jpg') ? 'image/jpeg' :
                     (fmt === 'webp') ? 'image/webp' :
                     (fmt === 'gif') ? 'image/gif' :
                     (fmt === 'bmp') ? 'image/bmp' : 'image/png';
      var qualityParam = (fmt === 'jpg' || fmt === 'webp') ? quality : undefined;

      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('Canvas toBlob xato')); return; }

        if (fmt === 'ico') {
          /* Wrap PNG as ICO (simple single-size ICO) */
          blobToIco(blob, targetW, targetH, resolve, reject);
        } else {
          resolve({ blob: blob, ext: info.ext, mime: info.mime });
        }
      }, mimeType, qualityParam);
    });
  }

  /* Simple PNG → ICO wrapper (single image ICO) */
  function blobToIco(pngBlob, w, h, resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var pngData = new Uint8Array(e.target.result);

      /* ICO header: 6 bytes */
      var icoHeader = new Uint8Array([
        0, 0,       /* Reserved */
        1, 0,       /* Type: 1 = ICO */
        1, 0        /* Image count: 1 */
      ]);

      /* Directory entry: 16 bytes */
      var imgSize = pngData.length;
      var offset  = 6 + 16; /* header + 1 directory entry */
      var dir = new Uint8Array([
        w > 255 ? 0 : w,   /* Width */
        h > 255 ? 0 : h,   /* Height */
        0,                   /* Color palette */
        0,                   /* Reserved */
        1, 0,               /* Color planes */
        32, 0,              /* Bits per pixel */
        imgSize & 0xFF, (imgSize >> 8) & 0xFF, (imgSize >> 16) & 0xFF, (imgSize >> 24) & 0xFF,
        offset  & 0xFF, (offset >> 8) & 0xFF,  (offset >> 16) & 0xFF,  (offset >> 24) & 0xFF
      ]);

      /* Combine */
      var icoBuffer = new Uint8Array(6 + 16 + imgSize);
      icoBuffer.set(icoHeader, 0);
      icoBuffer.set(dir, 6);
      icoBuffer.set(pngData, 6 + 16);

      var icoBlob = new Blob([icoBuffer], { type: 'image/x-icon' });
      resolve({ blob: icoBlob, ext: 'ico', mime: 'image/x-icon' });
    };
    reader.onerror = function () { reject(new Error('ICO yaratishda xato')); };
    reader.readAsArrayBuffer(pngBlob);
  }

  /* ── PDF conversion ── */
  async function convertToPDF(entries) {
    var mode     = $('pdfImageMode').value;   /* separate | combined */
    var pageSize = $('pdfPageSize').value;
    var orient   = $('pdfOrientation').value;

    var sizes = { a4: [210, 297], letter: [216, 279], a3: [297, 420] };
    var ps = sizes[pageSize] || sizes.a4;
    var pW = orient === 'landscape' ? ps[1] : ps[0];
    var pH = orient === 'landscape' ? ps[0] : ps[1];

    if (mode === 'combined') {
      /* All images → one PDF */
      var { jsPDF } = jspdf;
      var pdf = new jsPDF({ orientation: orient, unit: 'mm', format: [pW, pH] });
      var added = 0;

      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (!entry.img) continue;

        /* Render to canvas */
        var canvas = document.createElement('canvas');
        var ow = entry.img.naturalWidth || entry.img.width;
        var oh = entry.img.naturalHeight || entry.img.height;
        canvas.width = ow; canvas.height = oh;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = $('bgColorPicker').value;
        ctx.fillRect(0, 0, ow, oh);
        ctx.drawImage(entry.img, 0, 0);

        var imgData = canvas.toDataURL('image/jpeg', 0.92);
        var ratio = Math.min(pW / ow, pH / oh);
        var iW = ow * ratio, iH = oh * ratio;
        var x = (pW - iW) / 2, y = (pH - iH) / 2;

        if (added > 0) pdf.addPage([pW, pH], orient);
        pdf.addImage(imgData, 'JPEG', x, y, iW, iH);
        added++;

        /* Update progress fill for this entry */
        var progFill = $('prog-' + entry.id);
        if (progFill) progFill.style.width = '100%';
      }

      if (added === 0) throw new Error('Hech qanday rasm topilmadi');
      var pdfBlob = pdf.output('blob');
      return [{ blob: pdfBlob, ext: 'pdf', mime: 'application/pdf', outName: 'rasmlar-birlashtirilgan.pdf', entry: null, combined: true }];

    } else {
      /* Each image → separate PDF */
      var results = [];
      for (var j = 0; j < entries.length; j++) {
        var e = entries[j];
        if (!e.img) continue;
        var { jsPDF: JPDF } = jspdf;
        var spdf = new JPDF({ orientation: orient, unit: 'mm', format: [pW, pH] });
        var sc = document.createElement('canvas');
        var sw = e.img.naturalWidth || e.img.width;
        var sh = e.img.naturalHeight || e.img.height;
        sc.width = sw; sc.height = sh;
        var sctx = sc.getContext('2d');
        sctx.fillStyle = $('bgColorPicker').value;
        sctx.fillRect(0, 0, sw, sh);
        sctx.drawImage(e.img, 0, 0);
        var sData = sc.toDataURL('image/jpeg', 0.92);
        var sRatio = Math.min(pW / sw, pH / sh);
        var siW = sw * sRatio, siH = sh * sRatio;
        var sx = (pW - siW) / 2, sy = (pH - siH) / 2;
        spdf.addImage(sData, 'JPEG', sx, sy, siW, siH);
        var sBlob = spdf.output('blob');
        results.push({ blob: sBlob, ext: 'pdf', mime: 'application/pdf', outName: e.name.replace(/\.[^.]+$/, '') + '.pdf', entry: e });
      }
      return results;
    }
  }

  /* ── Main convert ── */
  async function doConvert() {
    if (isConverting || !files.length) return;
    isConverting = true;
    convertedBlobs = [];
    $('resultSummary').classList.remove('show');
    clearError();

    var readyFiles = files.filter(function (f) { return f.img && f.status !== 'error'; });
    if (!readyFiles.length) {
      showError('Rasmlar hali yuklanmagan. Bir ozgina kuting.');
      isConverting = false; return;
    }

    /* Reset all statuses */
    readyFiles.forEach(function (f) { f.status = 'converting'; f.blob = null; f.blobSize = 0; });
    renderFileList();
    setProgress(5, 'Boshlanmoqda…');

    var successCount = 0;
    var errorCount   = 0;

    try {
      if (targetFmt === 'pdf') {
        /* PDF mode */
        setProgress(20, 'PDF yaratilmoqda…');
        var pdfResults = await convertToPDF(readyFiles);

        if (pdfResults[0].combined) {
          /* Combined: one blob for all */
          var res = pdfResults[0];
          readyFiles.forEach(function (f) { f.status = 'done'; f.outName = res.outName; });
          /* Assign blob to first entry for preview, others ref same */
          readyFiles[0].blob = res.blob;
          readyFiles[0].blobSize = res.blob.size;
          readyFiles[0].outName = res.outName;
          convertedBlobs.push({ blob: res.blob, name: res.outName });
          successCount = readyFiles.length;
        } else {
          pdfResults.forEach(function (r) {
            if (r.entry) {
              r.entry.blob = r.blob;
              r.entry.blobSize = r.blob.size;
              r.entry.outName = r.outName;
              r.entry.status = 'done';
              convertedBlobs.push({ blob: r.blob, name: r.outName });
              successCount++;
            }
          });
        }

      } else {
        /* Raster formats */
        for (var i = 0; i < readyFiles.length; i++) {
          var entry = readyFiles[i];
          setProgress(10 + (i / readyFiles.length) * 85, (i + 1) + '/' + readyFiles.length + ' — ' + entry.name);

          /* Animate individual progress */
          var pf = $('prog-' + entry.id);
          if (pf) { pf.style.width = '30%'; }

          try {
            var result = await convertEntryToBlob(entry, targetFmt);
            if (pf) { pf.style.width = '100%'; }

            var baseName = entry.name.replace(/\.[^.]+$/, '');
            var outName  = baseName + '.' + result.ext;

            entry.blob     = result.blob;
            entry.blobSize = result.blob.size;
            entry.outName  = outName;
            entry.status   = 'done';
            convertedBlobs.push({ blob: result.blob, name: outName });
            successCount++;
          } catch (err) {
            entry.status = 'error';
            errorCount++;
            console.error('Convert error for', entry.name, err);
          }

          renderFileList();
          await sleep(10); /* Let UI update */
        }
      }

    } catch (err) {
      hideProgress();
      showError('Xatolik: ' + (err.message || err));
      isConverting = false;
      renderFileList();
      return;
    }

    hideProgress();
    renderFileList();

    /* Summary */
    var summaryText = successCount + ' ta rasm muvaffaqiyatli ' + targetFmt.toUpperCase() + ' ga o\'zgartirildi';
    if (errorCount) summaryText += ' · ' + errorCount + ' ta xato';
    $('resultSummaryText').textContent = summaryText;
    $('resultSummary').classList.add('show');
    showToast(successCount + ' ta rasm o\'zgartirildi ✓', 'ok');
    isConverting = false;
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ── Download single ── */
  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* ── Download all as ZIP ── */
  $('btnDlAll').addEventListener('click', async function () {
    if (!convertedBlobs.length) return;

    if (convertedBlobs.length === 1) {
      downloadBlob(convertedBlobs[0].blob, convertedBlobs[0].name);
      return;
    }

    if (typeof JSZip === 'undefined') {
      showError('JSZip kutubxonasi yuklanmadi. Fayllarni alohida yuklab oling.'); return;
    }

    var btn = this;
    btn.textContent = 'ZIP tayyorlanmoqda…';
    btn.disabled = true;

    var zip = new JSZip();
    convertedBlobs.forEach(function (item) { zip.file(item.name, item.blob); });

    var zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    downloadBlob(zipBlob, 'toolbase-rasmlar.zip');
    showToast('ZIP yuklab olindi ✓', 'ok');

    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Barchasini ZIP yuklash';
    btn.disabled = false;
  });

  /* ── Convert button ── */
  $('btnConvert').addEventListener('click', doConvert);

  /* ── Clear all ── */
  $('btnClearAll').addEventListener('click', function () {
    files = []; convertedBlobs = [];
    $('imgFileList').innerHTML = '';
    $('actionPanel').style.display = 'none';
    $('resultSummary').classList.remove('show');
    $('fileCountBadge').style.display = 'none';
    clearError(); hideProgress();
    $('fileInput').value = '';
  });

  /* ── Drag & Drop ── */
  var dz = $('dropZone');
  dz.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
  dz.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
  dz.addEventListener('drop', function (e) {
    e.preventDefault(); this.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  dz.addEventListener('click', function (e) {
    if (e.target === $('fileInput')) return;
    $('fileInput').click();
  });
  $('fileInput').addEventListener('change', function () {
    if (this.files.length) { handleFiles(this.files); this.value = ''; }
  });

  document.getElementById('year').textContent = new Date().getFullYear();

})();
