/**
 * toolbase.uz — Password Generator engine
 * Kriptografik xavfsiz: window.crypto.getRandomValues ishlatadi
 *
 * Xususiyatlar:
 *   - Uzunlik: 4–128 belgi
 *   - Katta harflar (A-Z)
 *   - Kichik harflar (a-z)
 *   - Raqamlar (0-9)
 *   - Belgilar (!@#$%^&* ...)
 *   - Chalkash belgilar istisno (0/O, 1/I/l)
 *   - Har bir tanlangan toifadan kamida 1 ta belgi kafolatlangan
 *   - Kuch (strength) hisoblash
 *   - Bir nechta parol bir vaqtda
 */

const PassGen = (function () {
  'use strict';

  /* ── Belgilar to'plamlari ─────────────────────────── */
  const SETS = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    digits:  '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  };

  const EXCLUDE_AMBIGUOUS = {
    upper:  'IO',
    lower:  'il',
    digits: '01',
  };

  /* ── Kriptografik tasodifiy indeks ────────────────── */
  function randIndex(max) {
    // Xolis (uniform) taqsimlash uchun rejection sampling
    var limit = 256 - (256 % max);
    var buf   = new Uint8Array(1);
    var val;
    do {
      window.crypto.getRandomValues(buf);
      val = buf[0];
    } while (val >= limit);
    return val % max;
  }

  /* ── Arrayni aralashtirish (Fisher-Yates) ─────────── */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = randIndex(i + 1);
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  /* ── Parol yaratish ───────────────────────────────── */
  function generate(opts) {
    /*
      opts: {
        length:    number (4–128),
        upper:     bool,
        lower:     bool,
        digits:    bool,
        symbols:   bool,
        noAmbig:   bool,  // chalkash belgilarni olib tashlash
        count:     number (1–20),
      }
    */
    var length  = Math.max(4, Math.min(128, opts.length  || 16));
    var count   = Math.max(1, Math.min(20,  opts.count   || 1));

    var selected = [];
    if (opts.upper)   selected.push('upper');
    if (opts.lower)   selected.push('lower');
    if (opts.digits)  selected.push('digits');
    if (opts.symbols) selected.push('symbols');

    if (selected.length === 0) {
      return { ok: false, msg: 'Kamida bitta belgi turini tanlang' };
    }
    if (length < selected.length) {
      return { ok: false, msg: 'Uzunlik tanlangan toifalar sonidan kam bo\'lmaydi' };
    }

    /* Build charset */
    var charset = '';
    selected.forEach(function (key) {
      var s = SETS[key];
      if (opts.noAmbig && EXCLUDE_AMBIGUOUS[key]) {
        var excl = EXCLUDE_AMBIGUOUS[key];
        s = s.split('').filter(function (c) { return excl.indexOf(c) === -1; }).join('');
      }
      charset += s;
    });

    if (charset.length === 0) {
      return { ok: false, msg: 'Belgilar to\'plami bo\'sh' };
    }

    var passwords = [];
    for (var p = 0; p < count; p++) {
      /* Har bir toifadan kamida 1 ta belgi */
      var chars = [];
      selected.forEach(function (key) {
        var s = SETS[key];
        if (opts.noAmbig && EXCLUDE_AMBIGUOUS[key]) {
          var excl = EXCLUDE_AMBIGUOUS[key];
          s = s.split('').filter(function (c) { return excl.indexOf(c) === -1; }).join('');
        }
        if (s.length > 0) chars.push(s[randIndex(s.length)]);
      });

      /* Qolgan belgilar */
      while (chars.length < length) {
        chars.push(charset[randIndex(charset.length)]);
      }

      passwords.push(shuffle(chars).join(''));
    }

    return { ok: true, passwords: passwords };
  }

  /* ── Kuch hisoblash ───────────────────────────────── */
  function strength(password) {
    if (!password) return { score: 0, label: '', color: '' };

    var score = 0;
    var len   = password.length;

    /* Uzunlik */
    if (len >= 8)   score += 1;
    if (len >= 12)  score += 1;
    if (len >= 16)  score += 1;
    if (len >= 24)  score += 1;

    /* Toifalar */
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 2;

    /* Entropy taxmin */
    var pool = 0;
    if (/[a-z]/.test(password))        pool += 26;
    if (/[A-Z]/.test(password))        pool += 26;
    if (/[0-9]/.test(password))        pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 28;
    var entropy = len * Math.log2(pool || 1);
    if (entropy >= 60) score += 1;
    if (entropy >= 80) score += 1;

    /* Normalize */
    var pct = Math.min(100, Math.round((score / 11) * 100));

    var label, color;
    if (pct < 30) { label = 'Juda zaif';  color = '#ef4444'; }
    else if (pct < 50) { label = 'Zaif';  color = '#f97316'; }
    else if (pct < 70) { label = 'O\'rta'; color = '#eab308'; }
    else if (pct < 85) { label = 'Kuchli'; color = '#22c55e'; }
    else               { label = 'Juda kuchli'; color = '#16a34a'; }

    return { score: pct, label: label, color: color };
  }

  return { generate, strength };
})();

if (typeof window !== 'undefined') window.PassGen = PassGen;
if (typeof module !== 'undefined') module.exports  = PassGen;
