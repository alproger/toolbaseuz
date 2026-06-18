/* TUSHUNTIRISH XATI — shapka o'ngda */
window.HUJJAT = {
  title: "TUSHUNTIRISH XATI", titleCyr: "ТУШУНТИРИШ ХАТИ",
  fileBase: "tushuntirish-xati", previewType: "document", shapkaJc: "right",
  fishKey: "fish", sanaKey: "hujjatSana",
  qadamlar: [
    { nom: "Kimga", maydonlar: ["tashkilot", "rahbar"] },
    { nom: "Kimdan", maydonlar: ["lavozim", "fish"] },
    { nom: "Tushuntirish", maydonlar: ["voqea", "hujjatSana"] }
  ],
  maydonlar: {
    tashkilot: { label: "Tashkilot nomi", placeholder: "«Toolbase» MChJ", required: true },
    rahbar: { label: "Rahbar lavozimi va F.I.Sh.", placeholder: "direktori A. Karimovga", required: true, hint: "Jo'nalish kelishigida (...ga)" },
    lavozim: { label: "Lavozimingiz", placeholder: "dasturchi", required: true },
    fish: { label: "F.I.Sh.", placeholder: "Aliyev Vali Salimovich", required: true },
    voqea: { label: "Tushuntirish matni", placeholder: "2026-yil 13-iyun kuni ishga kechikib kelganimning sababi shahar transportidagi nosozlik bo'ldi.", required: true, type: "kop", hint: "Nima bo'lgani va sababini aniq yozing" },
    hujjatSana: { label: "Sana", placeholder: "2026-yil 14-iyun", required: true }
  },
  matn: "{{tashkilot}}\n{{rahbar}}\n\n{{lavozim}} {{fish}}dan\n\nTUSHUNTIRISH XATI\n\n{{voqea}}\n\n{{hujjatSana}}{{imzo}}"
};
