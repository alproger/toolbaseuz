/* TARJIMAI HOL — narrativ konfiguratsiya */
window.HUJJAT = {
  title: "TARJIMAI HOL", titleCyr: "ТАРЖИМАИ ҲОЛ",
  fileBase: "tarjimai-hol", previewType: "narrative", fishKey: "fish", sanaKey: "hujjatSana",
  qadamlar: [
    { nom: "Shaxsiy", maydonlar: ["fish", "tugSana", "tugJoy", "millat"] },
    { nom: "Ta'lim va faoliyat", maydonlar: ["malumot", "ish"] },
    { nom: "Oila va aloqa", maydonlar: ["oila", "manzil", "telefon", "hujjatSana"] }
  ],
  maydonlar: {
    fish: { label: "To'liq F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
    tugSana: { label: "Tug'ilgan sana", placeholder: "1995-yil 12-mart", required: true },
    tugJoy: { label: "Tug'ilgan joy", placeholder: "Toshkent shahri", required: true },
    millat: { label: "Millati", placeholder: "o'zbek", required: false },
    malumot: { label: "Ma'lumoti", placeholder: "2017-yilda Toolbase universitetini axborot texnologiyalari yo'nalishi bo'yicha tamomlaganman", required: true, type: "kop", hint: "Qaysi muassasa, qachon, qaysi yo'nalish" },
    ish: { label: "Mehnat faoliyati", placeholder: "2018-yildan «Toolbase» MChJda dasturchi bo'lib ishlayman", required: false, type: "kop", hint: "Ish joylari, lavozimlar (ixtiyoriy)" },
    oila: { label: "Oilaviy ahvoli", placeholder: "uylanganman, ikki farzandim bor", required: false },
    manzil: { label: "Yashash manzili", placeholder: "Toshkent sh., Chilonzor t., 5-uy", required: false },
    telefon: { label: "Telefon", placeholder: "+998 90 123 45 67", required: false },
    hujjatSana: { label: "Hujjat sanasi", placeholder: "2026-yil 14-iyun", required: true }
  },
  bloklar: function (get) {
    var b = {};
    b.millat_blok = get('millat') ? ' Millatim — ' + get('millat') + '.' : '';
    b.malumot_blok = get('malumot') ? get('malumot').replace(/\.?$/, '.') : '';
    b.ish_blok = get('ish') ? ' ' + get('ish').replace(/\.?$/, '.') : '';
    b.oila_blok = get('oila') ? 'Oilaviy ahvolim: ' + get('oila') + '.' : '';
    b.manzil_blok = get('manzil') ? ' Hozirda ' + get('manzil') + ' manzilida istiqomat qilaman.' : '';
    b.telefon_blok = get('telefon') ? ' Aloqa uchun telefon: ' + get('telefon') + '.' : '';
    return b;
  },
  matn: "TARJIMAI HOL\n\nMen, {{fish}}, {{tugSana}}da {{tugJoy}}da tug'ilganman.{{millat_blok}}\n\n{{malumot_blok}}{{ish_blok}}\n\n{{oila_blok}}{{manzil_blok}}{{telefon_blok}}\n\n{{hujjatSana}}{{imzo}}"
};
