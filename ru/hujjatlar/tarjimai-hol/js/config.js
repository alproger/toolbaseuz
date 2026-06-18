/* АВТОБИОГРАФИЯ — нарративная конфигурация (RU) */
window.HUJJAT = {
  title: "АВТОБИОГРАФИЯ", titleCyr: "АВТОБИОГРАФИЯ",
  fileBase: "avtobiografiya", previewType: "narrative", fishKey: "fish", sanaKey: "hujjatSana",
  qadamlar: [
    { nom: "Личные данные", maydonlar: ["fish", "tugSana", "tugJoy", "millat"] },
    { nom: "Образование и работа", maydonlar: ["malumot", "ish"] },
    { nom: "Семья и контакты", maydonlar: ["oila", "manzil", "telefon", "hujjatSana"] }
  ],
  maydonlar: {
    fish: { label: "Ф.И.О. полностью", placeholder: "Алиев Вали Салимович", required: true },
    tugSana: { label: "Дата рождения", placeholder: "12 марта 1995 года", required: true },
    tugJoy: { label: "Место рождения", placeholder: "город Ташкент", required: true },
    millat: { label: "Национальность", placeholder: "узбек", required: false },
    malumot: { label: "Образование", placeholder: "в 2017 году окончил университет Toolbase по направлению «Информационные технологии»", required: true, type: "kop", hint: "Учебное заведение, год, направление" },
    ish: { label: "Трудовая деятельность", placeholder: "с 2018 года работаю программистом в ООО «Toolbase»", required: false, type: "kop", hint: "Места работы, должности (необязательно)" },
    oila: { label: "Семейное положение", placeholder: "женат, двое детей", required: false },
    manzil: { label: "Адрес проживания", placeholder: "г. Ташкент, Чиланзарский р-н, д. 5", required: false },
    telefon: { label: "Телефон", placeholder: "+998 90 123 45 67", required: false },
    hujjatSana: { label: "Дата документа", placeholder: "14 июня 2026 г.", required: true }
  },
  bloklar: function (get) {
    var b = {};
    b.millat_blok = get('millat') ? ' По национальности — ' + get('millat') + '.' : '';
    b.malumot_blok = get('malumot') ? get('malumot').charAt(0).toUpperCase() + get('malumot').slice(1).replace(/\.?$/, '.') : '';
    b.ish_blok = get('ish') ? ' ' + (get('ish').charAt(0).toUpperCase() + get('ish').slice(1)).replace(/\.?$/, '.') : '';
    b.oila_blok = get('oila') ? 'Семейное положение: ' + get('oila') + '.' : '';
    b.manzil_blok = get('manzil') ? ' В настоящее время проживаю по адресу: ' + get('manzil') + '.' : '';
    b.telefon_blok = get('telefon') ? ' Контактный телефон: ' + get('telefon') + '.' : '';
    return b;
  },
  matn: "АВТОБИОГРАФИЯ\n\nЯ, {{fish}}, родился {{tugSana}} в {{tugJoy}}.{{millat_blok}}\n\n{{malumot_blok}}{{ish_blok}}\n\n{{oila_blok}}{{manzil_blok}}{{telefon_blok}}\n\n{{hujjatSana}}{{imzo}}"
};
