/**
 * toolbase.uz — Number → Words (English)
 * Supports:
 *   - Integers: 0 to 999,999,999,999
 *   - Negative numbers
 *   - Decimals (max 2 decimal places)
 *   - Currency mode: dollars + cents
 */

const EnNumWord = (function () {
  'use strict';

  const MAX_VALUE    = 999999999999;
  const MAX_DECIMALS = 2;
  const MAX_INPUT_LEN = 16;

  const ONES = [
    '', 'one', 'two', 'three', 'four', 'five',
    'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
    'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const TENS = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty',
    'sixty', 'seventy', 'eighty', 'ninety'
  ];
  const SCALE = ['', 'thousand', 'million', 'billion'];

  function threeDigits(n) {
    if (n === 0) return '';
    if (n < 20) return ONES[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const o = n % 10;
      return TENS[t] + (o ? '-' + ONES[o] : '');
    }
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return ONES[h] + ' hundred' + (rest ? ' ' + threeDigits(rest) : '');
  }

  function intToWords(n) {
    if (n === 0) return 'zero';
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
      const scale = SCALE[i];
      parts.push(scale ? words + ' ' + scale : words);
    }
    return parts.join(' ');
  }

  function validate(raw) {
    if (!/^-?[\d.,]+$/.test(raw)) {
      return { ok: false, msg: 'Numbers only please' };
    }
    const sep = raw.replace(/[^.,]/g, '');
    if (sep.length > 1) {
      return { ok: false, msg: 'Only one decimal separator allowed' };
    }
    const clean = raw.replace(',', '.');
    const num = parseFloat(clean);
    if (isNaN(num)) {
      return { ok: false, msg: 'Invalid number' };
    }
    if (Math.abs(num) > MAX_VALUE) {
      return { ok: false, msg: 'Number too large (max: 999,999,999,999)' };
    }
    const dotIdx = clean.indexOf('.');
    if (dotIdx !== -1) {
      const decimals = clean.slice(dotIdx + 1);
      if (decimals.length > MAX_DECIMALS) {
        return { ok: false, msg: `Max ${MAX_DECIMALS} decimal places` };
      }
    }
    return { ok: true, num, clean };
  }

  function convert(raw, mode) {
    raw = (raw || '').trim();
    if (!raw) return { ok: false, msg: '' };
    if (raw.length > MAX_INPUT_LEN) {
      return { ok: false, msg: `Too many characters (max: ${MAX_INPUT_LEN})` };
    }

    const v = validate(raw);
    if (!v.ok) return v;

    const { num, clean } = v;
    const isNeg = num < 0;
    const abs   = Math.abs(num);
    const dotIdx = clean.indexOf('.');
    const intPart = Math.floor(abs);
    let rawDecStr = '';
    let decPart = 0;
    if (dotIdx !== -1) {
      rawDecStr = clean.slice(dotIdx + 1).slice(0, 2);
      decPart = parseInt(rawDecStr, 10);
    }

    let result = '';

    if (mode === 'pul') {
      const centsPart = rawDecStr ? parseInt(rawDecStr.padEnd(2, '0').slice(0, 2), 10) : 0;
      const dollarWords = intToWords(intPart);
      result = (isNeg ? 'minus ' : '') + dollarWords + (intPart === 1 ? ' dollar' : ' dollars');
      if (centsPart > 0) {
        result += ' and ' + intToWords(centsPart) + (centsPart === 1 ? ' cent' : ' cents');
      }
    } else {
      if (dotIdx !== -1 && decPart > 0) {
        const denom = rawDecStr.length === 1 ? 'tenths' : 'hundredths';
        result = (isNeg ? 'minus ' : '') +
                 intToWords(intPart) + ' point ' +
                 intToWords(decPart) + ' ' + denom;
      } else {
        result = (isNeg ? 'minus ' : '') + intToWords(intPart);
      }
    }

    return { ok: true, text: result.charAt(0).toUpperCase() + result.slice(1) };
  }

  function filterInput(raw) {
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

if (typeof window !== 'undefined') window.EnNumWord = EnNumWord;
if (typeof module !== 'undefined') module.exports = EnNumWord;
