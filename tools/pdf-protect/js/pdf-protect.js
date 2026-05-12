/**
 * toolbase.uz — PDF Himoya: Parol Qo'yish va Olib Tashlash
 * @cantoo/pdf-lib 2.6.5 — AES-128 encryption
 * SecurityOptions: { ownerPassword, userPassword, permissions }
 */
(function () {
  'use strict';

  /* ── Lib check ── */
  function waitLib(cb) {
    if (window.PDFLib) { cb(); return; }
    let t = 0;
    const iv = setInterval(() => {
      if (window.PDFLib) { clearInterval(iv); cb(); }
      if (++t > 150) { clearInterval(iv); }
    }, 100);
  }

  /* ── Mode tabs ── */
  document.querySelectorAll('.mode-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.mode-panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('panel-' + t.dataset.mode).classList.add('active');
  }));

  /* ── perm-item toggle ── */
  document.querySelectorAll('.perm-item').forEach(item => {
    const cb = item.querySelector('input[type=checkbox]');
    if (!cb) return;
    item.addEventListener('click', e => { if (e.target === cb) return; cb.checked = !cb.checked; item.classList.toggle('checked', cb.checked); });
    cb.addEventListener('change', () => item.classList.toggle('checked', cb.checked));
    if (cb.checked) item.classList.add('checked');
  });

  /* ── State ── */
  let lockFile = null, unlockFile = null;

  /* ══════════════════════
     LOCK PANEL
  ══════════════════════ */
  const lockDrop      = document.getElementById('lockDrop');
  const lockFileInp   = document.getElementById('lockFileInput');
  const lockLoaded    = document.getElementById('lockLoaded');
  const lockFileName  = document.getElementById('lockFileName');
  const lockFileMeta  = document.getElementById('lockFileMeta');
  const lockEncBadge  = document.getElementById('lockEncBadge');
  const btnChangeLock = document.getElementById('btnChangeLock');
  const userPwInp     = document.getElementById('userPw');
  const ownerPwInp    = document.getElementById('ownerPw');
  const btnLock       = document.getElementById('btnLock');
  const lockResult    = document.getElementById('lockResult');
  const btnDlLock     = document.getElementById('btnDlLock');
  const lockErrBox    = document.getElementById('lockErr');
  const pwStrBar      = document.getElementById('pwStrBar');
  const permPrint     = document.getElementById('permPrint');
  const permCopy      = document.getElementById('permCopy');
  const permModify    = document.getElementById('permModify');
  const permAnnot     = document.getElementById('permAnnot');

  // pw toggles
  setupToggle('userPw', 'userPwToggle');
  setupToggle('ownerPw', 'ownerPwToggle');

  // strength
  userPwInp.addEventListener('input', () => {
    userPwInp.classList.toggle('has-val', userPwInp.value.length > 0);
    const s = strength(userPwInp.value);
    const colors = ['#dc2626','#f97316','#eab308','#22c55e','#16a34a'];
    const widths  = [0, 20, 45, 70, 90, 100];
    pwStrBar.style.width      = widths[s] + '%';
    pwStrBar.style.background = s > 0 ? colors[s-1] : 'transparent';
  });

  setupDrop(lockDrop, lockFileInp, loadLockFile);
  btnChangeLock.addEventListener('click', () => {
    lockFile = null;
    lockDrop.style.display = '';
    lockLoaded.classList.remove('show');
    lockResult.classList.remove('show');
    clearErr('lock');
  });

  function loadLockFile(file) {
    if (!isPDF(file)) { showErr('Faqat PDF fayl qabul qilinadi.', 'lock'); return; }
    if (file.size > 100*1024*1024) { showErr('Fayl 100 MB dan katta.', 'lock'); return; }
    clearErr('lock'); lockFile = file;
    lockFileName.textContent = file.name;
    lockFileMeta.textContent = fmt(file.size);
    lockDrop.style.display = 'none';
    lockLoaded.classList.add('show');
    lockResult.classList.remove('show');
    detectEnc(file, b => { lockEncBadge.textContent = b.t; lockEncBadge.className = 'fl-badge ' + b.c; });
  }

  btnLock.addEventListener('click', async () => {
    clearErr('lock'); lockResult.classList.remove('show');
    if (!lockFile) { showErr('Avval PDF faylni yuklang.', 'lock'); return; }

    const uPw = userPwInp.value.trim();
    if (!uPw) { showErr("Parol kiriting.", 'lock'); return; }
    if (uPw.length < 1) { showErr("Parol bo'sh bo'lishi mumkin emas.", 'lock'); return; }

    setBtn(btnLock, true, '\u8635 Himoyalanmoqda\u2026');
    try {
      const buf = await lockFile.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });

      // Bitta parol - ham user, ham owner sifatida
      const secOpts = {
        userPassword:  uPw,
        ownerPassword: uPw,
        permissions: {
          printing:             'highResolution',
          copying:              true,
          modifying:            false,
          annotating:           true,
          fillingForms:         true,
          contentAccessibility: true,
          documentAssembly:     false,
        }
      };
      pdfDoc.encrypt(secOpts);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type:'application/pdf' });
      btnDlLock._blob = blob;
      btnDlLock._name = lockFile.name.replace(/\.pdf$/i,'') + '-himoyalangan.pdf';

      lockResult.classList.add('show');
      document.getElementById('lockResultInfo').textContent =
        btnDlLock._name + ' \u00b7 ' + fmt(pdfBytes.length);
      toast('PDF himoyalandi!', 'ok');
    } catch(e) {
      showErr('Xato: ' + (e.message || String(e)), 'lock');
    } finally {
      setBtn(btnLock, false,
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="17" height="17"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> PDF ga Parol Qo\u2019yish');
    }
  });

  btnDlLock.addEventListener('click', () => {
    if (btnDlLock._blob) { dlBlob(btnDlLock._blob, btnDlLock._name); toast('Yuklab olindi', 'ok'); }
  });

  /* ══════════════════════
     UNLOCK PANEL
  ══════════════════════ */
  const unlockDrop      = document.getElementById('unlockDrop');
  const unlockFileInp   = document.getElementById('unlockFileInput');
  const unlockLoaded    = document.getElementById('unlockLoaded');
  const unlockFileName  = document.getElementById('unlockFileName');
  const unlockFileMeta  = document.getElementById('unlockFileMeta');
  const unlockEncBadge  = document.getElementById('unlockEncBadge');
  const btnChangeUnlock = document.getElementById('btnChangeUnlock');
  const unlockPwInp     = document.getElementById('unlockPw');
  const btnUnlock       = document.getElementById('btnUnlock');
  const unlockResult    = document.getElementById('unlockResult');
  const btnDlUnlock     = document.getElementById('btnDlUnlock');
  const unlockErrBox    = document.getElementById('unlockErr');
  const unlockStatus    = document.getElementById('unlockStatus');
  const unlockHint      = document.getElementById('unlockHint');

  setupToggle('unlockPw', 'unlockPwToggle');
  setupDrop(unlockDrop, unlockFileInp, loadUnlockFile);
  btnChangeUnlock.addEventListener('click', () => {
    unlockFile = null;
    unlockDrop.style.display = '';
    unlockLoaded.classList.remove('show');
    unlockResult.classList.remove('show');
    if (unlockStatus) unlockStatus.style.display = 'none';
    clearErr('unlock');
  });

  function loadUnlockFile(file) {
    if (!isPDF(file)) { showErr('Faqat PDF fayl qabul qilinadi.', 'unlock'); return; }
    if (file.size > 100*1024*1024) { showErr('Fayl 100 MB dan katta.', 'unlock'); return; }
    clearErr('unlock'); unlockFile = file;
    unlockFileName.textContent = file.name;
    unlockFileMeta.textContent = fmt(file.size);
    unlockDrop.style.display = 'none';
    unlockLoaded.classList.add('show');
    unlockResult.classList.remove('show');
    autoDetect(file);
  }

  async function autoDetect(file) {
    if (!unlockStatus) return;
    unlockStatus.style.display = 'flex';
    unlockStatus.innerHTML = '<span class="spin">\u8635</span> Tahlil qilinmoqda\u2026';
    try {
      const buf = await file.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      if (!doc.isEncrypted) {
        unlockStatus.innerHTML = '<span style="color:#16a34a">\u2713</span> Himoyalanmagan PDF \u2014 parolsiz saqlash mumkin.';
        if (unlockHint) unlockHint.textContent = 'Parol maydonini bo\u02bcsh qoldiring.';
        detectEnc(file, b => { unlockEncBadge.textContent = b.t; unlockEncBadge.className = 'fl-badge ' + b.c; });
        return;
      }
      // Try owner-bypass
      try {
        await doc.save();
        unlockStatus.innerHTML = '<span style="color:#d97706">\u26a0</span> <strong>Ruxsat cheklangan PDF</strong> \u2014 parolsiz olib tashlash mumkin!';
        if (unlockHint) unlockHint.textContent = 'Parol bo\u02bcsh, tugmani bosing.';
        unlockEncBadge.textContent = '\uD83D\uDD12 Ruxsat cheklangan';
        unlockEncBadge.className = 'fl-badge encrypted';
      } catch {
        unlockStatus.innerHTML = '<span style="color:#dc2626">\uD83D\uDD10</span> <strong>Parol bilan himoyalangan</strong> \u2014 parol kiriting.';
        if (unlockHint) unlockHint.textContent = 'User yoki owner parolini kiriting.';
        unlockEncBadge.textContent = '\uD83D\uDD12 Parol kerak';
        unlockEncBadge.className = 'fl-badge encrypted';
      }
    } catch {
      unlockStatus.innerHTML = '<span style="color:var(--muted)">\u2139</span> Tahlil qilib bo\u02bcl olmadi.';
    }
  }

  btnUnlock.addEventListener('click', async () => {
    clearErr('unlock'); unlockResult.classList.remove('show');
    if (!unlockFile) { showErr('Avval PDF faylni yuklang.', 'unlock'); return; }
    const pw = unlockPwInp.value;

    setBtn(btnUnlock, true, '\u8635 Tekshirilmoqda\u2026');
    try {
      const buf = await unlockFile.arrayBuffer();
      let pdfDoc = null, method = '';

      // 1) Owner-bypass / unencrypted
      try {
        const d = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
        await d.save(); // throws if user-pw needed
        pdfDoc  = d;
        method  = d.isEncrypted ? 'owner-bypass' : 'no-encryption';
      } catch { /* need user pw */ }

      // 2) User password
      if (!pdfDoc) {
        if (!pw) { showErr('Bu PDF parol bilan himoyalangan. Parolni kiriting.', 'unlock'); return; }
        try {
          pdfDoc = await window.PDFLib.PDFDocument.load(buf, {
            ignoreEncryption: false,
            password: pw,
          });
          method = 'user-password';
        } catch(e) {
          const msg = e.message || '';
          if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('encrypt')) {
            showErr('Noto\u02bcg\u02bcri parol. Qaytadan urinib ko\u02bcring.', 'unlock');
          } else {
            showErr('Xato: ' + msg, 'unlock');
          }
          return;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type:'application/pdf' });
      btnDlUnlock._blob = blob;
      btnDlUnlock._name = unlockFile.name.replace(/(-himoyalangan)?\.pdf$/i,'') + '-ochilgan.pdf';

      unlockResult.classList.add('show');
      const labels = {
        'no-encryption' : '\uD83D\uDD13 PDF himoyalanmagan edi \u2014 saqlandi.',
        'owner-bypass'  : '\u2713 Ruxsat cheklovi olib tashlandi (parolsiz).',
        'user-password' : '\u2713 Parol muvaffaqiyatli olib tashlandi.',
      };
      document.getElementById('unlockResultInfo').innerHTML =
        (labels[method] || '\u2713 Tayyor.') + '<br>' + btnDlUnlock._name + ' \u00b7 ' + fmt(pdfBytes.length);
      toast('Parol olib tashlandi!', 'ok');
    } catch(e) {
      showErr('Xato: ' + (e.message || String(e)), 'unlock');
    } finally {
      setBtn(btnUnlock, false,
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="17" height="17"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Parolni Olib Tashlash');
    }
  });

  btnDlUnlock.addEventListener('click', () => {
    if (btnDlUnlock._blob) { dlBlob(btnDlUnlock._blob, btnDlUnlock._name); toast('Yuklab olindi', 'ok'); }
  });

  /* ── Helpers ── */
  async function detectEnc(file, cb) {
    try {
      const buf = await file.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption:true });
      if (!doc.isEncrypted) { cb({ t:'\uD83D\uDD13 Himoyasiz', c:'clear' }); return; }
      try { await doc.save(); cb({ t:'\uD83D\uDD12 Ruxsat cheklangan', c:'encrypted' }); }
      catch { cb({ t:'\uD83D\uDD12 Parol kerak', c:'encrypted' }); }
    } catch { cb({ t:'? Noma\u02bclum', c:'' }); }
  }

  function setupDrop(zone, inp, loader) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    ['dragleave','dragend'].forEach(ev => zone.addEventListener(ev, () => zone.classList.remove('drag-over')));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); const f = e.dataTransfer.files[0]; if(f) loader(f); });
    inp.addEventListener('change', () => { if(inp.files[0]) loader(inp.files[0]); inp.value = ''; });
  }

  function setupToggle(inputId, btnId) {
    const inp = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.querySelector('.ico-eye').style.display     = show ? 'none' : '';
      btn.querySelector('.ico-eye-off').style.display = show ? '' : 'none';
    });
  }

  function strength(pw) {
    if (!pw) return 0; let s = 0;
    if (pw.length >= 8) s++; if (pw.length >= 14) s++;
    if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 5);
  }

  function setBtn(btn, dis, html) { btn.disabled = dis; if (html) btn.innerHTML = html; }
  function isPDF(f) { return f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'; }
  function fmt(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
    return (b/1048576).toFixed(1) + ' MB';
  }
  function dlBlob(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  function showErr(m, p) { const el = p==='lock' ? lockErrBox : unlockErrBox; el.innerHTML = m; el.classList.add('show'); }
  function clearErr(p) { const el = p==='lock' ? lockErrBox : unlockErrBox; el.innerHTML = ''; el.classList.remove('show'); }
  let _tt;
  function toast(msg, type) {
    clearTimeout(_tt); const el = document.getElementById('toast');
    el.textContent = msg; el.className = 'toast show' + (type ? ' '+type : '');
    _tt = setTimeout(() => el.classList.remove('show'), 3000);
  }

  waitLib(() => {});

})();
