/**
 * toolbase.uz — Background Remove Tool
 * Uses @imgly/background-removal (WASM + ONNX, fully client-side)
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────
  let originalFile = null;
  let resultBlob   = null;
  let activeBg     = 'transparent'; // 'transparent' | hex color
  let modelReady   = false;

  // ── DOM refs ────────────────────────────────────────────────────
  const dropZone         = document.getElementById('dropZone');
  const fileInput        = document.getElementById('fileInput');
  const modelBanner      = document.getElementById('modelBanner');
  const modelProgressBar = document.getElementById('modelProgressBar');
  const modelStatusText  = document.getElementById('modelStatusText');
  const processingEl     = document.getElementById('processing');
  const resultArea       = document.getElementById('resultArea');
  const originalImg      = document.getElementById('originalImg');
  const resultImg        = document.getElementById('resultImg');
  const downloadBtn      = document.getElementById('downloadBtn');
  const newImageBtn      = document.getElementById('newImageBtn');
  const toastEl          = document.getElementById('toast');
  const swatches         = document.querySelectorAll('.swatch');
  const customColorInput = document.getElementById('customColor');

  // ── Drag & drop ─────────────────────────────────────────────────
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  // ── Background swatches ─────────────────────────────────────────
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      activeBg = sw.dataset.color || 'transparent';
      applyBackground();
    });
  });

  customColorInput.addEventListener('input', () => {
    swatches.forEach(s => s.classList.remove('active'));
    document.querySelector('.swatch-custom').classList.add('active');
    activeBg = customColorInput.value;
    applyBackground();
  });

  // ── Download ────────────────────────────────────────────────────
  downloadBtn.addEventListener('click', downloadResult);
  newImageBtn.addEventListener('click', resetTool);

  // ── Main handler ────────────────────────────────────────────────
  async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('❌ Faqat rasm fayllari qabul qilinadi');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('❌ Fayl hajmi 20 MB dan oshmasligi kerak');
      return;
    }

    originalFile = file;
    resultBlob   = null;

    // Show original preview
    const objUrl = URL.createObjectURL(file);
    originalImg.src = objUrl;

    // Hide drop, show processing
    dropZone.style.display    = 'none';
    processingEl.classList.add('visible');
    resultArea.classList.remove('visible');

    try {
      const blob = await removeBg(file);
      resultBlob = blob;

      const resultUrl = URL.createObjectURL(blob);
      resultImg.src   = resultUrl;

      processingEl.classList.remove('visible');
      resultArea.classList.add('visible');
      applyBackground();
    } catch (err) {
      console.error(err);
      processingEl.classList.remove('visible');
      dropZone.style.display = '';
      showToast('❌ Xatolik yuz berdi. Boshqa rasm sinab ko\'ring.');
    }
  }

  // ── Background-removal core ──────────────────────────────────────
  async function removeBg(file) {
    // Show model loading banner only first time
    if (!modelReady) {
      modelBanner.classList.add('visible');
    }

    const { removeBackground } = await import(
      'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/browser.mjs'
    );

    const config = {
      model: 'small',                  // 'small' = ~9MB, faster; 'medium' = ~40MB, better
      output: { format: 'image/png' },
      progress: (key, current, total) => {
        if (!modelReady && total > 0) {
          const pct = Math.round((current / total) * 100);
          modelProgressBar.style.width = pct + '%';
          modelStatusText.textContent  = `Model yuklanmoqda… ${pct}%`;
        }
      },
    };

    const result = await removeBackground(file, config);

    modelReady = true;
    modelBanner.classList.remove('visible');
    modelProgressBar.style.width = '0%';

    return result;
  }

  // ── Apply background color onto result image ─────────────────────
  function applyBackground() {
    if (!resultBlob) return;

    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    const img    = new Image();

    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;

      if (activeBg !== 'transparent') {
        ctx.fillStyle = activeBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      resultImg.src = canvas.toDataURL('image/png');

      // Store colored version for download
      canvas.toBlob(blob => { resultBlob = blob; }, 'image/png');
    };

    img.src = URL.createObjectURL(resultBlob);
  }

  // ── Download ────────────────────────────────────────────────────
  function downloadResult() {
    if (!resultBlob) return;
    const a    = document.createElement('a');
    const name = (originalFile?.name || 'rasm').replace(/\.[^.]+$/, '');
    a.href     = URL.createObjectURL(resultBlob);
    a.download = name + '-bg-removed.png';
    a.click();
    showToast('✅ Rasm yuklab olindi!');
  }

  // ── Reset ────────────────────────────────────────────────────────
  function resetTool() {
    originalFile = null;
    resultBlob   = null;
    originalImg.src  = '';
    resultImg.src    = '';
    processingEl.classList.remove('visible');
    resultArea.classList.remove('visible');
    dropZone.style.display = '';
    fileInput.value = '';
    // Reset swatches
    swatches.forEach(s => s.classList.remove('active'));
    document.querySelector('[data-color="transparent"]').classList.add('active');
    activeBg = 'transparent';
  }

  // ── Toast ────────────────────────────────────────────────────────
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

})();
