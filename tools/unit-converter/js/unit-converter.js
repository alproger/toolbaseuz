/**
 * toolbase.uz — O'lchov Konvertori
 * Kategoriyalar: uzunlik, vazn, harorat, hajm, maydon, tezlik, vaqt
 * 100% client-side, vanilla JS
 */
(function(){
'use strict';

/* ── Conversion data ── */
const CATS = {
  uzunlik: {
    label:'Uzunlik', icon:'📏',
    base:'m',  // metr
    units:{
      'km'   :{label:'Kilometr (km)',     to:1e3,    sym:'km'},
      'm'    :{label:'Metr (m)',          to:1,      sym:'m'},
      'cm'   :{label:'Santimetr (cm)',    to:0.01,   sym:'cm'},
      'mm'   :{label:'Millimetr (mm)',    to:0.001,  sym:'mm'},
      'mi'   :{label:'Mil (mi)',          to:1609.344,sym:'mi'},
      'yd'   :{label:'Yard (yd)',         to:0.9144, sym:'yd'},
      'ft'   :{label:'Fut (ft)',          to:0.3048, sym:'ft'},
      'in'   :{label:'Dyuym (in)',        to:0.0254, sym:'in'},
      'nm'   :{label:'Dengiz mili (nm)', to:1852,   sym:'nm'},
      'ly'   :{label:'Yorug\'lik yili',  to:9.461e15,sym:'ly'},
    },
    quick:[['1 km','mi'],['1 mi','km'],['1 m','ft'],['1 ft','m'],['1 in','cm'],['1 cm','in']],
  },
  vazn: {
    label:'Vazn / Massa', icon:'⚖️',
    base:'kg',
    units:{
      't'    :{label:'Tonna (t)',        to:1000,   sym:'t'},
      'kg'   :{label:'Kilogram (kg)',    to:1,      sym:'kg'},
      'g'    :{label:'Gram (g)',         to:0.001,  sym:'g'},
      'mg'   :{label:'Milligram (mg)',   to:1e-6,   sym:'mg'},
      'lb'   :{label:'Funt (lb)',        to:0.453592,sym:'lb'},
      'oz'   :{label:'Untsiya (oz)',     to:0.0283495,sym:'oz'},
      'st'   :{label:'Stoun (st)',       to:6.35029, sym:'st'},
    },
    quick:[['1 kg','lb'],['1 lb','kg'],['1 kg','oz'],['1 t','kg'],['1 g','oz'],['1 oz','g']],
  },
  harorat: {
    label:'Harorat', icon:'🌡️',
    base:'C',
    units:{
      'C':{label:'Celsius (°C)',    to:null, sym:'°C'},
      'F':{label:'Fahrenheit (°F)',to:null, sym:'°F'},
      'K':{label:'Kelvin (K)',      to:null, sym:'K'},
    },
    quick:[['0 °C','°F'],['100 °C','°F'],['37 °C','°F'],['32 °F','°C'],['98.6 °F','°C'],['273.15 K','°C']],
    convert:(val,from,to)=>{
      let c;
      if(from==='C') c=val;
      else if(from==='F') c=(val-32)*5/9;
      else c=val-273.15;
      if(to==='C') return c;
      if(to==='F') return c*9/5+32;
      return c+273.15;
    },
  },
  hajm: {
    label:'Hajm / Sig\'im', icon:'🧊',
    base:'l',
    units:{
      'm3'  :{label:'Kub metr (m³)',    to:1000,    sym:'m³'},
      'l'   :{label:'Litr (L)',         to:1,       sym:'L'},
      'ml'  :{label:'Millilitr (mL)',   to:0.001,   sym:'mL'},
      'gal_us':{label:'Gallon (AQSh)', to:3.78541, sym:'gal'},
      'qt'  :{label:'Quart (qt)',       to:0.946353,sym:'qt'},
      'pt'  :{label:'Pinta (pt)',       to:0.473176,sym:'pt'},
      'fl_oz':{label:'Suyuq untsiya',  to:0.0295735,sym:'fl oz'},
      'cup' :{label:'Chashka (cup)',    to:0.236588,sym:'cup'},
      'tbsp':{label:'Osh qoshiq',      to:0.0147868,sym:'tbsp'},
      'tsp' :{label:'Choy qoshiq',     to:0.00492892,sym:'tsp'},
    },
    quick:[['1 L','gal'],['1 gal','L'],['1 m³','L'],['1 cup','mL'],['1 L','fl oz'],['1 tbsp','mL']],
  },
  maydon: {
    label:'Maydon', icon:'📐',
    base:'m2',
    units:{
      'km2' :{label:'Kv. kilometr',  to:1e6,   sym:'km²'},
      'ha'  :{label:'Gektar (ha)',   to:10000, sym:'ha'},
      'm2'  :{label:'Kv. metr (m²)',to:1,     sym:'m²'},
      'cm2' :{label:'Kv. sm (cm²)', to:0.0001,sym:'cm²'},
      'mm2' :{label:'Kv. mm',       to:1e-6,  sym:'mm²'},
      'mi2' :{label:'Kv. mil',      to:2589988,sym:'mi²'},
      'acre':{label:'Akr (acre)',    to:4046.86,sym:'acre'},
      'ft2' :{label:'Kv. fut (ft²)',to:0.0929,sym:'ft²'},
      'in2' :{label:'Kv. dyuym',    to:6.452e-4,sym:'in²'},
    },
    quick:[['1 ha','m²'],['1 km²','ha'],['1 acre','m²'],['1 m²','ft²'],['1 km²','mi²'],['1 ft²','m²']],
  },
  tezlik: {
    label:'Tezlik', icon:'🚀',
    base:'mps',
    units:{
      'kmh' :{label:'km/soat',        to:1/3.6,   sym:'km/h'},
      'mps' :{label:'m/soniya',       to:1,       sym:'m/s'},
      'mph' :{label:'Mil/soat (mph)', to:0.44704, sym:'mph'},
      'kn'  :{label:'Tugun (knot)',   to:0.514444,sym:'kn'},
      'fts' :{label:'Fut/soniya',     to:0.3048,  sym:'ft/s'},
      'mach':{label:'Mach',           to:340.29,  sym:'Mach'},
      'c'   :{label:'Yorug\'lik tezl',to:3e8,     sym:'c'},
    },
    quick:[['100 km/h','mph'],['60 mph','km/h'],['1 m/s','km/h'],['1 kn','km/h'],['1 Mach','km/h'],['343 m/s','km/h']],
  },
  vaqt: {
    label:'Vaqt', icon:'⏱️',
    base:'s',
    units:{
      'yr'  :{label:'Yil',      to:31557600,sym:'yil'},
      'mo'  :{label:'Oy (≈30)', to:2592000, sym:'oy'},
      'wk'  :{label:'Hafta',    to:604800,  sym:'hafta'},
      'd'   :{label:'Kun',      to:86400,   sym:'kun'},
      'h'   :{label:'Soat',     to:3600,    sym:'soat'},
      'min' :{label:'Daqiqa',   to:60,      sym:'daqiqa'},
      's'   :{label:'Soniya',   to:1,       sym:'s'},
      'ms'  :{label:'Millison', to:0.001,   sym:'ms'},
    },
    quick:[['1 yil','kun'],['1 hafta','soat'],['1 soat','daqiqa'],['1 kun','soat'],['24 soat','daqiqa'],['1 min','s']],
  },
};

/* ── State ── */
let activeCat = 'uzunlik';
let fromUnit  = 'km';
let toUnit    = 'm';
let fromVal   = 1;

/* ── DOM ── */
const catTabs    = document.querySelectorAll('.cat-tab');
const fromSel    = document.getElementById('fromSel');
const toSel      = document.getElementById('toSel');
const fromInput  = document.getElementById('fromInput');
const resultEl   = document.getElementById('result');
const resultHint = document.getElementById('resultHint');
const formulaEl  = document.getElementById('formula');
const swapBtn    = document.getElementById('swapBtn');
const qrGrid     = document.getElementById('qrGrid');
const toast      = document.getElementById('copyFlash');

/* ── Category switch ── */
catTabs.forEach(tab => tab.addEventListener('click',()=>{
  catTabs.forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  activeCat = tab.dataset.cat;
  buildSelects();
  calc();
  buildQuick();
}));

function buildSelects(){
  const cat = CATS[activeCat];
  const units = Object.entries(cat.units);
  fromSel.innerHTML = units.map(([k,u])=>`<option value="${k}">${u.label}</option>`).join('');
  toSel.innerHTML   = units.map(([k,u])=>`<option value="${k}">${u.label}</option>`).join('');
  // Smart defaults
  const keys = units.map(([k])=>k);
  fromUnit = keys[0];
  toUnit   = keys[1] || keys[0];
  fromSel.value = fromUnit;
  toSel.value   = toUnit;
}

fromSel.addEventListener('change',()=>{ fromUnit=fromSel.value; calc(); });
toSel.addEventListener('change',()=>{ toUnit=toSel.value; calc(); });
fromInput.addEventListener('input',()=>{ fromVal=parseFloat(fromInput.value)||0; calc(); });
swapBtn.addEventListener('click',()=>{
  [fromUnit,toUnit]=[toUnit,fromUnit];
  fromSel.value=fromUnit; toSel.value=toUnit;
  fromVal = parseFloat(resultEl.dataset.raw)||0;
  fromInput.value = fmtNum(fromVal);
  calc();
});

/* ── Convert ── */
function convert(val,from,to,cat){
  if(cat.convert) return cat.convert(val,from,to);
  const base = val * cat.units[from].to;
  return base / cat.units[to].to;
}

function calc(){
  const cat = CATS[activeCat];
  const res = convert(fromVal, fromUnit, toUnit, cat);
  resultEl.dataset.raw = res;
  resultEl.textContent = fmtNum(res);
  const fSym = cat.units[fromUnit]?.sym || fromUnit;
  const tSym = cat.units[toUnit]?.sym   || toUnit;
  resultHint.textContent = `${fmtNum(fromVal)} ${fSym} = ${fmtNum(res)} ${tSym}`;
  // Formula
  if(cat.convert){
    const pairs={C:{F:'(x × 9/5) + 32',K:'x + 273.15'},F:{C:'(x − 32) × 5/9',K:'(x − 32) × 5/9 + 273.15'},K:{C:'x − 273.15',F:'(x − 273.15) × 9/5 + 32'}};
    formulaEl.innerHTML = `<strong>Formula:</strong> ${pairs[fromUnit]?.[toUnit]||'—'}`;
  } else {
    const ratio = convert(1,fromUnit,toUnit,cat);
    formulaEl.innerHTML = `<strong>1 ${fSym}</strong> = ${fmtNum(ratio)} ${tSym}`;
  }
}

function fmtNum(n){
  if(isNaN(n)||!isFinite(n)) return '—';
  if(Math.abs(n)===0) return '0';
  if(Math.abs(n)<0.000001||Math.abs(n)>=1e12) return n.toExponential(4);
  if(Math.abs(n)<0.01) return parseFloat(n.toPrecision(6)).toString();
  if(Number.isInteger(n)||Math.abs(n)>=10000) return n.toLocaleString('uz-UZ',{maximumFractionDigits:4});
  return parseFloat(n.toPrecision(8)).toString().replace(/\.?0+$/,'');
}

/* ── Quick reference ── */
function buildQuick(){
  const cat = CATS[activeCat];
  if(!cat.quick||!qrGrid) return;
  qrGrid.innerHTML='';
  cat.quick.forEach(([from,toLabel])=>{
    const num   = parseFloat(from);
    const fSym  = from.replace(/^[\d.\s]+/,'').trim();
    // find matching unit key
    const fromKey = Object.entries(cat.units).find(([,u])=>u.sym===fSym||u.label.includes(fSym))?.[0];
    const toKey   = Object.entries(cat.units).find(([,u])=>u.sym===toLabel||u.label.includes(toLabel))?.[0];
    if(!fromKey||!toKey) return;
    const res = convert(num,fromKey,toKey,cat);
    const tSym= cat.units[toKey].sym;
    const item=document.createElement('div');item.className='qr-item';
    item.innerHTML=`<span class="qr-from">${from}</span><span class="qr-arrow">→</span><span class="qr-to">${fmtNum(res)} ${tSym}</span>`;
    item.addEventListener('click',()=>{
      fromSel.value=fromKey; toSel.value=toKey;
      fromUnit=fromKey; toUnit=toKey;
      fromVal=num; fromInput.value=num;
      calc();
    });
    qrGrid.appendChild(item);
  });
}

/* ── Copy result ── */
resultEl.addEventListener('click',()=>{
  const txt=resultEl.textContent;
  if(!txt||txt==='—') return;
  navigator.clipboard.writeText(txt).catch(()=>{});
  showToast('Nusxalandi!','ok');
});

let _tt;
function showToast(msg,type){
  clearTimeout(_tt);
  toast.textContent=msg;toast.className='copy-flash show'+(type?' '+type:'');
  _tt=setTimeout(()=>toast.classList.remove('show'),2500);
}

/* ── Init ── */
buildSelects();
fromInput.value=1;
calc();
buildQuick();

})();
