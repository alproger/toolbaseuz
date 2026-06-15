/* ============================================================
   ARIZA SHABLONLARI v2 — rasmiy o'zbek ariza turlari
   - Manzil ism OLDIDAN: "...da yashovchi [F.I.Sh.]dan"
   - Sana foydalanuvchi tomonidan kiritiladi
   - Har maydon "qadam" guruhiga tegishli (mobil step uchun)
   ============================================================ */
window.ARIZA_TURLARI = [
  {
    id: "ishga-qabul", nom: "Ishga qabul qilish", tavsif: "Tashkilotga ishga kirish",
    qadamlar: [
      { nom: "Tashkilot", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Arizachi", maydonlar: ["manzil", "fish", "telefon"] },
      { nom: "Tafsilot", maydonlar: ["lavozim", "sana", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Tashkilot nomi", placeholder: "«Toolbase» MChJ", required: true, hint: "Ariza topshirilayotgan tashkilot to'liq nomi" },
      rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "direktori A. Karimovga", required: true, hint: "Jo'nalish kelishigida (...ga)" },
      manzil: { label: "Yashash manzilingiz", placeholder: "Toshkent sh., Chilonzor t., 5-uy", required: false, hint: "Ism oldidan yoziladi" },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      telefon: { label: "Telefon", placeholder: "+998 90 123 45 67", required: false },
      lavozim: { label: "Ishlamoqchi bo'lgan lavozim", placeholder: "dasturchi", required: true },
      sana: { label: "Ish boshlash sanasi", placeholder: "2026-yil 1-iyul", required: false },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true, hint: "Imzo yonida turadi" }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{manzil_blok}}{{fish}}dan\n{{telefon_blok}}\nARIZA\n\nMeni {{tashkilot}}ga {{lavozim}} lavozimiga {{sana_blok}}ishga qabul qilishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "ishdan-boshash", nom: "Ishdan bo'shash", tavsif: "O'z xohishi bilan ketish",
    qadamlar: [
      { nom: "Tashkilot", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Arizachi", maydonlar: ["lavozim", "fish"] },
      { nom: "Tafsilot", maydonlar: ["sana", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Tashkilot nomi", placeholder: "«Toolbase» MChJ", required: true },
      rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "direktori A. Karimovga", required: true },
      lavozim: { label: "Hozirgi lavozimingiz", placeholder: "dasturchi", required: true },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      sana: { label: "Bo'shash sanasi", placeholder: "2026-yil 15-iyul", required: true },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{lavozim}} {{fish}}dan\n\nARIZA\n\nMeni egallab turgan {{lavozim}} lavozimidan o'z xohishimga ko'ra {{sana}}dan bo'shatishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "tatil", nom: "Mehnat ta'tili", tavsif: "Yillik ta'til olish",
    qadamlar: [
      { nom: "Tashkilot", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Arizachi", maydonlar: ["lavozim", "fish"] },
      { nom: "Tafsilot", maydonlar: ["kun", "sana", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Tashkilot nomi", placeholder: "«Toolbase» MChJ", required: true },
      rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "direktori A. Karimovga", required: true },
      lavozim: { label: "Lavozimingiz", placeholder: "dasturchi", required: true },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      kun: { label: "Ta'til kunlari", placeholder: "14", required: true, hint: "Kalendar kunlar soni" },
      sana: { label: "Boshlanish sanasi", placeholder: "2026-yil 1-avgust", required: true },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{lavozim}} {{fish}}dan\n\nARIZA\n\nMenga navbatdagi mehnat ta'tilini {{sana}}dan {{kun}} kalendar kun muddatga berishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "oqishga", nom: "O'qishga kirish", tavsif: "Ta'lim muassasasiga",
    qadamlar: [
      { nom: "Muassasa", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Arizachi", maydonlar: ["manzil", "fish"] },
      { nom: "Tafsilot", maydonlar: ["yonalish", "kurs", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Muassasa nomi", placeholder: "Toolbase universiteti", required: true },
      rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "rektori A. Karimovga", required: true },
      manzil: { label: "Yashash manzilingiz", placeholder: "Toshkent sh., Chilonzor t.", required: false },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      yonalish: { label: "Yo'nalish / mutaxassislik", placeholder: "Axborot texnologiyalari", required: true },
      kurs: { label: "Kurs / bosqich", placeholder: "1-kurs", required: false },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{manzil_blok}}{{fish}}dan\n\nARIZA\n\nMeni {{tashkilot}}ning {{yonalish}} yo'nalishi {{kurs_blok}}o'qishga qabul qilishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "akademik", nom: "Akademik ta'til", tavsif: "O'qishni to'xtatish",
    qadamlar: [
      { nom: "Muassasa", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Arizachi", maydonlar: ["yonalish", "fish"] },
      { nom: "Tafsilot", maydonlar: ["sabab", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Muassasa nomi", placeholder: "Toolbase universiteti", required: true },
      rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "rektori A. Karimovga", required: true },
      yonalish: { label: "Yo'nalish va kurs", placeholder: "AT yo'nalishi 2-kurs", required: true },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      sabab: { label: "Sabab", placeholder: "sog'lig'im tufayli", required: true, hint: "...tufayli ko'rinishida" },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{yonalish}} talabasi {{fish}}dan\n\nARIZA\n\nMenga {{sabab}} bir yil muddatga akademik ta'til berishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "moddiy-yordam", nom: "Moddiy yordam", tavsif: "Bir martalik yordam",
    qadamlar: [
      { nom: "Tashkilot", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Arizachi", maydonlar: ["lavozim", "fish"] },
      { nom: "Tafsilot", maydonlar: ["sabab", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Tashkilot nomi", placeholder: "«Toolbase» MChJ", required: true },
      rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "direktori A. Karimovga", required: true },
      lavozim: { label: "Lavozimingiz", placeholder: "dasturchi", required: true },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      sabab: { label: "Sabab", placeholder: "oilaviy sharoit tufayli", required: true },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{lavozim}} {{fish}}dan\n\nARIZA\n\n{{sabab}} menga bir martalik moddiy yordam ko'rsatishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "otkazish", nom: "Lavozimga o'tkazish", tavsif: "Ichki o'zgartirish",
    qadamlar: [
      { nom: "Tashkilot", maydonlar: ["tashkilot", "rahbar"] },
      { nom: "Arizachi", maydonlar: ["eski", "fish"] },
      { nom: "Tafsilot", maydonlar: ["yangi", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Tashkilot nomi", placeholder: "«Toolbase» MChJ", required: true },
      rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "direktori A. Karimovga", required: true },
      eski: { label: "Hozirgi lavozim", placeholder: "kichik dasturchi", required: true },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      yangi: { label: "Yangi lavozim", placeholder: "yetakchi dasturchi", required: true },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n{{rahbar}}\n\n{{eski}} {{fish}}dan\n\nARIZA\n\nMeni {{eski}} lavozimidan {{yangi}} lavozimiga o'tkazishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "ajralish", nom: "Nikohdan ajralish", tavsif: "FHDYo arizasi",
    qadamlar: [
      { nom: "Organ", maydonlar: ["tashkilot"] },
      { nom: "Arizachi", maydonlar: ["manzil", "fish"] },
      { nom: "Tafsilot", maydonlar: ["turmush", "sana", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "FHDYo bo'limi", placeholder: "Chilonzor tumani FHDYo bo'limiga", required: true },
      manzil: { label: "Yashash manzilingiz", placeholder: "Toshkent sh., Chilonzor t.", required: false },
      fish: { label: "F.I.Sh.", placeholder: "Aliyeva Nodira Salimovna", required: true },
      turmush: { label: "Turmush o'rtog'ingiz F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      sana: { label: "Nikoh sanasi", placeholder: "2018-yil 10-may", required: false },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n\n{{manzil_blok}}{{fish}}dan\n\nARIZA\n\nMen {{fish}} bilan {{turmush}} o'rtasida {{sana_blok}}tuzilgan nikohni bekor qilishingizni so'rayman.\n\n{{hujjatSana}}{{imzo}}"
  },
  {
    id: "erkin", nom: "Bo'sh (erkin)", tavsif: "Matnni o'zingiz yozasiz",
    qadamlar: [
      { nom: "Kimga", maydonlar: ["tashkilot"] },
      { nom: "Arizachi", maydonlar: ["manzil", "fish"] },
      { nom: "Matn", maydonlar: ["matn", "hujjatSana"] }
    ],
    maydonlar: {
      tashkilot: { label: "Kimga (tashkilot/rahbar)", placeholder: "«Toolbase» MChJ direktori A. Karimovga", required: true },
      manzil: { label: "Yashash manzilingiz", placeholder: "Toshkent sh., Chilonzor t.", required: false },
      fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
      matn: { label: "Ariza matni", placeholder: "Sizdan ... so'rayman.", required: true, type: "kop" },
      hujjatSana: { label: "Ariza sanasi", placeholder: "2026-yil 14-iyun", required: true }
    },
    matn: "{{tashkilot}}\n\n{{manzil_blok}}{{fish}}dan\n\nARIZA\n\n{{matn}}\n\n{{hujjatSana}}{{imzo}}"
  }
];
