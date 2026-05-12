/**
 * toolbase.uz — PDF Sahifalarni Aylantirish
 * pdf-lib 1.17.1 — page.setRotation(degrees(N))
 * PDF.js — sahifa preview render
 * 100% client-side, serverga yuborilmaydi
 */
(function () {
  'use strict';

  /* ── State ── */
  let pdfFile    = null;   // File object
  let pdfDoc     = null;   // pdf-lib PDFDocument
  let pdfJsDoc   = null;   // PDF.js document (preview uchun)
  let pageCount  = 0;
  let pageRots   = [];     // har bir sahifa uchun qo'shimcha rotation (0,90,180,270)
  let selectedPages = new Set();

  /* ── DOM refs ── */
  const $ = id => document.getElementById(id);
  const dropZone      = $('dropZone');
  const fileInput     = $('fileInput');
  const fileInfoStrip = $('fileInfoStrip');
  const fiName        = $('fiName');
  const fiMeta        = $('fiMeta');
  const btnChange     = $('btnChange');
  const errBox        = $('errBox');
  const globalBar     = $('globalBar');
  const btnGlobalL    = $('btnGlobalL');
  const btnGlobalR    = $('btnGlobalR');
  const btnGlobal180  = $('btnGlobal180');
  const btnGlobalReset= $('btnGlobalReset');
  const pageGrid      = $('pageGrid');
  const pagesSec      = $('pagesSec');
  const pagesCount    = $('pagesCount');
  const selBar        = $('selBar');
  const selText       = $('selText');
  const btnSelL       = $('btnSelL');
  const btnSelR       = $('btnSelR');
  const btnSelReset   = $('btnSelReset');
  const btnSelClear   = $('btnSelClear');
  const btnSave       = $('btnSave');
  const btnResetAll   = $('btnResetAll');
  const resultCard    = $('resultCard');
  const btnDl         = $('btnDl');
  const rcInfo        = $('rcInfo');
  const progWrap      = $('progWrap');
  const progFill      = $('progFill');
  const progLabel     = $('progLabel');
  const statPages     = $('statPages');
  const statChanged   = $('statChanged');
  const toastEl       = $('toast');

  let _dlBlob = null, _dlName = '';

  /* ── Drop ── */
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  ['dragleave','dragend'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over')));
  dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); const f = e.dataTransfer.files[0]; if(f) loadFile(f); });
  fileInput.addEventListener('change', () => { if(fileInput.files[0]) loadFile(fileInput.files[0]); fileInput.value = ''; });
  btnChange.addEventListener('click', resetAll);

  /* ── Load file ── */
  async function loadFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showErr('Faqat PDF fayl qabul qilinadi.'); return;
    }
    if (file.size > 150 * 1024 * 1024) { showErr('Fayl 150 MB dan katta.'); return; }
    clearErr();
    pdfFile = file;
    fiName.textContent = file.name;
    fiMeta.textContent = (file.size / 1048576).toFixed(1) + ' MB · yuklanmoqda…';

    dropZone.style.display = 'none';
    fileInfoStrip.classList.add('show');
    progWrap.classList.add('show');
    progFill.style.width = '10%';
    progLabel.textContent = 'PDF o\'qilmoqda…';

    try {
      const buf = await file.arrayBuffer();
      progFill.style.width = '35%';

      // pdf-lib: editing uchun
      pdfDoc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();

      // Init rotations (pdf-lib dan mavjud rotationni olish)
      pageRots = [];
      for (let i = 0; i < pageCount; i++) {
        const existingRot = pdfDoc.getPage(i).getRotation().angle;
        pageRots.push(existingRot); // mavjud rotationni saqlaymiz
      }

      fiMeta.textContent = (file.size / 1048576).toFixed(1) + ' MB · ' + pageCount + ' ta sahifa';
      progFill.style.width = '50%';
      progLabel.textContent = 'Preview yuklanmoqda…';

      // PDF.js: preview uchun
      const pdfJsLib = window.pdfjsLib;
      if (pdfJsLib) {
        pdfJsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const loadTask = pdfJsLib.getDocument({ data: buf.slice(0) });
        pdfJsDoc = await loadTask.promise;
      }

      progFill.style.width = '70%';
      await renderGrid();
      progFill.style.width = '100%';
      progWrap.classList.remove('show');
      pagesSec.style.display = 'block';
      globalBar.style.display = 'flex';
      pagesCount.textContent = pageCount;
      updateStats();
      btnSave.disabled = false;
      window._pageRots = pageRots;
      window._rotatePage = rotatePage;
      window._pdfRotateReady = true;

    } catch(e) {
      showErr('PDF o\'qib bo\'lmadi: ' + (e.message || e));
      progWrap.classList.remove('show');
      dropZone.style.display = '';
      fileInfoStrip.classList.remove('show');
    }
  }

  /* ── Render page grid ── */
  async function renderGrid() {
    pageGrid.innerHTML = '';
    for (let i = 0; i < pageCount; i++) {
      const card = createPageCard(i);
      pageGrid.appendChild(card);
      if (pdfJsDoc) {
        renderPageThumb(i, card.querySelector('.page-canvas'), card.querySelector('.page-canvas-wrap'));
      }
    }
  }

  function createPageCard(idx) {
    const card = document.createElement('div');
    card.className = 'page-card';
    card.id = 'pcard-' + idx;
    const rot = pageRots[idx] % 360;
    const rotChanged = (rot !== 0);
    if (rotChanged) card.classList.add('rotated-card');

    card.innerHTML =
      `<div class="page-thumb-wrap">` +
        `<canvas class="page-canvas" data-idx="${idx}"></canvas>` +
        `<div class="page-num-badge">${idx + 1}</div>` +
        `<div class="page-rot-badge">${rot}°</div>` +
      `</div>` +
      `<div class="page-controls">` +
        `<button class="pc-btn" data-idx="${idx}" data-dir="l" title="Chapga 90°">` +
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.37"/></svg>` +
        `</button>` +
        `<span class="pc-angle ${rot===0?'zero':''}" id="pc-angle-${idx}">${rot===0?'0°':rot+'°'}</span>` +
        `<button class="pc-btn" data-idx="${idx}" data-dir="r" title="O'ngga 90°">` +
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.37"/></svg>` +
        `</button>` +
      `</div>`;

    // Click card = select
    card.querySelector('.page-thumb-wrap').addEventListener('click', () => toggleSelect(idx));
    // Per-page rotate buttons
    card.querySelectorAll('.pc-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        rotatePage(idx, btn.dataset.dir === 'l' ? -90 : 90);
      });
    });
    return card;
  }

  async function renderPageThumb(idx, canvas, wrap) {
    try {
      const page = await pdfJsDoc.getPage(idx + 1);
      const vp = page.getViewport({ scale: 0.5 });
      canvas.width  = vp.width;
      canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    } catch { /* sahifa render bo'lmadi */ }
  }

  /* ── Rotate single page ── */
  function rotatePage(idx, delta) {
    pageRots[idx] = ((pageRots[idx] + delta) % 360 + 360) % 360;
    updatePageCard(idx);
    updateStats();
    updateSelBar();
  }

  function updatePageCard(idx) {
    const card = $('pcard-' + idx);
    if (!card) return;
    const rot = pageRots[idx];
    const changed = (rot !== 0);
    card.classList.toggle('rotated-card', changed);
    // badge
    const badge = card.querySelector('.page-rot-badge');
    if (badge) { badge.textContent = rot + '°'; badge.style.display = changed ? '' : 'none'; }
    // angle label
    const label = $('pc-angle-' + idx);
    if (label) { label.textContent = rot + '°'; label.className = 'pc-angle' + (rot===0?' zero':''); }
    // rotate canvas preview
    const canvas = card.querySelector('.page-canvas');
    if (canvas) canvas.style.transform = `rotate(${rot}deg)`;
  }

  /* ── Selection ── */
  function toggleSelect(idx) {
    if (selectedPages.has(idx)) selectedPages.delete(idx);
    else selectedPages.add(idx);
    $('pcard-' + idx)?.classList.toggle('selected', selectedPages.has(idx));
    updateSelBar();
  }

  function updateSelBar() {
    const n = selectedPages.size;
    if (n === 0) { selBar.classList.remove('show'); return; }
    selBar.classList.add('show');
    selText.textContent = n + ' ta sahifa tanlandi';
  }

  btnSelL.addEventListener('click', () => { selectedPages.forEach(i => rotatePage(i, -90)); });
  btnSelR.addEventListener('click', () => { selectedPages.forEach(i => rotatePage(i,  90)); });
  btnSelReset.addEventListener('click', () => {
    selectedPages.forEach(i => { pageRots[i] = 0; updatePageCard(i); });
    updateStats();
  });
  btnSelClear.addEventListener('click', () => {
    selectedPages.clear();
    document.querySelectorAll('.page-card').forEach(c => c.classList.remove('selected'));
    updateSelBar();
  });

  /* ── Global rotate ── */
  btnGlobalL.addEventListener('click', () => { for(let i=0;i<pageCount;i++) rotatePage(i,-90); });
  btnGlobalR.addEventListener('click', () => { for(let i=0;i<pageCount;i++) rotatePage(i, 90); });
  btnGlobal180.addEventListener('click', () => { for(let i=0;i<pageCount;i++) rotatePage(i,180); });
  btnGlobalReset.addEventListener('click', () => {
    for(let i=0;i<pageCount;i++) { pageRots[i]=0; updatePageCard(i); }
    updateStats();
  });

  /* ── Stats ── */
  function updateStats() {
    if (statPages) statPages.textContent = pageCount;
    const changed = pageRots.filter(r => r !== 0).length;
    if (statChanged) {
      statChanged.textContent = changed + ' ta';
      statChanged.className = 'stat-val' + (changed > 0 ? ' changed' : '');
    }
  }

  /* ── Reset all ── */
  btnResetAll.addEventListener('click', () => {
    pageRots.fill(0);
    document.querySelectorAll('.page-card').forEach((c,i) => { updatePageCard(i); c.classList.remove('selected'); });
    selectedPages.clear();
    updateStats(); updateSelBar();
  });

  /* ── Save ── */
  btnSave.addEventListener('click', doSave);
  async function doSave() {
    clearErr();
    progWrap.classList.add('show');
    progFill.style.width = '0%';
    progLabel.textContent = 'Sahifalar aylantirilmoqda…';
    btnSave.disabled = true;

    try {
      // Freshly load file to avoid mutation issues
      const buf = await pdfFile.arrayBuffer();
      const freshDoc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });

      for (let i = 0; i < pageCount; i++) {
        const page = freshDoc.getPage(i);
        const newRot = pageRots[i];
        page.setRotation(window.PDFLib.degrees(newRot));
        progFill.style.width = Math.round((i+1)/pageCount*80) + '%';
      }
      progLabel.textContent = 'Saqlanmoqda…';
      progFill.style.width = '90%';

      const pdfBytes = await freshDoc.save();
      _dlBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      _dlName = pdfFile.name.replace(/\.pdf$/i, '') + '-aylantilgan.pdf';

      progFill.style.width = '100%';
      progWrap.classList.remove('show');
      resultCard.classList.add('show');
      rcInfo.textContent = _dlName + ' · ' + (pdfBytes.length / 1048576).toFixed(2) + ' MB';
      toast('PDF saqlandi!', 'ok');
    } catch(e) {
      showErr('Xato: ' + (e.message || e));
      progWrap.classList.remove('show');
    } finally {
      btnSave.disabled = false;
      window._pageRots = pageRots;
      window._rotatePage = rotatePage;
      window._pdfRotateReady = true;
    }
  }

  btnDl.addEventListener('click', () => {
    if (!_dlBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(_dlBlob); a.download = _dlName; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('Yuklab olindi', 'ok');
  });

  /* ── Reset everything ── */
  function resetAll() {
    pdfFile=null; pdfDoc=null; pdfJsDoc=null;
    pageCount=0; pageRots=[]; selectedPages.clear();
    pageGrid.innerHTML='';
    dropZone.style.display=''; fileInfoStrip.classList.remove('show');
    pagesSec.style.display='none'; globalBar.style.display='none';
    selBar.classList.remove('show'); resultCard.classList.remove('show');
    progWrap.classList.remove('show'); progFill.style.width='0%';
    btnSave.disabled=true; clearErr();
  }

  /* ── Helpers ── */
  function showErr(m) { errBox.innerHTML=m; errBox.classList.add('show'); }
  function clearErr() { errBox.innerHTML=''; errBox.classList.remove('show'); }
  let _tt;
  function toast(msg,type) {
    clearTimeout(_tt);
    toastEl.textContent=msg; toastEl.className='toast show'+(type?' '+type:'');
    _tt=setTimeout(()=>toastEl.classList.remove('show'),3000);
  }

})();
