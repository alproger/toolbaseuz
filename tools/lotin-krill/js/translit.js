/**
 * Toolbase.uz — Uzbek Latin ⇄ Cyrillic transliterator
 * Standard: 1995 official Uzbek alphabet
 * Handles: digraphs (sh ch ng oʻ gʻ), apostrophe variants,
 *          е→ye positional rule, ь suppression, ALL_CAPS,
 *          exceptions dictionary (JSON loaded externally).
 * Limit: 5 000 words / 35 000 chars.
 */
const UzTranslit = (function () {
  'use strict';

  /* ── Constants ──────────────────────────────────────── */
  const WORD_LIMIT      = 5000;
  const CHAR_HARD_LIMIT = 35000;

  // All apostrophe‑like chars used for oʻ / gʻ
  const RE_APOS = /[ʻ'\u2019`\u02BC]/g;

  // Cyrillic vowels for е → ye rule
  const CYR_VOWELS = new Set('аеёиоуўэюяАЕЁИОУЎЭЮЯ');

  /* ── Latin → Cyrillic table (ORDER MATTERS: longer first) ── */
  const L2C = [
    // trigraph
    ["sch","щ"],
    ["s'h","сҳ"],   // Is'hoq → Исҳоқ ("sh" emas)
    // apostrophe-digraphs (apos normalised to ' before lookup)
    ["o'","ў"],["g'","ғ"],
    // digraphs
    ["sh","ш"],["ch","ч"],["ng","нг"],
    ["yo","ё"],["yu","ю"],["ya","я"],["ye","е"],["ts","ц"],
    // singles
    ["a","а"],["b","б"],["d","д"],["f","ф"],
    ["g","г"],["h","ҳ"],["i","и"],["j","ж"],["k","к"],
    ["l","л"],["m","м"],["n","н"],["o","о"],["p","п"],
    ["q","қ"],["r","р"],["s","с"],["t","т"],["u","у"],
    ["v","в"],["x","х"],["y","й"],["z","з"],
    ["'","ъ"],  // remaining apos → hard sign (sanʼat → санъат)
  ];

  /* ── Cyrillic → Latin table ─────────────────────────── */
  const C2L = [
    ["щ","sch"],
    ["ш","sh"],["ч","ch"],
    ["нг","ng"],          // must come before н
    ["ё","yo"],["ю","yu"],["я","ya"],["ц","ts"],
    ["ў","o'"],["ғ","g'"],
    ["а","a"],["б","b"],["в","v"],["г","g"],["д","d"],
    // е handled separately (ye / e positional)
    ["ж","j"],["з","z"],["и","i"],["й","y"],["к","k"],
    ["л","l"],["м","m"],["н","n"],["о","o"],["п","p"],
    ["қ","q"],["р","r"],["с","s"],["т","t"],["у","u"],
    ["ф","f"],["х","x"],["ҳ","h"],["э","e"],
    ["ъ","'"],
    ["ь",""],   // soft sign → drop
    ["ы","i"],  // loan words
  ];

  /* ── Exceptions (loaded from JSON) ─────────────────── */
  // Ichki qo'shimcha istisnolar — sahifa lug'ati bilan birlashtiriladi
  const BUILTIN_L2C = {
    "sentabr": "сентябрь", "oktabr": "октябрь",
    "budjet": "бюджет", "obyekt": "объект", "subyekt": "субъект",
  };
  const BUILTIN_C2L = {
    "бюджет": "budjet",
  };
  let EX_L2C = Object.assign({}, BUILTIN_L2C);
  let EX_C2L = Object.assign({}, BUILTIN_C2L);

  function loadExceptions(json) {
    if (!json) return;
    EX_L2C = Object.assign({}, BUILTIN_L2C, json.lat_to_cyr || {});
    EX_C2L = Object.assign({}, BUILTIN_C2L, json.cyr_to_lat || {});
  }

  /* ── Helpers ─────────────────────────────────────────── */
  function normApos(s) { return s.replace(RE_APOS, "'"); }

  // Preserve case of original word in converted result
  function applyCase(orig, converted) {
    if (!orig || !converted) return converted || '';
    // ALL CAPS: every char in orig is uppercase → uppercase result
    if (orig.length > 1 && orig === orig.toUpperCase() && orig !== orig.toLowerCase())
      return converted.toUpperCase();
    // Single uppercase letter or Title-case first char
    if (orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase())
      return converted[0].toUpperCase() + converted.slice(1);
    return converted;
  }

  // For е: return true when it should render as "ye"
  function yeContext(src, pos) {
    if (pos === 0) return true;
    const prev = src[pos - 1];
    if (/\s/.test(prev)) return true;                  // after space → word start
    if (!/[а-яёўқғҳА-ЯЁЎҚҒҲ]/u.test(prev)) return true; // after non-Cyrillic
    return CYR_VOWELS.has(prev);                        // after vowel
  }

  /* ── Latin → Cyrillic engine ────────────────────────── */

  // Latin vowels — for е context detection in lat→cyr
  const LAT_VOWELS = new Set('aeiouAEIOU');

  // е appears as "ye" at word-start / after vowel, else "е" as plain е (not э)
  // э appears only when e is standalone not preceded by consonant but this is
  // complex; safest rule: e→е everywhere in Uzbek native words, е=э only in
  // clearly Russian-borrowed words (handled via exceptions).
  // Standard rule used by uzlatin.com: e → е always (not э) in Uzbek words.

  function latToCyr(text) {
    const src = normApos(text);
    let out = '', i = 0, len = src.length;

    while (i < len) {
      // 1. Exception: grab full word, lookup lowercase
      const wm = src.slice(i).match(/^([a-zA-Z']+)/);
      if (wm) {
        const raw = wm[1];
        const key = raw.toLowerCase();
        if (EX_L2C[key]) { out += applyCase(raw, EX_L2C[key]); i += raw.length; continue; }
      }

      const ch  = src[i];
      const chL = ch.toLowerCase();

      // 2. Standalone e → е (Uzbek native) or э (after consonant in isolation)?
      //    Standard 1995: e → е always. э only for some Russian loans (exceptions cover those).
      if (chL === 'e') {
        // Qoida: so'z boshida yoki unlidan keyin e → э (erkin→эркин, aeroport→аэропорт),
        // so'z ichida undoshdan keyin e → е (keldi→келди).
        // "ye" digrafi jadvalda е ga o'tadi (yer→ер) — bu yerga faqat yakka e keladi.
        const prev = i > 0 ? src[i - 1] : '';
        const prevIsLatLetter = /[a-zA-Z]/.test(prev);
        const prevIsVowel = LAT_VOWELS.has(prev);
        const isE_cyr = !prevIsLatLetter || prevIsVowel;
        out += applyCase(ch, isE_cyr ? 'э' : 'е');
        i++; continue;
      }

      // 3. Remaining apostrophe → ъ (lowercase only — applyCase fixes)
      if (ch === "'") {
        out += 'ъ';
        i++; continue;
      }

      // 4. Try table (longest match first, skip 'e' and "'" already handled)
      let matched = false;
      for (const [lat, cyr] of L2C) {
        if (lat === 'e' || lat === "'") continue; // already handled above
        const chunk = src.slice(i, i + lat.length);
        if (chunk.toLowerCase() === lat) {
          out += applyCase(chunk, cyr);
          i += lat.length;
          matched = true; break;
        }
      }
      if (!matched) { out += src[i]; i++; }
    }
    return out;
  }

  /* ── Cyrillic → Latin engine ────────────────────────── */
  function cyrToLat(text) {
    let out = '', i = 0, len = text.length;

    // Detect if whole text is ALL CAPS (for digraph casing)
    function isAllCaps(s) {
      const letters = s.replace(/[^a-zA-Zа-яёўқғҳА-ЯЁЎҚҒҲ]/gu, '');
      return letters.length > 0 && letters === letters.toUpperCase();
    }
    const allCapsInput = isAllCaps(text);

    while (i < len) {
      // 1. Exception: full word lookup
      const wm = text.slice(i).match(/^([а-яёўқғҳА-ЯЁЎҚҒҲЪЬ]+)/u);
      if (wm) {
        const raw = wm[1];
        const key = raw.toLowerCase();
        if (EX_C2L[key]) {
          let result = EX_C2L[key];
          if (allCapsInput) result = result.toUpperCase();
          else result = applyCase(raw, result);
          out += result; i += raw.length; continue;
        }
      }

      const ch   = text[i];
      const chL  = ch.toLowerCase();
      const chIsUpper = ch !== chL && ch === ch.toUpperCase();

      // 2. нг digraph (before н single)
      if (chL === 'н' && text[i+1] && text[i+1].toLowerCase() === 'г') {
        out += allCapsInput ? 'NG' : applyCase(ch, 'ng');
        i += 2; continue;
      }

      // 3. е / Е — positional
      if (chL === 'е') {
        const base = yeContext(text, i) ? 'ye' : 'e';
        out += allCapsInput ? base.toUpperCase() : applyCase(ch, base);
        i++; continue;
      }

      // 3a. ц — kontekstli: unlidan keyin ts (лицей→litsey, абзац→abzats),
      //     aks holda s (цирк→sirk)
      if (chL === 'ц') {
        const prev = i > 0 ? text[i - 1] : '';
        const base = (prev && CYR_VOWELS.has(prev)) ? 'ts' : 's';
        out += allCapsInput ? base.toUpperCase() : applyCase(ch, base);
        i++; continue;
      }

      // 3b. ъ + е/ё → ye/yo (объект→obyekt, съёмка→syomka)
      if (chL === 'ъ' && text[i+1]) {
        const nL = text[i+1].toLowerCase();
        if (nL === 'е' || nL === 'ё') {
          const base = nL === 'е' ? 'ye' : 'yo';
          out += allCapsInput ? base.toUpperCase() : applyCase(text[i+1], base);
          i += 2; continue;
        }
      }

      // 3c. ь + е/ё/ю/я → ye/yo/yu/ya (премьера→premyera), ь o'zi tushadi
      if (chL === 'ь' && text[i+1]) {
        const nL = text[i+1].toLowerCase();
        const m = { 'е':'ye', 'ё':'yo', 'ю':'yu', 'я':'ya' }[nL];
        if (m) {
          out += allCapsInput ? m.toUpperCase() : applyCase(text[i+1], m);
          i += 2; continue;
        }
      }

      // 4. General table
      let matched = false;
      for (const [cyr, lat] of C2L) {
        const chunk = text.slice(i, i + cyr.length);
        if (chunk.toLowerCase() === cyr) {
          let result = lat;
          if (allCapsInput) result = lat.toUpperCase();
          else result = applyCase(chunk, lat);
          out += result;
          i += cyr.length;
          matched = true; break;
        }
      }
      if (!matched) { out += ch; i++; }
    }
    return out;
  }

  /* ── Auto-detect ─────────────────────────────────────── */
  function detect(text) {
    const c = (text.match(/[а-яёўқғҳА-ЯЁЎҚҒҲ]/gu)||[]).length;
    const l = (text.match(/[a-zA-Z]/g)||[]).length;
    return c >= l ? 'cyr' : 'lat';
  }

  function countWords(t) {
    return t.trim() ? t.trim().split(/\s+/).length : 0;
  }

  /* ── Public ──────────────────────────────────────────── */
  return { WORD_LIMIT, CHAR_HARD_LIMIT, loadExceptions,
           latToCyr, cyrToLat, detect, countWords,
           convert(text, dir) {
             const d = dir || detect(text);
             return d === 'lat' ? latToCyr(text) : cyrToLat(text);
           }
  };
})();

if (typeof window  !== 'undefined') window.UzTranslit  = UzTranslit;
if (typeof module  !== 'undefined') module.exports      = UzTranslit;
