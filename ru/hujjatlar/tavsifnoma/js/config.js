/* ХАРАКТЕРИСТИКА — выдаётся организацией */
window.HUJJAT = {
  title: "ХАРАКТЕРИСТИКА", titleCyr: "ХАРАКТЕРИСТИКА",
  fileBase: "harakteristika", previewType: "document", shapkaJc: "left", imzoLabel: "(подпись)",
  footerKeys: { left: "imzoLavozim", right: "imzoFish" },
  qadamlar: [
    { nom: "Лицо", maydonlar: ["fish", "tugYili", "tashkilot", "lavozim"] },
    { nom: "Характеристика", maydonlar: ["matn", "maqsad"] },
    { nom: "Подписант", maydonlar: ["imzoLavozim", "imzoFish", "hujjatSana"] }
  ],
  maydonlar: {
    fish: { label: "На кого (Ф.И.О.)", placeholder: "Алиев Вали Салимович", required: true },
    tugYili: { label: "Год рождения", placeholder: "1995 года", required: true },
    tashkilot: { label: "Организация", placeholder: "ООО «Toolbase»", required: true },
    lavozim: { label: "Должность / статус", placeholder: "программист", required: true },
    matn: { label: "Текст характеристики", placeholder: "Ответственно выполняет свои обязанности, пользуется уважением в коллективе, постоянно повышает квалификацию.", required: true, type: "kop", hint: "Рабочие качества, поведение, достижения" },
    maqsad: { label: "Куда предоставляется", placeholder: "для предоставления по месту требования", required: false },
    imzoLavozim: { label: "Должность подписанта", placeholder: "Директор", required: true },
    imzoFish: { label: "Ф.И.О. подписанта", placeholder: "А. Каримов", required: true },
    hujjatSana: { label: "Дата", placeholder: "14 июня 2026 г.", required: true }
  },
  bloklar: function (get) {
    return { maqsad_blok: 'Характеристика выдана ' + (get('maqsad') || 'для предоставления по месту требования') + '.' };
  },
  matn: "ХАРАКТЕРИСТИКА\n\nна {{fish}}, {{tugYili}} рождения, {{lavozim}} в {{tashkilot}}.\n\n{{matn}}\n\n{{maqsad_blok}}\n\n{{hujjatSana}}{{imzo}}"
};
