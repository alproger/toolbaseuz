#!/usr/bin/env python3
"""
toolbase.uz — Bosh sahifa generatori
=====================================
data/tools.json va data/icons.json dan bosh sahifadagi tool kartalarini
qayta quradi (UZ + RU). Yangi tool qo'shish:

  1. Tool papkasini joylashtiring (masalan hujjatlar/ariza/)
  2. data/tools.json ga yangi yozuv qo'shing:
       {
         "slug": "ariza",
         "path": "hujjatlar/ariza/",
         "section": "hujjat",          // qaysi bo'limga
         "color": "file",              // ikonka rangi (var-file)
         "icon": "ariza",              // data/icons.json dagi kalit
         "tags": ["free", "new"],
         "search": "ariza zayavlenie ...",
         "uz": {"name": "Ariza yaratish", "desc": "..."},
         "ru": {"name": "Создать заявление", "desc": "..."}
       }
  3. Ikonka SVG sini data/icons.json ga "ariza" kaliti bilan qo'shing
  4. Ushbu skriptni ishga tushiring:  python3 scripts/build_home.py

Skript index.html va ru/index.html dagi
<!-- TOOLS:START --> ... <!-- TOOLS:END --> orasini yangilaydi.
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = json.load(open(os.path.join(ROOT, 'data/tools.json'), encoding='utf-8'))
ICONS = json.load(open(os.path.join(ROOT, 'data/icons.json'), encoding='utf-8'))

TAG_LABELS = {
    'uz': {'free': 'Bepul', 'new': 'Yangi', 'soon': 'Tez orada'},
    'ru': {'free': 'Бесплатно', 'new': 'Новый', 'soon': 'Скоро'},
}

def card_html(tool, lang):
    t = tool[lang]
    icon = ICONS.get(tool.get('icon', tool['slug']), '')
    tags = ''.join(
        f'<span class="tag {tg}">{TAG_LABELS[lang].get(tg, tg)}</span>'
        for tg in tool.get('tags', [])
    )
    tags_html = f'<div class="tool-tags">{tags}</div>' if tags else ''
    return (
        f'                <a class="tool-card var-{tool["color"]}" data-search="{tool["search"]}" href="{tool["path"]}">\n'
        f'                    <div class="tool-icon">\n'
        f'                        {icon}\n'
        f'                    </div>\n'
        f'                    <h3 class="tool-name">{t["name"]}</h3>\n'
        f'                    <p class="tool-desc">{t["desc"]}</p>\n'
        f'                    {tags_html}\n'
        f'                </a>'
    )

def build_grids(lang):
    blocks = []
    for sec in TOOLS['sections']:
        sec_tools = [t for t in TOOLS['tools'] if t['section'] == sec['id']]
        if not sec_tools:
            continue
        meta = sec[lang]
        cards = '\n\n'.join(card_html(t, lang) for t in sec_tools)
        blocks.append(
            f'            <div class="section-head tools-cat-head" id="cat-{sec["id"]}">\n'
            f'                <h2>{meta["title"]}</h2>\n'
            f'                <p>{meta["sub"]}</p>\n'
            f'            </div>\n'
            f'            <div class="tools-grid">\n\n{cards}\n\n            </div>'
        )
    return '\n\n'.join(blocks)

def inject(path, lang):
    full = os.path.join(ROOT, path)
    html = open(full, encoding='utf-8').read()
    grids = build_grids(lang)
    block = f'<!-- TOOLS:START -->\n{grids}\n        <!-- TOOLS:END -->'
    if '<!-- TOOLS:START -->' in html:
        html = re.sub(r'<!-- TOOLS:START -->.*?<!-- TOOLS:END -->', block, html, flags=re.S)
    else:
        # Birinchi marta: tools-section ichidagi container ichini almashtiramiz
        m = re.search(r'(<section class="tools-section">\s*<div class="container">)(.*?)(</div>\s*</section>)', html, re.S)
        if not m:
            print(f'  ⚠ {path}: tools-section topilmadi'); return
        html = html[:m.start()] + m.group(1) + '\n            ' + block + '\n        ' + m.group(3) + html[m.end():]
    open(full, 'w', encoding='utf-8').write(html)
    n = len([t for t in TOOLS['tools']])
    print(f'  ✓ {path}: {n} tool, {len(TOOLS["sections"])} bo\'lim yangilandi')

def main():
    print('Bosh sahifa generatsiya qilinmoqda...')
    inject('index.html', 'uz')
    inject('ru/index.html', 'ru')
    print('Tayyor.')

if __name__ == '__main__':
    main()
