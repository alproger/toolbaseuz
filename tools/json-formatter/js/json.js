'use strict';
(function () {
  var inputEl    = document.getElementById('inputText');
  var outputEl   = document.getElementById('outputText');
  var btnFormat  = document.getElementById('btnFormat');
  var btnMinify  = document.getElementById('btnMinify');
  var btnPaste   = document.getElementById('btnPaste');
  var btnClear   = document.getElementById('btnClear');
  var btnCopy    = document.getElementById('btnCopy');
  var btnDownload= document.getElementById('btnDownload');
  var btnSample  = document.getElementById('btnSample');
  var indentSel  = document.getElementById('indentSel');
  var inputBlock = document.getElementById('inputBlock');
  var outputBlock= document.getElementById('outputBlock');
  var statsRow   = document.getElementById('statsRow');
  var statSize   = document.getElementById('statSize');
  var statKeys   = document.getElementById('statKeys');
  var statDepth  = document.getElementById('statDepth');
  var statType   = document.getElementById('statType');
  var errorBox   = document.getElementById('errorBox');
  var inCounter  = document.getElementById('inCounter');
  var outCounter = document.getElementById('outCounter');
  var toastEl    = document.getElementById('toast');
  var yearEl     = document.getElementById('year');
  var toastTimer = null;

  var SAMPLE = {"sayt":"toolbase.uz","tavsif":"Bepul onlayn vositalar","vositalar":[{"id":1,"nomi":"Lotin Krill","bepul":true},{"id":2,"nomi":"Son Soz","bepul":true},{"id":3,"nomi":"JSON Formatter","bepul":true}],"aloqa":{"telegram":"@toolbaseuz","email":"developerkadirov@gmail.com"},"versiya":1.0};

  function showToast(msg, type) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (type === 'error' ? ' toast-error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { toastEl.className = 'toast'; }, 2300);
  }

  function countKeys(val) {
    if (!val || typeof val !== 'object') return 0;
    var n = 0;
    if (Array.isArray(val)) { for (var i=0;i<val.length;i++) n+=countKeys(val[i]); }
    else { var ks=Object.keys(val); n+=ks.length; for (var k=0;k<ks.length;k++) n+=countKeys(val[ks[k]]); }
    return n;
  }
  function maxDepth(val, d) {
    d=d||0; if(!val||typeof val!=='object') return d;
    var items=Array.isArray(val)?val:Object.values(val); if(!items.length) return d;
    var m=d; for(var i=0;i<items.length;i++){var c=maxDepth(items[i],d+1);if(c>m)m=c;} return m;
  }
  function rootType(val) {
    if(val===null) return 'null';
    if(Array.isArray(val)) return 'Array['+val.length+']';
    if(typeof val==='object') return 'Object{'+Object.keys(val).length+'}';
    return typeof val;
  }
  function byteSize(str) {
    var b=new TextEncoder().encode(str).length;
    return b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(2)+' MB';
  }

  function showStats(parsed, text) {
    statSize.textContent  = byteSize(text);
    statKeys.textContent  = countKeys(parsed);
    statDepth.textContent = maxDepth(parsed);
    statType.textContent  = rootType(parsed);
    statsRow.style.display = 'flex';
  }

  function updateCounter(el, text) {
    var lines = text ? text.split('\n').length : 0;
    el.textContent = lines + ' qator · ' + (text?text.length:0) + ' belgi';
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
    inputBlock.classList.add('has-error');
    inputBlock.classList.remove('has-valid');
    outputEl.value = '';
    updateCounter(outCounter, '');
    statsRow.style.display = 'none';
  }
  function clearError() {
    errorBox.style.display = 'none';
    inputBlock.classList.remove('has-error');
  }

  function friendlyError(msg, raw) {
    var m = msg.match(/position (\d+)/i);
    if (m) {
      var pos=parseInt(m[1],10), before=raw.substring(0,pos), lines=before.split('\n');
      return msg + ' → ' + lines.length + '-qator, ' + (lines[lines.length-1].length+1) + '-ustun';
    }
    return msg;
  }

  function getIndent() {
    var v=indentSel.value; return v==='tab'?'\t':parseInt(v,10);
  }

  function setActiveMode(m) {
    btnFormat.classList.toggle('active', m==='format');
    btnMinify.classList.toggle('active', m==='minify');
  }

  function doFormat() {
    var raw=inputEl.value.trim();
    if(!raw){showError('Maydon bo\'sh — JSON matnini kiriting.');return;}
    try {
      var parsed=JSON.parse(raw), result=JSON.stringify(parsed,null,getIndent());
      clearError(); outputEl.value=result;
      outputBlock.classList.add('has-valid'); outputBlock.classList.remove('has-error');
      updateCounter(outCounter,result); showStats(parsed,result); setActiveMode('format');
    } catch(e) { showError(friendlyError(e.message,raw)); }
  }

  function doMinify() {
    var raw=inputEl.value.trim();
    if(!raw){showError('Maydon bo\'sh — JSON matnini kiriting.');return;}
    try {
      var parsed=JSON.parse(raw), result=JSON.stringify(parsed);
      clearError(); outputEl.value=result;
      outputBlock.classList.add('has-valid'); outputBlock.classList.remove('has-error');
      updateCounter(outCounter,result); showStats(parsed,result); setActiveMode('minify');
    } catch(e) { showError(friendlyError(e.message,raw)); }
  }

  btnFormat.addEventListener('click', doFormat);
  btnMinify.addEventListener('click', doMinify);

  btnPaste.addEventListener('click', function() {
    if(navigator.clipboard&&navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function(t){
        inputEl.value=t; updateCounter(inCounter,t); doFormat(); inputEl.focus();
      }).catch(function(){ inputEl.focus(); showToast('Ctrl+V bosing','error'); });
    } else { inputEl.focus(); showToast('Ctrl+V bosing'); }
  });

  btnClear.addEventListener('click', function() {
    inputEl.value=''; outputEl.value='';
    clearError(); statsRow.style.display='none';
    outputBlock.classList.remove('has-valid','has-error');
    inputBlock.classList.remove('has-valid','has-error');
    setActiveMode('');
    updateCounter(inCounter,''); updateCounter(outCounter,''); inputEl.focus();
  });

  btnCopy.addEventListener('click', function() {
    if(!outputEl.value){showToast('Natija bo\'sh','error');return;}
    if(navigator.clipboard) {
      navigator.clipboard.writeText(outputEl.value).then(function(){showToast('Nusxalandi \u2713');});
    } else { outputEl.select(); document.execCommand('copy'); showToast('Nusxalandi \u2713'); }
  });

  btnDownload.addEventListener('click', function() {
    if(!outputEl.value){showToast('Natija bo\'sh','error');return;}
    var blob=new Blob([outputEl.value],{type:'application/json;charset=utf-8'});
    var url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download='formatted.json'; a.click(); URL.revokeObjectURL(url);
    showToast('Yuklab olindi \u2713');
  });

  btnSample.addEventListener('click', function() {
    inputEl.value=JSON.stringify(SAMPLE);
    updateCounter(inCounter,inputEl.value); doFormat();
  });

  var debTimer;
  inputEl.addEventListener('input', function() {
    updateCounter(inCounter, inputEl.value);
    clearTimeout(debTimer);
    debTimer=setTimeout(function(){
      if(inputEl.value.trim()) doFormat();
      else { clearError(); statsRow.style.display='none'; outputEl.value=''; updateCounter(outCounter,''); setActiveMode(''); }
    },420);
  });

  inputEl.addEventListener('dragover',function(e){e.preventDefault();});
  inputEl.addEventListener('drop',function(e){
    e.preventDefault(); var file=e.dataTransfer.files[0]; if(!file) return;
    var reader=new FileReader();
    reader.onload=function(ev){inputEl.value=ev.target.result;updateCounter(inCounter,ev.target.result);doFormat();};
    reader.readAsText(file);
  });

  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();doFormat();}
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==='M'){e.preventDefault();doMinify();}
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==='C'){e.preventDefault();if(outputEl.value)btnCopy.click();}
  });

  if(yearEl) yearEl.textContent=String(new Date().getFullYear());
  inputEl.focus();
})();
