/**
 * toolbase.uz — Number → Words (Russian)
 * Supports:
 *   - Integers: 0 to 999,999,999,999
 *   - Negative numbers
 *   - Decimals (max 2 decimal places)
 *   - Currency mode: рубли + копейки / сумы + тийины
 */

const RuNumWord = (function () {
  'use strict';

  const MAX_VALUE     = 999999999999;
  const MAX_DECIMALS  = 2;
  const MAX_INPUT_LEN = 16;

  // Ones — two genders: masculine (default) and feminine (for тысяча)
  const ONES_M = ['', 'один', 'два', 'три', 'четыре', 'пять',
                   'шесть', 'семь', 'восемь', 'девять'];
  const ONES_F = ['', 'одна', 'две', 'три', 'четыре', 'пять',
                  'шесть', 'семь', 'восемь', 'девять'];
  const TEENS  = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать',
                  'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать',
                  'восемнадцать', 'девятнадцать'];
  const TENS   = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят',
                  'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот',
                    'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

  // Scale words: [singular, 2-4, 5+, gender]
  const SCALE = [
    null,
    ['тысяча', 'тысячи', 'тысяч', 'f'],
    ['миллион', 'миллиона', 'миллионов', 'm'],
    ['миллиард', 'миллиарда', 'миллиардов', 'm'],
  ];

  function pluralize(n, one, two, five) {
    const mod10  = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return five;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return two;
    return five;
  }

  function threeDigits(n, feminine) {
    if (n === 0) return '';
    const parts = [];
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (h) parts.push(HUNDREDS[h]);
    if (rest >= 10 && rest <= 19) {
      parts.push(TEENS[rest - 10]);
    } else {
      const t = Math.floor(rest / 10);
      const o = rest % 10;
      if (t) parts.push(TENS[t]);
      if (o) parts.push(feminine ? ONES_F[o] : ONES_M[o]);
    }
    return parts.join(' ');
  }

  function intToWords(n) {
    if (n === 0) return 'ноль';
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
      const scaleInfo = SCALE[i];
      const isFem = scaleInfo && scaleInfo[3] === 'f';
      const words = threeDigits(g, isFem);
      if (scaleInfo) {
        const scaleWord = pluralize(g % 1000, scaleInfo[0], scaleInfo[1], scaleInfo[2]);
        parts.push(words + ' ' + scaleWord);
      } else {
        parts.push(words);
      }
    }
    return parts.join(' ');
  }

  function validate(raw) {
    if (!/^-?[\d.,]+$/.test(raw)) {
      return { ok: false, msg: 'Вводите только цифры' };
    }
    const sep = raw.replace(/[^.,]/g, '');
    if (sep.length > 1) {
      return { ok: false, msg: 'Только один разделитель дробной части' };
    }
    const clean = raw.replace(',', '.');
    const num = parseFloat(clean);
    if (isNaN(num)) {
      return { ok: false, msg: 'Неверное число' };
    }
    if (Math.abs(num) > MAX_VALUE) {
      return { ok: false, msg: 'Число слишком большое (макс: 999 999 999 999)' };
    }
    const dotIdx = clean.indexOf('.');
    if (dotIdx !== -1) {
      const decimals = clean.slice(dotIdx + 1);
      if (decimals.length > MAX_DECIMALS) {
        return { ok: false, msg: `Макс. ${MAX_DECIMALS} знака после запятой` };
      }
    }
    return { ok: true, num, clean };
  }

  function convert(raw, mode) {
    raw = (raw || '').trim();
    if (!raw) return { ok: false, msg: '' };
    if (raw.length > MAX_INPUT_LEN) {
      return { ok: false, msg: `Слишком много символов (макс: ${MAX_INPUT_LEN})` };
    }

    const v = validate(raw);
    if (!v.ok) return v;

    const { num, clean } = v;
    const isNeg  = num < 0;
    const abs    = Math.abs(num);
    const dotIdx = clean.indexOf('.');
    const intPart = Math.floor(abs);
    let rawDecStr = '';
    let decPart   = 0;
    if (dotIdx !== -1) {
      rawDecStr = clean.slice(dotIdx + 1).slice(0, 2);
      decPart   = parseInt(rawDecStr, 10);
    }

    let result = '';

    if (mode === 'pul') {
      // Currency: сум + тийин
      const tiyinPart = rawDecStr
        ? parseInt(rawDecStr.padEnd(2, '0').slice(0, 2), 10)
        : 0;
      const sumWords = intToWords(intPart);
      const sumForm  = pluralize(intPart % 1000 || intPart,
                                 'сум', 'сума', 'сумов');
      result = (isNeg ? 'минус ' : '') + sumWords + ' ' + sumForm;
      if (tiyinPart > 0) {
        const tiyinForm = pluralize(tiyinPart, 'тийин', 'тийина', 'тийинов');
        result += ' ' + intToWords(tiyinPart) + ' ' + tiyinForm;
      }
    } else {
      if (dotIdx !== -1 && decPart > 0) {
        const denom = rawDecStr.length === 1 ? 'десятых' : 'сотых';
        result = (isNeg ? 'минус ' : '') +
                 intToWords(intPart) + ' целых ' +
                 intToWords(decPart) + ' ' + denom;
      } else {
        result = (isNeg ? 'минус ' : '') + intToWords(intPart);
      }
    }

    return { ok: true, text: result.charAt(0).toUpperCase() + result.slice(1) };
  }

  function filterInput(raw) {
    let out = '';
    let hasSep   = false;
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

if (typeof window !== 'undefined') window.RuNumWord = RuNumWord;
if (typeof module !== 'undefined') module.exports = RuNumWord;
