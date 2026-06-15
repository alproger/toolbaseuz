/* ARIZA SHABLONLARI — RU (заявление). Адрес перед именем, дата вводится вручную. */
window.ARIZA_TURLARI = [
  {
    id: "ishga-qabul", nom: "Приём на работу", tavsif: "Заявление о приёме",
    qadamlar: [
      { nom: "Организация", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Заявитель", maydonlar: ["manzil", "fish", "telefon"] },
      { nom: "Детали", maydonlar: ["lavozim", "sana", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Название организации", placeholder: "ООО «Toolbase»", required: true },
      rahbar: { label: "Должность и Ф.И.О. руководителя", placeholder: "директору А. Каримову", required: true, hint: "В дательном падеже" },
      manzil: { label: "Ваш адрес проживания", placeholder: "г. Ташкент, Чиланзар, д. 5", required: false, hint: "Перед именем" },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true, hint: "В родительном падеже" },
      telefon: { label: "Телефон", placeholder: "+998 90 123 45 67", required: false },
      lavozim: { label: "Должность", placeholder: "программиста", required: true },
      sana: { label: "Дата начала работы", placeholder: "1 июля 2026 г.", required: false },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{manzil_blok}}от {{fish}}\n{{telefon_blok}}\nЗАЯВЛЕНИЕ\n\nПрошу принять меня на работу на должность {{lavozim}} {{sana_blok}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "ishdan-boshash", nom: "Увольнение", tavsif: "По собственному желанию",
    qadamlar: [{ nom: "Организация", maydonlar: ["tashkilot", "rahbar"] }, { nom: "Заявитель", maydonlar: ["lavozim", "fish"] }, { nom: "Детали", maydonlar: ["sana", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Название организации", placeholder: "ООО «Toolbase»", required: true },
      rahbar: { label: "Руководитель", placeholder: "директору А. Каримову", required: true },
      lavozim: { label: "Должность", placeholder: "программиста", required: true },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
      sana: { label: "Дата увольнения", placeholder: "15 июля 2026 г.", required: true },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\nот {{lavozim}} {{fish}}\n\nЗАЯВЛЕНИЕ\n\nПрошу уволить меня с занимаемой должности по собственному желанию с {{sana}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "tatil", nom: "Отпуск", tavsif: "Ежегодный отпуск",
    qadamlar: [{ nom: "Организация", maydonlar: ["tashkilot", "rahbar"] }, { nom: "Заявитель", maydonlar: ["lavozim", "fish"] }, { nom: "Детали", maydonlar: ["kun", "sana", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Название организации", placeholder: "ООО «Toolbase»", required: true },
      rahbar: { label: "Руководитель", placeholder: "директору А. Каримову", required: true },
      lavozim: { label: "Должность", placeholder: "программиста", required: true },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
      kun: { label: "Количество дней", placeholder: "14", required: true },
      sana: { label: "Дата начала", placeholder: "1 августа 2026 г.", required: true },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\nот {{lavozim}} {{fish}}\n\nЗАЯВЛЕНИЕ\n\nПрошу предоставить мне очередной трудовой отпуск на {{kun}} календарных дней с {{sana}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "oqishga", nom: "Поступление на учёбу", tavsif: "В учебное заведение",
    qadamlar: [{ nom: "Учреждение", maydonlar: ["tashkilot", "rahbar"] }, { nom: "Заявитель", maydonlar: ["manzil", "fish"] }, { nom: "Детали", maydonlar: ["yonalish", "kurs", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Название учреждения", placeholder: "Университет Toolbase", required: true },
      rahbar: { label: "Руководитель", placeholder: "ректору А. Каримову", required: true },
      manzil: { label: "Адрес проживания", placeholder: "г. Ташкент, Чиланзар", required: false },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
      yonalish: { label: "Направление", placeholder: "Информационные технологии", required: true },
      kurs: { label: "Курс", placeholder: "1 курс", required: false },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{manzil_blok}}от {{fish}}\n\nЗАЯВЛЕНИЕ\n\nПрошу принять меня на учёбу по направлению «{{yonalish}}» {{kurs_blok}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "akademik", nom: "Академический отпуск", tavsif: "Приостановка учёбы",
    qadamlar: [{ nom: "Учреждение", maydonlar: ["tashkilot", "rahbar"] }, { nom: "Заявитель", maydonlar: ["yonalish", "fish"] }, { nom: "Детали", maydonlar: ["sabab", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Название учреждения", placeholder: "Университет Toolbase", required: true },
      rahbar: { label: "Руководитель", placeholder: "ректору А. Каримову", required: true },
      yonalish: { label: "Направление и курс", placeholder: "ИТ, 2 курс", required: true },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
      sabab: { label: "Причина", placeholder: "по состоянию здоровья", required: true },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\nот студента {{yonalish}} {{fish}}\n\nЗАЯВЛЕНИЕ\n\nПрошу предоставить мне академический отпуск сроком на один год {{sabab}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "moddiy-yordam", nom: "Материальная помощь", tavsif: "Единовременная помощь",
    qadamlar: [{ nom: "Организация", maydonlar: ["tashkilot", "rahbar"] }, { nom: "Заявитель", maydonlar: ["lavozim", "fish"] }, { nom: "Детали", maydonlar: ["sabab", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Название организации", placeholder: "ООО «Toolbase»", required: true },
      rahbar: { label: "Руководитель", placeholder: "директору А. Каримову", required: true },
      lavozim: { label: "Должность", placeholder: "программиста", required: true },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
      sabab: { label: "Причина", placeholder: "в связи с семейными обстоятельствами", required: true },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\nот {{lavozim}} {{fish}}\n\nЗАЯВЛЕНИЕ\n\nПрошу оказать мне единовременную материальную помощь {{sabab}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "otkazish", nom: "Перевод на должность", tavsif: "Смена должности",
    qadamlar: [{ nom: "Организация", maydonlar: ["tashkilot", "rahbar"] }, { nom: "Заявитель", maydonlar: ["eski", "fish"] }, { nom: "Детали", maydonlar: ["yangi", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Название организации", placeholder: "ООО «Toolbase»", required: true },
      rahbar: { label: "Руководитель", placeholder: "директору А. Каримову", required: true },
      eski: { label: "Текущая должность", placeholder: "младшего программиста", required: true },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
      yangi: { label: "Новая должность", placeholder: "ведущего программиста", required: true },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\nот {{eski}} {{fish}}\n\nЗАЯВЛЕНИЕ\n\nПрошу перевести меня с должности {{eski}} на должность {{yangi}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "ajralish", nom: "Расторжение брака", tavsif: "Заявление в ЗАГС",
    qadamlar: [{ nom: "Орган", maydonlar: ["tashkilot"] }, { nom: "Заявитель", maydonlar: ["manzil", "fish"] }, { nom: "Детали", maydonlar: ["turmush", "sana", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Отдел ЗАГС", placeholder: "в отдел ЗАГС Чиланзарского района", required: true },
      manzil: { label: "Адрес проживания", placeholder: "г. Ташкент, Чиланзар", required: false },
      fish: { label: "Ф.И.О.", placeholder: "Алиевой Нодиры Салимовны", required: true },
      turmush: { label: "Ф.И.О. супруга(и)", placeholder: "Алиевым Вали Салимовичем", required: true },
      sana: { label: "Дата брака", placeholder: "10 мая 2018 г.", required: false },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n\n{{manzil_blok}}от {{fish}}\n\nЗАЯВЛЕНИЕ\n\nПрошу расторгнуть брак с {{turmush}}, заключённый {{sana_blok}}.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "erkin", nom: "Свободное заявление", tavsif: "Текст вводите сами",
    qadamlar: [{ nom: "Кому", maydonlar: ["tashkilot"] }, { nom: "Заявитель", maydonlar: ["manzil", "fish"] }, { nom: "Текст", maydonlar: ["matn", "hujjatSana"] }],
    maydonlar: {
      tashkilot: { label: "Кому", placeholder: "директору ООО «Toolbase» А. Каримову", required: true },
      manzil: { label: "Адрес проживания", placeholder: "г. Ташкент, Чиланзар", required: false },
      fish: { label: "Ф.И.О.", placeholder: "Алиева Вали Салимовича", required: true },
      matn: { label: "Текст заявления", placeholder: "Прошу Вас ...", required: true, type: "kop" },
      hujjatSana: { label: "Дата заявления", placeholder: "14 июня 2026 г.", required: true }
    },
    matn: "{{tashkilot}}\n\n{{manzil_blok}}от {{fish}}\n\nЗАЯВЛЕНИЕ\n\n{{matn}}\n\n{{hujjatSana}}{{imzo}}"
  }
];
