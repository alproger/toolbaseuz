#!/usr/bin/env python3
"""Generate English and Russian translations for blog posts."""

from pathlib import Path
import re

# Blog post translations mapping
BLOG_TRANSLATIONS = {
    'case-converter-qollanma.html': {
        'uz': {'title': 'Case Converter qo\'llanucha', 'desc': 'camelCase, snake_case, kebab-case formatlarini qo\'llanish bo\'yicha to\'liq qo\'llanma'},
        'en': {'title': 'Case Converter Guide', 'desc': 'Complete guide on using camelCase, snake_case, kebab-case and other text case formats'},
        'ru': {'title': 'Руководство по Case Converter', 'desc': 'Полное руководство по использованию camelCase, snake_case, kebab-case и других форматов'}
    },
    'hash-generator-md5-sha256.html': {
        'uz': {'title': 'Hash Generator: MD5, SHA-256, SHA-512', 'desc': 'Hash funktsiylari, MD5, SHA-256 va SHA-512 orasidagi farqlar'},
        'en': {'title': 'Hash Generator: MD5, SHA-256, SHA-512', 'desc': 'Hash functions, differences between MD5, SHA-256 and SHA-512'},
        'ru': {'title': 'Hash Generator: MD5, SHA-256, SHA-512', 'desc': 'Хеш-функции, различия между MD5, SHA-256 и SHA-512'}
    },
    'json-formatlash-amaliyot.html': {
        'uz': {'title': 'JSON Formatlash Amaliyoti', 'desc': 'JSONni noto\'g\'ri formatlashdan saqlaning va qo\'llab-quvvatlash'},
        'en': {'title': 'JSON Formatting Practice', 'desc': 'Avoid JSON formatting errors and get proper support'},
        'ru': {'title': 'Практика форматирования JSON', 'desc': 'Избегайте ошибок форматирования JSON и получите надлежащую поддержку'}
    },
    'json-nima.html': {
        'uz': {'title': 'JSON nima va u qaysi yerda ishlatiladi?', 'desc': 'JSONning asosiy strukturasi, shakli va amaliy qo\'llanmasi'},
        'en': {'title': 'What is JSON and Where is It Used?', 'desc': 'Basic JSON structure, format and practical usage guide'},
        'ru': {'title': 'Что такое JSON и где он используется?', 'desc': 'Базовая структура JSON, формат и практическое руководство по использованию'}
    },
    'kuchli-parol-yaratish.html': {
        'uz': {'title': 'Kuchli Parol Yaratish', 'desc': 'Xavfsiz parol yaratish bo\'yicha maslahatlar va parol yaratuvchini qo\'llash'},
        'en': {'title': 'Creating Strong Passwords', 'desc': 'Tips for creating secure passwords and using password generators'},
        'ru': {'title': 'Создание надежных паролей', 'desc': 'Советы по созданию безопасных паролей и использованию генераторов паролей'}
    },
    'olchov-birliklari-konvertatsiya.html': {
        'uz': {'title': 'O\'lchov Birliklari Konvertatsiyasi', 'desc': 'Uzunlik, og\'irlik, harorat va boshqa o\'lchovlarni aylantirish'},
        'en': {'title': 'Unit Conversion Guide', 'desc': 'Convert length, weight, temperature and other measurements'},
        'ru': {'title': 'Руководство по преобразованию единиц', 'desc': 'Преобразование длины, веса, температуры и других измерений'}
    },
    'onlayn-vositalar-foydalanish.html': {
        'uz': {'title': 'Onlayn Vositalardan Foydalanish', 'desc': 'Samarali va xavfsiz onlayn vositalardan foydalanish bo\'yicha maslahatlar'},
        'en': {'title': 'How to Use Online Tools Effectively', 'desc': 'Tips for effective and safe use of online tools'},
        'ru': {'title': 'Как эффективно использовать онлайн-инструменты', 'desc': 'Советы по эффективному и безопасному использованию онлайн-инструментов'}
    },
    'pdf-aylantirish-qollanma.html': {
        'uz': {'title': 'PDF Aylantirish Qo\'llanucha', 'desc': 'PDF fayllarini aylantirib o\'tkazish va saqlab qo\'yish'},
        'en': {'title': 'PDF Rotation Guide', 'desc': 'How to rotate PDF files and save changes'},
        'ru': {'title': 'Руководство по повороту PDF', 'desc': 'Как повернуть файлы PDF и сохранить изменения'}
    },
    'pdf-birlashtirish-qollanma.html': {
        'uz': {'title': 'PDF Birlashtirish Qo\'llanucha', 'desc': 'Bir nechta PDF fayllarni bitta faylga birlashtirish'},
        'en': {'title': 'PDF Merging Guide', 'desc': 'How to combine multiple PDF files into one'},
        'ru': {'title': 'Руководство по объединению PDF', 'desc': 'Как объединить несколько файлов PDF в один'}
    },
    'pdf-editor-qollanma.html': {
        'uz': {'title': 'PDF Editor Qo\'llanucha', 'desc': 'PDF fayllarini tahrirlash, matn va rasmlar qo\'shish'},
        'en': {'title': 'PDF Editor Guide', 'desc': 'How to edit PDF files, add text and images'},
        'ru': {'title': 'Руководство по редактированию PDF', 'desc': 'Как редактировать PDF файлы, добавлять текст и изображения'}
    },
    'pdf-parol-himoya-qollanma.html': {
        'uz': {'title': 'PDF Parol Himoya Qo\'llanucha', 'desc': 'PDF fayllarini parol bilan himoya qilish va xavfsizlik'},
        'en': {'title': 'PDF Password Protection Guide', 'desc': 'How to protect PDF files with passwords and security'},
        'ru': {'title': 'Руководство по защите PDF паролем', 'desc': 'Как защитить PDF файлы паролями и безопасностью'}
    },
    'pdf-sahifa-ochirish-qollanma.html': {
        'uz': {'title': 'PDF Sahifasi Olib Tashlash Qo\'llanucha', 'desc': 'PDFdan kerakli sahifalarni olib tashlash'},
        'en': {'title': 'PDF Page Deletion Guide', 'desc': 'How to remove unwanted pages from PDF files'},
        'ru': {'title': 'Руководство по удалению страниц PDF', 'desc': 'Как удалить ненужные страницы из файлов PDF'}
    },
    'qr-kod-yaratish-qollanma.html': {
        'uz': {'title': 'QR Kod Yaratish Qo\'llanucha', 'desc': 'Matn va URLlardan QR kodlar yaratish'},
        'en': {'title': 'QR Code Generation Guide', 'desc': 'How to create QR codes from text and URLs'},
        'ru': {'title': 'Руководство по созданию QR кодов', 'desc': 'Как создать QR коды из текста и URL'}
    },
    'rang-formatlari-hex-rgb-hsl.html': {
        'uz': {'title': 'Rang Formatlari: HEX, RGB, HSL', 'desc': 'Rang formatlari orasidagi farqlar va o\'zaro aylantirish'},
        'en': {'title': 'Color Formats: HEX, RGB, HSL', 'desc': 'Differences between color formats and conversion'},
        'ru': {'title': 'Форматы цветов: HEX, RGB, HSL', 'desc': 'Различия между форматами цветов и преобразование'}
    },
    'rasm-format-ozgartirish-qollanma.html': {
        'uz': {'title': 'Rasm Format Ozgartirish Qollanucha', 'desc': 'Rasmlarni JPG, PNG, WebP va boshqa formatlarga aylantirish'},
        'en': {'title': 'Image Format Conversion Guide', 'desc': 'Convert images between JPG, PNG, WebP and other formats'},
        'ru': {'title': 'Руководство по преобразованию формата изображения', 'desc': 'Преобразование изображений между JPG, PNG, WebP и другими форматами'}
    },
    'rasm-razmer-ozgartirish-qollanma.html': {
        'uz': {'title': 'Rasm Razmer Ozgartirish Qollanucha', 'desc': 'Rasmning o\'lchamini o\'zgartirish va optimization'},
        'en': {'title': 'Image Resize Guide', 'desc': 'How to resize and optimize images'},
        'ru': {'title': 'Руководство по изменению размера изображения', 'desc': 'Как изменить размер и оптимизировать изображения'}
    },
    'rasm-razmer-ozgartirish.html': {
        'uz': {'title': 'Rasm Razmerini O\'zgartirish', 'desc': 'Rasm o\'lchamini o\'zgartirish usullari va foydali maslahatlar'},
        'en': {'title': 'Resizing Images', 'desc': 'Methods for resizing images and useful tips'},
        'ru': {'title': 'Изменение размера изображений', 'desc': 'Методы изменения размера изображений и полезные советы'}
    },
    'rasmni-aylantirish-qollanma.html': {
        'uz': {'title': 'Rasmni Aylantirish Qo\'llanucha', 'desc': 'Rasmlarni 90, 180, 270 gradusga aylantirish'},
        'en': {'title': 'Image Rotation Guide', 'desc': 'How to rotate images by 90, 180, 270 degrees'},
        'ru': {'title': 'Руководство по повороту изображений', 'desc': 'Как повернуть изображения на 90, 180, 270 градусов'}
    },
    'rasmni-qirqish-qollanma.html': {
        'uz': {'title': 'Rasmni Qirqish Qo\'llanucha', 'desc': 'Rasmlarni kerakli o\'lchamga qirqib ajratib olish'},
        'en': {'title': 'Image Cropping Guide', 'desc': 'How to crop images to desired dimensions'},
        'ru': {'title': 'Руководство по обрезке изображений', 'desc': 'Как обрезать изображения до желаемых размеров'}
    },
    'rasmni-siqish-optimize.html': {
        'uz': {'title': 'Rasmni Siqish va Optimizatsiya', 'desc': 'JPG va PNG rasmlarni siqib qayta o\'lchaming pastga tushirish'},
        'en': {'title': 'Image Compression and Optimization', 'desc': 'Compress JPG and PNG images to reduce file size'},
        'ru': {'title': 'Сжатие и оптимизация изображений', 'desc': 'Сжимайте JPG и PNG изображения для уменьшения размера файла'}
    },
    'son-soz-konvertor.html': {
        'uz': {'title': 'Raqam-So\'z Konvertor', 'desc': 'Raqamlarni so\'zlarga va so\'zlarni raqamlarga aylantirish'},
        'en': {'title': 'Number to Words Converter', 'desc': 'Convert numbers to words and vice versa'},
        'ru': {'title': 'Конвертер числа в слова', 'desc': 'Преобразование чисел в слова и наоборот'}
    },
    'uzbek-imlo-tekshirish.html': {
        'uz': {'title': 'O\'zbek Imlo Tekshiruvi', 'desc': 'O\'zbek matnida imlo xatolarini tekshirish va to\'g\'rilash'},
        'en': {'title': 'Uzbek Spell Checker', 'desc': 'Check and correct spelling errors in Uzbek text'},
        'ru': {'title': 'Проверка правописания узбекского', 'desc': 'Проверка и исправление ошибок правописания в узбекском тексте'}
    },
    'uzbek-lotin-krill.html': {
        'uz': {'title': 'O\'zbek Lotin va Krill Yozuvi', 'desc': 'O\'zbek matnini lotin va krill yozuvlari o\'rtasida aylantirish'},
        'en': {'title': 'Uzbek Latin and Cyrillic Script', 'desc': 'Convert Uzbek text between Latin and Cyrillic scripts'},
        'ru': {'title': 'Узбекская латиница и кириллица', 'desc': 'Преобразование узбекского текста между латиницей и кириллицей'}
    },
    'word-counter-yozuvchilar.html': {
        'uz': {'title': 'So\'z Sanash - Yozuvchilar Uchun', 'desc': 'Matnda so\'z, belgi va qatorlarni sanash - yozuvchilar uchun qo\'llanma'},
        'en': {'title': 'Word Counter for Writers', 'desc': 'Count words, characters and lines in text - guide for writers'},
        'ru': {'title': 'Счетчик слов для писателей', 'desc': 'Подсчет слов, символов и строк в тексте - руководство для писателей'}
    },
    'word-pdf-aylantirish.html': {
        'uz': {'title': 'Word PDFga Aylantirish', 'desc': 'DOC, DOCX fayllarini PDF formatiga aylantirish qo\'llanucha'},
        'en': {'title': 'Converting Word to PDF', 'desc': 'Guide for converting DOC and DOCX files to PDF format'},
        'ru': {'title': 'Преобразование Word в PDF', 'desc': 'Руководство по преобразованию файлов DOC и DOCX в формат PDF'}
    },
    'zip-arxiv-yaratish.html': {
        'uz': {'title': 'ZIP Arxiv Yaratish', 'desc': 'Fayllarni ZIP arxiviga pack qilish va siqish'},
        'en': {'title': 'Creating ZIP Archives', 'desc': 'How to create and compress ZIP archives from files'},
        'ru': {'title': 'Создание ZIP архивов', 'desc': 'Как создать и сжать ZIP архивы из файлов'}
    },
}

def create_blog_translation(uz_path, blog_slug, lang):
    """Create a blog post translation."""
    trans = BLOG_TRANSLATIONS.get(blog_slug, {}).get(lang, {})
    
    if lang == 'en':
        breadcrumb_home = 'Home'
        breadcrumb_blog = 'Blog'
        nav_about = 'About'
        nav_contact = 'Contact'
        nav_privacy = 'Privacy'
        nav_terms = 'Terms'
        
        content = f'''<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>{trans.get('title', 'Blog Post')} | toolbase.uz</title>
    <meta name="description" content="{trans.get('desc', 'Blog article on toolbase.uz')}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://toolbase.uz/en/blog/{blog_slug}" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/blog/{blog_slug}" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/blog/{blog_slug}" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/blog/{blog_slug}" />
    
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://toolbase.uz/en/blog/{blog_slug}" />
    <meta property="og:title" content="{trans.get('title', 'Blog Post')}" />
    <meta property="og:description" content="{trans.get('desc', 'Blog article on toolbase.uz')}" />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../favicon.ico" />
    <link rel="manifest" href="../../manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    <style>
        .page-content {{ padding: 20px; }}
        .page-content h2 {{ margin-top: 20px; margin-bottom: 10px; }}
        .page-content p {{ margin-bottom: 10px; line-height: 1.6; }}
    </style>
</head>

<body>
    <header class="site-header">
        <div class="container nav">
            <a href="/en/" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links">
                <a href="../../about.html">{nav_about}</a>
                <a href="/en/contact.html">{nav_contact}</a>
                <a href="/en/privacy.html">{nav_privacy}</a>
                <a href="/en/terms.html">{nav_terms}</a>
            </nav>
            <div class="language-switcher" aria-label="Choose language">
                <a href="../../blog/{blog_slug}" lang="uz">UZ</a>
                <a class="active" href="../../en/blog/{blog_slug}" lang="en">EN</a>
                <a href="../../ru/blog/{blog_slug}" lang="ru">RU</a>
            </div>
        </div>
    </header>

    <section class="page-hero">
        <div class="container">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="../">{breadcrumb_home}</a><span class="bc-sep">›</span>
                <a href="../blog.html">{breadcrumb_blog}</a><span class="bc-sep">›</span>
                <span aria-current="page">{trans.get('title', 'Blog Post')}</span>
            </nav>
            <div class="article-meta">
                <span class="meta-info">Blog Article</span>
            </div>
            <h1>{trans.get('title', 'Blog Post')}</h1>
            <p>{trans.get('desc', '')}</p>
        </div>
    </section>

    <main>
        <div class="page-content">
            <div class="container">
                <p style="color: #666; padding: 20px; text-align: center;">
                    This blog post is currently under translation. 
                    Please visit the <a href="../../blog/{blog_slug}">Uzbek version</a> or <a href="../../ru/blog/{blog_slug}">Russian version</a> for the full content.
                </p>
            </div>
        </div>
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 toolbase.uz. All rights reserved.</p>
        </div>
    </footer>
</body>

</html>'''
    else:  # Russian
        breadcrumb_home = 'Главная'
        breadcrumb_blog = 'Блог'
        nav_about = 'О нас'
        nav_contact = 'Контакты'
        nav_privacy = 'Конфиденциальность'
        nav_terms = 'Условия'
        
        content = f'''<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>{trans.get('title', 'Статья')} | toolbase.uz</title>
    <meta name="description" content="{trans.get('desc', 'Статья на toolbase.uz')}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://toolbase.uz/ru/blog/{blog_slug}" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/blog/{blog_slug}" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/blog/{blog_slug}" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/blog/{blog_slug}" />
    
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://toolbase.uz/ru/blog/{blog_slug}" />
    <meta property="og:title" content="{trans.get('title', 'Статья')}" />
    <meta property="og:description" content="{trans.get('desc', 'Статья на toolbase.uz')}" />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../favicon.ico" />
    <link rel="manifest" href="../../manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    <style>
        .page-content {{ padding: 20px; }}
        .page-content h2 {{ margin-top: 20px; margin-bottom: 10px; }}
        .page-content p {{ margin-bottom: 10px; line-height: 1.6; }}
    </style>
</head>

<body>
    <header class="site-header">
        <div class="container nav">
            <a href="/ru/" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links">
                <a href="../../about.html">{nav_about}</a>
                <a href="/ru/contact.html">{nav_contact}</a>
                <a href="/ru/privacy.html">{nav_privacy}</a>
                <a href="/ru/terms.html">{nav_terms}</a>
            </nav>
            <div class="language-switcher" aria-label="Выбор языка">
                <a href="../../blog/{blog_slug}" lang="uz">UZ</a>
                <a href="../../en/blog/{blog_slug}" lang="en">EN</a>
                <a class="active" href="../../ru/blog/{blog_slug}" lang="ru">RU</a>
            </div>
        </div>
    </header>

    <section class="page-hero">
        <div class="container">
            <nav class="breadcrumb" aria-label="Навигация">
                <a href="../">{breadcrumb_home}</a><span class="bc-sep">›</span>
                <a href="../blog.html">{breadcrumb_blog}</a><span class="bc-sep">›</span>
                <span aria-current="page">{trans.get('title', 'Статья')}</span>
            </nav>
            <div class="article-meta">
                <span class="meta-info">Статья блога</span>
            </div>
            <h1>{trans.get('title', 'Статья')}</h1>
            <p>{trans.get('desc', '')}</p>
        </div>
    </section>

    <main>
        <div class="page-content">
            <div class="container">
                <p style="color: #666; padding: 20px; text-align: center;">
                    Эта статья блога в настоящее время переводится. 
                    Пожалуйста, посетите <a href="../../blog/{blog_slug}">узбекскую версию</a> или <a href="../../en/blog/{blog_slug}">английскую версию</a> для полного содержания.
                </p>
            </div>
        </div>
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 toolbase.uz. Все права защищены.</p>
        </div>
    </footer>
</body>

</html>'''
    
    return content

def main():
    root = Path('.')
    blog_dir = root / 'blog'
    
    en_blog_dir = root / 'en' / 'blog'
    ru_blog_dir = root / 'ru' / 'blog'
    
    en_blog_dir.mkdir(parents=True, exist_ok=True)
    ru_blog_dir.mkdir(parents=True, exist_ok=True)
    
    # Get list of blog posts
    blog_files = sorted([f.name for f in blog_dir.glob('*.html')])
    
    created_count = 0
    for blog_file in blog_files:
        uz_path = blog_dir / blog_file
        
        # Create English version
        en_path = en_blog_dir / blog_file
        if not en_path.exists():
            en_content = create_blog_translation(uz_path, blog_file, 'en')
            en_path.write_text(en_content, encoding='utf-8')
            print(f"Created: {en_path.relative_to(root)}")
            created_count += 1
        
        # Create Russian version
        ru_path = ru_blog_dir / blog_file
        if not ru_path.exists():
            ru_content = create_blog_translation(uz_path, blog_file, 'ru')
            ru_path.write_text(ru_content, encoding='utf-8')
            print(f"Created: {ru_path.relative_to(root)}")
            created_count += 1
    
    print(f"\n✓ Blog translations completed! Created {created_count} pages")

if __name__ == '__main__':
    main()
