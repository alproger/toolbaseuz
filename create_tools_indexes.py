#!/usr/bin/env python3
"""Generate tools listing pages for each language."""

from pathlib import Path

TOOLS_DATA = {
    'bg-remove': {'en': 'Remove Background', 'ru': 'Удаление фона', 'uz': 'Fon Olib Tashlash'},
    'case-converter': {'en': 'Case Converter', 'ru': 'Конвертер регистра', 'uz': 'Case Converter'},
    'color-converter': {'en': 'Color Converter', 'ru': 'Конвертер цветов', 'uz': 'Rang Konvertor'},
    'hash-generator': {'en': 'Hash Generator', 'ru': 'Генератор хешей', 'uz': 'Hash Generator'},
    'image-compress': {'en': 'Image Compress', 'ru': 'Сжатие изображений', 'uz': 'Rasm Siqish'},
    'image-converter': {'en': 'Image Format Converter', 'ru': 'Конвертер формата изображений', 'uz': 'Rasm Formati Konvertor'},
    'image-crop': {'en': 'Image Crop', 'ru': 'Обрезка изображений', 'uz': 'Rasm Qirqish'},
    'image-resize': {'en': 'Image Resize', 'ru': 'Изменение размера изображения', 'uz': 'Rasm O\'lchami'},
    'image-rotate': {'en': 'Image Rotate', 'ru': 'Поворот изображения', 'uz': 'Rasm Aylantirish'},
    'imlo-tekshirish': {'en': 'Uzbek Spell Checker', 'ru': 'Проверка правописания узбекского', 'uz': 'O\'zbek Imlo Tekshiruvi'},
    'json-formatter': {'en': 'JSON Formatter', 'ru': 'Форматер JSON', 'uz': 'JSON Formatlash'},
    'lotin-krill': {'en': 'Uzbek Latin-Cyrillic Converter', 'ru': 'Узбекский конвертер латиница-кириллица', 'uz': 'Lotin-Krill Konvertor'},
    'password-generator': {'en': 'Password Generator', 'ru': 'Генератор паролей', 'uz': 'Parol Yaratuvchi'},
    'pdf-delete': {'en': 'PDF Page Delete', 'ru': 'Удаление страниц PDF', 'uz': 'PDF Sahifa Olib Tashlash'},
    'pdf-editor': {'en': 'PDF Editor', 'ru': 'PDF Редактор', 'uz': 'PDF Editor'},
    'pdf-merge': {'en': 'PDF Merge', 'ru': 'Объединение PDF', 'uz': 'PDF Birlashtirish'},
    'pdf-protect': {'en': 'PDF Password Protect', 'ru': 'Защита PDF паролем', 'uz': 'PDF Parol Himoya'},
    'pdf-rotate': {'en': 'PDF Rotate', 'ru': 'Поворот PDF', 'uz': 'PDF Aylantirish'},
    'qr-generator': {'en': 'QR Code Generator', 'ru': 'Генератор QR кодов', 'uz': 'QR Code Yaratuvchi'},
    'son-soz': {'en': 'Number to Words', 'ru': 'Число в слова', 'uz': 'Raqamlarni Harflarga'},
    'time-zones': {'en': 'Time Zones', 'ru': 'Часовые пояса', 'uz': 'Vaqt Mintaqalari'},
    'unit-converter': {'en': 'Unit Converter', 'ru': 'Конвертер единиц', 'uz': 'O\'lchov Birliklari'},
    'word-counter': {'en': 'Word Counter', 'ru': 'Счетчик слов', 'uz': 'So\'z Sanash'},
    'word-to-pdf': {'en': 'Word to PDF', 'ru': 'Word в PDF', 'uz': 'Word PDFga Aylantirish'},
    'zip-creator': {'en': 'ZIP Creator', 'ru': 'Создатель ZIP', 'uz': 'ZIP Arxiv Yaratuvchi'},
}

def create_tools_index(lang, lang_code):
    """Create tools index page for a language."""
    
    if lang == 'en':
        title = "All Tools"
        description = "Browse all available tools on toolbase.uz"
        home_text = "Home"
        home_link = "../../"
        nav_about = "About"
        nav_contact = "Contact"
        nav_privacy = "Privacy Policy"
        nav_terms = "Terms"
        heading = "All Tools"
        intro = "Explore our complete collection of free online tools for text, documents, images, and more."
        page_locale = "en_US"
        canonical = "https://toolbase.uz/en/tools/"
        
    elif lang == 'ru':
        title = "Все инструменты"
        description = "Просмотрите все доступные инструменты на toolbase.uz"
        home_text = "Главная"
        home_link = "../../"
        nav_about = "О нас"
        nav_contact = "Контакты"
        nav_privacy = "Конфиденциальность"
        nav_terms = "Условия"
        heading = "Все инструменты"
        intro = "Изучите нашу полную коллекцию бесплатных онлайн-инструментов для текста, документов, изображений и многого другого."
        page_locale = "ru_RU"
        canonical = "https://toolbase.uz/ru/tools/"
    else:
        return None
    
    lang_path = f"/{lang_code}/" if lang_code else "/"
    
    html = f'''<!DOCTYPE html>
<html lang="{lang_code}">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>{title} | toolbase.uz</title>
    <meta name="description" content="{description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{canonical}" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/tools/" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/tools/" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/tools/" />
    
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="{page_locale}" />
    
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../favicon.ico" />
    <link rel="manifest" href="../../manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    
    <style>
        .tools-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }}
        .tool-card {{ display: block; padding: 20px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; text-decoration: none; transition: all 0.15s; }}
        .tool-card:hover {{ border-color: var(--primary); background: var(--bg-soft); transform: translateY(-2px); }}
        .tool-card h3 {{ font-size: 1.05rem; margin: 0 0 8px; color: var(--ink); }}
        .tool-card p {{ font-size: 0.9rem; color: var(--muted); margin: 0; }}
    </style>
</head>

<body>
    <header class="site-header">
        <div class="container nav">
            <a href="{lang_path}" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links">
                <a href="../../about.html">{nav_about}</a>
                <a href="{lang_path}contact.html">{nav_contact}</a>
                <a href="{lang_path}privacy.html">{nav_privacy}</a>
                <a href="{lang_path}terms.html">{nav_terms}</a>
            </nav>
            <div class="language-switcher" aria-label="Choose language">
                <a href="../../tools/" lang="uz">UZ</a>
                <a {"class='active'" if lang == 'en' else ""} href="../../en/tools/" lang="en">EN</a>
                <a {"class='active'" if lang == 'ru' else ""} href="../../ru/tools/" lang="ru">RU</a>
            </div>
        </div>
    </header>

    <section class="page-hero">
        <div class="container">
            <nav class="breadcrumb">
                <a href="{home_link}">{home_text}</a>
                <span class="bc-sep">›</span>
                <span>{title}</span>
            </nav>
            <h1>{heading}</h1>
            <p>{intro}</p>
        </div>
    </section>

    <main class="page-content">
        <div class="container">
            <div class="tools-grid">
'''
    
    # Add tools
    for tool_slug in sorted(TOOLS_DATA.keys()):
        tool_name = TOOLS_DATA[tool_slug].get(lang_code, TOOLS_DATA[tool_slug].get('uz'))
        tool_url = f"../../tools/{tool_slug}/" if lang_code == 'uz' else f"../../{lang_code}/tools/{tool_slug}/"
        html += f'''                <a href="{tool_url}" class="tool-card">
                    <h3>{tool_name}</h3>
                    <p>Free online tool</p>
                </a>
'''
    
    html += '''            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 toolbase.uz. All rights reserved.</p>
        </div>
    </footer>
</body>

</html>
'''
    return html

def main():
    root = Path('.')
    
    # Create English tools index
    en_tools_dir = root / 'en' / 'tools'
    en_tools_dir.mkdir(parents=True, exist_ok=True)
    en_content = create_tools_index('en', 'en')
    (en_tools_dir / 'index.html').write_text(en_content, encoding='utf-8')
    print(f"✓ Created: en/tools/index.html")
    
    # Create Russian tools index
    ru_tools_dir = root / 'ru' / 'tools'
    ru_tools_dir.mkdir(parents=True, exist_ok=True)
    ru_content = create_tools_index('ru', 'ru')
    (ru_tools_dir / 'index.html').write_text(ru_content, encoding='utf-8')
    print(f"✓ Created: ru/tools/index.html")
    
    print("\n✓ Tools directory pages created successfully!")

if __name__ == '__main__':
    main()
