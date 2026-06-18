/* ОБЪЯСНИТЕЛЬНАЯ ЗАПИСКА — шапка справа */
window.HUJJAT = {
  title: "ОБЪЯСНИТЕЛЬНАЯ ЗАПИСКА", titleCyr: "ОБЪЯСНИТЕЛЬНАЯ ЗАПИСКА",
  fileBase: "obyasnitelnaya", previewType: "document", shapkaJc: "right", imzoLabel: "(подпись)",
  fishKey: "fish", sanaKey: "hujjatSana",
  qadamlar: [
    { nom: "Кому", maydonlar: ["tashkilot", "rahbar"] },
    { nom: "От кого", maydonlar: ["lavozim", "fish"] },
    { nom: "Объяснение", maydonlar: ["voqea", "hujjatSana"] }
  ],
  maydonlar: {
    tashkilot: { label: "Название организации", placeholder: "ООО «Toolbase»", required: true },
    rahbar: { label: "Должность и Ф.И.О. руководителя", placeholder: "директору А. Каримову", required: true, hint: "В дательном падеже" },
    lavozim: { label: "Ваша должность", placeholder: "программиста", required: true },
    fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
    voqea: { label: "Текст объяснения", placeholder: "13 июня 2026 года я опоздал на работу по причине неисправности городского транспорта.", required: true, type: "kop", hint: "Что произошло и по какой причине" },
    hujjatSana: { label: "Дата", placeholder: "14 июня 2026 г.", required: true }
  },
  matn: "{{tashkilot}}\n{{rahbar}}\n\nот {{lavozim}} {{fish}}\n\nОБЪЯСНИТЕЛЬНАЯ ЗАПИСКА\n\n{{voqea}}\n\n{{hujjatSana}}{{imzo}}"
};
