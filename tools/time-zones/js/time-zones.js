/**
 * toolbase.uz — Vaqt Zonalari (World Clock)
 * 80+ shahar, live soat, night/dawn/day tema, pinning, qidiruv
 * Intl.DateTimeFormat orqali aniq vaqt
 */
(function(){
'use strict';

/* ══ ZONA MA'LUMOTLARI ══════════════════════════════════════════ */
const ZONES = [
  // O'rta Osiyo
  {city:"Toshkent",    country:"O'zbekiston", tz:"Asia/Tashkent",    r:"asia",  flag:"🇺🇿"},
  {city:"Samarqand",   country:"O'zbekiston", tz:"Asia/Samarkand",   r:"asia",  flag:"🇺🇿"},
  {city:"Almaty",      country:"Qozog'iston", tz:"Asia/Almaty",      r:"asia",  flag:"🇰🇿"},
  {city:"Bishkek",     country:"Qirg'iziston",tz:"Asia/Bishkek",     r:"asia",  flag:"🇰🇬"},
  {city:"Dushanbe",    country:"Tojikiston",  tz:"Asia/Dushanbe",    r:"asia",  flag:"🇹🇯"},
  {city:"Ashgabat",    country:"Turkmaniston",tz:"Asia/Ashgabat",    r:"asia",  flag:"🇹🇲"},
  {city:"Boku",        country:"Ozarbayjon",  tz:"Asia/Baku",        r:"asia",  flag:"🇦🇿"},
  {city:"Tehrон",      country:"Eron",        tz:"Asia/Tehran",      r:"mid",   flag:"🇮🇷"},
  {city:"Kobul",       country:"Afg'oniston", tz:"Asia/Kabul",       r:"asia",  flag:"🇦🇫"},
  {city:"Islamobod",   country:"Pokiston",    tz:"Asia/Karachi",     r:"asia",  flag:"🇵🇰"},
  {city:"Dehli",       country:"Hindiston",   tz:"Asia/Kolkata",     r:"asia",  flag:"🇮🇳"},
  {city:"Kolombo",     country:"Shri-Lanka",  tz:"Asia/Colombo",     r:"asia",  flag:"🇱🇰"},
  {city:"Daka",        country:"Bangladesh",  tz:"Asia/Dhaka",       r:"asia",  flag:"🇧🇩"},
  {city:"Yangon",      country:"Myanma",      tz:"Asia/Yangon",      r:"asia",  flag:"🇲🇲"},
  {city:"Bangkok",     country:"Tailand",     tz:"Asia/Bangkok",     r:"asia",  flag:"🇹🇭"},
  {city:"Pekin",       country:"Xitoy",       tz:"Asia/Shanghai",    r:"asia",  flag:"🇨🇳"},
  {city:"Singapur",    country:"Singapur",    tz:"Asia/Singapore",   r:"asia",  flag:"🇸🇬"},
  {city:"Xong-Kong",   country:"Xong-Kong",   tz:"Asia/Hong_Kong",   r:"asia",  flag:"🇭🇰"},
  {city:"Seul",        country:"Janubiy Koreya",tz:"Asia/Seoul",     r:"asia",  flag:"🇰🇷"},
  {city:"Tokio",       country:"Yaponiya",    tz:"Asia/Tokyo",       r:"asia",  flag:"🇯🇵"},
  // Yaqin Sharq
  {city:"Dubay",       country:"BAA",         tz:"Asia/Dubai",       r:"mid",   flag:"🇦🇪"},
  {city:"Riyadh",      country:"Saudiya Arabistoni",tz:"Asia/Riyadh",r:"mid",   flag:"🇸🇦"},
  {city:"Quvayt",      country:"Quvayt",      tz:"Asia/Kuwait",      r:"mid",   flag:"🇰🇼"},
  {city:"Bag'dod",     country:"Iroq",        tz:"Asia/Baghdad",     r:"mid",   flag:"🇮🇶"},
  {city:"Doha",        country:"Qatar",       tz:"Asia/Qatar",       r:"mid",   flag:"🇶🇦"},
  {city:"AmmOn",       country:"Iordaniya",   tz:"Asia/Amman",       r:"mid",   flag:"🇯🇴"},
  {city:"Bayrut",      country:"Livan",       tz:"Asia/Beirut",      r:"mid",   flag:"🇱🇧"},
  {city:"Tel-Aviv",    country:"Isroil",      tz:"Asia/Jerusalem",   r:"mid",   flag:"🇮🇱"},
  {city:"Maskat",      country:"Ummon",       tz:"Asia/Muscat",      r:"mid",   flag:"🇴🇲"},
  // Yevropa
  {city:"London",      country:"Britaniya",   tz:"Europe/London",    r:"eu",    flag:"🇬🇧"},
  {city:"Parij",       country:"Fransiya",    tz:"Europe/Paris",     r:"eu",    flag:"🇫🇷"},
  {city:"Berlin",      country:"Germaniya",   tz:"Europe/Berlin",    r:"eu",    flag:"🇩🇪"},
  {city:"Madrid",      country:"Ispaniya",    tz:"Europe/Madrid",    r:"eu",    flag:"🇪🇸"},
  {city:"Rim",         country:"Italiya",     tz:"Europe/Rome",      r:"eu",    flag:"🇮🇹"},
  {city:"Amsterdam",   country:"Niderlandiya",tz:"Europe/Amsterdam", r:"eu",    flag:"🇳🇱"},
  {city:"Bryussel",    country:"Belgiya",     tz:"Europe/Brussels",  r:"eu",    flag:"🇧🇪"},
  {city:"Vena",        country:"Avstriya",    tz:"Europe/Vienna",    r:"eu",    flag:"🇦🇹"},
  {city:"Zurix",       country:"Shveytsariya",tz:"Europe/Zurich",    r:"eu",    flag:"🇨🇭"},
  {city:"Stokgolm",    country:"Shvetsiya",   tz:"Europe/Stockholm", r:"eu",    flag:"🇸🇪"},
  {city:"Oslo",        country:"Norvegiya",   tz:"Europe/Oslo",      r:"eu",    flag:"🇳🇴"},
  {city:"Kopengagen",  country:"Daniya",      tz:"Europe/Copenhagen",r:"eu",    flag:"🇩🇰"},
  {city:"Varshava",    country:"Polsha",      tz:"Europe/Warsaw",    r:"eu",    flag:"🇵🇱"},
  {city:"Praga",       country:"Chexiya",     tz:"Europe/Prague",    r:"eu",    flag:"🇨🇿"},
  {city:"Moskva",      country:"Rossiya",     tz:"Europe/Moscow",    r:"eu",    flag:"🇷🇺"},
  {city:"Istanbul",    country:"Turkiya",     tz:"Europe/Istanbul",  r:"eu",    flag:"🇹🇷"},
  {city:"Afina",       country:"Gretsiya",    tz:"Europe/Athens",    r:"eu",    flag:"🇬🇷"},
  {city:"Kiyev",       country:"Ukraina",     tz:"Europe/Kiev",      r:"eu",    flag:"🇺🇦"},
  {city:"Minsk",       country:"Belarus",     tz:"Europe/Minsk",     r:"eu",    flag:"🇧🇾"},
  {city:"Tbilisi",     country:"Gruziya",     tz:"Asia/Tbilisi",     r:"eu",    flag:"🇬🇪"},
  {city:"Lisabon",     country:"Portugaliya", tz:"Europe/Lisbon",    r:"eu",    flag:"🇵🇹"},
  // Amerika
  {city:"Nyu-York",    country:"AQSh",        tz:"America/New_York", r:"am",    flag:"🇺🇸"},
  {city:"Los-Anjeles", country:"AQSh",        tz:"America/Los_Angeles",r:"am",  flag:"🇺🇸"},
  {city:"Chikago",     country:"AQSh",        tz:"America/Chicago",  r:"am",    flag:"🇺🇸"},
  {city:"Denver",      country:"AQSh",        tz:"America/Denver",   r:"am",    flag:"🇺🇸"},
  {city:"Toronto",     country:"Kanada",      tz:"America/Toronto",  r:"am",    flag:"🇨🇦"},
  {city:"Vankuver",    country:"Kanada",      tz:"America/Vancouver",r:"am",    flag:"🇨🇦"},
  {city:"Meksiko",     country:"Meksika",     tz:"America/Mexico_City",r:"am",  flag:"🇲🇽"},
  {city:"San-Paulu",   country:"Braziliya",   tz:"America/Sao_Paulo",r:"am",    flag:"🇧🇷"},
  {city:"Buenos-Ayres",country:"Argentina",   tz:"America/Argentina/Buenos_Aires",r:"am",flag:"🇦🇷"},
  {city:"Bogota",      country:"Kolumbiya",   tz:"America/Bogota",   r:"am",    flag:"🇨🇴"},
  {city:"Lima",        country:"Peru",        tz:"America/Lima",     r:"am",    flag:"🇵🇪"},
  {city:"Santiago",    country:"Chili",       tz:"America/Santiago", r:"am",    flag:"🇨🇱"},
  {city:"Gavanа",      country:"Kuba",        tz:"America/Havana",   r:"am",    flag:"🇨🇺"},
  // Boshqa
  {city:"Sidney",      country:"Avstraliya",  tz:"Australia/Sydney", r:"other", flag:"🇦🇺"},
  {city:"Melburn",     country:"Avstraliya",  tz:"Australia/Melbourne",r:"other",flag:"🇦🇺"},
  {city:"Aucklan",     country:"Yangi Zelandiya",tz:"Pacific/Auckland",r:"other",flag:"🇳🇿"},
  {city:"Honolulu",    country:"AQSh (Gavayi)",tz:"Pacific/Honolulu", r:"other", flag:"🇺🇸"},
  {city:"Ankoraj",     country:"AQSh (Alyaska)",tz:"America/Anchorage",r:"other",flag:"🇺🇸"},
  {city:"Reykyavik",   country:"Islandiya",   tz:"Atlantic/Reykjavik",r:"other",flag:"🇮🇸"},
  {city:"Lagos",       country:"Nigeriya",    tz:"Africa/Lagos",     r:"other", flag:"🇳🇬"},
  {city:"Nairobi",     country:"Keniya",      tz:"Africa/Nairobi",   r:"other", flag:"🇰🇪"},
  {city:"Joburg",      country:"Janubiy Afrika",tz:"Africa/Johannesburg",r:"other",flag:"🇿🇦"},
  {city:"Qohira",      country:"Misr",        tz:"Africa/Cairo",     r:"other", flag:"🇪🇬"},
  {city:"Kazablanka",  country:"Marokash",    tz:"Africa/Casablanca",r:"other", flag:"🇲🇦"},
  {city:"Akkra",       country:"Gana",        tz:"Africa/Accra",     r:"other", flag:"🇬🇭"},
  {city:"Katmandu",    country:"Nepal",       tz:"Asia/Kathmandu",   r:"asia",  flag:"🇳🇵"},
  {city:"Taipei",      country:"Tayvan",      tz:"Asia/Taipei",      r:"asia",  flag:"🇹🇼"},
  {city:"Manila",      country:"Filippin",    tz:"Asia/Manila",      r:"asia",  flag:"🇵🇭"},
  {city:"Dakarta",     country:"Indoneziya",  tz:"Asia/Jakarta",     r:"asia",  flag:"🇮🇩"},
  {city:"Kuala-Lumpur",country:"Malayziya",   tz:"Asia/Kuala_Lumpur",r:"asia",  flag:"🇲🇾"},
];

/* ── State ── */
let pinned = new Set(JSON.parse(localStorage.getItem('tz-pins')||'[]'));
let activeFilter = 'all';
let searchQ = '';
let userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
let tickInterval;

/* ── DOM ── */
const clockGrid   = document.getElementById('clockGrid');
const tzSearch    = document.getElementById('tzSearch');
const myTime      = document.getElementById('myTime');
const myDate      = document.getElementById('myDate');
const myInfo      = document.getElementById('myInfo');

/* ── Filter tabs ── */
document.querySelectorAll('.ft-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ft-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderGrid();
  });
});

/* ── Search ── */
tzSearch.addEventListener('input', () => {
  searchQ = tzSearch.value.trim().toLowerCase();
  renderGrid();
});

/* ── Render ── */
function getTheme(hour) {
  if (hour >= 0  && hour < 6)  return 'night';
  if (hour >= 6  && hour < 9)  return 'dawn';
  if (hour >= 18 && hour < 21) return 'eve';
  return 'day';
}
function getDotClass(theme) {
  return {night:'dot-night',dawn:'dot-dawn',day:'dot-day',eve:'dot-eve'}[theme]||'dot-day';
}
function fmt(dt, tz) {
  return new Intl.DateTimeFormat('uz',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(dt);
}
function fmtDate(dt,tz){
  return new Intl.DateTimeFormat('uz',{timeZone:tz,weekday:'short',month:'short',day:'numeric'}).format(dt);
}
function getHour(dt,tz){
  return +new Intl.DateTimeFormat('en',{timeZone:tz,hour:'numeric',hour12:false}).format(dt);
}
function getUtcOffset(tz,dt){
  const s = new Intl.DateTimeFormat('en',{timeZone:tz,timeZoneName:'shortOffset'}).formatToParts(dt)
    .find(p=>p.type==='timeZoneName')?.value || '';
  return s.replace('GMT','UTC') || 'UTC';
}
function getDiff(tz,dt){
  const myOff = -dt.getTimezoneOffset();
  const tzFmt = new Intl.DateTimeFormat('en',{timeZone:tz,timeZoneName:'shortOffset'});
  const tzOffStr = tzFmt.formatToParts(dt).find(p=>p.type==='timeZoneName')?.value||'GMT+0';
  const m = tzOffStr.match(/GMT([+-])(\d+):?(\d*)/);
  if(!m) return '';
  const tzOff = (m[1]==='-'?-1:1)*(parseInt(m[2])*60+(parseInt(m[3])||0));
  const diff = tzOff - myOff;
  if(diff===0) return 'Sizning vaqtingiz';
  const h = Math.floor(Math.abs(diff)/60);
  const mn = Math.abs(diff)%60;
  const sign = diff>0?'+':'-';
  return sign+h+(mn?':'+String(mn).padStart(2,'0'):'')+'s';
}

function renderGrid(){
  const dt = new Date();
  let zones = ZONES;
  if (searchQ) zones = zones.filter(z => z.city.toLowerCase().includes(searchQ)||z.country.toLowerCase().includes(searchQ)||z.tz.toLowerCase().includes(searchQ));
  else if(activeFilter==='pinned') zones = zones.filter(z=>pinned.has(z.tz));
  else if(activeFilter!=='all') zones = zones.filter(z=>z.r===activeFilter);
  // Pinned first
  zones = [...zones.filter(z=>pinned.has(z.tz)), ...zones.filter(z=>!pinned.has(z.tz))];

  clockGrid.innerHTML='';
  if(!zones.length){
    clockGrid.innerHTML='<div class="no-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Hech narsa topilmadi</div>';
    return;
  }
  zones.forEach(z => {
    const hour = getHour(dt,z.tz);
    const theme = getTheme(hour);
    const isPinned = pinned.has(z.tz);
    const card = document.createElement('div');
    card.className = 'tz-card'+(isPinned?' pinned':'')+(theme!=='day'&&theme!=='eve'?' '+theme+'-theme':'');
    card.dataset.tz = z.tz;
    card.innerHTML =
      `<div class="tz-card-top">` +
        `<span class="tz-flag">${z.flag}</span>` +
        `<button class="tz-pin-btn" title="${isPinned?'Saralashdan olib tashlash':'Saralash'}">${pinSvg(isPinned)}</button>` +
      `</div>` +
      `<div class="tz-city">${z.city}</div>` +
      `<div class="tz-country">${z.country}</div>` +
      `<div class="tz-time" data-tz="${z.tz}">${fmt(dt,z.tz)}</div>` +
      `<div class="tz-date">${fmtDate(dt,z.tz)}</div>` +
      `<div class="tz-bottom">` +
        `<span class="tz-utc">${getUtcOffset(z.tz,dt)}</span>` +
        `<span class="tz-diff">${getDiff(z.tz,dt)}</span>` +
        `<span class="tz-day-dot ${getDotClass(theme)}"></span>` +
      `</div>`;
    card.querySelector('.tz-pin-btn').addEventListener('click', e=>{
      e.stopPropagation();
      if(pinned.has(z.tz)) pinned.delete(z.tz); else pinned.add(z.tz);
      savePins();
      renderGrid();
      updatePinnedCount();
    });
    clockGrid.appendChild(card);
  });
  updatePinnedCount();
}

function updatePinnedCount(){
  const ct = document.getElementById('pinnedCount');
  if(ct) ct.textContent = pinned.size;
}

function pinSvg(active){
  const fill = active ? '#7c3aed' : 'none';
  return `<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

/* ── Tick ── */
function tick(){
  const dt = new Date();
  // Update all time elements
  document.querySelectorAll('.tz-time[data-tz]').forEach(el=>{
    el.textContent = fmt(dt, el.dataset.tz);
  });
  // My zone
  updateMyZone(dt);
}

function updateMyZone(dt){
  if(!myTime) return;
  myTime.textContent = fmt(dt, userTz);
  if(myDate) myDate.textContent = fmtDate(dt, userTz);
  if(myInfo) {
    const zone = ZONES.find(z=>z.tz===userTz);
    myInfo.textContent = zone ? `${zone.flag} ${zone.city}, ${zone.country}` : userTz;
  }
}

function savePins(){
  localStorage.setItem('tz-pins', JSON.stringify([...pinned]));
}

/* ── Init ── */
renderGrid();
tick();
tickInterval = setInterval(tick, 1000);
updateMyZone(new Date());

})();
