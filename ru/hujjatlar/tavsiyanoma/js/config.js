/* РЕКОМЕНДАЦИЯ — рекомендательное письмо */
window.HUJJAT = {
  title: "РЕКОМЕНДАЦИЯ", titleCyr: "РЕКОМЕНДАЦИЯ",
  fileBase: "rekomendaciya", previewType: "document", shapkaJc: "left", imzoLabel: "(подпись)",
  footerKeys: { left: "tavsiyaLavozim", right: "tavsiyaFish" },
  qadamlar: [
    { nom: "Кандидат", maydonlar: ["fish", "maqom", "maqsad"] },
    { nom: "Рекомендация", maydonlar: ["matn"] },
    { nom: "Рекомендатель", maydonlar: ["tavsiyaLavozim", "tavsiyaFish", "hujjatSana"] }
  ],
  maydonlar: {
    fish: { label: "На кого (Ф.И.О.)", placeholder: "Алиев Вали Салимович", required: true },
    maqom: { label: "Статус / должность", placeholder: "программист", required: true },
    maqsad: { label: "Для чего рекомендуется", placeholder: "поступления в магистратуру", required: true, hint: "Должность, грант, учёба и т.д." },
    matn: { label: "Текст рекомендации", placeholder: "Является высококвалифицированным специалистом, ответственным и инициативным. Выполняет проекты качественно и в срок.", required: true, type: "kop", hint: "Сильные стороны кандидата" },
    tavsiyaLavozim: { label: "Должность рекомендателя", placeholder: "директор ООО «Toolbase»", required: true },
    tavsiyaFish: { label: "Ф.И.О. рекомендателя", placeholder: "А. Каримов", required: true },
    hujjatSana: { label: "Дата", placeholder: "14 июня 2026 г.", required: true }
  },
  matn: "РЕКОМЕНДАЦИЯ\n\nЯ, {{tavsiyaLavozim}} {{tavsiyaFish}}, рекомендую {{fish}} ({{maqom}}) для {{maqsad}}.\n\n{{matn}}\n\n{{hujjatSana}}{{imzo}}"
};
