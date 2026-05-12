/**
 * toolbase.uz — Rasm Qirqish (Crop)
 * Canvas API — drag selection, aspect ratio lock, presets
 * 100% client-side, serverga yuborilmaydi
 */
(function () {
  'use strict';

  /* ── DOM ── */
  const mainCanvas   = document.getElementById('mainCanvas');
  const ctx          = mainCanvas.getContext('2d');
  const previewCanvas= document.getElementById('previewCanvas');
  const pctx         = previewCanvas.getContext('2d');
  const canvasWrap   = document.getElementById('canvasWrap');
  const canvasEmpty  = document.getElementById('canvasEmpty');
  const fileInput    = document.getElementById('fileInput');
  const fileInput2   = document.getElementById('fileInput2');
  const errBox       = document.getElementById('errBox');
  const previewMini  = document.getElementById('previewMini');
  const previewDims  = document.getElementById('previewDims');
  const previewEmptyMini = document.getElementById('previewEmptyMini');
  const btnCropDl    = document.getElementById('btnCropDl');
  const btnReset     = document.getElementById('btnReset');
  const btnRotL      = document.getElementById('btnRotL');
  const btnRotR      = document.getElementById('btnRotR');
  const btnFlipH     = document.getElementById('btnFlipH');
  const btnFlipV     = document.getElementById('btnFlipV');
  const btnClearSel  = document.getElementById('btnClearSel');
  const btnFullSel   = document.getElementById('btnFullSel');
  const selFmt       = document.getElementById('selFmt');
  const qualSlider   = document.getElementById('qualSlider');
  const qualVal      = document.getElementById('qualVal');
  const inX          = document.getElementById('inX');
  const inY          = document.getElementById('inY');
  const inW          = document.getElementById('inW');
  const inH          = document.getElementById('inH');
  const chkLock      = document.getElementById('chkLock');
  const lockLabel    = document.getElementById('lockLabel');
  const crW          = document.getElementById('crW');
  const crH          = document.getElementById('crH');
  const btnApplyRatio= document.getElementById('btnApplyRatio');
  const toastEl      = document.getElementById('toast');

  /* ── State ── */
  let img = null;          // original HTMLImageElement
  let origW = 0, origH = 0;
  let rotation = 0;        // 0,90,180,270
  let flipH = false, flipV = false;
  let scale = 1;           // canvas display scale

  // Selection in IMAGE coordinates (not canvas pixels)
  let sel = null;          // {x,y,w,h} or null
  let isDragging = false;
  let dragMode = 'draw';   // 'draw' | 'move' | 'resize'
  let dragHandle = null;   // 'nw','ne','sw','se','n','s','e','w'
  let dragStart = {x:0,y:0};
  let selStart  = null;

  let aspectRatio = null;  // null = free, number = w/h
  let originalName = 'rasm';

  /* ── Aspect ratio presets ── */
  document.querySelectorAll('.ratio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const r = btn.dataset.ratio;
      if (r === 'free') { aspectRatio = null; }
      else {
        const [a,b2] = r.split(':').map(Number);
        aspectRatio = a / b2;
      }
      if (sel) enforceAspect();
      redraw();
    });
  });

  btnApplyRatio.addEventListener('click', () => {
    const a = parseFloat(crW.value), b2 = parseFloat(crH.value);
    if (!a || !b2 || a <= 0 || b2 <= 0) return;
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    aspectRatio = a / b2;
    if (sel) enforceAspect();
    redraw();
  });

  /* ── File loading ── */
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
    fileInput.value = '';
  });
  fileInput2.addEventListener('change', () => {
    if (fileInput2.files[0]) loadFile(fileInput2.files[0]);
    fileInput2.value = '';
  });

  // Drag & drop onto canvas wrapper
  canvasWrap.addEventListener('dragover', e => { e.preventDefault(); });
  canvasWrap.addEventListener('drop', e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) loadFile(f);
  });

  function loadFile(file) {
    if (file.size > 80 * 1024 * 1024) { showErr('Rasm 80 MB dan katta.'); return; }
    clearErr();
    originalName = (file.name || 'rasm').replace(/\.[^.]+$/, '') || 'rasm';
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      img = image;
      origW = image.naturalWidth;
      origH = image.naturalHeight;
      rotation = 0; flipH = false; flipV = false; sel = null;
      fitCanvas();
      canvasEmpty.classList.add('hide');
      makeDefaultSelection();
      updateInputs();
      updatePreview();
      redraw();
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      showErr("Rasmni ochib bo'lmadi.");
    };
    image.src = url;
  }

  /* ── Fit canvas to wrapper ── */
  function fitCanvas() {
    const maxW = canvasWrap.clientWidth  - 40;
    const maxH = Math.max(400, window.innerHeight * 0.55);
    const [dw, dh] = displayDims();
    scale = Math.min(maxW / dw, maxH / dh, 1);
    mainCanvas.width  = Math.round(dw * scale);
    mainCanvas.height = Math.round(dh * scale);
    redraw();
  }

  // Display dimensions accounting for rotation
  function displayDims() {
    if (rotation === 90 || rotation === 270) return [origH, origW];
    return [origW, origH];
  }

  /* ── Draw ── */
  function redraw() {
    if (!img) return;
    const [dw, dh] = displayDims();
    const cw = mainCanvas.width, ch = mainCanvas.height;
    ctx.clearRect(0, 0, cw, ch);

    drawTransformedImage(ctx, cw, ch, scale);

    // Dark overlay + selection hole
    if (sel) {
      const sx = sel.x * scale, sy = sel.y * scale;
      const sw2 = sel.w * scale, sh2 = sel.h * scale;

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.rect(0, 0, cw, ch);
      ctx.rect(sx, sy, sw2, sh2); // hole (evenodd)
      ctx.fill('evenodd');
      ctx.restore();

      // Selection border
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5,4]);
      ctx.strokeRect(sx+0.5, sy+0.5, sw2-1, sh2-1);
      ctx.restore();

      // Rule of thirds grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let i=1;i<3;i++) {
        ctx.beginPath();ctx.moveTo(sx+sw2*i/3,sy);ctx.lineTo(sx+sw2*i/3,sy+sh2);ctx.stroke();
        ctx.beginPath();ctx.moveTo(sx,sy+sh2*i/3);ctx.lineTo(sx+sw2,sy+sh2*i/3);ctx.stroke();
      }
      ctx.restore();

      // Corner + edge handles
      drawHandles(sx, sy, sw2, sh2);

      // Dimension label
      ctx.save();
      const label = Math.round(sel.w) + ' × ' + Math.round(sel.h) + ' px';
      ctx.font = 'bold 12px Plus Jakarta Sans, system-ui';
      const tw = ctx.measureText(label).width;
      const lx = sx + sw2/2 - tw/2 - 6;
      const ly = sy + sh2 + 8;
      ctx.fillStyle = 'rgba(0,0,0,.7)';
      ctx.beginPath();ctx.roundRect(lx,ly,tw+12,22,4);ctx.fill();
      ctx.fillStyle='#fff';ctx.fillText(label, lx+6, ly+15);
      ctx.restore();
    }
  }

  function drawHandles(sx,sy,sw,sh) {
    const handles = [
      {x:sx,        y:sy,       id:'nw'},
      {x:sx+sw/2,   y:sy,       id:'n'},
      {x:sx+sw,     y:sy,       id:'ne'},
      {x:sx+sw,     y:sy+sh/2,  id:'e'},
      {x:sx+sw,     y:sy+sh,    id:'se'},
      {x:sx+sw/2,   y:sy+sh,    id:'s'},
      {x:sx,        y:sy+sh,    id:'sw'},
      {x:sx,        y:sy+sh/2,  id:'w'},
    ];
    ctx.save();
    handles.forEach(h => {
      const isCorner = ['nw','ne','se','sw'].includes(h.id);
      const size = isCorner ? 9 : 6;
      ctx.fillStyle='#fff';
      ctx.beginPath();
      ctx.roundRect(h.x-size/2, h.y-size/2, size, size, isCorner?3:2);
      ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;ctx.setLineDash([]);
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ── Mouse events ── */
  canvasWrap.addEventListener('mousedown', onDown);
  canvasWrap.addEventListener('mousemove', onMove);
  canvasWrap.addEventListener('mouseup',   onUp);
  canvasWrap.addEventListener('mouseleave',onUp);
  canvasWrap.addEventListener('touchstart', e=>{ e.preventDefault(); onDown(e.touches[0]); },{passive:false});
  canvasWrap.addEventListener('touchmove',  e=>{ e.preventDefault(); onMove(e.touches[0]); },{passive:false});
  canvasWrap.addEventListener('touchend',   e=>{ e.preventDefault(); onUp(e.changedTouches[0]); },{passive:false});

  function canvasPos(e) {
    const rect = mainCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top)  / scale,
    };
  }

  function getHandle(cx,cy) {
    if (!sel) return null;
    const THRESH = 8 / scale;
    const sx=sel.x,sy=sel.y,sw=sel.w,sh=sel.h;
    const handles=[
      {x:sx,       y:sy,      id:'nw'},{x:sx+sw/2,y:sy,      id:'n'},
      {x:sx+sw,    y:sy,      id:'ne'},{x:sx+sw,  y:sy+sh/2, id:'e'},
      {x:sx+sw,    y:sy+sh,   id:'se'},{x:sx+sw/2,y:sy+sh,   id:'s'},
      {x:sx,       y:sy+sh,   id:'sw'},{x:sx,     y:sy+sh/2, id:'w'},
    ];
    for(const h of handles) {
      if(Math.abs(cx-h.x)<THRESH && Math.abs(cy-h.y)<THRESH) return h.id;
    }
    return null;
  }

  function insideSel(cx,cy){
    if(!sel) return false;
    return cx>=sel.x && cx<=sel.x+sel.w && cy>=sel.y && cy<=sel.y+sel.h;
  }

  function onDown(e) {
    if (!img) return;
    const {x,y} = canvasPos(e);
    const [dw,dh] = displayDims();
    if(x<0||y<0||x>dw||y>dh) return;

    const handle = getHandle(x,y);
    if (handle) {
      dragMode = 'resize'; dragHandle = handle;
    } else if (insideSel(x,y)) {
      dragMode = 'move';
    } else {
      dragMode = 'draw';
      sel = {x, y, w:0, h:0};
    }
    isDragging = true;
    dragStart = {x,y};
    selStart = sel ? {...sel} : null;
    canvasWrap.classList.add('dragging-sel');
  }

  function onMove(e) {
    if (!img || !isDragging) {
      if (img) updateCursor(e);
      return;
    }
    const {x,y} = canvasPos(e);
    const [dw,dh] = displayDims();
    const dx = x - dragStart.x, dy = y - dragStart.y;

    if (dragMode === 'draw') {
      sel = makeSelectionFromDrag(dragStart, {x,y}, dw, dh);
    } else if (dragMode === 'move') {
      sel = {
        x: clamp(selStart.x + dx, 0, dw - selStart.w),
        y: clamp(selStart.y + dy, 0, dh - selStart.h),
        w: selStart.w, h: selStart.h,
      };
    } else if (dragMode === 'resize') {
      sel = resizeHandle(selStart, dragHandle, dx, dy, dw, dh);
      if (aspectRatio) enforceAspectResize(dragHandle);
    }
    if (sel) sel = clampSelection(sel, dw, dh);
    updateInputs();
    redraw();
    updatePreview();
  }

  function onUp() {
    isDragging = false;
    canvasWrap.classList.remove('dragging-sel');
    if (sel && (sel.w < 4 || sel.h < 4)) { sel = null; redraw(); clearPreview(); }
    else { updateInputs(); updatePreview(); }
  }

  function updateCursor(e) {
    const {x,y} = canvasPos(e);
    const h = getHandle(x,y);
    const cursors = {nw:'nw-resize',ne:'ne-resize',sw:'sw-resize',se:'se-resize',n:'n-resize',s:'s-resize',e:'e-resize',w:'w-resize'};
    if (h) canvasWrap.style.cursor = cursors[h] || 'crosshair';
    else if (insideSel(x,y)) canvasWrap.style.cursor = 'move';
    else canvasWrap.style.cursor = 'crosshair';
  }

  function normalize(r) {
    return {
      x: r.w < 0 ? r.x + r.w : r.x,
      y: r.h < 0 ? r.y + r.h : r.y,
      w: Math.abs(r.w),
      h: Math.abs(r.h),
    };
  }

  function makeSelectionFromDrag(start, end, maxW, maxH) {
    const sx = clamp(start.x, 0, maxW);
    const sy = clamp(start.y, 0, maxH);
    let dx = clamp(end.x, 0, maxW) - sx;
    let dy = clamp(end.y, 0, maxH) - sy;

    if (aspectRatio) {
      const signX = dx < 0 ? -1 : 1;
      const signY = dy < 0 ? -1 : 1;
      let w = Math.abs(dx);
      let h = Math.abs(dy);
      if (w / Math.max(h, 1) > aspectRatio) w = h * aspectRatio;
      else h = w / aspectRatio;
      dx = w * signX;
      dy = h * signY;
    }

    return clampSelection(normalize({x:sx, y:sy, w:dx, h:dy}), maxW, maxH);
  }

  function makeDefaultSelection() {
    if (!img) return;
    const [dw, dh] = displayDims();
    const pad = 0.1;
    let w = dw * (1 - pad * 2);
    let h = dh * (1 - pad * 2);
    if (aspectRatio) {
      if (w / h > aspectRatio) w = h * aspectRatio;
      else h = w / aspectRatio;
    }
    sel = {
      x: Math.round((dw - w) / 2),
      y: Math.round((dh - h) / 2),
      w: Math.round(w),
      h: Math.round(h),
    };
  }

  function clampSelection(s, maxW, maxH) {
    const w = clamp(s.w, 1, maxW);
    const h = clamp(s.h, 1, maxH);
    return {
      x: clamp(s.x, 0, maxW - w),
      y: clamp(s.y, 0, maxH - h),
      w,
      h,
    };
  }

  function resizeHandle(s, handle, dx, dy, maxW, maxH) {
    let {x,y,w,h} = s;
    if (handle.includes('e')) w = clamp(s.w + dx, 1, maxW - s.x);
    if (handle.includes('s')) h = clamp(s.h + dy, 1, maxH - s.y);
    if (handle.includes('w')) { const nw = clamp(s.w - dx, 1, s.x + s.w); x = s.x + s.w - nw; w = nw; }
    if (handle.includes('n')) { const nh = clamp(s.h - dy, 1, s.y + s.h); y = s.y + s.h - nh; h = nh; }
    return {x,y,w,h};
  }

  function enforceAspect(endX, endY, mode, start) {
    if (!sel || !aspectRatio) return;
    if (sel.h < 1) return;
    sel.h = sel.w / aspectRatio;
  }

  function enforceAspectResize(handle) {
    if (!sel || !aspectRatio) return;
    if (handle.includes('n') || handle.includes('s')) sel.w = sel.h * aspectRatio;
    else sel.h = sel.w / aspectRatio;
  }

  function clamp(v,min,max){return Math.min(Math.max(v,min),max);}

  /* ── Inputs sync ── */
  function updateInputs() {
    if (!sel) { inX.value=''; inY.value=''; inW.value=''; inH.value=''; btnCropDl.disabled = true; return; }
    inX.value = Math.round(sel.x);
    inY.value = Math.round(sel.y);
    inW.value = Math.round(sel.w);
    inH.value = Math.round(sel.h);
    btnCropDl.disabled = false;
  }

  [inX,inY,inW,inH].forEach(inp => inp.addEventListener('change', () => {
    if (!img) return;
    const [dw,dh] = displayDims();
    sel = {
      x: clamp(parseInt(inX.value)||0, 0, dw),
      y: clamp(parseInt(inY.value)||0, 0, dh),
      w: clamp(parseInt(inW.value)||0, 1, dw),
      h: clamp(parseInt(inH.value)||0, 1, dh),
    };
    sel = clampSelection(sel, dw, dh);
    redraw(); updatePreview();
  }));

  chkLock.addEventListener('change', () => {
    lockLabel.classList.toggle('locked', chkLock.checked);
    if (chkLock.checked && sel) aspectRatio = sel.w / sel.h;
    else if (!chkLock.checked) aspectRatio = null;
  });

  qualSlider.addEventListener('input', () => { qualVal.textContent = qualSlider.value + '%'; updatePreview(); });
  selFmt.addEventListener('change', () => { updatePreview(); });

  /* ── Transform buttons ── */
  btnRotL.addEventListener('click', () => { rotation = (rotation - 90 + 360) % 360; fitCanvas(); makeDefaultSelection(); updateInputs(); updatePreview(); redraw(); });
  btnRotR.addEventListener('click', () => { rotation = (rotation + 90) % 360;       fitCanvas(); makeDefaultSelection(); updateInputs(); updatePreview(); redraw(); });
  btnFlipH.addEventListener('click',() => { flipH = !flipH; redraw(); updatePreview(); });
  btnFlipV.addEventListener('click',() => { flipV = !flipV; redraw(); updatePreview(); });
  btnClearSel.addEventListener('click', () => { sel=null; redraw(); clearPreview(); updateInputs(); });
  btnFullSel.addEventListener('click', () => {
    if (!img) return;
    const [dw, dh] = displayDims();
    sel = {x:0, y:0, w:dw, h:dh};
    if (aspectRatio) {
      makeDefaultSelection();
    }
    updateInputs();
    updatePreview();
    redraw();
  });

  /* ── Preview ── */
  function updatePreview() {
    if (!img || !sel || sel.w < 1 || sel.h < 1) { clearPreview(); return; }
    const cropped = getCroppedCanvas();
    const maxW = 260, maxH = 160;
    const sc = Math.min(maxW/cropped.width, maxH/cropped.height, 1);
    previewCanvas.width  = Math.round(cropped.width  * sc);
    previewCanvas.height = Math.round(cropped.height * sc);
    pctx.clearRect(0,0,previewCanvas.width,previewCanvas.height);
    pctx.drawImage(cropped, 0, 0, previewCanvas.width, previewCanvas.height);
    previewCanvas.style.display = 'block';
    previewEmptyMini.style.display = 'none';
    const mime = getMime();
    previewMini.classList.toggle('jpg-bg', mime==='image/jpeg');
    previewDims.innerHTML = '<strong>' + Math.round(sel.w) + ' &times; ' + Math.round(sel.h) + ' px</strong>';
    btnCropDl.disabled = false;
  }

  function clearPreview() {
    previewCanvas.style.display = 'none';
    previewEmptyMini.style.display = 'block';
    previewDims.innerHTML = '';
    previewMini.classList.remove('jpg-bg');
    btnCropDl.disabled = true;
  }

  /* ── Get cropped canvas (actual image pixels) ── */
  function getCroppedCanvas() {
    // Draw full image with transforms into an offscreen canvas
    const [dw, dh] = displayDims();
    const full = document.createElement('canvas');
    full.width = dw; full.height = dh;
    const fctx = full.getContext('2d');
    drawTransformedImage(fctx, dw, dh, 1);

    // Crop from selection
    const out = document.createElement('canvas');
    const sx = Math.max(0, Math.round(sel.x));
    const sy = Math.max(0, Math.round(sel.y));
    const sw2 = Math.min(Math.round(sel.w), dw - sx);
    const sh2 = Math.min(Math.round(sel.h), dh - sy);
    out.width = sw2; out.height = sh2;
    out.getContext('2d').drawImage(full, sx, sy, sw2, sh2, 0, 0, sw2, sh2);
    return out;
  }

  /* ── Download ── */
  btnCropDl.addEventListener('click', () => {
    if (!sel || !img) return;
    const cropped = getCroppedCanvas();
    const mime = getMime();
    const qual = mime === 'image/png' ? undefined : parseInt(qualSlider.value)/100;
    cropped.toBlob(blob => {
      if (!blob) { showErr('Bu formatda rasmni yaratib bo\'lmadi. PNG yoki JPG tanlab ko\'ring.'); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = originalName + '-crop.' + getExt();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('Yuklab olindi', 'ok');
    }, mime, qual);
  });

  btnReset.addEventListener('click', () => {
    img=null; sel=null; rotation=0; flipH=false; flipV=false; scale=1;
    mainCanvas.width=10; mainCanvas.height=10;
    ctx.clearRect(0,0,10,10);
    canvasEmpty.classList.remove('hide');
    clearPreview(); updateInputs();
    clearErr();
  });

  function getMime() {
    const v = selFmt.value;
    if (v==='png') return 'image/png';
    if (v==='webp') return 'image/webp';
    return 'image/jpeg';
  }

  function getExt() {
    const v = selFmt.value;
    return v === 'png' || v === 'webp' ? v : 'jpg';
  }

  function drawTransformedImage(targetCtx, canvasW, canvasH, drawScale) {
    targetCtx.save();
    targetCtx.translate(canvasW / 2, canvasH / 2);
    targetCtx.rotate(rotation * Math.PI / 180);
    if (flipH) targetCtx.scale(-1, 1);
    if (flipV) targetCtx.scale(1, -1);
    targetCtx.drawImage(
      img,
      -origW * drawScale / 2,
      -origH * drawScale / 2,
      origW * drawScale,
      origH * drawScale
    );
    targetCtx.restore();
  }

  /* ── Resize observer ── */
  const ro = new ResizeObserver(() => { if(img) fitCanvas(); });
  ro.observe(canvasWrap);

  /* ── Helpers ── */
  function showErr(m){errBox.textContent=m;errBox.classList.add('show');}
  function clearErr(){errBox.textContent='';errBox.classList.remove('show');}
  let _tt;
  function toast(msg,type){
    clearTimeout(_tt);toastEl.textContent=msg;
    toastEl.className='toast show'+(type?' '+type:'');
    _tt=setTimeout(()=>toastEl.classList.remove('show'),2800);
  }

})();
