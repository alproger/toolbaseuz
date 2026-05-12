/**
 * toolbase.uz — Rasmni Aylantirish (Rotate & Flip)
 * Canvas API — erkin burchak, flip, fon rangi, batch 20ta
 * 100% client-side, serverga yuborilmaydi
 */
(function () {
  'use strict';

  /* ── State ── */
  let files = [];
  let angle = 0;       // -180 dan 180 gacha
  let flipH = false;
  let flipV = false;
  let bgColor = 'transparent'; // 'transparent' | '#rrggbb'
  let currentPreviewIdx = -1;
  let previewOrigImg = null;

  /* ── DOM ── */
  const $ = id => document.getElementById(id);
  const dropZone      = $('dropZone');
  const fileInput     = $('fileInput');
  const fileList      = $('fileList');
  const cntBadge      = $('cntBadge');
  const cntText       = $('cntText');
  const errBox        = $('errBox');
  const angleSlider   = $('angleSlider');
  const angleInput    = $('angleInput');
  const angleDial     = $('angleDial');
  const angleReadout  = $('angleReadout');
  const btnRotL90     = $('btnRotL90');
  const btnRotR90     = $('btnRotR90');
  const btnRotL45     = $('btnRotL45');
  const btnRotR45     = $('btnRotR45');
  const btnRot180     = $('btnRot180');
  const btnReset0     = $('btnReset0');
  const btnFlipH      = $('btnFlipH');
  const btnFlipV      = $('btnFlipV');
  const selFmt        = $('selFmt');
  const qualSlider    = $('qualSlider');
  const qualVal       = $('qualVal');
  const actionPan     = $('actionPan');
  const btnGo         = $('btnGo');
  const btnClear      = $('btnClear');
  const progWrap      = $('progWrap');
  const progFill      = $('progFill');
  const progLabel     = $('progLabel');
  const resultBar     = $('resultBar');
  const resultTxt     = $('resultTxt');
  const btnZip        = $('btnZip');
  const previewCanvas = $('previewCanvas');
  const previewWrap   = $('previewWrap');
  const previewEmpty  = $('previewEmpty');
  const previewInfo   = $('previewInfo');
  const btnDlSingle   = $('btnDlSingle');
  const btnResetAll   = $('btnResetAll');
  const toastEl       = $('toast');

  /* ── BG swatches ── */
  const bgSwatches = {
    transparent: 'transparent',
    white:  '#ffffff',
    black:  '#000000',
    gray:   '#808080',
  };
  document.querySelectorAll('.bg-swatch[data-bg]').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.bg-swatch,.bg-color-input').forEach(x => x.classList.remove('selected'));
      sw.classList.add('selected');
      bgColor = sw.dataset.bg;
      refreshPreview();
    });
  });
  // Custom color picker
  const bgColorInp = $('bgColorInp');
  const bgColorPreview = $('bgColorPreview');
  const bgColorWrap = $('bgColorWrap');
  bgColorInp && bgColorInp.addEventListener('input', () => {
    bgColor = bgColorInp.value;
    bgColorPreview.style.background = bgColor;
    document.querySelectorAll('.bg-swatch').forEach(x => x.classList.remove('selected'));
    bgColorWrap.classList.add('selected');
    refreshPreview();
  });

  /* ── Drag & Drop ── */
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  ['dragleave','dragend'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over')));
  dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); addFiles([...e.dataTransfer.files]); });
  fileInput.addEventListener('change', () => { addFiles([...fileInput.files]); fileInput.value = ''; });

  /* ── Add files ── */
  function addFiles(incoming) {
    clearErr();
    const imgs = incoming.filter(f => f.type.startsWith('image/'));
    if (!imgs.length) { showErr('Faqat rasm fayllari (JPG, PNG, WebP...) qabul qilinadi.'); return; }
    const free = 20 - files.length;
    if (free <= 0) { showErr('Maksimal 20 ta rasm.'); return; }
    imgs.slice(0, free).forEach(f => {
      if (f.size > 80 * 1024 * 1024) return;
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      const url = URL.createObjectURL(f);
      files.push({ id, file: f, url, blob: null, status: 'pending' });
      addRow(files[files.length - 1]);
    });
    renderUI();
    if (currentPreviewIdx < 0 && files.length > 0) selectFile(0);
  }

  /* ── File row ── */
  function addRow(item) {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.id = 'row-' + item.id;
    row.innerHTML =
      `<img class="file-thumb" src="${item.url}" alt="" />` +
      `<div class="file-info">` +
        `<div class="file-name">${esc(item.file.name)}</div>` +
        `<div class="file-meta" id="meta-${item.id}">${(item.file.size/1048576).toFixed(1)} MB</div>` +
      `</div>` +
      `<div class="file-actions">` +
        `<button class="f-btn dl" id="dl-${item.id}" title="Yuklab olish" style="display:none">` +
          svg_dl() + `</button>` +
        `<button class="f-btn rm" data-id="${item.id}" title="O'chirish">` +
          svg_rm() + `</button>` +
      `</div>`;
    fileList.appendChild(row);

    row.addEventListener('click', e => {
      if (e.target.closest('.f-btn')) return;
      const idx = files.findIndex(f => f.id === item.id);
      if (idx >= 0) selectFile(idx);
    });
    row.querySelector('.rm').addEventListener('click', () => delFile(item.id));
    row.querySelector('.dl').addEventListener('click', () => {
      if (item.blob) dlBlob(item.blob, outName(item.file.name));
    });
  }

  function delFile(id) {
    const idx = files.findIndex(f => f.id === id);
    files = files.filter(f => f.id !== id);
    $('row-' + id)?.remove();
    if (currentPreviewIdx >= idx) currentPreviewIdx = Math.min(currentPreviewIdx, files.length - 1);
    if (files.length === 0) { currentPreviewIdx = -1; clearPreview(); }
    else selectFile(Math.max(0, currentPreviewIdx));
    renderUI();
  }

  function selectFile(idx) {
    currentPreviewIdx = idx;
    document.querySelectorAll('.file-row').forEach(r => r.classList.remove('active'));
    if (files[idx]) {
      $('row-' + files[idx].id)?.classList.add('active');
      loadPreviewImg(files[idx]);
    }
  }

  function loadPreviewImg(item) {
    const img = new Image();
    img.onload = () => { previewOrigImg = img; refreshPreview(); };
    img.src = item.url;
  }

  /* ── Render UI ── */
  function renderUI() {
    const n = files.length;
    cntBadge.classList.toggle('show', n > 0);
    cntText.textContent = n + ' ta rasm';
    actionPan.style.display = n ? 'flex' : 'none';
    if (!n) { resultBar.classList.remove('show'); progWrap.classList.remove('show'); }
  }

  /* ══════════════════════════════════
     ANGLE CONTROLS
  ══════════════════════════════════ */
  function setAngle(val, updateSlider = true) {
    angle = Math.max(-180, Math.min(180, Math.round(val)));
    if (updateSlider) angleSlider.value = angle;
    angleInput.value = angle;
    // Dial rotation: arrow points up at 0°
    if (angleDial) angleDial.style.transform = `translateX(-50%) translateY(-100%) rotate(${angle}deg)`;
    if (angleReadout) angleReadout.textContent = angle + '°';
    refreshPreview();
  }

  angleSlider.addEventListener('input', () => setAngle(+angleSlider.value, false));
  angleInput.addEventListener('change', () => setAngle(+angleInput.value));
  angleInput.addEventListener('input', () => { if(angleInput.value !== '' && angleInput.value !== '-') setAngle(+angleInput.value); });

  // Quick buttons
  btnRotL90.addEventListener('click', () => setAngle(((angle - 90 + 540) % 360) - 180));
  btnRotR90.addEventListener('click', () => setAngle(((angle + 90 + 540) % 360) - 180));
  btnRotL45.addEventListener('click', () => setAngle(Math.max(-180, angle - 45)));
  btnRotR45.addEventListener('click', () => setAngle(Math.min(180, angle + 45)));
  btnRot180.addEventListener('click', () => setAngle(angle === 180 || angle === -180 ? 0 : 180));
  btnReset0.addEventListener('click', () => setAngle(0));

  /* ── Flip ── */
  btnFlipH.addEventListener('click', () => { flipH = !flipH; btnFlipH.classList.toggle('active', flipH); refreshPreview(); });
  btnFlipV.addEventListener('click', () => { flipV = !flipV; btnFlipV.classList.toggle('active', flipV); refreshPreview(); });

  /* ── Format + quality ── */
  qualSlider.addEventListener('input', () => { qualVal.textContent = qualSlider.value + '%'; refreshPreview(); });
  selFmt.addEventListener('change', () => refreshPreview());

  /* ══════════════════════════════════
     LIVE PREVIEW
  ══════════════════════════════════ */
  let _prevDebounce;
  function refreshPreview() {
    clearTimeout(_prevDebounce);
    _prevDebounce = setTimeout(_doPreview, 60);
  }

  function _doPreview() {
    if (!previewOrigImg) { clearPreview(); return; }
    const img = previewOrigImg;
    const rad = angle * Math.PI / 180;
    const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
    // Output canvas dims
    const outW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
    const outH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

    // Preview canvas (scaled to fit 300×280)
    const maxW = 300, maxH = 280;
    const sc = Math.min(maxW / outW, maxH / outH, 1);
    previewCanvas.width  = Math.round(outW * sc);
    previewCanvas.height = Math.round(outH * sc);

    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Background
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    // Draw rotated + flipped
    ctx.save();
    ctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.naturalWidth * sc / 2, -img.naturalHeight * sc / 2, img.naturalWidth * sc, img.naturalHeight * sc);
    ctx.restore();

    previewCanvas.style.display = 'block';
    previewEmpty.style.display = 'none';

    // Update checkerboard bg for transparent
    previewWrap.classList.toggle('solid-bg', bgColor !== 'transparent');
    if (bgColor !== 'transparent') previewWrap.style.background = bgColor;
    else previewWrap.style.background = '';

    // Info
    const flipStr = [flipH ? 'G-flip' : '', flipV ? 'V-flip' : ''].filter(Boolean).join(', ');
    previewInfo.innerHTML =
      `<strong>${img.naturalWidth} × ${img.naturalHeight}</strong> px &nbsp;→&nbsp; <strong>${outW} × ${outH}</strong> px` +
      (flipStr ? ` &nbsp;·&nbsp; ${flipStr}` : '');

    btnDlSingle.disabled = false;
  }

  function clearPreview() {
    previewCanvas.style.display = 'none';
    previewEmpty.style.display = 'flex';
    previewInfo.innerHTML = '';
    btnDlSingle.disabled = true;
    previewOrigImg = null;
  }

  /* ── Single download (preview) ── */
  btnDlSingle.addEventListener('click', async () => {
    if (!previewOrigImg) return;
    const blob = await rotateToBlob(previewOrigImg);
    if (!blob) return;
    const name = files[currentPreviewIdx] ? outName(files[currentPreviewIdx].file.name) : 'rotated.jpg';
    dlBlob(blob, name);
    toast('Yuklab olindi', 'ok');
  });

  /* ══════════════════════════════════
     BATCH PROCESS
  ══════════════════════════════════ */
  btnGo.addEventListener('click', runBatch);
  btnClear.addEventListener('click', clearAll);
  btnZip.addEventListener('click', doZip);
  btnResetAll && btnResetAll.addEventListener('click', () => {
    setAngle(0); flipH = false; flipV = false;
    btnFlipH.classList.remove('active'); btnFlipV.classList.remove('active');
    bgColor = 'transparent';
    document.querySelectorAll('.bg-swatch[data-bg]')[0]?.click();
    refreshPreview();
  });

  async function runBatch() {
    clearErr();
    if (!files.length) return;
    btnGo.disabled = true;
    resultBar.classList.remove('show');
    progWrap.classList.add('show');
    progFill.style.width = '0%';

    let done = 0;
    for (const item of files) {
      setStatus(item.id, 'processing');
      const img = await loadImg(item.url);
      item.blob = await rotateToBlob(img);
      done++;
      progFill.style.width = Math.round(done / files.length * 100) + '%';
      progLabel.textContent = done + ' / ' + files.length;
      if (item.blob) {
        setStatus(item.id, 'done');
        const dlBtn = $('dl-' + item.id);
        if (dlBtn) dlBtn.style.display = 'flex';
      }
    }

    btnGo.disabled = false;
    const ok = files.filter(f => f.blob).length;
    resultBar.classList.add('show');
    resultTxt.textContent = ok + ' ta rasm aylantildi';
    toast('✓ ' + ok + ' ta tayyor', 'ok');
  }

  async function rotateToBlob(img) {
    const rad = angle * Math.PI / 180;
    const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
    const outW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
    const outH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
    const canvas = document.createElement('canvas');
    canvas.width = outW; canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (bgColor !== 'transparent') { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, outW, outH); }
    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
    const mime = getMime();
    const qual = mime === 'image/png' ? undefined : parseInt(qualSlider.value) / 100;
    return new Promise(resolve => canvas.toBlob(b => resolve(b), mime, qual));
  }

  function loadImg(src) {
    return new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
    });
  }

  async function doZip() {
    const ready = files.filter(f => f.blob);
    if (!ready.length) return;
    btnZip.disabled = true;
    btnZip.innerHTML = '<span class="spin">↻</span> Tayyorlanmoqda…';
    const zip = new window.JSZip();
    ready.forEach(item => zip.file(outName(item.file.name), item.blob));
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    dlBlob(blob, 'toolbase-rotated.zip');
    btnZip.disabled = false;
    btnZip.innerHTML = svg_dl() + ' ZIP yuklab olish';
    toast('ZIP tayyor', 'ok');
  }

  function clearAll() {
    files = []; currentPreviewIdx = -1; fileList.innerHTML = '';
    progWrap.classList.remove('show'); resultBar.classList.remove('show');
    clearErr(); clearPreview(); renderUI();
  }

  /* ── Helpers ── */
  function getMime() {
    const v = selFmt.value;
    if (v === 'png') return 'image/png';
    if (v === 'webp') return 'image/webp';
    return 'image/jpeg';
  }

  function outName(name) {
    const dot = name.lastIndexOf('.');
    const base = dot > -1 ? name.slice(0, dot) : name;
    const v = selFmt.value;
    const ext = v === 'auto' ? (dot > -1 ? name.slice(dot+1) : 'jpg') : v;
    return base + '-rotated.' + ext;
  }

  function dlBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  function setStatus(id, status) {
    const row = $('row-' + id);
    if (!row) return;
    row.className = 'file-row' + (status === 'done' ? ' done' : status === 'processing' ? ' processing' : '');
    const meta = $('meta-' + id);
    if (meta) meta.textContent = status === 'done' ? '✓ Tayyor' : status === 'processing' ? '…' : '';
  }

  function svg_dl() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'; }
  function svg_rm() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>'; }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function showErr(m) { errBox.textContent = m; errBox.classList.add('show'); }
  function clearErr() { errBox.textContent = ''; errBox.classList.remove('show'); }
  let _tt;
  function toast(msg, type) {
    clearTimeout(_tt);
    toastEl.textContent = msg; toastEl.className = 'toast show' + (type ? ' '+type : '');
    _tt = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  // Init
  setAngle(0);

})();
