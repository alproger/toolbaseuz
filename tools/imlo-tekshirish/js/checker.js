'use strict';
/* ================================================================
   toolbase.uz — O'zbek Imlo Tekshiruvi
   js/checker.js  —  Asosiy tekshiruv mexanizmi
   ================================================================ */

var UzChecker = (function(){

/* ═══════════════════════════════════════════════════════════════
   1. TOKENIZER
   ═══════════════════════════════════════════════════════════════ */
function tokenize(text){
  var tokens=[], i=0, n=text.length;
  while(i<n){
    /* Yangi qator */
    if(text[i]==='\n'){
      tokens.push({t:'nl', v:'\n', s:i, e:i+1}); i++; continue;
    }
    /* Bo'sh joy */
    if(/[ \t]/.test(text[i])){
      var ws='', si=i;
      while(i<n && /[ \t]/.test(text[i])) ws+=text[i++];
      tokens.push({t:'space', v:ws, s:si, e:i}); continue;
    }
    /* Tinish belgilari */
    if(/[.!?,;:«»"'\u201C\u201D()\[\]{}\u2014\u2013\-]/.test(text[i])){
      /* Ellipsis */
      if(text[i]==='.' && text[i+1]==='.' && text[i+2]==='.'){
        tokens.push({t:'ellipsis', v:'...', s:i, e:i+3}); i+=3; continue;
      }
      tokens.push({t:'punct', v:text[i], s:i, e:i+1}); i++; continue;
    }
    /* Raqam */
    if(/\d/.test(text[i])){
      var num='', ni=i;
      while(i<n && /[\d.,]/.test(text[i])) num+=text[i++];
      tokens.push({t:'num', v:num, s:ni, e:i}); continue;
    }
    /* So'z — lotin, krill, apostrof */
    if(/[a-zA-ZА-Яа-яёЁ\u02BC\u2018\u2019'`]/i.test(text[i])){
      var word='', wi=i;
      while(i<n && /[a-zA-ZА-Яа-яёЁ\u02BC\u2018\u2019'`\-]/i.test(text[i])){
        word+=text[i++];
      }
      /* Oxiridagi tire yoki apostrof ajratib tashlash */
      while(word.length>0 && /[-']/.test(word[word.length-1])){
        word=word.slice(0,-1); i--;
      }
      tokens.push({t:'word', v:word, s:wi, e:wi+word.length}); continue;
    }
    tokens.push({t:'other', v:text[i], s:i, e:i+1}); i++;
  }
  return tokens;
}

/* ═══════════════════════════════════════════════════════════════
   2. HELPERS
   ═══════════════════════════════════════════════════════════════ */
function normApos(w){
  return w.replace(/[\u02BC\u2018\u2019`]/g,"'");
}
function isCyrillic(w){ return /[А-Яа-яёЁ]/.test(w); }
function isLatin(w)   { return /[a-zA-Z]/.test(w); }
function hasMixed(w)  { return isLatin(w) && isCyrillic(w); }
function escRe(s)     { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function sentStart(tokens, idx){
  /* Oldingi token gap tugash belgilaridan biri yoki boshidami? */
  for(var j=idx-1; j>=0; j--){
    var t=tokens[j];
    if(t.t==='nl'||t.t==='space') continue;
    if(t.t==='punct' && /[.!?]/.test(t.v)) return true;
    return false;
  }
  return true; /* matn boshi */
}

/* ═══════════════════════════════════════════════════════════════
   3. TEKSHIRUV FUNKSIYALARI
   ═══════════════════════════════════════════════════════════════ */

/* 3-A. Aralash alifbo */
function checkMixed(tokens){
  var errs=[];
  tokens.forEach(function(tok){
    if(tok.t!=='word') return;
    if(hasMixed(tok.v)){
      errs.push({type:'mix', sev:'error',
        s:tok.s, e:tok.e, found:tok.v, sug:'',
        msg:'Bir so\'zda lotin va krill harflari aralashtirilgan: "'+tok.v+'"'});
    }
  });
  return errs;
}

/* 3-B. Imlo lug'ati + apostrof tekshiruvi */
function checkSpelling(tokens){
  var errs=[];
  var dict=UZ_DICT.MISSPELLED;

  tokens.forEach(function(tok){
    if(tok.t!=='word') return;
    if(isCyrillic(tok.v)) return; /* Krill so'zlarni o'tkazib yuboramiz */

    var norm=normApos(tok.v.toLowerCase());
    var entry=dict[norm];
    if(!entry || entry.t==='ok') return;

    errs.push({
      type: entry.t,
      sev: entry.t==='style' ? 'info' : 'error',
      s:tok.s, e:tok.e,
      found:tok.v, sug:entry.c,
      msg: entry.m || "To'g'ri imlosi: "+entry.c
    });
  });
  return errs;
}

/* 3-C. Apostrof aniqroq tekshiruvi (lug'at ro'yxatdan) */
function checkApostrophe(tokens){
  var errs=[];
  var apList=UZ_DICT.APOSTROPHE_LIST;

  /* Apostrof ro'yxatidagi so'zlar uchun apostrofsiz variantlar jadvalini quramiz */
  var apoMap={};
  apList.forEach(function(w){
    var clean=w.replace(/'/g,'');
    if(!apoMap[clean]) apoMap[clean]=w;
  });

  tokens.forEach(function(tok){
    if(tok.t!=='word') return;
    if(isCyrillic(tok.v)) return;

    var norm=normApos(tok.v.toLowerCase());
    /* Agar apostrof yo'q bo'lsa va lug'atda apostrof bilan versiyasi bo'lsa */
    if(norm.indexOf("'")<0 && apoMap[norm]){
      var correct=apoMap[norm];
      /* Agar allaqachon MISSPELLED da bor bo'lsa, ikki marta qo'shmaymiz */
      if(UZ_DICT.MISSPELLED[norm]) return;
      errs.push({
        type:'apos', sev:'error',
        s:tok.s, e:tok.e,
        found:tok.v, sug:correct,
        msg:"Apostrof tushib qolgan yoki noto'g'ri: '"+tok.v+"' → '"+correct+"'"
      });
    }
  });
  return errs;
}

/* 3-D. Katta harf tekshiruvi */
function checkCapitals(tokens){
  var errs=[];
  /* Gap boshi olmoshlari va bog'lovchilar — ularga katta harf qo'yilmasligi mumkin */
  var skipList=new Set(['va','yoki','lekin','ammo','biroq','chunki','agar','ham',
    'bilan','uchun','da','ga','ni','dan','ta','chi','esa','balki']);

  for(var i=0; i<tokens.length; i++){
    var tok=tokens[i];
    if(tok.t!=='word') continue;
    var first=tok.v[0];
    if(!first) continue;

    /* Gap boshida turgan so'zmi? */
    if(sentStart(tokens,i)){
      if(first===first.toLowerCase() && /[a-z]/i.test(first)){
        var lower=tok.v.toLowerCase();
        if(!skipList.has(lower)){
          errs.push({type:'cap', sev:'warning',
            s:tok.s, e:tok.e, found:tok.v,
            sug:tok.v[0].toUpperCase()+tok.v.slice(1),
            msg:'Gap boshi katta harf bilan boshlanishi kerak'});
        }
      }
    }
  }
  return errs;
}

/* 3-E. Takrorlangan so'zlar */
function checkRepeats(tokens){
  var errs=[];
  var words=tokens.filter(function(t){ return t.t==='word'; });
  var ok=new Set(['ha','yo','qo','lo','goh','jim']);

  for(var i=1; i<words.length; i++){
    var cur =normApos(words[i].v.toLowerCase());
    var prev=normApos(words[i-1].v.toLowerCase());
    if(cur===prev && cur.length>1 && !ok.has(cur)){
      errs.push({type:'repeat', sev:'warning',
        s:words[i].s, e:words[i].e,
        found:words[i].v, sug:'',
        msg:'"'+words[i].v+'" so\'zi ketma-ket takrorlangan'});
    }
  }
  return errs;
}

/* 3-F. Tinish belgilari */
function checkPunctuation(text){
  var errs=[];

  UZ_DICT.PUNCT_RULES.forEach(function(rule){
    var re=new RegExp(rule.pat.source, rule.pat.flags);
    var m;
    while((m=re.exec(text))!==null){
      /* Ellipsis (...) bundan mustasno */
      if(m[0]==='...' || (m[0][0]==='.' && text[m.index+1]==='.' && text[m.index+2]==='.')) continue;
      errs.push({type:'punct', sev:rule.sev,
        s:m.index, e:m.index+m[0].length,
        found:m[0], sug: rule.fix ? rule.fix(m[0]) : '',
        msg:rule.msg});
    }
  });
  return errs;
}

/* 3-G. Birikib/ajralib yozilish */
function checkJoining(text){
  var errs=[];
  UZ_DICT.JOININGS.forEach(function(j){
    if(j.ok) return;
    var re=new RegExp('\\b'+escRe(j.wrong)+'\\b','gi');
    var m;
    while((m=re.exec(text))!==null){
      errs.push({type:'join', sev:'error',
        s:m.index, e:m.index+m[0].length,
        found:m[0], sug:j.right,
        msg:j.m||"To'g'ri yozilishi: '"+j.right+"'"});
    }
  });
  return errs;
}

/* 3-H. Uslub tekshiruvi */
function checkStyle(text){
  var errs=[];
  UZ_DICT.STYLE_RULES.forEach(function(r){
    var re=new RegExp('\\b'+escRe(r.w)+'\\b','gi');
    var m;
    while((m=re.exec(text))!==null){
      errs.push({type:'style', sev:'info',
        s:m.index, e:m.index+m[0].length,
        found:m[0], sug:r.r,
        msg:r.m});
    }
  });
  return errs;
}

/* 3-I. Grammatik qoidalar */
function checkGrammar(text, tokens){
  var errs=[];
  UZ_DICT.GRAMMAR_RULES.forEach(function(rule){
    if(typeof rule.check==='function'){
      try{
        var res=rule.check(text, tokens);
        if(res && res.length){
          res.forEach(function(e){
            e.type=e.type||'grammar';
            e.sev=e.sev||'warning';
            errs.push(e);
          });
        }
      }catch(ex){ /* qoida xatosi */ }
    }
  });
  return errs;
}

/* ═══════════════════════════════════════════════════════════════
   4. STATISTIKA
   ═══════════════════════════════════════════════════════════════ */
function calcStats(text, tokens){
  var words=tokens.filter(function(t){ return t.t==='word'; });
  var sentences=Math.max(1, (text.match(/[.!?]+/g)||[]).length);
  var paragraphs=Math.max(1, (text.match(/\n\s*\n/g)||[]).length+1);
  var chars=text.length;
  var charsNs=text.replace(/\s/g,'').length;
  var avgWl=words.length
    ? (words.reduce(function(s,w){return s+w.v.length;},0)/words.length).toFixed(1)
    : 0;
  var avgWps=(words.length/sentences).toFixed(1);
  var readTimeSec=Math.max(30, Math.ceil(words.length/4)); /* 240 so'z/daqiqa */
  var readTimeMin=Math.ceil(words.length/240);

  /* Murakkablik */
  var awl=parseFloat(avgWl), awps=parseFloat(avgWps);
  var complexity, complexScore;
  if(awl>8 || awps>22){ complexity="Qiyin";      complexScore=3; }
  else if(awl>6||awps>15){ complexity="O'rta";   complexScore=2; }
  else {                   complexity="Oson";     complexScore=1; }

  /* Leksik boylik (unique so'zlar nisbati) */
  var uniq=new Set(words.map(function(w){ return normApos(w.v.toLowerCase()); }));
  var lexRich=words.length>0
    ? Math.round((uniq.size/words.length)*100)
    : 100;

  /* O'qish vaqti */
  var readLabel = readTimeMin<1
    ? readTimeSec+" soniya"
    : readTimeMin+" daqiqa";

  return {
    words:words.length, sentences, paragraphs,
    chars, charsNs,
    avgWordLen:avgWl, avgWordsPerSentence:avgWps,
    readTime:readLabel, readTimeSec,
    complexity, complexScore,
    uniqueWords:uniq.size, lexRich
  };
}

/* ═══════════════════════════════════════════════════════════════
   5. ASOSIY CHECK FUNKSIYASI
   ═══════════════════════════════════════════════════════════════ */
function check(text, opts){
  opts=opts||{};
  if(!text||!text.trim()) return {errors:[],stats:null,tokens:[]};

  var tokens=tokenize(text);
  var errs=[];

  if(opts.mixed   !==false) errs=errs.concat(checkMixed(tokens));
  if(opts.spelling!==false) errs=errs.concat(checkSpelling(tokens));
  if(opts.apostrophe!==false) errs=errs.concat(checkApostrophe(tokens));
  if(opts.capital !==false) errs=errs.concat(checkCapitals(tokens));
  if(opts.repeat  !==false) errs=errs.concat(checkRepeats(tokens));
  if(opts.punct   !==false) errs=errs.concat(checkPunctuation(text));
  if(opts.joining !==false) errs=errs.concat(checkJoining(text));
  if(opts.style   !==false) errs=errs.concat(checkStyle(text));
  if(opts.grammar !==false) errs=errs.concat(checkGrammar(text,tokens));

  /* Ikki marta qo'shilgan xatolarni olib tashlash */
  var seen={};
  errs=errs.filter(function(e){
    var k=(e.s||0)+'-'+(e.e||0)+'-'+e.type;
    if(seen[k]) return false;
    return (seen[k]=true);
  });

  /* Pozitsiya bo'yicha saralash */
  errs.sort(function(a,b){ return (a.s||0)-(b.s||0); });

  var stats=calcStats(text,tokens);
  return {errors:errs, stats, tokens};
}

/* ═══════════════════════════════════════════════════════════════
   6. MATNNI BELGILASH (highlight)
   ═══════════════════════════════════════════════════════════════ */
function buildHighlighted(text, errors){
  if(!errors.length) return escHtml(text);

  /* Overlap bo'lmagan xatolarni saralash */
  var sorted=errors.slice().sort(function(a,b){ return a.s-b.s; });
  var merged=[], last=-1;
  sorted.forEach(function(e){
    if(e.s>=last){
      merged.push(e);
      last=e.e;
    }
  });

  var out='', pos=0;
  merged.forEach(function(e){
    if(e.s>pos) out+=escHtml(text.slice(pos,e.s));
    var meta=UZ_DICT.ERROR_META[e.type]||{color:'#dc2626',bg:'#fef2f2'};
    var tip=escAttr('['+e.type+'] '+(e.msg||'')+(e.sug?' → '+e.sug:''));
    out+='<mark class="err-mark" style="background:'+meta.bg+
         ';border-bottom:2px solid '+meta.color+
         ';cursor:pointer;border-radius:2px;padding:0 1px;"'+
         ' data-type="'+e.type+'"'+
         ' data-sug="'+escAttr(e.sug||'')+'"'+
         ' data-msg="'+tip+'"'+
         ' title="'+tip+'"'+
         '>'+escHtml(text.slice(e.s,e.e))+'</mark>';
    pos=e.e;
  });
  if(pos<text.length) out+=escHtml(text.slice(pos));
  return out.replace(/\n/g,'<br>');
}

function escHtml(s){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s){
  return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function normApos(w){
  return w.replace(/[\u02BC\u2018\u2019`]/g,"'");
}

return {check, buildHighlighted, tokenize, escHtml};
})();
