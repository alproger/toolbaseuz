'use strict';
/* ================================================================
   toolbase.uz — QR Kod Generator
   QRious lib + Canvas API for colors, gradients, logo, caption
   ================================================================ */
(function () {

  /* ── State ── */
  var activeType    = 'url';
  var qrColor       = '#000000';
  var bgColor       = '#ffffff';
  var captionColor  = '#000000';
  var gradientOn    = false;
  var gradientC1    = '#1565c0';
  var gradientC2    = '#7c3aed';
  var captionOn     = false;
  var logoOn        = false;
  var logoImg       = null;
  var lastQRValue   = '';
  var debounceTimer = null;

  var $ = function (id) { return document.getElementById(id); };

  /* ── Type tabs ── */
  $('typeTabs').addEventListener('click', function (e) {
    var btn = e.target.closest('.type-tab');
    if (!btn) return;
    activeType = btn.dataset.type;
    document.querySelectorAll('.type-tab').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('.qr-form-panel').forEach(function (p) { p.classList.remove('active'); });
    var panel = $('panel-' + activeType);
    if (panel) panel.classList.add('active');
    scheduleGenerate();
  });

  /* ── All inputs → live generate ── */
  document.querySelectorAll('.qr-input').forEach(function (el) {
    el.addEventListener('input', scheduleGenerate);
    el.addEventListener('change', scheduleGenerate);
  });
  ['captionText', 'captionPos', 'captionSize', 'logoSize', 'logoShape', 'ecLevel', 'sizeSlider', 'marginSlider'].forEach(function (id) {
    var el = $(id); if (el) el.addEventListener('input', scheduleGenerate);
    if (el) el.addEventListener('change', scheduleGenerate);
  });

  /* Sliders display */
  $('sizeSlider').addEventListener('input', function () { $('sizeVal').textContent = this.value + 'px'; });
  $('marginSlider').addEventListener('input', function () { $('marginVal').textContent = this.value; });

  /* ── Color swatches ── */
  document.querySelectorAll('#qrColorSwatches .swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      document.querySelectorAll('#qrColorSwatches .swatch').forEach(function (s) { s.classList.remove('selected'); });
      this.classList.add('selected');
      qrColor = this.dataset.color;
      $('qrColorCustom').value = qrColor;
      $('qrColorPreview').style.background = qrColor;
      scheduleGenerate();
    });
  });
  $('qrColorCustom').addEventListener('input', function () {
    qrColor = this.value;
    $('qrColorPreview').style.background = qrColor;
    document.querySelectorAll('#qrColorSwatches .swatch').forEach(function (s) { s.classList.remove('selected'); });
    scheduleGenerate();
  });

  document.querySelectorAll('#bgColorSwatches .swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      document.querySelectorAll('#bgColorSwatches .swatch').forEach(function (s) { s.classList.remove('selected'); });
      this.classList.add('selected');
      bgColor = this.dataset.color;
      $('bgColorCustom').value = bgColor;
      $('bgColorPreview').style.background = bgColor;
      scheduleGenerate();
    });
  });
  $('bgColorCustom').addEventListener('input', function () {
    bgColor = this.value;
    $('bgColorPreview').style.background = bgColor;
    document.querySelectorAll('#bgColorSwatches .swatch').forEach(function (s) { s.classList.remove('selected'); });
    scheduleGenerate();
  });

  /* Caption color swatches */
  document.querySelectorAll('.swatch[data-target="caption"]').forEach(function (sw) {
    sw.addEventListener('click', function () {
      document.querySelectorAll('.swatch[data-target="caption"]').forEach(function (s) { s.classList.remove('selected'); });
      this.classList.add('selected');
      captionColor = this.dataset.color;
      $('captionColorCustom').value = captionColor;
      $('captionColorPreview').style.background = captionColor;
      scheduleGenerate();
    });
  });
  $('captionColorCustom').addEventListener('input', function () {
    captionColor = this.value;
    $('captionColorPreview').style.background = captionColor;
    document.querySelectorAll('.swatch[data-target="caption"]').forEach(function (s) { s.classList.remove('selected'); });
    scheduleGenerate();
  });

  /* ── Gradient toggle ── */
  $('gradientToggle').addEventListener('click', function () {
    gradientOn = !gradientOn;
    this.classList.toggle('on', gradientOn);
    $('gradientToggleLabel').textContent = gradientOn ? 'Yoqilgan' : 'O\'chiq';
    $('gradientOptions').style.display = gradientOn ? 'block' : 'none';
    scheduleGenerate();
  });

  document.querySelectorAll('.gradient-preset').forEach(function (gp) {
    gp.addEventListener('click', function () {
      document.querySelectorAll('.gradient-preset').forEach(function (g) { g.classList.remove('selected'); });
      this.classList.add('selected');
      gradientC1 = this.dataset.g1;
      gradientC2 = this.dataset.g2;
      scheduleGenerate();
    });
  });

  /* ── Caption toggle ── */
  $('captionToggle').addEventListener('click', function () {
    captionOn = !captionOn;
    this.classList.toggle('on', captionOn);
    $('captionToggleLabel').textContent = captionOn ? 'Yoqilgan' : 'O\'chiq';
    $('captionOptions').style.display = captionOn ? 'block' : 'none';
    scheduleGenerate();
  });

  /* ── Logo toggle ── */
  $('logoToggle').addEventListener('click', function () {
    logoOn = !logoOn;
    this.classList.toggle('on', logoOn);
    $('logoToggleLabel').textContent = logoOn ? 'Yoqilgan' : 'O\'chiq';
    $('logoOptions').style.display = logoOn ? 'block' : 'none';
    scheduleGenerate();
  });

  /* Logo file input */
  $('logoFile').addEventListener('change', function () {
    var file = this.files[0];
    if (!file) { logoImg = null; scheduleGenerate(); return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () { logoImg = img; scheduleGenerate(); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  /* ── Generate button ── */
  $('btnGenerate').addEventListener('click', function () {
    var content = buildContent();
    if (!content) {
      showError('Iltimos, avval ma\'lumot kiriting.'); return;
    }
    generateQR();
    /* Only show success toast when user explicitly clicks the button */
    setTimeout(function () {
      if ($('qrCanvas').style.display !== 'none') {
        showToast('QR kod muvaffaqiyatli yaratildi ✓', 'ok');
        /* Scroll preview into view on mobile */
        var preview = document.querySelector('.qr-preview-col');
        if (preview && window.innerWidth < 860) {
          preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 120);
  });

  /* ── Build QR content string ── */
  function buildContent() {
    switch (activeType) {
      case 'url':
        var url = $('in-url').value.trim();
        if (!url) return '';
        if (!/^https?:\/\//i.test(url) && url.length > 3) url = 'https://' + url;
        return url;

      case 'text':
        return $('in-text').value.trim();

      case 'phone':
        var ph = $('in-phone').value.trim().replace(/\s/g, '');
        return ph ? 'tel:' + ph : '';

      case 'email':
        var em = $('in-email-addr').value.trim();
        if (!em) return '';
        var subj = encodeURIComponent($('in-email-subj').value.trim());
        var body = encodeURIComponent($('in-email-body').value.trim());
        return 'mailto:' + em + (subj || body ? '?' : '') + (subj ? 'subject=' + subj : '') + (subj && body ? '&' : '') + (body ? 'body=' + body : '');

      case 'wifi':
        var ssid = $('in-wifi-ssid').value.trim();
        if (!ssid) return '';
        var pass = $('in-wifi-pass').value;
        var sec  = $('in-wifi-sec').value;
        var escapedSsid = ssid.replace(/([\\;,":"])/g, '\\$1');
        var escapedPass = pass.replace(/([\\;,":"])/g, '\\$1');
        return 'WIFI:T:' + sec + ';S:' + escapedSsid + ';P:' + escapedPass + ';;';

      case 'vcard':
        var fn = ($('in-vc-fname').value.trim() + ' ' + $('in-vc-lname').value.trim()).trim();
        if (!fn) return '';
        var vcLines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + fn, 'N:' + $('in-vc-lname').value.trim() + ';' + $('in-vc-fname').value.trim() + ';;;'];
        if ($('in-vc-phone').value.trim()) vcLines.push('TEL:' + $('in-vc-phone').value.trim());
        if ($('in-vc-email').value.trim()) vcLines.push('EMAIL:' + $('in-vc-email').value.trim());
        if ($('in-vc-org').value.trim())   vcLines.push('ORG:' + $('in-vc-org').value.trim());
        if ($('in-vc-url').value.trim())   vcLines.push('URL:' + $('in-vc-url').value.trim());
        vcLines.push('END:VCARD');
        return vcLines.join('\n');

      case 'sms':
        var smsPhone = $('in-sms-phone').value.trim().replace(/\s/g, '');
        if (!smsPhone) return '';
        var smsMsg = $('in-sms-msg').value.trim();
        return 'smsto:' + smsPhone + (smsMsg ? ':' + smsMsg : '');

      default: return '';
    }
  }

  /* ── Schedule debounced generate ── */
  function scheduleGenerate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateQR, 220);
  }

  /* ── Main generate ── */
  function generateQR() {
    var content = buildContent();
    if (!content) {
      $('qrCanvas').style.display = 'none';
      $('emptyState').style.display = 'flex';
      $('dlBtns').style.display = 'none';
      return;
    }

    lastQRValue = content;
    var qrSize   = parseInt($('sizeSlider').value);
    var margin   = parseInt($('marginSlider').value);
    var ecLevel  = $('ecLevel').value;

    /* Step 1: Generate raw QR into hidden temp canvas */
    var tempCanvas = document.createElement('canvas');
    var qr;
    try {
      qr = new QRious({
        element: tempCanvas,
        value: content,
        size: qrSize,
        foreground: '#000000',
        background: '#ffffff',
        level: ecLevel,
        padding: margin * 4
      });
    } catch (e) {
      showError('QR kod yaratib bo\'lmadi: ma\'lumot juda ko\'p.'); return;
    }

    /* Step 2: Build final canvas with custom colors/gradient/logo/caption */
    var captionText = captionOn ? ($('captionText').value.trim()) : '';
    var captionSize = captionOn ? parseInt($('captionSize').value) : 0;
    var captionPos  = captionOn ? $('captionPos').value : 'bottom';
    var captionPad  = captionText ? captionSize + 12 : 0;

    var canvasW = qrSize;
    var canvasH = qrSize + captionPad;

    var outCanvas = $('qrCanvas');
    outCanvas.width  = canvasW;
    outCanvas.height = canvasH;
    var ctx = outCanvas.getContext('2d');

    /* Background */
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    /* QR pixels with color */
    var qrData = tempCanvas.getContext('2d').getImageData(0, 0, qrSize, qrSize);
    var finalCanvas = document.createElement('canvas');
    finalCanvas.width = qrSize; finalCanvas.height = qrSize;
    var fCtx = finalCanvas.getContext('2d');

    /* Draw bg */
    fCtx.fillStyle = bgColor;
    fCtx.fillRect(0, 0, qrSize, qrSize);

    /* Create gradient or solid color mask */
    var fgFill;
    if (gradientOn) {
      var grad = fCtx.createLinearGradient(0, 0, qrSize, qrSize);
      grad.addColorStop(0, gradientC1);
      grad.addColorStop(1, gradientC2);
      fgFill = grad;
    } else {
      fgFill = qrColor;
    }

    /* Draw QR using pixel-by-pixel coloring */
    /* 1: Fill entire QR area with fg color */
    fCtx.fillStyle = fgFill;
    fCtx.fillRect(0, 0, qrSize, qrSize);

    /* 2: Use destination-in or manual approach — use source-atop */
    /* Draw the black QR as mask */
    var maskCanvas = document.createElement('canvas');
    maskCanvas.width = qrSize; maskCanvas.height = qrSize;
    var mCtx = maskCanvas.getContext('2d');

    /* White bg first */
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(0, 0, qrSize, qrSize);

    /* Original QR (black dots on white) */
    mCtx.drawImage(tempCanvas, 0, 0);

    /* Now on fCtx: where original is black → keep our color, where white → show bg */
    fCtx.globalCompositeOperation = 'destination-in';
    /* Invert: draw black pixels as mask — we need to show color where black is */
    /* Actually: use the dark pixels as alpha mask */
    var maskData = maskCanvas.getContext('2d').getImageData(0, 0, qrSize, qrSize);
    var fgCanvas = document.createElement('canvas');
    fgCanvas.width = qrSize; fgCanvas.height = qrSize;
    var fgCtx = fgCanvas.getContext('2d');

    /* Fill with fg color */
    if (gradientOn) {
      var g2 = fgCtx.createLinearGradient(0, 0, qrSize, qrSize);
      g2.addColorStop(0, gradientC1);
      g2.addColorStop(1, gradientC2);
      fgCtx.fillStyle = g2;
    } else {
      fgCtx.fillStyle = qrColor;
    }
    fgCtx.fillRect(0, 0, qrSize, qrSize);

    /* Apply original QR as source-in mask */
    fgCtx.globalCompositeOperation = 'destination-in';
    fgCtx.drawImage(tempCanvas, 0, 0);
    /* Invert because QR dots are black (opaque) on white: we need to flip */
    /* Alternative: manually flip pixel alphas */
    var fgData = fgCtx.getImageData(0, 0, qrSize, qrSize);
    var orig = maskData.data;
    var fgd  = fgData.data;
    for (var i = 3; i < orig.length; i += 4) {
      /* orig alpha for black pixels is 255, white is 255 too (both opaque) */
      /* Use luminance: dark pixel = module dot */
      var r = orig[i-3], g2v = orig[i-2], b = orig[i-1];
      var lum = (r * 0.299 + g2v * 0.587 + b * 0.114);
      fgd[i] = lum < 128 ? 255 : 0;
    }
    fgCtx.putImageData(fgData, 0, 0);
    fgCtx.globalCompositeOperation = 'source-over';

    /* Compose final: bg + colored QR dots */
    var compCanvas = document.createElement('canvas');
    compCanvas.width = qrSize; compCanvas.height = qrSize;
    var compCtx = compCanvas.getContext('2d');
    compCtx.fillStyle = bgColor;
    compCtx.fillRect(0, 0, qrSize, qrSize);
    compCtx.drawImage(fgCanvas, 0, 0);

    /* Draw composed QR onto output canvas */
    var qrTop = captionPos === 'top' && captionText ? captionPad : 0;
    ctx.drawImage(compCanvas, 0, qrTop);

    /* ── Logo ── */
    if (logoOn && logoImg) {
      var logoRatio = parseFloat($('logoSize').value) || 0.20;
      var logoMaxW  = qrSize * logoRatio;
      var logoMaxH  = qrSize * logoRatio;
      var lW = logoImg.naturalWidth  || logoImg.width;
      var lH = logoImg.naturalHeight || logoImg.height;
      var lRatio = Math.min(logoMaxW / lW, logoMaxH / lH);
      var lDW = lW * lRatio;
      var lDH = lH * lRatio;
      var lX  = (qrSize - lDW) / 2;
      var lY  = qrTop + (qrSize - lDH) / 2;

      var logoShape = $('logoShape').value;
      var pad = 6;

      /* White bg behind logo */
      ctx.save();
      ctx.fillStyle = '#ffffff';
      if (logoShape === 'circle') {
        ctx.beginPath();
        ctx.arc(lX + lDW/2, lY + lDH/2, Math.max(lDW, lDH)/2 + pad, 0, Math.PI*2);
        ctx.fill();
      } else if (logoShape === 'rounded') {
        var r = 10;
        roundRect(ctx, lX - pad, lY - pad, lDW + pad*2, lDH + pad*2, r);
        ctx.fill();
      } else {
        ctx.fillRect(lX - pad, lY - pad, lDW + pad*2, lDH + pad*2);
      }

      /* Clip + draw logo */
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(lX + lDW/2, lY + lDH/2, Math.max(lDW, lDH)/2, 0, Math.PI*2);
        ctx.clip();
      } else if (logoShape === 'rounded') {
        roundRect(ctx, lX, lY, lDW, lDH, 8);
        ctx.clip();
      }
      ctx.drawImage(logoImg, lX, lY, lDW, lDH);
      ctx.restore();
    }

    /* ── Caption ── */
    if (captionOn && captionText) {
      var cSize = captionSize || 18;
      ctx.font = 'bold ' + cSize + 'px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillStyle = captionColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var cY = captionPos === 'top'
        ? captionPad / 2
        : qrSize + captionPad / 2 + (qrTop > 0 ? 0 : 0);
      ctx.fillText(captionText, canvasW / 2, cY);
    }

    /* Show result */
    $('emptyState').style.display = 'none';
    outCanvas.style.display = 'block';
    $('dlBtns').style.display = 'flex';
  }

  /* ── Rounded rect helper ── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ── Download PNG ── */
  $('btnDlPNG').addEventListener('click', function () {
    var canvas = $('qrCanvas');
    if (!canvas || canvas.style.display === 'none') return;
    var link = document.createElement('a');
    link.download = 'toolbase-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('PNG yuklab olindi ✓', 'ok');
  });

  /* ── Download SVG ── */
  $('btnDlSVG').addEventListener('click', function () {
    var canvas = $('qrCanvas');
    if (!canvas || canvas.style.display === 'none') return;
    var w = canvas.width, h = canvas.height;
    var dataUrl = canvas.toDataURL('image/png');
    var svgContent = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
      + 'width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">\n'
      + '  <image width="' + w + '" height="' + h + '" xlink:href="' + dataUrl + '"/>\n'
      + '</svg>';
    var blob = new Blob([svgContent], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.download = 'toolbase-qr.svg';
    link.href = url;
    link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    showToast('SVG yuklab olindi ✓', 'ok');
  });

  /* ── Copy to clipboard ── */
  $('btnCopy').addEventListener('click', function () {
    var canvas = $('qrCanvas');
    if (!canvas || canvas.style.display === 'none') return;
    canvas.toBlob(function (blob) {
      if (navigator.clipboard && window.ClipboardItem) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          .then(function () { showToast('Clipboard ga nusxalandi ✓', 'ok'); })
          .catch(function () { showToast('Nusxalash qo\'llab-quvvatlanmaydi', 'error'); });
      } else {
        showToast('Brauzeringiz clipboard ni qo\'llamaydi', 'error');
      }
    }, 'image/png');
  });

  /* ── Toast ── */
  var toastTimer = null;
  function showToast(msg, type) {
    var el = $('toast');
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' toast-' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast'; }, 2500);
  }
  function showError(msg) {
    var el = $('errorBox');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; }, 6000);
  }

  /* ── Init ── */
  $('in-url').value = 'https://toolbase.uz';
  document.getElementById('year').textContent = new Date().getFullYear();
  generateQR();

})();
