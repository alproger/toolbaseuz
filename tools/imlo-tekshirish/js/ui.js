'use strict';
/* ================================================================
   toolbase.uz — O'zbek Imlo Tekshirish
   js/ui.js  —  Interfeys boshqaruvi
   ================================================================ */
(function(){

/* ── Holat ── */
var lastResult    = null;    /* {errors, stats, tokens} */
var activeFilter  = 'all';
var checkOptions  = {
  mixed:true, spelling:true, apostrophe:true, capital:true,
  repeat:true, punct:true, joining:true, style:true, grammar:true
};
var correctedText = '';
var debounceTimer = null;

/* ── DOM referanslar ── */
var $ = function(id){ return document.getElementById(id); };
var elInput      = $('inputText');
var elCharCount  = $('charCount');
var elBtnCheck   = $('btnCheck');
var elBtnClear   = $('btnClear');
var elBtnSample  = $('btnSample');
var elResultArea = $('resultArea');
var elHighlight  = $('highlightedText');
var elErrorList  = $('errorList');
var elNoErrors   = $('noErrorsBox');
var elErrBadges  = $('errorBadges');
var elCheckingOv = $('checkingOverlay');
var elStatsCard  = $('statsCard');
var elErrStats   = $('errStatsCard');
var elErrStatsList=$('errStatsList');
var elTotalErrors = $('totalErrors');
var elBtnCopyCor = $('btnCopyCorrected');
var elToast      = $('toast');
var elTooltip    = $('errTooltip');
var toastTimer   = null;

/* ── NAMUNAVIY MATN ── */
var SAMPLES = [
  "Toshkend shahride yashayotgan ogil o'quvchi komputer darslarini juda qiziqarli deb topdi. Uning doslari ham bu mashgulotlarga jalb etildi. Lekin xurmat va izzat bilan muomalada bolish kerak edi.hamma bolalarning imkoniyati bor edi.",
  "O'zbekiston qadimiy va buyuk davlatdir. Samarkand, Buxoro va Fargona shaharlari qadimdan madaniyat markazlari bo'lgan. Bu yerda yashagan buyuk olimlar,shoirlar va memorlar jahon ilmiga katta hissa qo'shishgan. Biz bu merosni asrashimiz va davom ettirishimiz lozim.",
  "Yangi texnologiyalar hayotimizni ossonlashtirdi. Telifonlar va kompyuterlar orqali dunyoning har bir burchagiga malumot olish mumkin. Ammo shunaqa qurilmalardan foydalanishda ehtiyot bolish kerak. Yoshlar uchun sifatli ta'lim berishda bu vositalar muhim ahamiyat kasb etadi.",
  "Vatanparvar bo'lish har bir fuqaroning burchi hisoblanadi. Mehnat va bilim orqali yurtimizni rivojlantirishga hissa qo'shish mumkin. Agar biz hammamiz birga harakat qilsak,natijalar albatta yaxshi bo'ladi. Demak,mas'uliyatni his etib harakat qilish kerak."
];
var sampleIdx = 0;

/* ── Toast ── */
function showToast(msg, type){
  elToast.textContent = msg;
  elToast.className = 'toast show'+(type?' toast-'+type:'');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ elToast.className='toast'; }, 2500);
}

/* ── Char counter ── */
elInput.addEventListener('input', function(){
  var len = elInput.value.length;
  elCharCount.textContent = len.toLocaleString()+' / 15,000';
  elCharCount.classList.toggle('warn', len > 13000);
  /* Debounce auto check */
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(function(){ if(len>20) runCheck(); }, 800);
});

/* ── Filter chiplari ── */
document.querySelectorAll('.fchip').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.fchip').forEach(function(b){ b.classList.remove('active'); });
    this.classList.add('active');
    activeFilter = this.dataset.type;
    if(lastResult) renderErrors(lastResult.errors);
  });
});

/* ── Tekshirish ── */
elBtnCheck.addEventListener('click', runCheck);

elInput.addEventListener('keydown', function(e){
  if((e.ctrlKey||e.metaKey) && e.key==='Enter'){ e.preventDefault(); runCheck(); }
});

function runCheck(){
  var text = elInput.value;
  if(!text.trim()){ showToast("Matn kiriting!", 'error'); return; }

  elCheckingOv.classList.add('show');
  elBtnCheck.disabled = true;

  /* Async — UI yangilashi uchun */
  setTimeout(function(){
    try{
      var result = UzChecker.check(text, checkOptions);
      lastResult = result;
      correctedText = buildCorrected(text, result.errors);
      renderResult(text, result);
    } catch(ex){
      showToast('Tekshirishda xatolik: '+ex.message, 'error');
    } finally {
      elCheckingOv.classList.remove('show');
      elBtnCheck.disabled = false;
    }
  }, 30);
}

/* ── Tuzatilgan matnni qurilish ── */
function buildCorrected(text, errors){
  /* Faqat aniq tavsiyalari bor xatolarni tuzatish */
  var fixable = errors.filter(function(e){
    return e.sug && e.sug.length && e.sev==='error';
  }).sort(function(a,b){ return b.s-a.s; }); /* oxiridan tuzatish */

  var result = text;
  fixable.forEach(function(e){
    result = result.slice(0,e.s) + e.sug + result.slice(e.e);
  });
  return result;
}

/* ── Natijani ko'rsatish ── */
function renderResult(text, result){
  elResultArea.classList.add('show');

  /* Belgilangan matn */
  var visible = activeFilter==='all'
    ? result.errors
    : result.errors.filter(function(e){ return e.type===activeFilter; });
  elHighlight.innerHTML = UzChecker.buildHighlighted(text, visible);

  /* Xato kartalar */
  renderErrors(result.errors);

  /* Statistika */
  if(result.stats) renderStats(result.stats);
  renderErrStats(result.errors);

  /* Nusxa tugmasi */
  var hasFixable = result.errors.some(function(e){ return e.sug&&e.sev==='error'; });
  elBtnCopyCor.style.display = hasFixable ? 'flex' : 'none';

  /* Highlight ichidagi mark larni bosish */
  elHighlight.querySelectorAll('.err-mark').forEach(function(mark){
    mark.addEventListener('mouseenter', function(e){
      showTooltip(e, mark.dataset.msg);
    });
    mark.addEventListener('mouseleave', hideTooltip);
    mark.addEventListener('click', function(){
      var sug=mark.dataset.sug, orig=mark.textContent;
      if(!sug) return;
      var newText=elInput.value.replace(orig, sug);
      elInput.value=newText;
      runCheck();
      showToast('"'+orig+'" → "'+sug+'"', 'ok');
    });
  });

  /* Scroll to result */
  elResultArea.scrollIntoView({behavior:'smooth', block:'nearest'});
}


/* ── Highlight mark orqali aniq joyni tuzatish ── */
function applyMarkFix(mark){
  var sug = mark.dataset.sug;
  if(!sug) return;
  var s = parseInt(mark.dataset.s, 10);
  var e = parseInt(mark.dataset.e, 10);
  if(isNaN(s) || isNaN(e)) return;
  var text = elInput.value;
  var orig = text.slice(s, e);
  elInput.value = text.slice(0, s) + sug + text.slice(e);
  runCheck();
  showToast('"'+orig+'" → "'+sug+'"', 'ok');
}

/* ── Xato kartalar ── */
function renderErrors(errors){
  var filtered = activeFilter==='all'
    ? errors
    : errors.filter(function(e){ return e.type===activeFilter; });

  /* Badges */
  elErrBadges.innerHTML = '';
  var counts = {};
  errors.forEach(function(e){ counts[e.sev]=(counts[e.sev]||0)+1; });
  if(counts.error){
    var b=document.createElement('span');
    b.className='errors-badge badge-error';
    b.textContent=counts.error+' xato';
    elErrBadges.appendChild(b);
  }
  if(counts.warning){
    var w=document.createElement('span');
    w.className='errors-badge badge-warning';
    w.textContent=counts.warning+' ogohlantiruv';
    elErrBadges.appendChild(w);
  }
  if(counts.info){
    var inf=document.createElement('span');
    inf.className='errors-badge badge-info';
    inf.textContent=counts.info+' tavsiya';
    elErrBadges.appendChild(inf);
  }

  /* Xato yo'q */
  elNoErrors.style.display = filtered.length===0 ? 'flex' : 'none';
  elErrorList.innerHTML = '';

  /* Filtered highlight */
  if(lastResult){
    elHighlight.innerHTML = UzChecker.buildHighlighted(
      elInput.value,
      activeFilter==='all' ? errors : filtered
    );
    /* Re-bind highlight clicks */
    elHighlight.querySelectorAll('.err-mark').forEach(function(mark){
      mark.addEventListener('mouseenter', function(e){ showTooltip(e, mark.dataset.msg); });
      mark.addEventListener('mouseleave', hideTooltip);
      mark.addEventListener('click', function(){ applyMarkFix(mark); });
    });
  }

  filtered.forEach(function(err, idx){
    var meta = UZ_DICT.ERROR_META[err.type]||{label:'Xato',color:'#dc2626',bg:'#fef2f2',badge:'!'};
    var card = document.createElement('div');
    card.className = 'error-card';
    card.dataset.idx = idx;

    var sevIcon = err.sev==='error' ? '✗' : err.sev==='warning' ? '⚠' : 'ℹ';
    var hasApply = err.sug && err.sug.length > 0;

    card.innerHTML =
      '<div class="error-type-badge" style="background:'+meta.color+'">'+meta.badge+'</div>'+
      '<div class="error-card-body">'+
        '<div class="error-found">"'+(err.found||'')+ '"</div>'+
        (hasApply ? '<div class="error-sug">→ "'+(err.sug)+'"</div>' : '')+
        '<div class="error-msg">'+escHtml(err.msg||meta.label)+'</div>'+
      '</div>'+
      (hasApply
        ? '<button class="error-apply-btn" data-idx="'+idx+'">Tuzatish</button>'
        : '');

    /* Tuzatish tugmasi */
    if(hasApply){
      card.querySelector('.error-apply-btn').addEventListener('click', function(e){
        e.stopPropagation();
        applySingleFix(err);
      });
    }

    elErrorList.appendChild(card);
  });
}

/* ── Bitta xatoni tuzatish ── */
function applySingleFix(err){
  if(!err.sug) return;
  var text = elInput.value;
  var orig = err.found || text.slice(err.s, err.e);
  var newText = text.slice(0,err.s) + err.sug + text.slice(err.e);
  elInput.value = newText;
  showToast('"'+orig+'" → "'+err.sug+'" tuzatildi ✓', 'ok');
  runCheck();
}

/* ── Statistika ── */
function renderStats(st){
  elStatsCard.style.display = 'block';
  $('statWords').textContent     = st.words.toLocaleString();
  $('statSentences').textContent = st.sentences;
  $('statChars').textContent     = st.chars.toLocaleString();
  $('statParagraphs').textContent= st.paragraphs;
  $('statAvgWord').textContent   = st.avgWordLen+' harf';
  $('statAvgSent').textContent   = st.avgWordsPerSentence+' so\'z';
  $('statLex').textContent       = st.lexRich+'%';
  $('statRead').textContent      = st.readTime;

  /* Murakkablik */
  var label=$('complexityLabel'), fill=$('complexityFill');
  var cl = st.complexScore===3 ? {t:"Qiyin",pct:90,cls:"fill-hard"}
         : st.complexScore===2 ? {t:"O'rta",pct:55,cls:"fill-medium"}
         :                        {t:"Oson", pct:25,cls:"fill-easy"};
  label.textContent = cl.t;
  fill.style.width  = cl.pct+'%';
  fill.className    = 'complexity-fill '+cl.cls;
}

function renderErrStats(errors){
  if(!errors.length){ elErrStats.style.display='none'; return; }
  elErrStats.style.display='block';
  elTotalErrors.textContent = errors.length;

  var typeCount={};
  errors.forEach(function(e){ typeCount[e.type]=(typeCount[e.type]||0)+1; });

  elErrStatsList.innerHTML='';
  Object.keys(typeCount).sort(function(a,b){return typeCount[b]-typeCount[a];}).forEach(function(type){
    var meta = UZ_DICT.ERROR_META[type]||{label:type,color:'#888'};
    var row  = document.createElement('div');
    row.className='err-stat-row';
    row.innerHTML=
      '<span class="err-stat-label">'+
        '<span class="err-stat-dot" style="background:'+meta.color+'"></span>'+
        meta.label+
      '</span>'+
      '<span class="err-stat-count">'+typeCount[type]+'</span>';
    elErrStatsList.appendChild(row);
  });
}

/* ── Tooltip ── */
function showTooltip(e, msg){
  if(!msg) return;
  elTooltip.textContent = msg;
  elTooltip.style.display = 'block';
  var x=e.clientX+10, y=e.clientY-36;
  if(x+280>window.innerWidth) x=window.innerWidth-290;
  elTooltip.style.left=x+'px';
  elTooltip.style.top=y+'px';
}
function hideTooltip(){ elTooltip.style.display='none'; }
document.addEventListener('scroll', hideTooltip);

/* ── Nusxa tugmalari ── */
elBtnCopyCor.addEventListener('click', function(){
  if(!correctedText) return;
  navigator.clipboard.writeText(correctedText)
    .then(function(){ showToast('Tuzatilgan matn nusxalandi ✓','ok'); })
    .catch(function(){ showToast('Nusxalash qo\'llab-quvvatlanmaydi','error'); });
});

/* ── Tozalash ── */
elBtnClear.addEventListener('click', function(){
  elInput.value = '';
  elCharCount.textContent = '0 / 15,000';
  elResultArea.classList.remove('show');
  elStatsCard.style.display = 'none';
  elErrStats.style.display  = 'none';
  lastResult = null;
  elInput.focus();
});

/* ── Namunaviy matn ── */
elBtnSample.addEventListener('click', function(){
  elInput.value = SAMPLES[sampleIdx % SAMPLES.length];
  sampleIdx++;
  elInput.dispatchEvent(new Event('input'));
  runCheck();
  showToast('Namunaviy matn yuklandi', 'ok');
});

/* ── Helper ── */
function escHtml(s){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Yil ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Boshlang'ich focus ── */
elInput.focus();

})();
