/**
 * toolbase.uz — Rasm O'lchamini O'zgartirish
 * 100% client-side · Canvas API · JSZip
 */
(function () {
  'use strict';

  const CATS = {
    doc: { presets:[
      {id:'p3x4',   name:'Pasport 3x4',  w:3,   h:4,   unit:'cm', dpi:300, fit:'cover'},
      {id:'p4x6',   name:'Pasport 4x6',  w:4,   h:6,   unit:'cm', dpi:300, fit:'cover'},
      {id:'v3545',  name:'Viza 35x45',   w:3.5, h:4.5, unit:'cm', dpi:300, fit:'cover'},
      {id:'v5151',  name:'Viza 51x51',   w:5.1, h:5.1, unit:'cm', dpi:300, fit:'cover'},
      {id:'id64',   name:'ID karta 6x4', w:6,   h:4,   unit:'cm', dpi:300, fit:'cover'},
      {id:'biz',    name:'Vizit karta',  w:9,   h:5.5, unit:'cm', dpi:300, fit:'cover'},
    ]},
    social: { presets:[
      {id:'tgch',   name:'Telegram',     w:800,  h:800,  unit:'px', fit:'cover'},
      {id:'tgpost', name:'TG post',      w:1280, h:720,  unit:'px', fit:'cover'},
      {id:'igsq',   name:'IG kvadrat',   w:1080, h:1080, unit:'px', fit:'cover'},
      {id:'igst',   name:'IG story',     w:1080, h:1920, unit:'px', fit:'cover'},
      {id:'igport', name:'IG portret',   w:1080, h:1350, unit:'px', fit:'cover'},
      {id:'fbpost', name:'FB post',      w:1200, h:630,  unit:'px', fit:'cover'},
      {id:'fbcov',  name:'FB muqova',    w:820,  h:312,  unit:'px', fit:'cover'},
      {id:'yt',     name:'YouTube',      w:1280, h:720,  unit:'px', fit:'cover'},
    ]},
    print: { presets:[
      {id:'a4p',  name:'A4 vertikal',   w:21,   h:29.7, unit:'cm', dpi:300, fit:'contain'},
      {id:'a4l',  name:'A4 gorizont',   w:29.7, h:21,   unit:'cm', dpi:300, fit:'contain'},
      {id:'a5',   name:'A5',            w:14.8, h:21,   unit:'cm', dpi:300, fit:'contain'},
      {id:'a6',   name:'A6',            w:10.5, h:14.8, unit:'cm', dpi:300, fit:'contain'},
      {id:'lett', name:'Letter',        w:21.6, h:27.9, unit:'cm', dpi:300, fit:'contain'},
      {id:'bann', name:'Banner 100x30', w:100,  h:30,   unit:'cm', dpi:150, fit:'fill'},
    ]},
    screen: { presets:[
      {id:'hd',    name:'HD 720p',     w:1280, h:720,  unit:'px', fit:'cover'},
      {id:'fhd',   name:'FHD 1080p',   w:1920, h:1080, unit:'px', fit:'cover'},
      {id:'2k',    name:'2K 1440p',    w:2560, h:1440, unit:'px', fit:'cover'},
      {id:'sq512', name:'Kvadrat 512', w:512,  h:512,  unit:'px', fit:'cover'},
      {id:'ico256',name:'Favicon 256', w:256,  h:256,  unit:'px', fit:'cover'},
      {id:'ico128',name:'Favicon 128', w:128,  h:128,  unit:'px', fit:'cover'},
    ]},
  };

  let files = [], activePreset = null, activeCat = 'doc', previewMode = 'after';
  let currentOrigImg = null, currentResultBlob = null;

  const $ = id => document.getElementById(id);
  const catTabs=$('.cat-tabs')?document.querySelectorAll('.cat-tab'):[];
  const presetGrid=$('presetGrid');
  const inW=$('inW'),inH=$('inH'),selUnit=$('selUnit'),selDpi=$('selDpi');
  const dpiRow=$('dpiRow'),pxHint=$('pxHint');
  const selFit=$('selFit'),selFmt=$('selFmt');
  const qualSlider=$('qualSlider'),qualVal=$('qualVal');
  const dropZone=$('dropZone'),fileInput=$('fileInput');
  const errBox=$('errBox'),fileList=$('fileList');
  const cntBadge=$('cntBadge'),cntText=$('cntText');
  const actionPan=$('actionPan'),btnGo=$('btnGo'),btnClear=$('btnClear');
  const progWrap=$('progWrap'),progFill=$('progFill'),progLabel=$('progLabel');
  const resultBar=$('resultBar'),resultTxt=$('resultTxt'),btnZip=$('btnZip');
  const toastEl=$('toast');
  const previewCanvas=$('previewCanvas'),previewEmpty=$('previewEmpty'),previewWrap=$('previewWrap');
  const previewInfo=$('previewInfo');
  const baTabs=document.querySelectorAll('.ba-tab');
  const btnDlSingle=$('btnDlSingle');

  function buildGrid(cat){
    presetGrid.innerHTML='';
    CATS[cat].presets.forEach(p=>{
      const btn=document.createElement('button');
      btn.className='preset-btn'+(activePreset&&activePreset.id===p.id?' active':'');
      btn.dataset.id=p.id;
      const ratio=p.w/p.h;
      let bw,bh;
      if(ratio>=1){bw=38;bh=Math.round(38/ratio);}else{bh=38;bw=Math.round(38*ratio);}
      const sz=p.unit==='cm'?p.w+'x'+p.h+'sm':p.w+'x'+p.h+'px';
      btn.innerHTML='<div class="pb-visual" style="width:'+bw+'px;height:'+bh+'px"></div>'
        +'<div class="pb-name">'+p.name+'</div>'+'<div class="pb-size">'+sz+'</div>';
      btn.addEventListener('click',()=>applyPreset(p));
      presetGrid.appendChild(btn);
    });
  }

  function applyPreset(p){
    activePreset=p;
    presetGrid.querySelectorAll('.preset-btn').forEach(b=>b.classList.toggle('active',b.dataset.id===p.id));
    inW.value=p.w;inH.value=p.h;selUnit.value=p.unit;
    if(p.dpi)selDpi.value=String(p.dpi);
    if(p.fit)selFit.value=p.fit;
    syncUnit();refreshPreview();
  }

  document.querySelectorAll('.cat-tab').forEach(t=>t.addEventListener('click',()=>{
    document.querySelectorAll('.cat-tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');activeCat=t.dataset.cat;activePreset=null;buildGrid(activeCat);
  }));

  buildGrid('doc');applyPreset(CATS.doc.presets[0]);

  [selUnit,selDpi,selFit,selFmt].forEach(el=>el&&el.addEventListener('change',()=>{syncUnit();refreshPreview();}));
  [inW,inH].forEach(el=>el&&el.addEventListener('input',()=>{syncUnit();refreshPreview();}));
  qualSlider&&qualSlider.addEventListener('input',()=>{qualVal.textContent=qualSlider.value+'%';});

  function syncUnit(){
    const isPx=selUnit.value==='px';
    dpiRow.style.display=isPx?'none':'flex';
    const px=getTargetPx();
    pxHint.textContent=(!isPx&&px)?'approx '+px.w+'x'+px.h+'px':'';
  }
  syncUnit();

  dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('drag-over');});
  ['dragleave','dragend'].forEach(ev=>dropZone.addEventListener(ev,()=>dropZone.classList.remove('drag-over')));
  dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('drag-over');addFiles([...e.dataTransfer.files]);});
  fileInput.addEventListener('change',()=>{addFiles([...fileInput.files]);fileInput.value='';});

  function addFiles(incoming){
    clearErr();
    const imgs=incoming.filter(f=>f.type.startsWith('image/'));
    if(!imgs.length){showErr('Faqat rasm fayllari qabul qilinadi.');return;}
    const free=20-files.length;
    if(free<=0){showErr('Maksimal 20 ta rasm.');return;}
    imgs.slice(0,free).forEach(f=>{
      if(f.size>60*1024*1024)return;
      const id=Date.now().toString(36)+Math.random().toString(36).slice(2);
      const url=URL.createObjectURL(f);
      files.push({id,file:f,url,status:'pending',blob:null});
      addRow(files[files.length-1]);
    });
    renderUI();
    if(files.length===1)loadPreviewOrig(files[0]);
  }

  function addRow(item){
    const row=document.createElement('div');
    row.className='file-row';row.id='row-'+item.id;
    const mb=(item.file.size/1048576).toFixed(1);
    row.innerHTML='<img class="file-thumb" src="'+item.url+'" alt="" />'
      +'<div class="file-info"><div class="file-name">'+esc(item.file.name)+'</div>'
      +'<div class="file-meta">'+mb+' MB <span id="dim-'+item.id+'"></span></div></div>'
      +'<span class="file-status pending" id="st-'+item.id+'">Kutmoqda</span>'
      +'<div class="file-actions">'
      +'<button class="f-btn dl" id="dl-'+item.id+'" style="display:none" title="Yuklab olish">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
      +'</button>'
      +'<button class="f-btn rm" data-id="'+item.id+'" title="O\'chirish">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>'
      +'</button></div>';
    fileList.appendChild(row);
    const img=new Image();
    img.onload=()=>{const d=$('dim-'+item.id);if(d)d.textContent=' \u00b7 '+img.naturalWidth+'\u00d7'+img.naturalHeight+'px';};
    img.src=item.url;
    row.addEventListener('click',e=>{if(e.target.closest('.f-btn'))return;loadPreviewOrig(item);});
    row.querySelector('.rm').addEventListener('click',()=>delFile(item.id));
    $('dl-'+item.id).addEventListener('click',()=>{if(item.blob)dlBlob(item.blob,outName(item.file.name));});
  }

  function delFile(id){
    files=files.filter(f=>f.id!==id);
    $('row-'+id)&&$('row-'+id).remove();
    if(!files.length)clearPreview();
    renderUI();
  }

  function renderUI(){
    const n=files.length;
    cntBadge.classList.toggle('show',n>0);
    cntText.textContent=n+' ta rasm';
    actionPan.style.display=n?'flex':'none';
    if(!n){resultBar.classList.remove('show');progWrap.classList.remove('show');}
  }

  function loadPreviewOrig(item){
    currentResultBlob=null;
    const img=new Image();
    img.onload=()=>{currentOrigImg=img;if(previewMode==='before')drawBefore(img);else drawAfter(img);};
    img.src=item.url;
  }

  function drawBefore(img){
    previewEmpty.style.display='none';previewCanvas.style.display='block';
    const mW=300,mH=240;
    const sc=Math.min(mW/img.naturalWidth,mH/img.naturalHeight,1);
    previewCanvas.width=Math.round(img.naturalWidth*sc);
    previewCanvas.height=Math.round(img.naturalHeight*sc);
    previewCanvas.getContext('2d').drawImage(img,0,0,previewCanvas.width,previewCanvas.height);
    previewWrap.classList.remove('white-bg');
    updateInfo(img.naturalWidth,img.naturalHeight,null,null);
    btnDlSingle.disabled=true;
  }

  function drawAfter(img){
    const target=getTargetPx();
    if(!target){drawBefore(img);return;}
    const fit=selFit.value,qual=parseInt(qualSlider.value)/100;
    const fmt=getMime(selFmt.value,{type:'image/jpeg'});
    const off=document.createElement('canvas');
    off.width=target.w;off.height=target.h;
    const ctx=off.getContext('2d');
    const sw=img.naturalWidth,sh=img.naturalHeight,tw=target.w,th=target.h;
    if(fmt==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,tw,th);}
    if(fit==='fill'){ctx.drawImage(img,0,0,tw,th);}
    else if(fit==='contain'){const s=Math.min(tw/sw,th/sh);ctx.drawImage(img,(tw-sw*s)/2,(th-sh*s)/2,sw*s,sh*s);}
    else{const s=Math.max(tw/sw,th/sh);ctx.drawImage(img,(tw-sw*s)/2,(th-sh*s)/2,sw*s,sh*s);}
    const mW=300,mH=240,pSc=Math.min(mW/tw,mH/th,1);
    previewCanvas.width=Math.round(tw*pSc);previewCanvas.height=Math.round(th*pSc);
    previewCanvas.getContext('2d').drawImage(off,0,0,previewCanvas.width,previewCanvas.height);
    previewCanvas.style.display='block';previewEmpty.style.display='none';
    previewWrap.classList.toggle('white-bg',fmt==='image/jpeg');
    updateInfo(sw,sh,tw,th);
    off.toBlob(blob=>{currentResultBlob=blob;btnDlSingle.disabled=!blob;},fmt,fmt==='image/png'?undefined:qual);
  }

  function updateInfo(ow,oh,nw,nh){
    if(!nw)previewInfo.innerHTML='<strong>'+ow+'\u00d7'+oh+'px</strong>';
    else previewInfo.innerHTML='<strong>'+ow+'\u00d7'+oh+'px</strong> <span class="arrow">\u2192</span> <strong>'+nw+'\u00d7'+nh+'px</strong>';
  }

  function clearPreview(){
    previewCanvas.style.display='none';previewEmpty.style.display='flex';
    previewInfo.innerHTML='';currentOrigImg=null;currentResultBlob=null;btnDlSingle.disabled=true;
  }

  function refreshPreview(){if(!currentOrigImg)return;if(previewMode==='before')drawBefore(currentOrigImg);else drawAfter(currentOrigImg);}

  baTabs.forEach(t=>t.addEventListener('click',()=>{
    baTabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');
    previewMode=t.dataset.mode;refreshPreview();
  }));

  btnDlSingle.addEventListener('click',()=>{
    if(!currentResultBlob)return;
    const name=files.length?outName(files[0].file.name):'resized.jpg';
    dlBlob(currentResultBlob,name);toast('Yuklab olindi','ok');
  });

  btnGo.addEventListener('click',runResize);
  btnClear.addEventListener('click',clearAll);
  btnZip.addEventListener('click',doZip);

  async function runResize(){
    clearErr();const target=getTargetPx();
    if(!target||target.w<1||target.h<1){showErr("O'lchamni to'g'ri kiriting.");return;}
    btnGo.disabled=true;resultBar.classList.remove('show');
    progWrap.classList.add('show');progFill.style.width='0%';
    const fmt=selFmt.value,qual=parseInt(qualSlider.value)/100,fit=selFit.value;
    let done=0;
    for(const item of files){
      setSt(item.id,'proc','Ishlanmoqda...');
      try{
        item.blob=await resizeOne(item.file,target,fit,fmt,qual);
        setSt(item.id,'done','\u2713 Tayyor');
        $('row-'+item.id).className='file-row done';
        const dlb=$('dl-'+item.id);if(dlb)dlb.style.display='flex';
        if(done===0){
          currentResultBlob=item.blob;previewMode='after';
          baTabs.forEach(t=>t.classList.toggle('active',t.dataset.mode==='after'));
          loadPreviewOrig(item);
        }
      }catch{setSt(item.id,'error','\u2717 Xato');$('row-'+item.id).className='file-row error';}
      done++;progFill.style.width=Math.round(done/files.length*100)+'%';
      progLabel.textContent=done+' / '+files.length;
    }
    btnGo.disabled=false;
    const ok=files.filter(f=>f.blob).length;
    resultBar.classList.add('show');resultTxt.textContent=ok+" ta rasm o'zgartirildi";
    toast(ok+' ta tayyor','ok');
  }

  function resizeOne(file,target,fit,fmt,quality){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const sw=img.naturalWidth,sh=img.naturalHeight,tw=target.w,th=target.h;
          const canvas=document.createElement('canvas');canvas.width=tw;canvas.height=th;
          const ctx=canvas.getContext('2d');const mime=getMime(fmt,file);
          if(mime==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,tw,th);}
          if(fit==='fill'){ctx.drawImage(img,0,0,tw,th);}
          else if(fit==='contain'){const s=Math.min(tw/sw,th/sh);ctx.drawImage(img,(tw-sw*s)/2,(th-sh*s)/2,sw*s,sh*s);}
          else{const s=Math.max(tw/sw,th/sh);ctx.drawImage(img,(tw-sw*s)/2,(th-sh*s)/2,sw*s,sh*s);}
          canvas.toBlob(b=>b?resolve(b):reject(new Error('fail')),mime,mime==='image/png'?undefined:quality);
        }catch(e){reject(e);}
      };
      img.onerror=reject;img.src=URL.createObjectURL(file);
    });
  }

  async function doZip(){
    const ready=files.filter(f=>f.blob);if(!ready.length)return;
    btnZip.disabled=true;btnZip.textContent='Tayyorlanmoqda...';
    const zip=new window.JSZip();
    ready.forEach(item=>zip.file(outName(item.file.name),item.blob));
    const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});
    dlBlob(blob,'toolbase-resized.zip');
    btnZip.disabled=false;btnZip.textContent='ZIP yuklab olish';
    toast('ZIP tayyor','ok');
  }

  function clearAll(){
    files=[];fileList.innerHTML='';progWrap.classList.remove('show');
    resultBar.classList.remove('show');clearErr();clearPreview();renderUI();
  }

  function getTargetPx(){
    const w=parseFloat(inW.value),h=parseFloat(inH.value);
    if(!w||!h||w<=0||h<=0)return null;
    const dpi=parseInt(selDpi.value)||300;
    const f={px:1,cm:dpi/2.54,mm:dpi/25.4,in:dpi}[selUnit.value]||1;
    return{w:Math.round(w*f),h:Math.round(h*f)};
  }

  function getMime(fmt,file){
    if(fmt==='auto'){if(file.type==='image/png')return'image/png';if(file.type==='image/webp')return'image/webp';return'image/jpeg';}
    return{jpg:'image/jpeg',png:'image/png',webp:'image/webp'}[fmt]||'image/jpeg';
  }

  function outName(name){
    const dot=name.lastIndexOf('.');const base=dot>-1?name.slice(0,dot):name;
    const fmt=selFmt.value;const ext=fmt==='auto'?(dot>-1?name.slice(dot+1):'jpg'):fmt;
    return base+'-resized.'+ext;
  }

  function dlBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);}
  function setSt(id,cls,txt){const el=$('st-'+id);if(el){el.className='file-status '+cls;el.textContent=txt;}}
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function showErr(m){errBox.textContent=m;errBox.classList.add('show');}
  function clearErr(){errBox.textContent='';errBox.classList.remove('show');}
  let _tt;
  function toast(msg,type){clearTimeout(_tt);toastEl.textContent=msg;toastEl.className='toast show'+(type?' '+type:'');_tt=setTimeout(()=>toastEl.classList.remove('show'),3000);}

})();
