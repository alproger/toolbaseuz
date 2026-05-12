/**
 * toolbase.uz — Rang Konvertori + Color Picker + CSS Gradient
 * 100% client-side, vanilla JS, Canvas API
 */
(function () {
  'use strict';

  /* ══════════════════════════════════
     SECTION TABS
  ══════════════════════════════════ */
  document.querySelectorAll('.s-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.s-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.s-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
    });
  });

  /* ══════════════════════════════════
     PANEL 1: RANG KONVERTORI
  ══════════════════════════════════ */

  // --- State ---
  let currentHex = '#0891b2';
  let colorHistory = [];
  const MAX_HIST = 16;

  // --- DOM ---
  const colorPicker    = document.getElementById('colorPicker');
  const colorPreviewBig= document.getElementById('colorPreviewBig');
  const cpbHex         = document.getElementById('cpbHex');
  const hexInput       = document.getElementById('hexInput');
  const rInput = document.getElementById('rInput');
  const gInput = document.getElementById('gInput');
  const bInput = document.getElementById('bInput');
  const rgbInput       = document.getElementById('rgbInput');
  const hInput = document.getElementById('hInput');
  const sInput = document.getElementById('sInput');
  const lInput = document.getElementById('lInput');
  const hslInput       = document.getElementById('hslInput');
  const cmykInput      = document.getElementById('cmykInput');
  const hsvInput       = document.getElementById('hsvInput');
  const historyRow     = document.getElementById('historyRow');
  const namedSearch    = document.getElementById('namedSearch');
  const namedGrid      = document.getElementById('namedGrid');

  // --- Conversion functions ---
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex, 16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  }
  function rgbToHex({r,g,b}) {
    return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  function rgbToHsl({r,g,b}) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}
    else{
      const d=max-min; s=l>.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}
      h/=6;
    }
    return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
  }
  function hslToRgb({h,s,l}) {
    s/=100; l/=100;
    const k=n=>(n+h/30)%12;
    const a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return{r:Math.round(f(0)*255),g:Math.round(f(8)*255),b:Math.round(f(4)*255)};
  }
  function rgbToHsv({r,g,b}) {
    r/=255;g/=255;b/=255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
    let h=0,s=max===0?0:d/max,v=max;
    if(d!==0){switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h/=6;}
    return{h:Math.round(h*360),s:Math.round(s*100),v:Math.round(v*100)};
  }
  function rgbToCmyk({r,g,b}) {
    r/=255;g/=255;b/=255;
    const k=1-Math.max(r,g,b);
    if(k===1) return{c:0,m:0,y:0,k:100};
    return{c:Math.round((1-r-k)/(1-k)*100),m:Math.round((1-g-k)/(1-k)*100),y:Math.round((1-b-k)/(1-k)*100),k:Math.round(k*100)};
  }
  function getLuma({r,g,b}){ return 0.299*r+0.587*g+0.114*b; }
  function isValidHex(h){ return /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(h); }

  // --- Update all outputs from hex ---
  function applyColor(hex, source) {
    if(!hex.startsWith('#')) hex='#'+hex;
    if(!isValidHex(hex)) return;
    if(hex.length===4) hex='#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
    currentHex=hex.toLowerCase();
    const rgb=hexToRgb(currentHex);
    const hsl=rgbToHsl(rgb);
    const hsv=rgbToHsv(rgb);
    const cmyk=rgbToCmyk(rgb);
    const dark=getLuma(rgb)<128;

    // Preview
    colorPreviewBig.style.background=currentHex;
    cpbHex.textContent=currentHex.toUpperCase();
    cpbHex.style.color=dark?'#fff':'#111';

    // Inputs
    if(source!=='hex') hexInput.value=currentHex;
    if(source!=='rgb'){rInput.value=rgb.r;gInput.value=rgb.g;bInput.value=rgb.b;}
    if(source!=='hsl'){hInput.value=hsl.h;sInput.value=hsl.s;lInput.value=hsl.l;}
    rgbInput.value=`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslInput.value=`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    cmykInput.value=`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    hsvInput.value=`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;

    // Native picker sync
    if(source!=='picker') colorPicker.value=currentHex;

    // History
    addHistory(currentHex);
  }

  // --- Input listeners ---
  colorPicker.addEventListener('input', () => applyColor(colorPicker.value, 'picker'));
  hexInput.addEventListener('input', () => {
    const v = hexInput.value.trim();
    if(isValidHex(v)) { hexInput.classList.add('valid'); hexInput.classList.remove('invalid'); applyColor(v,'hex'); }
    else { hexInput.classList.add('invalid'); hexInput.classList.remove('valid'); }
  });
  [rInput,gInput,bInput].forEach(inp => inp.addEventListener('input', () => {
    const r=+rInput.value,g=+gInput.value,b=+bInput.value;
    if([r,g,b].every(v=>v>=0&&v<=255)) applyColor(rgbToHex({r,g,b}),'rgb');
  }));
  [hInput,sInput,lInput].forEach(inp => inp.addEventListener('input', () => {
    const h=+hInput.value,s=+sInput.value,l=+lInput.value;
    if(h>=0&&h<=360&&s>=0&&s<=100&&l>=0&&l<=100)
      applyColor(rgbToHex(hslToRgb({h,s,l})),'hsl');
  }));

  // --- Copy buttons ---
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.copy);
      if(!target) return;
      const txt = target.value || target.textContent;
      copyText(txt, btn);
    });
  });
  cpbHex.addEventListener('click', () => copyText(currentHex.toUpperCase()));

  // --- History ---
  function addHistory(hex) {
    colorHistory = colorHistory.filter(h=>h!==hex);
    colorHistory.unshift(hex);
    if(colorHistory.length>MAX_HIST) colorHistory.pop();
    renderHistory();
  }
  function renderHistory() {
    historyRow.innerHTML = '';
    colorHistory.forEach(hex => {
      const sw = document.createElement('div');
      sw.className='hist-swatch'; sw.style.background=hex; sw.title=hex;
      sw.addEventListener('click',()=>applyColor(hex,'history'));
      historyRow.appendChild(sw);
    });
  }

  // --- Named colors ---
  const NAMED = [
    ['Qizil','#ff0000'],['Yashil','#008000'],['Ko\'k','#0000ff'],['Sariq','#ffff00'],
    ['To\'q sariq','#ff8c00'],['Binafsha','#8b008b'],['Jigarrang','#a52a2a'],['Kulrang','#808080'],
    ['Oq','#ffffff'],['Qora','#000000'],['Moviy','#00bcd4'],['Pushti','#ff69b4'],
    ['Och yashil','#90ee90'],['Limon','#fff44f'],['Krем','#fffdd0'],['Lavanda','#e6e6fa'],
    ['Olcha','#800000'],['Tarvuz','#fc6c85'],['Ko\'k-yashil','#008080'],['Zangori','#87ceeb'],
    ['Indigo','#4b0082'],['Zafaron','#ff6600'],['Misrang','#b87333'],['Kumush','#c0c0c0'],
    ['Oltin','#ffd700'],['Limon yashil','#32cd32'],['Coral','#ff7f50'],['Salmon','#fa8072'],
    ['Khaki','#f0e68c'],['Feruza','#40e0d0'],['Violet','#ee82ee'],['Maroon','#800000'],
    ['Navy','#000080'],['Olive','#808000'],['Aqua','#00ffff'],['Fuchsia','#ff00ff'],
  ];
  function renderNamed(filter='') {
    namedGrid.innerHTML='';
    const f=filter.toLowerCase();
    NAMED.filter(([n,h])=>!f||n.toLowerCase().includes(f)||h.includes(f)).forEach(([name,hex])=>{
      const item=document.createElement('div');item.className='nc-swatch';
      item.innerHTML=`<div class="nc-color" style="background:${hex}"></div><div class="nc-name">${name}</div>`;
      item.title=`${name} ${hex}`;
      item.addEventListener('click',()=>applyColor(hex,'named'));
      namedGrid.appendChild(item);
    });
  }
  namedSearch.addEventListener('input',()=>renderNamed(namedSearch.value));
  renderNamed();

  // Init
  applyColor('#0891b2','init');

  /* ══════════════════════════════════
     PANEL 2: CSS GRADIENT GENERATOR
  ══════════════════════════════════ */

  let gradType  = 'linear';
  let gradAngle = 135;
  let stops = [
    { color:'#0891b2', pos:0 },
    { color:'#7c3aed', pos:100 },
  ];

  const gradPreview  = document.getElementById('gradPreview');
  const gradAngleSlider = document.getElementById('gradAngleSlider');
  const gradAngleVal = document.getElementById('gradAngleVal');
  const angleCtrl    = document.getElementById('angleCtrl');
  const stopsList    = document.getElementById('stopsList');
  const btnAddStop   = document.getElementById('btnAddStop');
  const cssCodeEl    = document.getElementById('cssCode');
  const btnCopyCss   = document.getElementById('btnCopyCss');
  const gradPresetsEl= document.getElementById('gradPresets');

  // Type buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      gradType=btn.dataset.type;
      angleCtrl.classList.toggle('hidden', gradType!=='linear');
      updateGrad();
    });
  });

  // Angle
  gradAngleSlider.addEventListener('input',()=>{
    gradAngle=+gradAngleSlider.value;
    gradAngleVal.textContent=gradAngle+'°';
    updateGrad();
  });

  // Stops
  btnAddStop.addEventListener('click',()=>{
    const mid = stops.length>0 ? Math.round((stops[0].pos+stops[stops.length-1].pos)/2) : 50;
    stops.push({color:'#ec4899',pos:mid});
    stops.sort((a,b)=>a.pos-b.pos);
    renderStops();updateGrad();
  });

  function renderStops(){
    stopsList.innerHTML='';
    stops.forEach((stop,i)=>{
      const row=document.createElement('div');row.className='stop-row';
      row.innerHTML=
        `<div class="stop-color-pick" style="background:${stop.color}"><input type="color" value="${stop.color}" /></div>`+
        `<input class="fmt-input stop-pos" type="number" min="0" max="100" value="${stop.pos}" />`+
        `<span class="stop-pct">%</span>`+
        (stops.length>2?`<button class="stop-del" title="O'chirish"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`:'');

      row.querySelector('input[type=color]').addEventListener('input',e=>{
        stop.color=e.target.value;
        row.querySelector('.stop-color-pick').style.background=stop.color;
        updateGrad();
      });
      row.querySelector('.stop-pos').addEventListener('input',e=>{
        stop.pos=Math.max(0,Math.min(100,+e.target.value));
        updateGrad();
      });
      const delBtn=row.querySelector('.stop-del');
      if(delBtn) delBtn.addEventListener('click',()=>{stops.splice(i,1);renderStops();updateGrad();});
      stopsList.appendChild(row);
    });
  }

  function buildGradCss(){
    const sorted=[...stops].sort((a,b)=>a.pos-b.pos);
    const stopsStr=sorted.map(s=>`${s.color} ${s.pos}%`).join(', ');
    if(gradType==='linear') return `linear-gradient(${gradAngle}deg, ${stopsStr})`;
    if(gradType==='radial')  return `radial-gradient(circle, ${stopsStr})`;
    if(gradType==='conic')   return `conic-gradient(from ${gradAngle}deg, ${stopsStr})`;
    return `linear-gradient(${gradAngle}deg, ${stopsStr})`;
  }

  function updateGrad(){
    const css=buildGradCss();
    gradPreview.style.background=css;
    const fullCss=`background: ${css};\nbackground: -webkit-${css};`;
    cssCodeEl.innerHTML=`<span class="css-prop">background</span>: <span class="css-val">${css}</span>;\n<span class="css-prop">background</span>: <span class="css-val">-webkit-${css}</span>;`;
    btnCopyCss.dataset.raw=fullCss;
  }

  btnCopyCss.addEventListener('click',()=>{
    copyText(btnCopyCss.dataset.raw||'', btnCopyCss);
  });

  // Gradient presets
  const GRAD_PRESETS = [
    {name:'Ocean',     stops:[{color:'#0891b2',pos:0},{color:'#0e7490',pos:100}], angle:135},
    {name:'Sunset',    stops:[{color:'#f97316',pos:0},{color:'#ec4899',pos:100}], angle:135},
    {name:'Forest',    stops:[{color:'#16a34a',pos:0},{color:'#0891b2',pos:100}], angle:135},
    {name:'Violet',    stops:[{color:'#7c3aed',pos:0},{color:'#ec4899',pos:100}], angle:135},
    {name:'Gold',      stops:[{color:'#f59e0b',pos:0},{color:'#ef4444',pos:100}], angle:90},
    {name:'Night',     stops:[{color:'#1e1b4b',pos:0},{color:'#312e81',pos:50},{color:'#1e1b4b',pos:100}], angle:135},
    {name:'Peach',     stops:[{color:'#fde68a',pos:0},{color:'#fb923c',pos:100}], angle:135},
    {name:'Aurora',    stops:[{color:'#6ee7b7',pos:0},{color:'#3b82f6',pos:50},{color:'#a78bfa',pos:100}], angle:135},
    {name:'Rose',      stops:[{color:'#fce7f3',pos:0},{color:'#ec4899',pos:100}], angle:135},
    {name:'Steel',     stops:[{color:'#94a3b8',pos:0},{color:'#334155',pos:100}], angle:135},
    {name:'Lemon',     stops:[{color:'#fef08a',pos:0},{color:'#84cc16',pos:100}], angle:135},
    {name:'Berry',     stops:[{color:'#8b5cf6',pos:0},{color:'#06b6d4',pos:100}], angle:135},
  ];
  GRAD_PRESETS.forEach(p=>{
    const item=document.createElement('div');item.className='gp-item';item.title=p.name;
    const preview=`linear-gradient(${p.angle||135}deg,${p.stops.map(s=>s.color+' '+s.pos+'%').join(',')})`;
    item.style.background=preview;
    item.addEventListener('click',()=>{
      stops=p.stops.map(s=>({...s}));
      if(p.angle!==undefined){gradAngle=p.angle;gradAngleSlider.value=p.angle;gradAngleVal.textContent=p.angle+'°';}
      renderStops();updateGrad();
    });
    gradPresetsEl.appendChild(item);
  });

  // Init gradient
  renderStops();
  updateGrad();

  /* ══════════════════════════════════
     SHARED HELPERS
  ══════════════════════════════════ */
  function copyText(txt, btn) {
    if(!txt) return;
    navigator.clipboard.writeText(txt).then(()=>{
      toast('Nusxalandi!','ok');
      if(btn){const old=btn.textContent;btn.textContent='✓';setTimeout(()=>btn.textContent=old,1500);}
    }).catch(()=>{
      // Fallback
      const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      toast('Nusxalandi!','ok');
    });
  }

  let _tt;
  function toast(msg,type){
    clearTimeout(_tt);const el=document.getElementById('toast');
    el.textContent=msg;el.className='toast show'+(type?' '+type:'');
    _tt=setTimeout(()=>el.classList.remove('show'),2500);
  }

})();
