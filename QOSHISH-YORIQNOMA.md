# Yangi tool qo'shish — yo'riqnoma

Sayt endi **JSON-asosli**: bosh sahifadagi tool kartalari `data/tools.json` dan
avtomatik quriladi. Yangi tool qo'shish uchun:

## 1. Tool papkasini joylashtiring
Masalan: `hujjatlar/ariza/` (UZ) va `ru/hujjatlar/ariza/` (RU)

## 2. Ikonkani qo'shing
`data/icons.json` ga yangi yozuv (SVG kodi):
```json
"ariza": "<svg viewBox=\"0 0 24 24\" ...>...</svg>"
```

## 3. tools.json ga yozuv qo'shing
`data/tools.json` ichidagi `"tools"` ro'yxatiga:
```json
{
  "slug": "ariza",
  "path": "hujjatlar/ariza/",
  "section": "hujjat",
  "color": "file",
  "icon": "ariza",
  "tags": ["free", "new"],
  "search": "ariza zayavlenie namuna generator",
  "uz": { "name": "Ariza yaratish", "desc": "9 turdagi ariza: namuna va generator." },
  "ru": { "name": "Создать заявление", "desc": "9 видов заявлений: образец и генератор." }
}
```

**section** — qaysi bo'limga qo'shilishi (mavjud: `hujjat`, `matn`, `pdf`, `rasm`, `boshqa`).
**color** — ikonka rangi: `text`, `number`, `amber`, `violet`, `pdf`, `image`, `code`, `file`.
**tags** — `free`, `new`, `soon`.

## 4. Generatorni ishga tushiring
```bash
python3 scripts/build_home.py
```
Bu `index.html` va `ru/index.html` dagi kartalarni yangilaydi.

## Yangi bo'lim qo'shish
`tools.json` ichidagi `"sections"` ga yozuv qo'shing:
```json
{ "id": "hujjat", "uz": {"title": "Rasmiy hujjatlar", "sub": "..."}, "ru": {"title": "Официальные документы", "sub": "..."} }
```
Bo'limlar `sections` ro'yxatidagi tartibda chiqadi.
