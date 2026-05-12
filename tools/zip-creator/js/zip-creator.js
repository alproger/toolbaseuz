/**
 * toolbase.uz — ZIP Creator
 * JSZip 3.10 — fayllar va papkalarni ZIP arxivga yig'ish
 * 100% client-side, serverga yuborilmaydi
 *
 * Ma'lumotlar tuzilmasi:
 *   folders: [ { id, name, files:[File,...] }, ... ]
 *   rootFiles: [ File, ... ]
 */
(function () {
  'use strict';

  /* ── State ── */
  let folders   = [];   // { id, name, files[] }
  let rootFiles = [];   // papkasiz fayllar
  let idSeq     = 0;
  let keepStructure = true; // papka strukturasini saqlash

  /* ── DOM ── */
  const $ = id => document.getElementById(id);
  const dropZone       = $('dropZone');
  const dropInput      = $('dropInput');
  const folderInput    = $('folderInput');
  const fileTree       = $('fileTree');
  const treeEmpty      = $('treeEmpty');
  const treeCount      = $('treeCount');
  const errBox         = $('errBox');
  const statsStrip     = $('statsStrip');
  const statFiles      = $('statFiles');
  const statFolders    = $('statFolders');
  const statSize       = $('statSize');
  const zipNameInp     = $('zipNameInp');
  const compSelect     = $('compSelect');
  const keepToggle     = $('keepToggle');
  const btnCreate      = $('btnCreate');
  const btnClearAll    = $('btnClearAll');
  const progWrap       = $('progWrap');
  const progFill       = $('progFill');
  const progLabel      = $('progLabel');
  const resultCard     = $('resultCard');
  const btnDl          = $('btnDl');
  const rcInfo         = $('rcInfo');
  const toastEl        = $('toast');

  let _dlBlob = null, _dlName = '';

  /* ── Toggle ── */
  keepToggle.addEventListener('click', () => {
    keepStructure = !keepStructure;
    keepToggle.classList.toggle('on', keepStructure);
  });

  /* ── Drag & drop onto drop zone ── */
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  ['dragleave','dragend'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over')));
  dropZone.addEventListener('drop', async e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    clearErr();
    const items = [...e.dataTransfer.items];
    await processDropItems(items);
  });

  /* ── File input (multiple files) ── */
  dropInput.addEventListener('change', () => {
    const files = [...dropInput.files];
    if (!files.length) return;
    addRootFiles(files);
    dropInput.value = '';
  });

  /* ── Folder input ── */
  folderInput.addEventListener('change', () => {
    const files = [...folderInput.files];
    if (!files.length) return;
    processFolderInput(files);
    folderInput.value = '';
  });

  /* ── Process drag-drop DataTransferItems ── */
  async function processDropItems(items) {
    const entries = items
      .map(i => i.webkitGetAsEntry ? i.webkitGetAsEntry() : null)
      .filter(Boolean);

    if (!entries.length) {
      // Fallback: just files
      const files = items.map(i => i.getAsFile()).filter(Boolean);
      addRootFiles(files);
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory) {
        await addFolderFromEntry(entry);
      } else if (entry.isFile) {
        const file = await entryToFile(entry);
        if (file) addRootFiles([file]);
      }
    }
  }

  async function addFolderFromEntry(dirEntry) {
    const folderId = ++idSeq;
    const folder = { id: folderId, name: dirEntry.name, files: [] };
    folders.push(folder);
    await readDirRecursive(dirEntry, folder, '');
    renderTree();
  }

  async function readDirRecursive(dirEntry, folder, prefix) {
    const entries = await readDir(dirEntry);
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await entryToFile(entry);
        if (file) {
          // Relative path inside folder
          const relPath = prefix ? prefix + '/' + entry.name : entry.name;
          file._zipPath = relPath;
          folder.files.push(file);
        }
      } else if (entry.isDirectory) {
        await readDirRecursive(entry, folder, prefix ? prefix + '/' + entry.name : entry.name);
      }
    }
  }

  function readDir(dirEntry) {
    return new Promise(resolve => {
      const reader = dirEntry.createReader();
      const all = [];
      function readBatch() {
        reader.readEntries(entries => {
          if (!entries.length) { resolve(all); return; }
          all.push(...entries);
          readBatch();
        }, () => resolve(all));
      }
      readBatch();
    });
  }

  function entryToFile(fileEntry) {
    return new Promise((res, rej) => fileEntry.file(res, rej));
  }

  /* ── Process folder input (input[webkitdirectory]) ── */
  function processFolderInput(files) {
    // files have .webkitRelativePath = "FolderName/subdir/file.ext"
    const folderMap = {};
    for (const f of files) {
      const parts = f.webkitRelativePath.split('/');
      const rootName = parts[0];
      if (!folderMap[rootName]) folderMap[rootName] = { id: ++idSeq, name: rootName, files: [] };
      f._zipPath = parts.slice(1).join('/') || f.name;
      folderMap[rootName].files.push(f);
    }
    folders.push(...Object.values(folderMap));
    renderTree();
  }

  /* ── Add root-level files ── */
  function addRootFiles(files) {
    files.forEach(f => { f._zipPath = f.name; rootFiles.push(f); });
    renderTree();
  }

  /* ── Delete ── */
  function delFolder(id) {
    folders = folders.filter(f => f.id !== id);
    renderTree();
  }

  function delRootFile(idx) {
    rootFiles.splice(idx, 1);
    renderTree();
  }

  function delFileInFolder(folderId, fileIdx) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    folder.files.splice(fileIdx, 1);
    if (folder.files.length === 0) folders = folders.filter(f => f.id !== folderId);
    renderTree();
  }

  /* ── Render tree ── */
  function renderTree() {
    fileTree.innerHTML = '';
    const totalFiles = rootFiles.length + folders.reduce((s,f) => s + f.files.length, 0);
    const totalSize  = [...rootFiles, ...folders.flatMap(f=>f.files)].reduce((s,f) => s+f.size, 0);

    treeCount.textContent = totalFiles;
    statFiles.textContent   = totalFiles + ' ta fayl';
    statFolders.textContent = folders.length + ' ta papka';
    statSize.textContent    = fmtSize(totalSize);
    statSize.className      = 'ss-val' + (totalSize > 0 ? ' green' : '');
    statsStrip.style.display = totalFiles > 0 ? 'flex' : 'none';
    treeEmpty.style.display  = totalFiles === 0 ? 'block' : 'none';
    btnCreate.disabled       = totalFiles === 0;

    // Render folders
    folders.forEach(folder => {
      const node = document.createElement('div');
      node.className = 'folder-node open';
      node.dataset.id = folder.id;

      const folderSize = folder.files.reduce((s,f) => s+f.size, 0);

      node.innerHTML =
        `<div class="folder-row">` +
          `<span class="fr-toggle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>` +
          `<span class="fr-icon">${svgFolder()}</span>` +
          `<span class="fr-name" title="${esc(folder.name)}">${esc(folder.name)}</span>` +
          `<span class="fr-meta">${folder.files.length} fayl · ${fmtSize(folderSize)}</span>` +
          `<button class="fr-del" data-fid="${folder.id}" title="Papkani o'chirish">${svgRm()}</button>` +
        `</div>` +
        `<div class="folder-files" id="ff-${folder.id}"></div>`;

      // Toggle open/close
      node.querySelector('.folder-row').addEventListener('click', e => {
        if (e.target.closest('.fr-del')) return;
        node.classList.toggle('open');
      });

      // Delete folder
      node.querySelector('.fr-del').addEventListener('click', () => delFolder(folder.id));

      // Files inside folder
      const ffDiv = node.querySelector('.folder-files');
      folder.files.forEach((file, fidx) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML =
          `<div class="fi-indent"></div>` +
          `<div class="fi-icon">${svgFileType(file.name)}</div>` +
          `<div class="fi-name" title="${esc(file._zipPath || file.name)}">${esc(file._zipPath || file.name)}</div>` +
          `<div class="fi-size">${fmtSize(file.size)}</div>` +
          `<button class="fi-del" title="O'chirish">${svgRmSm()}</button>`;
        item.querySelector('.fi-del').addEventListener('click', () => delFileInFolder(folder.id, fidx));
        ffDiv.appendChild(item);
      });

      fileTree.appendChild(node);
    });

    // Render root files
    rootFiles.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'root-file file-item';
      item.innerHTML =
        `<div class="rf-indent"></div>` +
        `<div class="fi-icon">${svgFileType(file.name)}</div>` +
        `<div class="fi-name" title="${esc(file.name)}">${esc(file.name)}</div>` +
        `<div class="fi-size">${fmtSize(file.size)}</div>` +
        `<button class="fi-del" title="O'chirish">${svgRmSm()}</button>`;
      item.querySelector('.fi-del').addEventListener('click', () => delRootFile(idx));
      fileTree.appendChild(item);
    });
  }

  /* ── Clear all ── */
  btnClearAll.addEventListener('click', () => {
    folders=[]; rootFiles=[]; renderTree();
    resultCard.classList.remove('show'); clearErr();
    toast('Tozalandi', '');
  });

  /* ── Create ZIP ── */
  btnCreate.addEventListener('click', doCreate);
  async function doCreate() {
    const totalFiles = rootFiles.length + folders.reduce((s,f)=>s+f.files.length, 0);
    if (!totalFiles) { showErr('Avval fayl yoki papka qo\'shing.'); return; }

    clearErr();
    resultCard.classList.remove('show');
    progWrap.classList.add('show');
    progFill.style.width = '0%';
    progLabel.textContent = 'ZIP tayyorlanmoqda…';
    btnCreate.disabled = true;

    try {
      const zip = new window.JSZip();
      const compression = compSelect.value; // DEFLATE | STORE
      let processed = 0;
      const allFiles = [
        ...rootFiles.map(f => ({ file:f, path: f.name })),
        ...folders.flatMap(folder =>
          folder.files.map(f => ({
            file: f,
            path: keepStructure
              ? folder.name + '/' + (f._zipPath || f.name)
              : (f._zipPath || f.name)
          }))
        )
      ];
      const total = allFiles.length;

      for (const { file, path } of allFiles) {
        const buf = await file.arrayBuffer();
        zip.file(path, buf, { compression });
        processed++;
        progFill.style.width = Math.round(processed / total * 70) + '%';
        progLabel.textContent = processed + ' / ' + total + ' fayl qo\'shildi';
        // yield to UI
        await new Promise(r => setTimeout(r, 0));
      }

      progLabel.textContent = 'Siqilmoqda…';
      progFill.style.width = '80%';

      const blob = await zip.generateAsync(
        { type: 'blob', compression, compressionOptions: { level: compression === 'DEFLATE' ? 6 : 0 } },
        meta => {
          progFill.style.width = 80 + Math.round(meta.percent * 0.2) + '%';
          progLabel.textContent = 'Siqilmoqda… ' + Math.round(meta.percent) + '%';
        }
      );

      _dlBlob = blob;
      _dlName = (zipNameInp.value.trim() || 'toolbase-archive') + '.zip';

      progFill.style.width = '100%';
      progWrap.classList.remove('show');
      resultCard.classList.add('show');

      const origSize = allFiles.reduce((s,{file}) => s+file.size, 0);
      const ratio = origSize > 0 ? Math.round((1 - blob.size/origSize)*100) : 0;

      rcInfo.innerHTML =
        `<strong>${_dlName}</strong><br>` +
        `${total} ta fayl · ${fmtSize(blob.size)}` +
        (ratio > 0 ? ` · <strong>${ratio}% siqildi</strong>` : '');

      toast('ZIP tayyor!', 'ok');
    } catch(e) {
      showErr('Xato: ' + (e.message || e));
      progWrap.classList.remove('show');
    } finally {
      btnCreate.disabled = false;
    }
  }

  /* ── Download ── */
  btnDl.addEventListener('click', () => {
    if (!_dlBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(_dlBlob); a.download = _dlName; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    toast('Yuklab olindi', 'ok');
  });

  /* ── Helpers ── */
  function fmtSize(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes/1048576).toFixed(1) + ' MB';
    return (bytes/1073741824).toFixed(2) + ' GB';
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function svgFolder() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
  }
  function svgRm() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>';
  }
  function svgRmSm() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }
  function svgFileType(name) {
    const ext = name.split('.').pop().toLowerCase();
    const imgs = ['jpg','jpeg','png','gif','webp','bmp','svg','ico','tiff'];
    const docs = ['pdf'];
    const office = ['doc','docx','xls','xlsx','ppt','pptx','odt','ods','odp'];
    const code = ['js','ts','jsx','tsx','html','css','py','java','c','cpp','go','rs','php','json','xml','yaml','yml','sh','sql'];
    const audio = ['mp3','wav','ogg','flac','aac','m4a'];
    const video = ['mp4','avi','mov','mkv','webm','flv'];
    const zips  = ['zip','rar','7z','tar','gz','bz2'];
    let cls = 'icon-default';
    let d = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z';
    if (imgs.includes(ext))   { cls='icon-img';    d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M4 15l5-5 3 3 2-2 5 5'; }
    if (docs.includes(ext))   { cls='icon-pdf'; }
    if (office.includes(ext)) { cls='icon-doc'; }
    if (code.includes(ext))   { cls='icon-code'; }
    if (audio.includes(ext))  { cls='icon-audio'; }
    if (video.includes(ext))  { cls='icon-video'; }
    if (zips.includes(ext))   { cls='icon-zip'; }
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="${d}"/></svg>`;
  }

  function showErr(m) { errBox.textContent=m; errBox.classList.add('show'); }
  function clearErr() { errBox.textContent=''; errBox.classList.remove('show'); }
  let _tt;
  function toast(msg, type) {
    clearTimeout(_tt);
    toastEl.textContent=msg; toastEl.className='toast show'+(type?' '+type:'');
    _tt=setTimeout(()=>toastEl.classList.remove('show'),3000);
  }

  // Init
  renderTree();

})();
