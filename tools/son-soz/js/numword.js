/**
 * toolbase.uz — Son → So'z (O'zbekcha)
 * Qo'llab-quvvatlanadi:
 *   - Butun sonlar: 0 dan 999 999 999 999 gacha (milliard)
 *   - Manfiy sonlar
 *   - Kasr sonlar (verguldan keyin max 2 raqam)
 *   - Pul rejimi: so'm + tiyin
 *
 * Limitlar:
 *   - Max qiymat: 999 999 999 999 (to'qqiz yuz to'qson to'qqiz milliard...)
 *   - Min qiymat: -999 999 999 999
 *   - Kasr: max 2 ta raqam
 *   - Input uzunligi: max 16 belgi (raqam + vergul/minus)
 */

const UzNumWord = (function () {
  'use strict';

  /* ── Limitlar ─────────────────────────────────────────────── */
  const MAX_VALUE    = 999999999999;   // 999 milliard
  const MAX_DECIMALS = 2;              // verguldan keyin
  const MAX_INPUT_LEN = 16;           // belgilar soni

  /* ── So'z lug'ati ─────────────────────────────────────────── */
  const ONES = [
    '', 'bir', 'ikki', 'uch', 'to\'rt', 'besh',
    'olti', 'yetti', 'sakkiz', 'to\'qqiz'
  ];
  const TENS = [
    '', 'o\'n', 'yigirma', 'o\'ttiz', 'qirq', 'ellik',
    'oltmish', 'yetmish', 'sakson', 'to\'qson'
  ];
  const SCALE = ['', 'ming', 'million', 'milliard'];

  /* ── Yordamchi: 1–999 ni so'zga ─────────────────────────── */
  function threeDigits(n) {
    if (n === 0) return '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    let result = '';
    if (h > 0) result += ONES[h] + ' yuz';
    if (t > 0) result += (result ? ' ' : '') + TENS[t];
    if (o > 0) result += (result ? ' ' : '') + ONES[o];
    return result;
  }

  /* ── Asosiy: musbat butun sonni so'zga ──────────────────── */
  function intToWords(n) {
    if (n === 0) return 'nol';
    const groups = [];
    let tmp = n;
    while (tmp > 0) {
      groups.push(tmp % 1000);
      tmp = Math.floor(tmp / 1000);
    }
    const parts = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      if (g === 0) continue;
      const words = threeDigits(g);
      // "bir ming" emas "ming" (1000 uchun)
      const scale = SCALE[i];
      if (scale === 'ming' && g === 1) {
        parts.push('ming');
      } else {
        parts.push(scale ? words + ' ' + scale : words);
      }
    }
    return parts.join(' ');
  }

  /* ── Validatsiya ─────────────────────────────────────────── */
  function validate(raw) {
    // Faqat raqam, minus, nuqta yoki vergul
    if (!/^-?[\d.,]+$/.test(raw)) {
      return { ok: false, msg: 'Faqat raqam kiriting' };
    }
    // Bir nechta ajratgich
    const sep = raw.replace(/[^.,]/g, '');
    if (sep.length > 1) {
      return { ok: false, msg: 'Faqat bitta vergul yoki nuqta bo\'lishi mumkin' };
    }
    // Minus faqat boshida
    const clean = raw.replace(',', '.');
    const num = parseFloat(clean);
    if (isNaN(num)) {
      return { ok: false, msg: 'Noto\'g\'ri son' };
    }
    if (Math.abs(num) > MAX_VALUE) {
      return { ok: false, msg: 'Son juda katta (max: 999 999 999 999)' };
    }
    // Kasr qismini tekshirish
    const dotIdx = clean.indexOf('.');
    if (dotIdx !== -1) {
      const decimals = clean.slice(dotIdx + 1);
      if (decimals.length > MAX_DECIMALS) {
        return { ok: false, msg: `Verguldan keyin ko'pi bilan ${MAX_DECIMALS} ta raqam` };
      }
    }
    return { ok: true, num, clean };
  }

  /* ── Asosiy funksiya ─────────────────────────────────────── */
  function convert(raw, mode) {
    // mode: 'oddiy' | 'pul'
    raw = (raw || '').trim();
    if (!raw) return { ok: false, msg: '' };

    // Input uzunligi
    if (raw.length > MAX_INPUT_LEN) {
      return { ok: false, msg: `Juda ko\'p belgi (max: ${MAX_INPUT_LEN})` };
    }

    const v = validate(raw);
    if (!v.ok) return v;

    const { num, clean } = v;
    const isNeg = num < 0;
    const abs   = Math.abs(num);
    const dotIdx = clean.indexOf('.');
    const intPart = Math.floor(abs);
    let decPart = 0;
    let rawDecStr = '';
    if (dotIdx !== -1) {
      rawDecStr = clean.slice(dotIdx + 1).slice(0, 2);
      // "5" → 5 (o'ndan), "50" → 50 (yuzdan), "05" → 5 (yuzdan)
      decPart = parseInt(rawDecStr, 10);
    }

    let result = '';

    if (mode === 'pul') {
      // Pul: kasr → tiyin (max 99 tiyin)
      // "50" → 50 tiyin, "5" → 5 tiyin, "05" → 5 tiyin
      const tiyinPart = rawDecStr ? parseInt(rawDecStr.padEnd(2,'0').slice(0,2), 10) : 0;
      const somWords = intToWords(intPart);
      result = (isNeg ? 'minus ' : '') + somWords + ' so\'m';
      if (tiyinPart > 0) {
        result += ' ' + intToWords(tiyinPart) + ' tiyin';
      }
    } else {
      if (dotIdx !== -1 && decPart > 0) {
        const denom = rawDecStr.length === 1 ? 'o\'ndan' : 'yuzdan';
        result = (isNeg ? 'minus ' : '') +
                 intToWords(intPart) + ' butun ' +
                 intToWords(decPart) + ' ' + denom;
      } else {
        result = (isNeg ? 'minus ' : '') + intToWords(intPart);
      }
    }

    // Capitalize first letter
    return { ok: true, text: result.charAt(0).toUpperCase() + result.slice(1) };
  }

  /* ── Input filtri ────────────────────────────────────────── */
  function filterInput(raw) {
    // Faqat raqam, bitta ajratgich, bitta minus boshida
    let out = '';
    let hasSep = false;
    let hasMinus = false;
    for (let i = 0; i < raw.length && out.length < MAX_INPUT_LEN; i++) {
      const c = raw[i];
      if (c === '-' && i === 0 && !hasMinus) { out += c; hasMinus = true; }
      else if ((c === '.' || c === ',') && !hasSep) { out += c; hasSep = true; }
      else if (c >= '0' && c <= '9') { out += c; }
    }
    return out;
  }

  return { convert, filterInput, MAX_VALUE, MAX_INPUT_LEN };
})();

if (typeof window  !== 'undefined') window.UzNumWord  = UzNumWord;
if (typeof module  !== 'undefined') module.exports     = UzNumWord;
