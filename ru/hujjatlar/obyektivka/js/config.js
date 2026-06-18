/* OBYEKTIVKA (MA'LUMOTNOMA) — to'liq format konfiguratsiyasi
   3 qism: shaxsiy ma'lumotlar + mehnat faoliyati + qarindoshlar */
window.OBYEKTIVKA = {
  title: "MA'LUMOTNOMA", titleCyr: "МАЪЛУМОТНОМА",
  fileBase: "obyektivka", rasmLabel: "Rasm (3\u00d74)",
  sec: {
    work: "MEHNAT FAOLIYATI",
    relSuffix: "ning yaqin qarindoshlari haqida",
    relWord: "MA'LUMOT",
    relHead: ["Qarindoshligi", "Familiyasi va ismi", "Tug'ilgan yili va joyi", "Ish joyi va lavozimi", "Yashash joyi"]
  },
  shaxs: {
    fish: { label: "F.I.Sh.", placeholder: "Antropov Klod Sonnet o'g'li", required: true },
    birthDate: { label: "Tug'ilgan yili", placeholder: "04.03.2024", required: true },
    birthPlace: { label: "Tug'ilgan joyi", placeholder: "Toshkent viloyati, Serverobod tumani", required: true },
    nationality: { label: "Millati", placeholder: "o'zbek", required: true },
    party: { label: "Partiyaviyligi", placeholder: "yo'q", required: false },
    education: { label: "Ma'lumoti", placeholder: "oliy", required: true },
    graduated: { label: "Tamomlagan", placeholder: "2024 y. Transformer Milliy Universiteti", required: true },
    specialty: { label: "Ma'lumoti bo'yicha mutaxassisligi", placeholder: "tabiiy tilni qayta ishlash (NLP)", required: false },
    academicDegree: { label: "Ilmiy darajasi", placeholder: "yo'q", required: false },
    academicTitle: { label: "Ilmiy unvoni", placeholder: "yo'q", required: false },
    languages: { label: "Qaysi chet tillarini biladi", placeholder: "ingliz, rus (a'lo)", required: false },
    military: { label: "Harbiy (maxsus) unvoni", placeholder: "yo'q", required: false },
    awards: { label: "Davlat mukofotlari bilan taqdirlanganmi (qanaqa)", placeholder: "yo'q", required: false },
    deputy: { label: "Xalq deputatlari, respublika, viloyat, shahar va tuman Kengashi deputatimi yoki boshqa saylanadigan organlarning a'zosimi (to'liq ko'rsatilishi lozim)", placeholder: "yo'q", required: false }
  },
  layout: [
    { type: "pair", keys: ["birthDate", "birthPlace"] },
    { type: "pair", keys: ["nationality", "party"] },
    { type: "pair", keys: ["education", "graduated"] },
    { type: "inline", key: "specialty" },
    { type: "pair", keys: ["academicDegree", "academicTitle"] },
    { type: "pair", keys: ["languages", "military"] },
    { type: "inline", key: "awards" },
    { type: "stacked", key: "deputy" }
  ],
  ish: {
    period: { label: "Davr", placeholder: "2024.09 - h.v" },
    desc: { label: "Ish joyi va lavozimi", placeholder: "Anthropic kompaniyasi, bosh arxitektor" }
  },
  qar: [
    { key: "relation", label: "Qarindoshligi", ph: "Otasi" },
    { key: "name", label: "Familiyasi va ismi", ph: "Jipitiyev Chat o'g'li" },
    { key: "birth", label: "Tug'ilgan yili va joyi", ph: "1999 yil, San-Fransisko" },
    { key: "work", label: "Ish joyi va lavozimi", ph: "OpenAI bosh direktori" },
    { key: "residence", label: "Yashash joyi", ph: "AQSh, San-Fransisko" }
  ]
};
