/**
 * toolbase.uz — Case Converter engine
 * Qo'llab-quvvatlanadi:
 *   UPPER CASE     → BARCHA HARFLAR KATTA
 *   lower case     → barcha harflar kichik
 *   Title Case     → Har So'z Boshi Katta
 *   Sentence case  → Faqat gap boshi katta
 *   camelCase      → birBirikkanSo'zlar
 *   PascalCase     → BirBirikkanSo'zlar (boshi ham katta)
 *   snake_case     → bir_birikkan_so'zlar
 *   kebab-case     → bir-birikkan-so'zlar
 *   CONSTANT_CASE  → BIR_BIRIKKAN_SO'ZLAR
 *   Alternating    → hEr BeLgI aLmAsHiNaDi
 *   Inverse        → kAtta kIchIk AkSiNchA
 */

const CaseConverter = (function () {
  'use strict';

  /* ── O'zbek tilidagi harflarni qo'llab-quvvatlash ── */
  // toLowerCase / toUpperCase JS'da unicode'ni to'g'ri ishlaydi
  // lekin ba'zi muhitlarda ʻ (modifier letter turned comma) harfi
  // case'dan tashqarida — uni qoldirish kerak.

  /* ── Yordamchi: so'zlarga ajratish ─────────────────── */
  // Har qanday formatdan so'zlar olish:
  // "hello_world", "helloWorld", "Hello World", "HELLO_WORLD" → ["hello", "world"]
  function tokenize(text) {
    // 1. camelCase / PascalCase ajratish
    text = text.replace(/([a-zA-ZА-ЯЁЎҚҒҲа-яёўқғҳ])([A-ZА-ЯЁЎҚҒҲ][a-zа-яёўқғҳ])/gu,
                        '$1 $2');
    text = text.replace(/([a-zа-яёўқғҳ])([A-ZА-ЯЁЎҚҒҲ])/gu, '$1 $2');
    // 2. Ajratgichlar → bo'shliq
    text = text.replace(/[-_./\\|]+/g, ' ');
    // 3. Bir nechta bo'shliq → bitta
    text = text.replace(/\s+/g, ' ').trim();
    return text ? text.split(' ') : [];
  }

  /* ── Har bir harfni katta qilish (unicode-safe) ───── */
  function capFirst(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  /* ── Converters ──────────────────────────────────── */
  const converters = {

    upper: function (text) {
      return text.toUpperCase();
    },

    lower: function (text) {
      return text.toLowerCase();
    },

    title: function (text) {
      // So'z boshlarini katta qiladi, har bir qatorni alohida
      return text.replace(/\S+/gu, function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      });
    },

    sentence: function (text) {
      // Har bir gap boshini katta qiladi
      return text.toLowerCase().replace(/(^|[.!?؟…]\s+)(\S)/gu, function (m, pre, ch) {
        return pre + ch.toUpperCase();
      }).replace(/^\s*(\S)/u, function (m, ch) {
        return ch.toUpperCase();
      });
    },

    camel: function (text) {
      var words = tokenize(text);
      if (!words.length) return '';
      return words[0].toLowerCase() +
        words.slice(1).map(function (w) { return capFirst(w); }).join('');
    },

    pascal: function (text) {
      return tokenize(text).map(function (w) { return capFirst(w); }).join('');
    },

    snake: function (text) {
      return tokenize(text).map(function (w) { return w.toLowerCase(); }).join('_');
    },

    kebab: function (text) {
      return tokenize(text).map(function (w) { return w.toLowerCase(); }).join('-');
    },

    constant: function (text) {
      return tokenize(text).map(function (w) { return w.toUpperCase(); }).join('_');
    },

    alternating: function (text) {
      var i = 0;
      return text.replace(/[^\s]/gu, function (ch) {
        return (i++ % 2 === 0) ? ch.toLowerCase() : ch.toUpperCase();
      });
    },

    inverse: function (text) {
      return text.replace(/./gu, function (ch) {
        var up = ch.toUpperCase();
        var lo = ch.toLowerCase();
        if (ch === up && ch !== lo) return lo;
        if (ch === lo && ch !== up) return up;
        return ch;
      });
    },
  };

  /* ── Convert ──────────────────────────────────────── */
  function convert(text, mode) {
    if (!text) return '';
    var fn = converters[mode];
    if (!fn) return text;
    return fn(text);
  }

  /* ── Available modes ─────────────────────────────── */
  var modes = [
    { id: 'upper',      label: 'UPPER CASE',      example: 'BARCHA HARFLAR KATTA' },
    { id: 'lower',      label: 'lower case',       example: 'barcha harflar kichik' },
    { id: 'title',      label: 'Title Case',       example: 'Har So\'z Boshi Katta' },
    { id: 'sentence',   label: 'Sentence case',    example: 'Faqat gap boshi katta.' },
    { id: 'camel',      label: 'camelCase',        example: 'birBirikkanSozlar' },
    { id: 'pascal',     label: 'PascalCase',       example: 'BirBirikkanSozlar' },
    { id: 'snake',      label: 'snake_case',       example: 'bir_birikkan_sozlar' },
    { id: 'kebab',      label: 'kebab-case',       example: 'bir-birikkan-sozlar' },
    { id: 'constant',   label: 'CONSTANT_CASE',    example: 'BIR_BIRIKKAN_SOZLAR' },
    { id: 'alternating',label: 'aLtErNaTiNg',      example: 'hAr bElGi aLmAsHiNaDi' },
    { id: 'inverse',    label: 'iNVERSE cASE',     example: 'kAtTa kIcHiK aKsInChA' },
  ];

  return { convert, modes };
})();

if (typeof window !== 'undefined') window.CaseConverter = CaseConverter;
if (typeof module !== 'undefined') module.exports        = CaseConverter;
