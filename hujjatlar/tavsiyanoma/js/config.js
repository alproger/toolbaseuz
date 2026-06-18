/* TAVSIYANOMA — tavsiya xati (shapka chapda) */
window.HUJJAT = {
  title: "TAVSIYANOMA", titleCyr: "ТАВСИЯНОМА",
  fileBase: "tavsiyanoma", previewType: "document", shapkaJc: "left",
  footerKeys: { left: "tavsiyaLavozim", right: "tavsiyaFish" },
  qadamlar: [
    { nom: "Nomzod", maydonlar: ["fish", "maqom", "maqsad"] },
    { nom: "Tavsiya", maydonlar: ["matn"] },
    { nom: "Tavsiya beruvchi", maydonlar: ["tavsiyaLavozim", "tavsiyaFish", "hujjatSana"] }
  ],
  maydonlar: {
    fish: { label: "Kimga (F.I.Sh.)", placeholder: "Aliyev Vali Salimovich", required: true },
    maqom: { label: "Maqomi / lavozimi", placeholder: "dasturchi", required: true },
    maqsad: { label: "Nima uchun tavsiya etilyapti", placeholder: "magistraturaga o'qishga kirish", required: true, hint: "Lavozim, grant, o'qish va h.k." },
    matn: { label: "Tavsiya matni", placeholder: "U yuqori malakali mutaxassis bo'lib, mas'uliyatli va tashabbuskor. Loyihalarni o'z vaqtida va sifatli bajaradi.", required: true, type: "kop", hint: "Nomzodning kuchli tomonlari" },
    tavsiyaLavozim: { label: "Tavsiya beruvchi lavozimi", placeholder: "«Toolbase» MChJ direktori", required: true },
    tavsiyaFish: { label: "Tavsiya beruvchi F.I.Sh.", placeholder: "A. Karimov", required: true },
    hujjatSana: { label: "Sana", placeholder: "2026-yil 14-iyun", required: true }
  },
  matn: "TAVSIYANOMA\n\nMen, {{tavsiyaLavozim}} {{tavsiyaFish}}, {{fish}}ni ({{maqom}}) {{maqsad}} uchun tavsiya etaman.\n\n{{matn}}\n\n{{hujjatSana}}{{imzo}}"
};
