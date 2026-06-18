/* TAVSIFNOMA — tashkilot beradi (shapka chapda, intro tanada) */
window.HUJJAT = {
  title: "TAVSIFNOMA", titleCyr: "ТАВСИФНОМА",
  fileBase: "tavsifnoma", previewType: "document", shapkaJc: "left",
  footerKeys: { left: "imzoLavozim", right: "imzoFish" },
  qadamlar: [
    { nom: "Shaxs", maydonlar: ["fish", "tugYili", "tashkilot", "lavozim"] },
    { nom: "Tavsif", maydonlar: ["matn", "maqsad"] },
    { nom: "Imzolovchi", maydonlar: ["imzoLavozim", "imzoFish", "hujjatSana"] }
  ],
  maydonlar: {
    fish: { label: "Kimga (F.I.Sh.)", placeholder: "Aliyev Vali Salimovich", required: true },
    tugYili: { label: "Tug'ilgan yili", placeholder: "1995-yil", required: true },
    tashkilot: { label: "Tashkilot", placeholder: "«Toolbase» MChJ", required: true },
    lavozim: { label: "Lavozimi / maqomi", placeholder: "dasturchi", required: true },
    matn: { label: "Tavsif matni", placeholder: "O'z vazifasini mas'uliyat bilan bajaradi, jamoada hurmatga sazovor, malakasini muntazam oshirib boradi.", required: true, type: "kop", hint: "Ish sifatlari, xulqi, yutuqlari" },
    maqsad: { label: "Qayerga beriladi", placeholder: "talab qilingan joyga taqdim etish", required: false },
    imzoLavozim: { label: "Imzolovchi lavozimi", placeholder: "Direktor", required: true },
    imzoFish: { label: "Imzolovchi F.I.Sh.", placeholder: "A. Karimov", required: true },
    hujjatSana: { label: "Sana", placeholder: "2026-yil 14-iyun", required: true }
  },
  bloklar: function (get) {
    return { maqsad_blok: 'Mazkur tavsifnoma ' + (get('maqsad') || 'talab qilingan joyga taqdim etish') + ' uchun berildi.' };
  },
  matn: "TAVSIFNOMA\n\n{{fish}}, {{tugYili}}da tug'ilgan, {{tashkilot}}da {{lavozim}}.\n\n{{matn}}\n\n{{maqsad_blok}}\n\n{{hujjatSana}}{{imzo}}"
};
