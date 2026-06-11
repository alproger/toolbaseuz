'use strict';
/* ================================================================
   toolbase.uz — O'zbek Imlo Tekshiruvi v2.1
   Browser-only rule based spell/grammar checker with local wordlist lexicon.

   Qamrov:
   - apostrof normalizatsiyasi: o', oʻ, o‘, o`, g', gʻ, g‘, g`
   - aniq xatolar lug'ati
   - apostrof tushib qolgan so'zlarni aniqlash
   - so'z takrori, katta harf, tinish belgilari
   - birikib/ajralib yozilish
   - yuqori ishonchli fuzzy suggestion: Levenshtein + suffix stripping
   - grammar qoida natijalarini UI formatiga moslash
   ================================================================ */

var UzChecker = (function(){

/* ═══════════════════════════════════════════════════════════════
   0. KICHIK LUG'AT VA QO'SHIMCHA QOIDALAR
   ═══════════════════════════════════════════════════════════════ */
var EXTRA_MISTAKES = {
  /* H/X va keng tarqalgan imlo xatolari */
  "xamma":{c:"hamma",t:"spell",m:"To'g'ri yozilishi: hamma"},
  "xammasi":{c:"hammasi",t:"spell",m:"To'g'ri yozilishi: hammasi"},
  "xam":{c:"ham",t:"spell",m:"X emas, H bilan: ham"},
  "xech":{c:"hech",t:"spell",m:"X emas, H bilan: hech"},
  "xechkim":{c:"hech kim",t:"join",m:"Ajralib yoziladi: hech kim"},
  "xechqachon":{c:"hech qachon",t:"join",m:"Ajralib yoziladi: hech qachon"},
  "xech narsa":{c:"hech narsa",t:"spell",m:"X emas, H bilan: hech narsa"},
  "xozircha":{c:"hozircha",t:"spell",m:"X emas, H bilan: hozircha"},
  "xolat":{c:"holat",t:"spell",m:"X emas, H bilan: holat"},
  "xolatda":{c:"holatda",t:"spell",m:"X emas, H bilan: holatda"},
  "xuddi":{c:"xuddi",t:"ok",m:""},

  /* Apostrof tushib qolgan eng ko'p uchraydigan so'zlar */
  "boladi":{c:"bo'ladi",t:"apos",m:"Apostrof tushib qolgan: bo'ladi"},
  "bolsa":{c:"bo'lsa",t:"apos",m:"Apostrof tushib qolgan: bo'lsa"},
  "bolsin":{c:"bo'lsin",t:"apos",m:"Apostrof tushib qolgan: bo'lsin"},
  "bolish":{c:"bo'lish",t:"apos",m:"Apostrof tushib qolgan: bo'lish"},
  "bolishi":{c:"bo'lishi",t:"apos",m:"Apostrof tushib qolgan: bo'lishi"},
  "bolishingiz":{c:"bo'lishingiz",t:"apos",m:"Apostrof tushib qolgan: bo'lishingiz"},
  "bolishimiz":{c:"bo'lishimiz",t:"apos",m:"Apostrof tushib qolgan: bo'lishimiz"},
  "bolib":{c:"bo'lib",t:"apos",m:"Apostrof tushib qolgan: bo'lib"},
  "bolmoqda":{c:"bo'lmoqda",t:"apos",m:"Apostrof tushib qolgan: bo'lmoqda"},
  "bolgan":{c:"bo'lgan",t:"apos",m:"Apostrof tushib qolgan: bo'lgan"},
  "bolmaydi":{c:"bo'lmaydi",t:"apos",m:"Apostrof tushib qolgan: bo'lmaydi"},
  "tolov":{c:"to'lov",t:"apos",m:"Apostrof tushib qolgan: to'lov"},
  "tolash":{c:"to'lash",t:"apos",m:"Apostrof tushib qolgan: to'lash"},
  "toliq":{c:"to'liq",t:"apos",m:"Apostrof tushib qolgan: to'liq"},
  "togri":{c:"to'g'ri",t:"apos",m:"Apostrof tushib qolgan: to'g'ri"},
  "soz":{c:"so'z",t:"apos",m:"Apostrof tushib qolgan: so'z"},
  "sozlar":{c:"so'zlar",t:"apos",m:"Apostrof tushib qolgan: so'zlar"},
  "song":{c:"so'ng",t:"apos",m:"Apostrof tushib qolgan: so'ng"},
  "sung":{c:"so'ng",t:"spell",m:"To'g'ri yozilishi: so'ng"},
  "korish":{c:"ko'rish",t:"apos",m:"Apostrof tushib qolgan: ko'rish"},
  "korinish":{c:"ko'rinish",t:"apos",m:"Apostrof tushib qolgan: ko'rinish"},
  "korsatish":{c:"ko'rsatish",t:"apos",m:"Apostrof tushib qolgan: ko'rsatish"},
  "kochirish":{c:"ko'chirish",t:"apos",m:"Apostrof tushib qolgan: ko'chirish"},
  "ozgartirish":{c:"o'zgartirish",t:"apos",m:"Apostrof tushib qolgan: o'zgartirish"},
  "ozgartirildi":{c:"o'zgartirildi",t:"apos",m:"Apostrof tushib qolgan"},
  "qoshish":{c:"qo'shish",t:"apos",m:"Apostrof tushib qolgan: qo'shish"},
  "qoshildi":{c:"qo'shildi",t:"apos",m:"Apostrof tushib qolgan: qo'shildi"},
  "qollanma":{c:"qo'llanma",t:"apos",m:"Apostrof tushib qolgan: qo'llanma"},
  "qollab":{c:"qo'llab",t:"apos",m:"Apostrof tushib qolgan"},
  "qoyish":{c:"qo'yish",t:"apos",m:"Apostrof tushib qolgan: qo'yish"},
  "qoyilgan":{c:"qo'yilgan",t:"apos",m:"Apostrof tushib qolgan: qo'yilgan"},
  "qozgatuvchi":{c:"qo'zg'atuvchi",t:"apos",m:"Apostrof tushib qolgan"},
  "goncha":{c:"g'uncha",t:"spell",m:"To'g'ri yozilishi: g'uncha"},

  /* Tez-tez uchraydigan typo */
  "keraj":{c:"kerak",t:"spell",m:"To'g'ri yozilishi: kerak"},
  "kerka":{c:"kerak",t:"spell",m:"To'g'ri yozilishi: kerak"},
  "judayam":{c:"juda ham",t:"style",m:"Adabiyroq yozilishi: juda ham"},
  "yani":{c:"ya'ni",t:"apos",m:"Apostrof tushib qolgan: ya'ni"},
  "meyor":{c:"me'yor",t:"apos",m:"Apostrof tushib qolgan: me'yor"},
  "tugatildi":{c:"tugatildi",t:"ok",m:""},
  "ishlayapdi":{c:"ishlayapti",t:"spell",m:"Adabiy shakl: ishlayapti"},
  "ishlayabdi":{c:"ishlayapti",t:"spell",m:"Adabiy shakl: ishlayapti"},
  "ketvotti":{c:"ketmoqda",t:"style",m:"So'zlashuv shakli; adabiyroq: ketmoqda"},
  "kevotti":{c:"kelmoqda",t:"style",m:"So'zlashuv shakli; adabiyroq: kelmoqda"},
  "bopti":{c:"bo'pti",t:"apos",m:"Apostrof tushib qolgan: bo'pti"},
  "boptiyu":{c:"bo'ptiyu",t:"apos",m:"Apostrof tushib qolgan"},
  "xisob":{c:"hisob",t:"spell",m:"X emas, H bilan: hisob"},
  "xisoblash":{c:"hisoblash",t:"spell",m:"X emas, H bilan: hisoblash"},
  "xaqida":{c:"haqida",t:"spell",m:"X emas, H bilan: haqida"},
  "xaqiqiy":{c:"haqiqiy",t:"spell",m:"X emas, H bilan: haqiqiy"},
  "xavfsiz":{c:"xavfsiz",t:"ok",m:""}
};

var COMMON_WORDS = [
  "men","sen","u","biz","siz","ular","bu","shu","ana","mana","kim","nima","qayer","qachon",
  "qanday","nega","qancha","hamma","barcha","hech","har","bir","ikki","uch","ko'p","kam",
  "sayt","loyiha","dastur","kod","algoritm","frontend","backend","server","client","api","django",
  "python","javascript","html","css","seo","toolbase","tool","tools","platforma","sahifa","maqola",
  "foydalanuvchi","tizim","xizmat","to'lov","pullik","bepul","limit","fayl","hujjat","matn",
  "imlo","grammatika","tekshirish","tuzatish","xato","so'z","so'zlar","gap","paragraf",
  "bugun","ertaga","kecha","hozir","keyin","avval","boshlash","boshlaymiz","ish","ishlash",
  "kerak","lozim","mumkin","emas","ha","yo'q","bo'ladi","bo'lsa","bo'lsin","qilish","qilamiz",
  "yozish","yozing","yuborish","yuboring","tekshirib","ko'rish","kuchaytirish","tuzatish",
  "o'zbek","rus","ingliz","til","tillar","tarjima","lotin","krill","kirill","hujjat","docx","pdf",
  "sifat","sifatli","professional","mobil","mobile","desktop","responsive","dizayn","struktura",
  "maktab","universitet","talaba","o'qituvchi","ofis","tashkilot","biznes","model","daromad",
  "pul","foyda","maqsad","reja","natija","statistika","trafik","unique","foydalanuvchilar"
];

var SUFFIXES = [
  /* long possessive/case endings first */
  "laringizdan","laringizga","laringizni","laringizda","larimizdan","larimizga","larimizni","larimizda",
  "ingizdan","ingizga","ingizni","ingizda","imizdan","imizga","imizni","imizda",
  "ayotgan","yotgan","moqchi","moqda","yapti","yapsiz","yapmiz","yapman",
  "aymiz","amiz","ayman","aman","aysiz","asiz","aydi","adi",
  "lardan","larga","larni","larda","larning","ingiz","imiz","lari","larni","ning",
  "ganlar","dilar","chilar","chilik","sizlar","liklar","sizlik",
  "gan","kan","qan","adi","ydi","di","ti","moq","ish","uvchi","lovchi",
  "dan","ga","da","ni","lar","lik","chi","siz","cha","roq","mi","ku","u","im","ing","i","miz","man","san"
];

var LATIN_LETTER_RE = /[a-zA-Z\u02BB\u02BC\u2018\u2019'`]/;
var WORD_RE = /[a-zA-ZА-Яа-яёЁ\u02BB\u02BC\u2018\u2019'`]/i;
var CYR_RE = /[А-Яа-яёЁ]/;
var LAT_RE = /[a-zA-Z]/;

/* ═══════════════════════════════════════════════════════════════
   1. TOKENIZER
   ═══════════════════════════════════════════════════════════════ */
function tokenize(text){
  var tokens=[], i=0, n=text.length;
  while(i<n){
    var ch=text[i];
    if(ch==='\n') { tokens.push({t:'nl',v:'\n',s:i,e:i+1}); i++; continue; }
    if(/[ \t\r]/.test(ch)){
      var ws='', si=i;
      while(i<n && /[ \t\r]/.test(text[i])) ws+=text[i++];
      tokens.push({t:'space',v:ws,s:si,e:i}); continue;
    }
    if(/[.!?,;:«»"“”()\[\]{}—–-]/.test(ch)){
      if(ch==='.' && text[i+1]==='.' && text[i+2]==='.'){
        tokens.push({t:'ellipsis',v:'...',s:i,e:i+3}); i+=3; continue;
      }
      tokens.push({t:'punct',v:ch,s:i,e:i+1}); i++; continue;
    }
    if(/\d/.test(ch)){
      var num='', ni=i;
      while(i<n && /[\d.,:%]/.test(text[i])) num+=text[i++];
      tokens.push({t:'num',v:num,s:ni,e:i}); continue;
    }
    if(WORD_RE.test(ch)){
      var word='', wi=i;
      while(i<n && /[a-zA-ZА-Яа-яёЁ\u02BB\u02BC\u2018\u2019'`\-]/i.test(text[i])) word+=text[i++];
      while(word.length>0 && /[-']/.test(word[word.length-1])){ word=word.slice(0,-1); i--; }
      tokens.push({t:'word',v:word,s:wi,e:wi+word.length}); continue;
    }
    tokens.push({t:'other',v:ch,s:i,e:i+1}); i++;
  }
  return tokens;
}

/* ═══════════════════════════════════════════════════════════════
   2. HELPERS
   ═══════════════════════════════════════════════════════════════ */
function normApos(w){ return String(w).replace(/[\u02BB\u02BC\u2018\u2019`´]/g,"'"); }
function normWord(w){ return normApos(w).toLowerCase(); }
function isCyrillic(w){ return CYR_RE.test(w); }
function isLatin(w){ return LAT_RE.test(w); }
function hasMixed(w){ return isLatin(w) && isCyrillic(w); }
function escRe(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function isAcronym(w){ return /^[A-Z]{2,8}$/.test(w); }
function isLikelyUrlOrEmail(w){ return /(@|www\.|https?|\.com|\.uz|\.org|\.net)/i.test(w); }
function sentStart(tokens, idx){
  for(var j=idx-1; j>=0; j--){
    var t=tokens[j];
    if(t.t==='nl'||t.t==='space') continue;
    if((t.t==='punct'||t.t==='ellipsis') && /[.!?]/.test(t.v)) return true;
    return false;
  }
  return true;
}
function preserveCase(original, suggestion){
  if(!suggestion) return suggestion;
  if(/^[A-ZА-ЯЁ]+$/.test(original)) return suggestion.toUpperCase();
  if(original[0] && original[0]===original[0].toUpperCase() && original.slice(1)===original.slice(1).toLowerCase()){
    return suggestion[0].toUpperCase()+suggestion.slice(1);
  }
  return suggestion;
}
function addErr(list, type, sev, tokOrStart, end, found, sug, msg){
  var s, e;
  if(typeof tokOrStart==='object') { s=tokOrStart.s; e=tokOrStart.e; found=found==null?tokOrStart.v:found; }
  else { s=tokOrStart; e=end; }
  list.push({type:type, sev:sev||'warning', s:s, e:e, found:found||'', sug:sug||'', msg:msg||''});
}

/* ═══════════════════════════════════════════════════════════════
   3. LEXICON VA SUGGESTION ENGINE
   ═══════════════════════════════════════════════════════════════ */
var LEXICON = null;
var LEXICON_BY_FIRST = null;
var APOSTROPHE_MAP = null;
function buildLexicon(){
  if(LEXICON) return;
  LEXICON = new Set();
  APOSTROPHE_MAP = {};

  Object.keys(UZ_DICT.MISSPELLED||{}).forEach(function(k){
    var e=UZ_DICT.MISSPELLED[k];
    if(e.t==='ok') LEXICON.add(normWord(k));
    if(e.c) LEXICON.add(normWord(e.c));
  });
  Object.keys(EXTRA_MISTAKES).forEach(function(k){
    var e=EXTRA_MISTAKES[k];
    if(e.t==='ok') LEXICON.add(normWord(k));
    if(e.c) LEXICON.add(normWord(e.c));
  });
  (UZ_DICT.APOSTROPHE_LIST||[]).forEach(function(w){
    var nw=normWord(w);
    LEXICON.add(nw);
    var clean=nw.replace(/'/g,'');
    if(!APOSTROPHE_MAP[clean]) APOSTROPHE_MAP[clean]=nw;
  });
  COMMON_WORDS.forEach(function(w){ LEXICON.add(normWord(w)); });

  /* Large local wordlist: data/uz-wordlist.js.
     Future: replace/extend with full Hunspell import if license/size is acceptable. */
  if(typeof UZ_WORDLIST !== 'undefined' && Array.isArray(UZ_WORDLIST)){
    UZ_WORDLIST.forEach(function(w){
      var nw = normWord(w);
      if(nw && nw.length>=2) LEXICON.add(nw);
    });
  }

  /* Speed index for fuzzy suggestions */
  LEXICON_BY_FIRST = {};
  LEXICON.forEach(function(w){
    var k = w[0] || '#';
    if(!LEXICON_BY_FIRST[k]) LEXICON_BY_FIRST[k] = [];
    LEXICON_BY_FIRST[k].push(w);
  });
}
function isKnownWord(w){
  buildLexicon();
  var n=normWord(w);
  if(!n || LEXICON.has(n)) return true;
  if(n.length<4) return true;
  if(isLikelyUrlOrEmail(n) || isAcronym(w)) return true;
  if(/^\d+$/.test(n)) return true;

  for(var i=0;i<SUFFIXES.length;i++){
    var suf=SUFFIXES[i];
    if(n.length>suf.length+2 && n.endsWith(suf)){
      var root=n.slice(0,-suf.length);
      if(LEXICON.has(root)) return true;
      /* o'zbekcha fe'l/ot yasovchi shakllar: tekshir+amiz, yaxshila+ymiz */
      if(LEXICON.has(root+"moq") || LEXICON.has(root+"ish") || LEXICON.has(root+"lash")) return true;
      if(root.endsWith('la') && LEXICON.has(root.slice(0,-2))) return true;
      /* o'zbekcha tovush almashish: so'z + im/ing/i */
      if(LEXICON.has(root+"i") || LEXICON.has(root+"a")) return true;
    }
  }
  return false;
}
function levLimited(a,b,max){
  if(Math.abs(a.length-b.length)>max) return max+1;
  var prev=[], cur=[], i,j;
  for(j=0;j<=b.length;j++) prev[j]=j;
  for(i=1;i<=a.length;i++){
    cur[0]=i; var rowMin=cur[0];
    for(j=1;j<=b.length;j++){
      var cost=a[i-1]===b[j-1]?0:1;
      cur[j]=Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+cost);
      if(cur[j]<rowMin) rowMin=cur[j];
    }
    if(rowMin>max) return max+1;
    var tmp=prev; prev=cur; cur=tmp;
  }
  return prev[b.length];
}
function collapseRepeats(w){
  return w.replace(/([a-zа-яё])\1{2,}/gi,'$1');
}
function findSuggestion(word){
  buildLexicon();
  var n=normWord(word);
  if(n.length<5 || isKnownWord(word)) return null;

  /* Juda ko'p takrorlangan harflar: judaaa → juda */
  var collapsed=collapseRepeats(n);
  if(collapsed!==n && LEXICON.has(collapsed)) return {sug:collapsed, sev:'error', reason:'Ortiqcha takrorlangan harf'};
  if(collapsed!==n && APOSTROPHE_MAP && APOSTROPHE_MAP[collapsed]) return {sug:APOSTROPHE_MAP[collapsed], sev:'error', reason:'Ortiqcha harf va apostrof xatosi'};

  var max = n.length>=8 ? 2 : 1;
  var best=[], bestD=max+1;
  var candidates = [];
  if(LEXICON_BY_FIRST){
    candidates = (LEXICON_BY_FIRST[n[0]]||[]).concat(LEXICON_BY_FIRST[n[n.length-1]]||[]);
  }
  if(!candidates.length) candidates = Array.from(LEXICON);
  var seenCand = {};
  candidates.forEach(function(c){
    if(seenCand[c]) return; seenCand[c]=1;
    if(Math.abs(c.length-n.length)>max) return;
    if(c[0]!==n[0] && c[c.length-1]!==n[n.length-1]) return;
    var d=levLimited(n,c,max);
    if(d<bestD){ bestD=d; best=[c]; }
    else if(d===bestD && best.length<4){ best.push(c); }
  });
  if(bestD<=max && best.length===1){
    return {sug:best[0], sev: bestD===1?'warning':'info', reason:'Yaqin imlo varianti topildi'};
  }
  return null;
}

function shouldFlagUnknown(word){
  var n = normWord(word);
  if(n.length < 5) return false;
  if(isCyrillic(word) || hasMixed(word) || isAcronym(word) || isLikelyUrlOrEmail(word)) return false;
  if(/[_\d]/.test(n)) return false;
  /* common file/tech abbreviations are not spelling mistakes */
  if(/^(pdf|docx|xlsx|pptx|jpg|jpeg|png|webp|html|css|json|api|seo|url|qr|md5|sha|svg|pwa)$/.test(n)) return false;
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   4. TEKSHIRUV FUNKSIYALARI
   ═══════════════════════════════════════════════════════════════ */
function checkMixed(tokens){
  var errs=[];
  tokens.forEach(function(tok){
    if(tok.t==='word' && hasMixed(tok.v)){
      addErr(errs,'mix','error',tok,null,null,'',"Bir so'zda lotin va krill harflari aralashib ketgan");
    }
  });
  return errs;
}

function checkSpelling(tokens){
  var errs=[];
  buildLexicon();
  tokens.forEach(function(tok){
    if(tok.t!=='word') return;
    if(hasMixed(tok.v)) return;
    if(isCyrillic(tok.v)) return; /* Hozirgi engine Latin imlo uchun */
    if(isAcronym(tok.v) || isLikelyUrlOrEmail(tok.v)) return;

    var n=normWord(tok.v);
    var entry = EXTRA_MISTAKES[n] || (UZ_DICT.MISSPELLED||{})[n];
    if(entry){
      if(entry.t==='ok') return;
      addErr(errs, entry.t||'spell', entry.t==='style'?'info':'error', tok, null, tok.v,
        preserveCase(tok.v, entry.c), entry.m || ("To'g'ri yozilishi: "+entry.c));
      return;
    }

    /* apostrofli so'zlarning apostrofsiz varianti */
    if(n.indexOf("'")<0 && APOSTROPHE_MAP[n]){
      addErr(errs,'apos','error',tok,null,tok.v,preserveCase(tok.v, APOSTROPHE_MAP[n]),
        "Apostrof tushib qolgan: "+APOSTROPHE_MAP[n]);
      return;
    }

    var sug=findSuggestion(tok.v);
    if(sug){
      addErr(errs,'spell',sug.sev,tok,null,tok.v,preserveCase(tok.v, sug.sug),
        sug.reason+": ehtimol, '"+sug.sug+"' bo'lishi kerak");
      return;
    }

    /* Unknown-word detector: large local lexicon + suffix stripping.
       This is intentionally a warning, not auto-correction. */
    if(shouldFlagUnknown(tok.v) && !isKnownWord(tok.v)){
      addErr(errs,'spell','warning',tok,null,tok.v,'',
        "Bu so'z lug'atda topilmadi. Imlo yoki apostrofni tekshiring.");
    }
  });
  return errs;
}

function checkApostrophe(tokens){
  var errs=[];
  buildLexicon();
  tokens.forEach(function(tok){
    if(tok.t!=='word' || isCyrillic(tok.v) || hasMixed(tok.v)) return;
    var n=normWord(tok.v);
    if(n.indexOf("'")<0 && APOSTROPHE_MAP[n] && !(EXTRA_MISTAKES[n] || (UZ_DICT.MISSPELLED||{})[n])){
      addErr(errs,'apos','error',tok,null,tok.v,preserveCase(tok.v, APOSTROPHE_MAP[n]),
        "Apostrof belgisi tushib qolgan");
    }
    /* Noto'g'ri apostrof belgilari normalizatsiyasi */
    if(/[\u02BB\u02BC\u2018\u2019`´]/.test(tok.v)){
      var normalized=tok.v.replace(/[\u02BB\u02BC\u2018\u2019`´]/g,"'");
      if(normalized!==tok.v){
        addErr(errs,'apos','warning',tok,null,tok.v,normalized,
          "Apostrof belgisi bir xil ko'rinishda yozilgani ma'qul: '");
      }
    }
  });
  return errs;
}

function checkCapitals(tokens){
  var errs=[];
  var skip=new Set(['va','yoki','lekin','ammo','biroq','chunki','agar','ham','bilan','uchun','da','ga','ni','dan','esa','balki']);
  tokens.forEach(function(tok, i){
    if(tok.t!=='word') return;
    var first=tok.v[0];
    if(!first || isCyrillic(first)) return;
    if(sentStart(tokens,i) && first===first.toLowerCase() && /[a-z]/i.test(first)){
      var lower=normWord(tok.v);
      if(!skip.has(lower)){
        addErr(errs,'cap','warning',tok,null,tok.v,tok.v[0].toUpperCase()+tok.v.slice(1),
          'Gap boshi katta harf bilan boshlanishi kerak');
      }
    }
  });
  return errs;
}

function checkRepeats(tokens){
  var errs=[], words=tokens.filter(function(t){return t.t==='word';});
  var ok=new Set(['ha','yo','qo','lo','goh','jim']);
  for(var i=1;i<words.length;i++){
    var cur=normWord(words[i].v), prev=normWord(words[i-1].v);
    if(cur===prev && cur.length>1 && !ok.has(cur)){
      addErr(errs,'repeat','warning',words[i],null,words[i].v,'',"So'z ketma-ket takrorlangan");
    }
  }
  return errs;
}

function checkPunctuation(text){
  var errs=[];
  (UZ_DICT.PUNCT_RULES||[]).forEach(function(rule){
    var re=new RegExp(rule.pat.source, rule.pat.flags);
    var m;
    while((m=re.exec(text))!==null){
      if(m[0]==='...' || (m[0][0]==='.' && text[m.index+1]==='.' && text[m.index+2]==='.')) continue;
      addErr(errs,'punct',rule.sev||'warning',m.index,m.index+m[0].length,m[0],
        rule.fix ? rule.fix(m[0]) : '', rule.msg||'Tinish belgisi xatosi');
      if(!re.global) break;
    }
  });

  return errs;
}

function checkJoining(text){
  var errs=[];
  (UZ_DICT.JOININGS||[]).forEach(function(j){
    if(j.ok) return;
    var re=new RegExp('\\b'+escRe(j.wrong)+'\\b','gi'), m;
    while((m=re.exec(text))!==null){
      addErr(errs,'join','error',m.index,m.index+m[0].length,m[0],j.right,
        j.m || "To'g'ri yozilishi: '"+j.right+"'");
    }
  });
  return errs;
}

function checkStyle(text){
  var errs=[];
  (UZ_DICT.STYLE_RULES||[]).forEach(function(r){
    var re=new RegExp('\\b'+escRe(r.w)+'\\b','gi'), m;
    while((m=re.exec(text))!==null){
      addErr(errs,'style','info',m.index,m.index+m[0].length,m[0],r.r,r.m);
    }
  });
  return errs;
}

function normalizeGrammarError(e){
  if(!e) return null;
  return {
    type:e.type||'grammar',
    sev:e.sev||'warning',
    s: e.s!=null ? e.s : e.start,
    e: e.e!=null ? e.e : e.end,
    found:e.found||'',
    sug:preserveCase(e.found||'', e.sug||e.suggestion||''),
    msg:e.msg||'Grammatik tavsiya'
  };
}
function checkGrammar(text, tokens){
  var errs=[];
  (UZ_DICT.GRAMMAR_RULES||[]).forEach(function(rule){
    if(typeof rule.check!=='function') return;
    try{
      var res=rule.check(text,tokens)||[];
      res.forEach(function(raw){
        var e=normalizeGrammarError(raw);
        if(e && e.s!=null && e.e!=null) errs.push(e);
      });
    }catch(ex){}
  });
  return errs;
}

/* ═══════════════════════════════════════════════════════════════
   5. STATISTIKA
   ═══════════════════════════════════════════════════════════════ */
function calcStats(text,tokens){
  var words=tokens.filter(function(t){return t.t==='word';});
  var sentences=Math.max(1,(text.match(/[.!?]+/g)||[]).length);
  var paragraphs=Math.max(1,(text.match(/\n\s*\n/g)||[]).length+1);
  var chars=text.length, charsNs=text.replace(/\s/g,'').length;
  var avgWl=words.length?(words.reduce(function(s,w){return s+w.v.length;},0)/words.length).toFixed(1):0;
  var avgWps=(words.length/sentences).toFixed(1);
  var readTimeMin=Math.ceil(words.length/240), readTimeSec=Math.max(30,Math.ceil(words.length/4));
  var awl=parseFloat(avgWl), awps=parseFloat(avgWps), complexity, complexScore;
  if(awl>8 || awps>22){ complexity="Qiyin"; complexScore=3; }
  else if(awl>6 || awps>15){ complexity="O'rta"; complexScore=2; }
  else { complexity="Oson"; complexScore=1; }
  var uniq=new Set(words.map(function(w){return normWord(w.v);}));
  var lexRich=words.length?Math.round((uniq.size/words.length)*100):100;
  return {
    words:words.length, sentences:sentences, paragraphs:paragraphs,
    chars:chars, charsNs:charsNs,
    avgWordLen:avgWl, avgWordsPerSentence:avgWps,
    readTime: readTimeMin<1 ? readTimeSec+' soniya' : readTimeMin+' daqiqa',
    readTimeSec:readTimeSec, complexity:complexity, complexScore:complexScore,
    uniqueWords:uniq.size, lexRich:lexRich
  };
}

/* ═══════════════════════════════════════════════════════════════
   6. ASOSIY CHECK
   ═══════════════════════════════════════════════════════════════ */
function check(text,opts){
  opts=opts||{};
  if(!text || !text.trim()) return {errors:[],stats:null,tokens:[]};
  var tokens=tokenize(text), errs=[];
  if(opts.mixed!==false) errs=errs.concat(checkMixed(tokens));
  if(opts.spelling!==false) errs=errs.concat(checkSpelling(tokens));
  if(opts.apostrophe!==false) errs=errs.concat(checkApostrophe(tokens));
  if(opts.capital!==false) errs=errs.concat(checkCapitals(tokens));
  if(opts.repeat!==false) errs=errs.concat(checkRepeats(tokens));
  if(opts.punct!==false) errs=errs.concat(checkPunctuation(text));
  if(opts.joining!==false) errs=errs.concat(checkJoining(text));
  if(opts.style!==false) errs=errs.concat(checkStyle(text));
  if(opts.grammar!==false) errs=errs.concat(checkGrammar(text,tokens));

  /* Takror/overlapni tozalash. Aniq xato warningdan ustun. */
  var rank={error:3,warning:2,info:1};
  errs=errs.filter(function(e){return e && e.s!=null && e.e!=null && e.e>e.s;});
  errs.sort(function(a,b){
    if(a.s!==b.s) return a.s-b.s;
    return (rank[b.sev]||0)-(rank[a.sev]||0);
  });
  var out=[], seen={};
  errs.forEach(function(e){
    var k=e.s+'-'+e.e+'-'+(e.sug||'')+'-'+e.type;
    if(seen[k]) return;
    seen[k]=true;
    /* ayni joydagi exact apostrof/spell bor bo'lsa, fuzzy warningni tashlaymiz */
    var overlaps=out.some(function(o){return o.s===e.s && o.e===e.e && (rank[o.sev]||0)>=(rank[e.sev]||0);});
    if(!overlaps) out.push(e);
  });
  out.sort(function(a,b){return a.s-b.s;});
  return {errors:out, stats:calcStats(text,tokens), tokens:tokens};
}

/* ═══════════════════════════════════════════════════════════════
   7. HIGHLIGHT
   ═══════════════════════════════════════════════════════════════ */
function buildHighlighted(text,errors){
  if(!errors || !errors.length) return escHtml(text).replace(/\n/g,'<br>');
  var sorted=errors.slice().sort(function(a,b){return a.s-b.s;});
  var merged=[], last=-1;
  sorted.forEach(function(e){ if(e.s>=last){ merged.push(e); last=e.e; } });
  var out='', pos=0;
  merged.forEach(function(e){
    if(e.s>pos) out+=escHtml(text.slice(pos,e.s));
    var meta=(UZ_DICT.ERROR_META||{})[e.type]||{color:'#dc2626',bg:'#fef2f2'};
    var tip=escAttr('['+e.type+'] '+(e.msg||'')+(e.sug?' → '+e.sug:''));
    out+='<mark class="err-mark" style="background:'+meta.bg+';border-bottom:2px solid '+meta.color+';cursor:pointer;border-radius:2px;padding:0 1px;"'+
      ' data-type="'+escAttr(e.type)+'" data-s="'+e.s+'" data-e="'+e.e+'" data-sug="'+escAttr(e.sug||'')+'" data-msg="'+tip+'" title="'+tip+'">'+
      escHtml(text.slice(e.s,e.e))+'</mark>';
    pos=e.e;
  });
  if(pos<text.length) out+=escHtml(text.slice(pos));
  return out.replace(/\n/g,'<br>');
}
function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;'); }

return {check:check, buildHighlighted:buildHighlighted, tokenize:tokenize, escHtml:escHtml, _debug:{isKnownWord:isKnownWord,findSuggestion:findSuggestion}};
})();
