#!/usr/bin/env python3
"""Generate English and Russian translations for tool pages."""

from pathlib import Path
import re

# Tool translations - mapping Uzbek to English/Russian titles and descriptions
TOOL_TRANSLATIONS = {
    'bg-remove': {
        'uz': {'title': 'Fon Olib Tashlash', 'desc': 'Rasmdan fon avtomatik olib tashlang'},
        'en': {'title': 'Remove Background', 'desc': 'Automatically remove image background'},
        'ru': {'title': 'Удаление фона', 'desc': 'Автоматически удалите фон изображения'}
    },
    'case-converter': {
        'uz': {'title': 'Case Converter', 'desc': 'Matn registrini UPPER, lower, camelCase va boshqaga aylantiring'},
        'en': {'title': 'Case Converter', 'desc': 'Convert text to UPPER, lower, camelCase and other formats'},
        'ru': {'title': 'Конвертер регистра', 'desc': 'Преобразуйте текст в UPPER, lower, camelCase и другие форматы'}
    },
    'color-converter': {
        'uz': {'title': 'Rang Konvertor', 'desc': 'HEX, RGB, HSL ranglarni o\'zaro aylantiring'},
        'en': {'title': 'Color Converter', 'desc': 'Convert colors between HEX, RGB, HSL formats'},
        'ru': {'title': 'Конвертер цветов', 'desc': 'Преобразуйте цвета между форматами HEX, RGB, HSL'}
    },
    'hash-generator': {
        'uz': {'title': 'Hash Generator', 'desc': 'MD5, SHA-256, SHA-512 hashlarni yarating'},
        'en': {'title': 'Hash Generator', 'desc': 'Generate MD5, SHA-256, SHA-512 hashes'},
        'ru': {'title': 'Генератор хешей', 'desc': 'Создавайте хеши MD5, SHA-256, SHA-512'}
    },
    'image-compress': {
        'uz': {'title': 'Rasm Siqish', 'desc': 'JPG, PNG rasmlarni siqib qayta o\'lchaming pastga tushiring'},
        'en': {'title': 'Image Compress', 'desc': 'Compress JPG and PNG images to reduce file size'},
        'ru': {'title': 'Сжатие изображений', 'desc': 'Сжимайте JPG и PNG изображения для уменьшения размера файла'}
    },
    'image-converter': {
        'uz': {'title': 'Rasm Formati Konvertor', 'desc': 'Rasmni JPG, PNG, WebP, BMP va boshqa formatlarga aylantiring'},
        'en': {'title': 'Image Format Converter', 'desc': 'Convert images to JPG, PNG, WebP, BMP and other formats'},
        'ru': {'title': 'Конвертер формата изображений', 'desc': 'Преобразуйте изображения в JPG, PNG, WebP, BMP и другие форматы'}
    },
    'image-crop': {
        'uz': {'title': 'Rasm Qirqish', 'desc': 'Rasmni kerakli o\'lchamga qirqib ajratib oling'},
        'en': {'title': 'Image Crop', 'desc': 'Crop images to desired dimensions'},
        'ru': {'title': 'Обрезка изображений', 'desc': 'Обрежьте изображения до нужного размера'}
    },
    'image-resize': {
        'uz': {'title': 'Rasm O\'lchami', 'desc': 'Rasmning o\'lchamini piksel yoki foizda o\'zgartiring'},
        'en': {'title': 'Image Resize', 'desc': 'Resize images by pixel dimensions or percentage'},
        'ru': {'title': 'Изменение размера изображения', 'desc': 'Измените размер изображения по пикселям или процентам'}
    },
    'image-rotate': {
        'uz': {'title': 'Rasm Aylantirish', 'desc': 'Rasmni 90°, 180°, 270° yoki ixtiyoriy burchakka aylantiring'},
        'en': {'title': 'Image Rotate', 'desc': 'Rotate images by 90°, 180°, 270° or custom angles'},
        'ru': {'title': 'Поворот изображения', 'desc': 'Поворачивайте изображения на 90°, 180°, 270° или нужный угол'}
    },
    'imlo-tekshirish': {
        'uz': {'title': 'O\'zbek Imlo Tekshiruvi', 'desc': 'O\'zbek matnida imlo xatolarini tekshiring'},
        'en': {'title': 'Uzbek Spell Checker', 'desc': 'Check Uzbek text for spelling errors'},
        'ru': {'title': 'Проверка правописания узбекского', 'desc': 'Проверьте узбекский текст на ошибки правописания'}
    },
    'json-formatter': {
        'uz': {'title': 'JSON Formatterlash', 'desc': 'JSONni formatlang, validatsiya qiling va minify qiling'},
        'en': {'title': 'JSON Formatter', 'desc': 'Format, validate and minify JSON'},
        'ru': {'title': 'Форматер JSON', 'desc': 'Форматируйте, проверяйте и минифицируйте JSON'}
    },
    'lotin-krill': {
        'uz': {'title': 'Lotin-Krill Konvertor', 'desc': 'O\'zbek matnini lotin va krill yozuvlari o\'rtasida aylantiring'},
        'en': {'title': 'Uzbek Latin-Cyrillic Converter', 'desc': 'Convert Uzbek text between Latin and Cyrillic scripts'},
        'ru': {'title': 'Узбекский конвертер латиница-кириллица', 'desc': 'Конвертируйте узбекский текст между латиницей и кириллицей'}
    },
    'password-generator': {
        'uz': {'title': 'Kuchli Parol Yaratuvchi', 'desc': 'Kuchli va xavfsiz parollar yarating'},
        'en': {'title': 'Strong Password Generator', 'desc': 'Generate strong and secure passwords'},
        'ru': {'title': 'Генератор надежных паролей', 'desc': 'Создавайте надежные и защищенные пароли'}
    },
    'pdf-delete': {
        'uz': {'title': 'PDF Sahifa Olib Tashlash', 'desc': 'PDF dan kerakli sahifalarni olib tashlang'},
        'en': {'title': 'PDF Page Delete', 'desc': 'Remove unwanted pages from PDF files'},
        'ru': {'title': 'Удаление страниц PDF', 'desc': 'Удалите ненужные страницы из файлов PDF'}
    },
    'pdf-editor': {
        'uz': {'title': 'PDF Editor', 'desc': 'PDF fayllarni tahrirlang, matn qo\'shing va rasmlar joylashtiring'},
        'en': {'title': 'PDF Editor', 'desc': 'Edit PDF files, add text and place images'},
        'ru': {'title': 'PDF Редактор', 'desc': 'Редактируйте PDF файлы, добавляйте текст и изображения'}
    },
    'pdf-merge': {
        'uz': {'title': 'PDF Birlashtirish', 'desc': 'Bir nechta PDF fayllarni bitta faylga birlashtiring'},
        'en': {'title': 'PDF Merge', 'desc': 'Combine multiple PDF files into one'},
        'ru': {'title': 'Объединение PDF', 'desc': 'Объедините несколько файлов PDF в один'}
    },
    'pdf-protect': {
        'uz': {'title': 'PDF Parol Himoya', 'desc': 'PDF fayllarni parol bilan himoya qiling'},
        'en': {'title': 'PDF Password Protect', 'desc': 'Protect PDF files with passwords'},
        'ru': {'title': 'Защита PDF паролем', 'desc': 'Защитите файлы PDF паролями'}
    },
    'pdf-rotate': {
        'uz': {'title': 'PDF Sahifa Aylantirish', 'desc': 'PDF sahifalarini aylantirib o\'tkazib tashlang'},
        'en': {'title': 'PDF Rotate', 'desc': 'Rotate PDF pages by 90° increments'},
        'ru': {'title': 'Поворот PDF', 'desc': 'Поворачивайте страницы PDF на кратные 90°'}
    },
    'qr-generator': {
        'uz': {'title': 'QR Code Yaratuvchi', 'desc': 'Matn, URL yoki boshqa ma\'lumotlardan QR kod yarating'},
        'en': {'title': 'QR Code Generator', 'desc': 'Generate QR codes from text, URLs and data'},
        'ru': {'title': 'Генератор QR кодов', 'desc': 'Создавайте QR коды из текста, URL и данных'}
    },
    'son-soz': {
        'uz': {'title': 'Raqamlarni Harflarga Aylantirish', 'desc': 'Raqamlarni so\'zga aylantirib o\'qing va yozing'},
        'en': {'title': 'Number to Words Converter', 'desc': 'Convert numbers to words and text'},
        'ru': {'title': 'Конвертер чисел в слова', 'desc': 'Преобразуйте числа в слова и текст'}
    },
    'time-zones': {
        'uz': {'title': 'Vaqt Mintaqalari', 'desc': 'Turli vaqt mintaqalaridagi vaqtni bilning'},
        'en': {'title': 'Time Zones', 'desc': 'Check current time in different time zones'},
        'ru': {'title': 'Часовые пояса', 'desc': 'Проверьте текущее время в разных часовых поясах'}
    },
    'unit-converter': {
        'uz': {'title': 'O\'lchov Birliklari Konvertor', 'desc': 'Uzunlik, og\'irlik, harorat va boshqa o\'lchovlarni aylantiring'},
        'en': {'title': 'Unit Converter', 'desc': 'Convert length, weight, temperature and more'},
        'ru': {'title': 'Конвертер единиц', 'desc': 'Преобразуйте длину, вес, температуру и другие единицы'}
    },
    'word-counter': {
        'uz': {'title': 'So\'z Sanash', 'desc': 'Matnda so\'z, belgi va qatorlarni hisoblang'},
        'en': {'title': 'Word Counter', 'desc': 'Count words, characters and lines in text'},
        'ru': {'title': 'Счетчик слов', 'desc': 'Подсчитайте слова, символы и строки в тексте'}
    },
    'word-to-pdf': {
        'uz': {'title': 'Word PDF ga Aylantirish', 'desc': 'DOC, DOCX fayllarini PDF formatiga aylantiring'},
        'en': {'title': 'Word to PDF', 'desc': 'Convert DOC and DOCX files to PDF format'},
        'ru': {'title': 'Word в PDF', 'desc': 'Преобразуйте файлы DOC и DOCX в формат PDF'}
    },
    'zip-creator': {
        'uz': {'title': 'ZIP Arxiv Yaratuvchi', 'desc': 'Fayllarni ZIP arxiviga pack qiling'},
        'en': {'title': 'ZIP Creator', 'desc': 'Create ZIP archives from files'},
        'ru': {'title': 'Создатель ZIP', 'desc': 'Создавайте ZIP архивы из файлов'}
    },
}

def translate_html_tool_page(uz_path, tool_slug, lang):
    """Translate a tool page to specified language."""
    uz_content = uz_path.read_text(encoding='utf-8')
    trans = TOOL_TRANSLATIONS[tool_slug][lang]
    
    # Extract styles from Uzbek page
    style_match = re.search(r'<link rel="stylesheet" href="css/tool.css"', uz_content)
    
    # Generate translated page based on language
    if lang == 'en':
        logo_href = '../' if '/' in str(uz_path) else '../../'
        about_href = '../about.html' if 'en' in str(uz_path) else '../../about.html'
        
        new_content = f'''<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>{trans['title']} | toolbase.uz</title>
    <meta name="description" content="{trans['desc']}" />
    <meta name="keywords" content="{trans['title'].lower()}, {tool_slug.replace('-', ' ')}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://toolbase.uz/en/tools/{tool_slug}/" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/tools/{tool_slug}/" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/tools/{tool_slug}/" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/tools/{tool_slug}/" />
    
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://toolbase.uz/en/tools/{tool_slug}/" />
    <meta property="og:title" content="{trans['title']} | toolbase.uz" />
    <meta property="og:description" content="{trans['desc']}" />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <link rel="icon" type="image/svg+xml" href="../../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../../favicon.ico" />
    <link rel="apple-touch-icon" href="../../../assets/img/apple-touch-icon.png" />
    <link rel="manifest" href="../../../manifest.json" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    
    <link rel="stylesheet" href="../../../assets/css/styles.css" />
    <link rel="stylesheet" href="../../../tools/{tool_slug}/css/tool.css" />
</head>

<body>
    <header class="site-header">
        <div class="container nav">
            <a href="/en/" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links">
                <a href="../../../about.html">About</a>
                <a href="/en/contact.html">Contact</a>
                <a href="/en/privacy.html">Privacy Policy</a>
                <a href="/en/terms.html">Terms</a>
            </nav>
            <div class="language-switcher" aria-label="Choose language">
                <a href="../../../tools/{tool_slug}/" lang="uz">UZ</a>
                <a class="active" href="../../../en/tools/{tool_slug}/" lang="en">EN</a>
                <a href="../../../ru/tools/{tool_slug}/" lang="ru">RU</a>
            </div>
        </div>
    </header>
    
    <main>
        <div class="container">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="../../">Home</a>
                <span class="bc-sep">›</span>
                <span>{trans['title']}</span>
            </nav>
        </div>
        
        <p style="padding: 20px; text-align: center; color: #666;">
            This tool page is currently under translation. Please use the <a href="../../../tools/{tool_slug}/">Uzbek version</a> or <a href="../../../ru/tools/{tool_slug}/">Russian version</a> for now.
        </p>
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 toolbase.uz. All rights reserved.</p>
        </div>
    </footer>
</body>

</html>'''
    else:  # Russian
        new_content = f'''<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>{trans['title']} | toolbase.uz</title>
    <meta name="description" content="{trans['desc']}" />
    <meta name="keywords" content="{trans['title'].lower()}, {tool_slug.replace('-', ' ')}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://toolbase.uz/ru/tools/{tool_slug}/" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/tools/{tool_slug}/" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/tools/{tool_slug}/" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/tools/{tool_slug}/" />
    
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://toolbase.uz/ru/tools/{tool_slug}/" />
    <meta property="og:title" content="{trans['title']} | toolbase.uz" />
    <meta property="og:description" content="{trans['desc']}" />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <link rel="icon" type="image/svg+xml" href="../../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../../favicon.ico" />
    <link rel="apple-touch-icon" href="../../../assets/img/apple-touch-icon.png" />
    <link rel="manifest" href="../../../manifest.json" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    
    <link rel="stylesheet" href="../../../assets/css/styles.css" />
    <link rel="stylesheet" href="../../../tools/{tool_slug}/css/tool.css" />
</head>

<body>
    <header class="site-header">
        <div class="container nav">
            <a href="/ru/" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links">
                <a href="../../../about.html">О нас</a>
                <a href="/ru/contact.html">Контакты</a>
                <a href="/ru/privacy.html">Конфиденциальность</a>
                <a href="/ru/terms.html">Условия</a>
            </nav>
            <div class="language-switcher" aria-label="Выбор языка">
                <a href="../../../tools/{tool_slug}/" lang="uz">UZ</a>
                <a href="../../../en/tools/{tool_slug}/" lang="en">EN</a>
                <a class="active" href="../../../ru/tools/{tool_slug}/" lang="ru">RU</a>
            </div>
        </div>
    </header>
    
    <main>
        <div class="container">
            <nav class="breadcrumb" aria-label="Навигация">
                <a href="../../">Главная</a>
                <span class="bc-sep">›</span>
                <span>{trans['title']}</span>
            </nav>
        </div>
        
        <p style="padding: 20px; text-align: center; color: #666;">
            Эта страница инструмента в настоящее время переводится. Пожалуйста, используйте <a href="../../../tools/{tool_slug}/">узбекскую версию</a> или <a href="../../../en/tools/{tool_slug}/">английскую версию</a> на данный момент.
        </p>
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 toolbase.uz. Все права защищены.</p>
        </div>
    </footer>
</body>

</html>'''
    
    return new_content

def main():
    root = Path('.')
    tools_dir = root / 'tools'
    
    # Create directories if they don't exist
    en_tools_dir = root / 'en' / 'tools'
    ru_tools_dir = root / 'ru' / 'tools'
    
    en_tools_dir.mkdir(parents=True, exist_ok=True)
    ru_tools_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate translations for all tools except lotin-krill (already translated)
    for tool_slug in sorted(TOOL_TRANSLATIONS.keys()):
        if tool_slug == 'lotin-krill':
            print(f"Skipping {tool_slug} (already translated)")
            continue
        
        uz_path = tools_dir / tool_slug / 'index.html'
        if not uz_path.exists():
            print(f"WARNING: {uz_path} not found")
            continue
        
        # Create English version
        en_dir = en_tools_dir / tool_slug
        en_dir.mkdir(parents=True, exist_ok=True)
        en_path = en_dir / 'index.html'
        en_content = translate_html_tool_page(uz_path, tool_slug, 'en')
        en_path.write_text(en_content, encoding='utf-8')
        print(f"Created: {en_path}")
        
        # Create Russian version
        ru_dir = ru_tools_dir / tool_slug
        ru_dir.mkdir(parents=True, exist_ok=True)
        ru_path = ru_dir / 'index.html'
        ru_content = translate_html_tool_page(uz_path, tool_slug, 'ru')
        ru_path.write_text(ru_content, encoding='utf-8')
        print(f"Created: {ru_path}")
    
    print("\n✓ Tool translations completed!")

if __name__ == '__main__':
    main()
