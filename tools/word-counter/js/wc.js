/**
 * toolbase.uz — Word Counter engine
 * Real-time matn statistikasi:
 *   - So'zlar, belgilar, belgilar (bo'shliqlarsiz)
 *   - Gaplar, paragraflar
 *   - O'qish vaqti (ortalama 200 so'z/daqiqa)
 *   - Yozish vaqti (ortalama 40 so'z/daqiqa)
 *   - Top 10 so'zlar (stop-words olib tashlab)
 *   - Unikal so'zlar soni
 *   - O'rtacha gap uzunligi (so'z/gap)
 */

const WCounter = (function () {
  'use strict';

  /* ── Stop-words (o'zbek + ingliz eng keng tarqalganlari) ── */
  const STOP = new Set([
    // O'zbek
    'va', 'bu', 'bir', 'u', 'biz', 'siz', 'men', 'ular', 'ham',
    'lekin', 'ammo', 'chunki', 'agar', 'esa', 'bilan', 'uchun',
    'dan', 'ga', 'da', 'ni', 'ning', 'mi', 'ki', 'bo', 'ha',
    'yo', 'yoki', 'hatto', 'faqat', 'hali', 'endi',
    // Ingliz
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
    'to', 'for', 'of', 'with', 'by', 'from', 'is', 'it', 'be',
    'as', 'was', 'are', 'that', 'this', 'he', 'she', 'we', 'you',
    'i', 'not', 'have', 'had', 'has', 'do', 'did', 'will', 'can',
  ]);

  function analyze(text) {
    if (!text) {
      return {
        words: 0, chars: 0, charsNoSpace: 0,
        sentences: 0, paragraphs: 0,
        readMin: 0, readSec: 0,
        writeMin: 0, writeSec: 0,
        uniqueWords: 0, avgSentenceLen: 0,
        topWords: [],
      };
    }

    /* ── So'zlar ─────────────────────────────────────────── */
    const wordList = text.trim().match(/\S+/g) || [];
    const words = wordList.length;

    /* ── Belgilar ────────────────────────────────────────── */
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;

    /* ── Gaplar ──────────────────────────────────────────── */
    const sentenceMatches = text.match(/[^.!?؟…]*[.!?؟…]+/g) || [];
    const sentences = sentenceMatches.length || (text.trim() ? 1 : 0);

    /* ── Paragraflar ─────────────────────────────────────── */
    const paragraphs = text.trim()
      ? text.split(/\n\s*\n+/).filter(function (p) { return p.trim().length > 0; }).length
      : 0;

    /* ── O'qish va yozish vaqti ──────────────────────────── */
    const totalReadSec  = Math.round((words / 200) * 60);
    const totalWriteSec = Math.round((words / 40)  * 60);

    function toMinSec(totalSec) {
      return { min: Math.floor(totalSec / 60), sec: totalSec % 60 };
    }
    const read  = toMinSec(totalReadSec);
    const write = toMinSec(totalWriteSec);

    /* ── Unikal so'zlar ──────────────────────────────────── */
    const normalised = wordList.map(function (w) {
      return w.toLowerCase().replace(/[^a-zA-Zа-яёўқғҳА-ЯЁЎҚҒҲ''-]/gu, '');
    }).filter(function (w) { return w.length > 0; });

    const uniqueWords = new Set(normalised).size;

    /* ── O'rtacha gap uzunligi ───────────────────────────── */
    const avgSentenceLen = sentences > 0
      ? Math.round(words / sentences)
      : 0;

    /* ── Top 10 so'zlar ──────────────────────────────────── */
    const freq = {};
    normalised.forEach(function (w) {
      if (w.length < 2) return;
      if (STOP.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });
    const topWords = Object.entries(freq)
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, 10)
      .map(function (e) { return { word: e[0], count: e[1] }; });

    return {
      words, chars, charsNoSpace,
      sentences, paragraphs,
      readMin: read.min, readSec: read.sec,
      writeMin: write.min, writeSec: write.sec,
      uniqueWords, avgSentenceLen,
      topWords,
    };
  }

  /* ── Vaqtni formatlash ───────────────────────────────────── */
  function fmtTime(min, sec) {
    if (min === 0 && sec === 0) return '0 daq';
    if (min === 0) return sec + ' son';
    if (sec === 0) return min + ' daq';
    return min + ' daq ' + sec + ' son';
  }

  return { analyze, fmtTime };
})();

if (typeof window !== 'undefined') window.WCounter = WCounter;
if (typeof module !== 'undefined') module.exports  = WCounter;
