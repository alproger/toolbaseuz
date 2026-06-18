/* MA'LUMOTNOMA — tashkilot beradigan hujjat (shapka chapda) */
window.HUJJAT = {
  title: "MA'LUMOTNOMA", titleCyr: "МАЪЛУМОТНОМА",
  fileBase: "malumotnoma", previewType: "document", shapkaJc: "left",
  footerKeys: { left: "imzoLavozim", right: "imzoFish" },
  qadamlar: [
    { nom: "Tashkilot", maydonlar: ["tashkilot", "sana", "raqam"] },
    { nom: "Shaxs", maydonlar: ["fish", "lavozim", "maqsad"] },
    { nom: "Imzolovchi", maydonlar: ["imzoLavozim", "imzoFish"] }
  ],
  maydonlar: {
    tashkilot: { label: "Tashkilot nomi", placeholder: "«Toolbase» MChJ", required: true },
    sana: { label: "Berilgan sana", placeholder: "2026-yil 14-iyun", required: true },
    raqam: { label: "Hujjat raqami", placeholder: "125", required: false, hint: "Ixtiyoriy" },
    fish: { label: "Kimga berilgan (F.I.Sh.)", placeholder: "Aliyev Vali Salimovich", required: true },
    lavozim: { label: "Lavozimi / maqomi", placeholder: "dasturchi", required: true, hint: "Masalan: dasturchi, 3-kurs talabasi" },
    maqsad: { label: "Qayerga beriladi", placeholder: "talab qilingan joyga taqdim etish uchun", required: false },
    imzoLavozim: { label: "Imzolovchi lavozimi", placeholder: "Direktor", required: true },
    imzoFish: { label: "Imzolovchi F.I.Sh.", placeholder: "A. Karimov", required: true }
  },
  bloklar: function (get) {
    return {
      raqam_blok: get('raqam') ? '   № ' + get('raqam') : '',
      maqsad_blok: 'Ushbu ma\u2019lumotnoma ' + (get('maqsad') || 'talab qilingan joyga taqdim etish uchun') + ' berildi.'
    };
  },
  matn: "{{tashkilot}}\n{{sana}}{{raqam_blok}}\n\nMA'LUMOTNOMA\n\nUshbu ma\u2019lumotnoma {{fish}}ga, u haqiqatan ham {{tashkilot}}da {{lavozim}} ekanligini tasdiqlash uchun berildi.\n\n{{maqsad_blok}}\n\n{{hujjatSana}}{{imzo}}"
};
