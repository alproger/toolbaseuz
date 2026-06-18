/* СПРАВКА — выдаётся организацией (шапка слева) */
window.HUJJAT = {
  title: "СПРАВКА", titleCyr: "СПРАВКА",
  fileBase: "spravka", previewType: "document", shapkaJc: "left", imzoLabel: "(подпись)",
  footerKeys: { left: "imzoLavozim", right: "imzoFish" },
  qadamlar: [
    { nom: "Организация", maydonlar: ["tashkilot", "sana", "raqam"] },
    { nom: "Лицо", maydonlar: ["fish", "lavozim", "maqsad"] },
    { nom: "Подписант", maydonlar: ["imzoLavozim", "imzoFish"] }
  ],
  maydonlar: {
    tashkilot: { label: "Название организации", placeholder: "ООО «Toolbase»", required: true },
    sana: { label: "Дата выдачи", placeholder: "14 июня 2026 г.", required: true },
    raqam: { label: "Номер документа", placeholder: "125", required: false, hint: "Необязательно" },
    fish: { label: "Кому выдана (Ф.И.О.)", placeholder: "Алиев Вали Салимович", required: true },
    lavozim: { label: "Должность / статус", placeholder: "программиста", required: true, hint: "Например: программиста, студента 3 курса" },
    maqsad: { label: "Куда предоставляется", placeholder: "для предоставления по месту требования", required: false },
    imzoLavozim: { label: "Должность подписанта", placeholder: "Директор", required: true },
    imzoFish: { label: "Ф.И.О. подписанта", placeholder: "А. Каримов", required: true }
  },
  bloklar: function (get) {
    return {
      raqam_blok: get('raqam') ? '   № ' + get('raqam') : '',
      maqsad_blok: 'Справка выдана ' + (get('maqsad') || 'для предоставления по месту требования') + '.'
    };
  },
  matn: "{{tashkilot}}\n{{sana}}{{raqam_blok}}\n\nСПРАВКА\n\nДана {{fish}} в том, что он(а) действительно является {{lavozim}} в {{tashkilot}}.\n\n{{maqsad_blok}}\n\n{{hujjatSana}}{{imzo}}"
};
