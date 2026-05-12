/**
 * toolbase.uz — Rasm Siqish (Image Compress)
 * Canvas API toBlob() — quality slider, format tanlash
 * Before/After preview, batch 20ta, ZIP yuklab olish
 * 100% client-side, serverga yuborilmaydi
 */
(function(){
'use strict';

/* ── State ── */
let files = [];
let currentPreviewIdx = -1;
let currentOrigImg = null;
let previewMode = 'after'; // 'before' | 'after'
let idSeq = 0;

/* ── DOM ── */
const $ = id => document.getElementById(id);
const dropZone    = $('dropZone');
const fileInput   = $('fileInput');
const fileList    = $('fileList');
const countBadge  = $('countBadge');
const countText   = $('countText');
const errBox      = $('errBox');
const qualSlider  = $('qualSlider');
const qualPct     = $('qualPct');
const qualHint    = $('qualHint');
const fmtSelect   = $('fmtSelect');
const btnGo       = $('btnGo');
const btnClear    = $('btnClear');
const progWrap    = $('progWrap');
const progFill    = $('progFill');
const progLabel   = $('progLabel');
const resultCard  = $('resultCard');
const rcOrigSz    = $('rcOrigSz');
const rcNewSz     = $('rcNewSz');
const rcSaved     = $('rcSaved');
const btnZip      = $('btnZip');
const pvCanvas    = $('pvCanvas');
const pvEmpty     = $('pvEmpty');
const pvWrap      = $('pvWrap');
const pvOrigSz    = $('pvOrigSz');
const pvNewSz     = $('pvNewSz');
const pvSaved     = $('pvSaved');
const toastEl     = $('toast');

/* ── Quality slider ── */
const HINTS = {
  90: 'Maksimal sifat. Minimal siqish.',
  80: 'Tavsiya: sifat a\'lo, hajm 50% kichik.',
  70: 'Yaxshi balans. Veb uchun optimal.',
  60: 'Kichik hajm. Sifat biroz pasayadi.',
  50: 'Kichik hajm. Ko\'rinishda farq bo\'ladi.',
};
qualSlider.addEventListener('input', () => {
  const v = +qualSlider.value;
  qualPct.textContent = v + '%';
  const closest = Object.keys(HINTS).reduce((a,b) => Math.abs(b-v)<Math.abs(a-v)?b:a);
  qualHint.textContent = HINTS[closest];
  refreshPreview();
});
fmtSelect.addEventListener('change', refreshPreview);

/* ── Drop & input ── */
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
['dragleave','dragend'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over')));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); addFiles([...e.dataTransfer.files]); });
fileInput.addEventListener('change', () => { addFiles([...fileInput.files]); fileInput.value=''; });

function addFiles(incoming) {
  clearErr();
  const imgs = incoming.filter(f => f.type.startsWith('image/'));
  if (!imgs.length) { showErr('Faqat rasm fayllari qabul qilinadi.'); return; }
  const free = 20 - files.length;
  if (free <= 0) { showErr('Maksimal 20 ta rasm.'); return; }
  imgs.slice(0, free).forEach(f => {
    if (f.size > 80*1024*1024) return;
    const id = ++idSeq;
    const url = URL.createObjectURL(f);
    files.push({ id, file:f, url, blob:null, status:'pending' });
    addRow(files[files.length-1]);
  });
  renderUI();
  if (currentPreviewIdx < 0 && files.length > 0) selectFile(0);
}

function addRow(item) {
  const row = document.createElement('div');
  row.className = 'file-row';
  row.id = 'row-'+item.id;
  row.innerHTML =
    `<img class="file-thumb" src="${item.url}" alt="" />` +
    `<div class="fi-info">` +
      `<div class="fi-name">${esc(item.file.name)}</div>` +
      `<div class="fi-meta" id="meta-${item.id}">${fmtSz(item.file.size)}</div>` +
      `<div class="fi-savings" id="sav-${item.id}" style="display:none"></div>` +
    `</div>` +
    `<div class="file-acts">` +
      `<button class="fa-btn dl" id="dl-${item.id}" title="Yuklab olish" style="display:none">${svgDl()}</button>` +
      `<button class="fa-btn rm" data-id="${item.id}" title="O'chirish">${svgRm()}</button>` +
    `</div>`;
  row.addEventListener('click', e => { if (e.target.closest('.fa-btn')) return; const i=files.findIndex(f=>f.id===item.id); if(i>=0) selectFile(i); });
  row.querySelector('.rm').addEventListener('click', () => delFile(item.id));
  row.querySelector(`#dl-${item.id}`).addEventListener('click', () => { if(item.blob) dlBlob(item.blob, outName(item.file.name)); });
  fileList.appendChild(row);
}

function delFile(id) {
  const idx = files.findIndex(f=>f.id===id);
  files = files.filter(f=>f.id!==id);
  $('row-'+id)?.remove();
  if (currentPreviewIdx >= idx) currentPreviewIdx = Math.min(currentPreviewIdx, files.length-1);
  if (!files.length) { currentPreviewIdx=-1; clearPreview(); }
  else selectFile(Math.max(0, currentPreviewIdx));
  renderUI();
}

function selectFile(idx) {
  currentPreviewIdx = idx;
  document.querySelectorAll('.file-row').forEach(r=>r.classList.remove('active'));
  if (files[idx]) {
    $('row-'+files[idx].id)?.classList.add('active');
    const img = new Image(); img.onload = () => { currentOrigImg=img; refreshPreview(); }; img.src = files[idx].url;
  }
}

function renderUI() {
  const n = files.length;
  countBadge.classList.toggle('show', n>0);
  countText.textContent = n + ' ta rasm';
  btnGo.disabled = !n;
  if (!n) { resultCard.classList.remove('show'); progWrap.classList.remove('show'); }
}

/* ── LIVE PREVIEW ── */
let _pvDebounce;
function refreshPreview() {
  clearTimeout(_pvDebounce);
  _pvDebounce = setTimeout(_doPreview, 80);
}

async function _doPreview() {
  if (!currentOrigImg) { clearPreview(); return; }
  pvEmpty.style.display = 'none';

  const img = currentOrigImg;
  if (previewMode === 'before') {
    pvCanvas.width = Math.min(img.naturalWidth, 600);
    pvCanvas.height = Math.round(img.naturalHeight * pvCanvas.width / img.naturalWidth);
    const ctx = pvCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, pvCanvas.width, pvCanvas.height);
    pvCanvas.style.display = 'block';
    pvOrigSz.textContent = fmtSz(files[currentPreviewIdx]?.file.size||0);
    pvNewSz.textContent = '—';
    pvSaved.textContent = '—'; pvSaved.className='pvs-val muted';
    return;
  }

  // After mode
  const blob = await compressImg(img, +qualSlider.value/100, getMime());
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const pImg = new Image();
  pImg.onload = () => {
    pvCanvas.width = Math.min(pImg.naturalWidth, 600);
    pvCanvas.height = Math.round(pImg.naturalHeight * pvCanvas.width / pImg.naturalWidth);
    pvCanvas.getContext('2d').drawImage(pImg, 0, 0, pvCanvas.width, pvCanvas.height);
    pvCanvas.style.display='block';
    URL.revokeObjectURL(url);
    const origSz = files[currentPreviewIdx]?.file.size||1;
    const ratio = Math.round((1-blob.size/origSz)*100);
    pvOrigSz.textContent = fmtSz(origSz);
    pvNewSz.textContent  = fmtSz(blob.size);
    pvSaved.textContent  = ratio>0 ? '-'+ratio+'%' : '±0%';
    pvSaved.className    = 'pvs-val' + (ratio>0?' green':'');
  };
  pImg.src = url;
}

function clearPreview() {
  pvCanvas.style.display='none';
  pvEmpty.style.display='flex';
  currentOrigImg=null;
  pvOrigSz.textContent=pvNewSz.textContent=pvSaved.textContent='—';
}

/* ── Preview tabs ── */
document.querySelectorAll('.pv-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pv-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    previewMode = tab.dataset.mode;
    refreshPreview();
  });
});

/* ── Compress function ── */
function compressImg(img, quality, mime) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    canvas.toBlob(b => resolve(b), mime, mime==='image/png'?undefined:quality);
  });
}

/* ── Batch process ── */
btnGo.addEventListener('click', runBatch);
btnClear.addEventListener('click', () => { files=[]; currentPreviewIdx=-1; fileList.innerHTML=''; clearPreview(); renderUI(); resultCard.classList.remove('show'); progWrap.classList.remove('show'); clearErr(); toast('Tozalandi',''); });

async function runBatch() {
  clearErr(); resultCard.classList.remove('show');
  if(!files.length) return;
  btnGo.disabled=true;
  progWrap.classList.add('show'); progFill.style.width='0%';

  let done=0, totalOrig=0, totalNew=0;
  for (const item of files) {
    setStatus(item.id,'processing');
    const img = await loadImg(item.url);
    const blob = await compressImg(img, +qualSlider.value/100, getMime());
    item.blob = blob; done++;
    totalOrig += item.file.size;
    totalNew  += blob.size;
    progFill.style.width = Math.round(done/files.length*100)+'%';
    progLabel.textContent = done+' / '+files.length;
    setStatus(item.id,'done');
    const sav = $('sav-'+item.id);
    const ratio = Math.round((1-blob.size/item.file.size)*100);
    if(sav){ sav.textContent = ratio>0 ? '↓ '+ratio+'% kichik':'±0%'; sav.style.display='block'; }
    const dlBtn = $('dl-'+item.id);
    if(dlBtn) dlBtn.style.display='flex';
  }

  btnGo.disabled=false;
  progWrap.classList.remove('show');
  resultCard.classList.add('show');
  rcOrigSz.textContent = fmtSz(totalOrig);
  rcNewSz.textContent  = fmtSz(totalNew);
  const saved = Math.round((1-totalNew/totalOrig)*100);
  rcSaved.textContent = saved>0 ? saved+'% tejaldi' : '±0%';
  rcSaved.className = 'rcs-val'+(saved>0?' green':'');
  toast('✓ '+done+' ta siqildi!','ok');
  if(currentPreviewIdx>=0) refreshPreview();
}

/* ── ZIP download ── */
btnZip.addEventListener('click', async () => {
  const ready = files.filter(f=>f.blob);
  if(!ready.length) return;
  btnZip.disabled=true; btnZip.innerHTML='<span class="spin">↻</span> Tayyorlanmoqda…';
  const zip = new window.JSZip();
  ready.forEach(item => zip.file(outName(item.file.name), item.blob));
  const blob = await zip.generateAsync({type:'blob',compression:'DEFLATE'});
  dlBlob(blob,'toolbase-siqilgan.zip');
  btnZip.disabled=false; btnZip.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ZIP yuklab olish';
  toast('ZIP tayyor!','ok');
});

/* ── Helpers ── */
function getMime(){
  const v=fmtSelect.value;
  if(v==='jpg'||v==='jpeg') return 'image/jpeg';
  if(v==='png') return 'image/png';
  if(v==='webp') return 'image/webp';
  // auto: keep original
  if(files[currentPreviewIdx]) {
    const t=files[currentPreviewIdx].file.type;
    return t||'image/jpeg';
  }
  return 'image/jpeg';
}
function outName(name){
  const dot=name.lastIndexOf('.');
  const base=dot>-1?name.slice(0,dot):name;
  const v=fmtSelect.value;
  const ext=v==='auto'?(dot>-1?name.slice(dot+1):'jpg'):v;
  return base+'-siqilgan.'+ext;
}
function loadImg(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
function dlBlob(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),5000); }
function fmtSz(b){ if(!b) return '0 B'; if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(2)+' MB'; }
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function svgDl(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'; }
function svgRm(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>'; }
function setStatus(id,st){
  const row=$('row-'+id); if(!row) return;
  row.className='file-row'+(st==='done'?' done':st==='processing'?' processing':'');
}
function showErr(m){ errBox.textContent=m; errBox.classList.add('show'); }
function clearErr(){ errBox.textContent=''; errBox.classList.remove('show'); }
let _tt;
function toast(msg,type){ clearTimeout(_tt); toastEl.textContent=msg; toastEl.className='toast show'+(type?' '+type:''); _tt=setTimeout(()=>toastEl.classList.remove('show'),3000); }

renderUI();
})();
