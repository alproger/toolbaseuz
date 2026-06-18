#!/usr/bin/env python3
"""
Hujjat sahifasi generatori — bitta spec dan UZ + RU sahifa quradi.
Ariza/tarjimai-hol bilan bir xil tuzilish. Har hujjat:
  hujjatlar/<slug>/index.html, css/tool.css, js/config.js, namuna/
  ru/hujjatlar/<slug>/...
"""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGE = '''<!DOCTYPE html>
<html lang="{lang}">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />

    <title>{title}</title>
    <meta name="description" content="{desc}" />
    <meta name="keywords" content="{keywords}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{canonical}" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/hujjatlar/{slug}/" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/hujjatlar/{slug}/" />
    <link rel="alternate" hreflang="x-default" href="https://toolbase.uz/hujjatlar/{slug}/" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:title" content="{og_title}" />
    <meta property="og:description" content="{og_desc}" />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="{locale}" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="icon" type="image/svg+xml" href="{up}assets/img/favicon.svg" />
    <link rel="alternate icon" href="{up}favicon.ico" />
    <link rel="apple-touch-icon" href="{up}assets/img/apple-touch-icon.png" />
    <link rel="manifest" href="{up}manifest.json" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="{up}assets/css/styles.css" />
    <link rel="stylesheet" href="css/tool.css" />

    <script type="application/ld+json">
    {{ "@context": "https://schema.org", "@type": "WebApplication", "name": "{app_name}", "url": "{canonical}", "description": "{desc}", "applicationCategory": "BusinessApplication", "operatingSystem": "Any", "inLanguage": "{lang}", "offers": {{ "@type": "Offer", "price": "0", "priceCurrency": "UZS" }}, "publisher": {{ "@type": "Organization", "name": "toolbase.uz", "url": "https://toolbase.uz" }} }}
    </script>
    <script type="application/ld+json">
    {{ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ {{ "@type": "ListItem", "position": 1, "name": "{bc_home}", "item": "{home_url}" }}, {{ "@type": "ListItem", "position": 2, "name": "{bc_docs}", "item": "{docs_url}" }}, {{ "@type": "ListItem", "position": 3, "name": "{doc_name}", "item": "{canonical}" }} ] }}
    </script>
    {faq_schema}
</head>

<body>

    <header class="site-header">
        <div class="container nav">
            <a href="{up}" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links">
                <a href="{nav_about}">{t_about}</a>
                <a href="{nav_contact}">{t_contact}</a>
                <a href="{nav_privacy}">{t_privacy}</a>
                <a href="{nav_terms}">{t_terms}</a>
            </nav>
            <div class="language-switcher" aria-label="{t_lang}">
                <a {uz_active}href="{uz_href}" lang="uz">UZ</a>
                <a {ru_active}href="{ru_href}" lang="ru">RU</a>
            </div>
        </div>
    </header>

    <main>
        <nav class="breadcrumb container" aria-label="{t_path}">
            <a href="{home_href}">{bc_home}</a><span class="bc-sep">›</span>
            <a href="../">{bc_docs}</a><span class="bc-sep">›</span>
            <span>{doc_name}</span>
        </nav>

        <section class="tool-hero container">
            <div class="tool-hero-icon icon-doc">{icon}</div>
            <div class="tool-hero-text">
                <h1>{h1}</h1>
                <p>{hero_sub}</p>
                <div class="trust-badges">
                    <span class="trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>{t_noserver}</span>
                    <span class="trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>{t_free}</span>
                    <span class="trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>{t_format}</span>
                </div>
            </div>
        </section>

        <section class="tool-workspace container" id="workspace">
            <div class="gen-controls">
                <div class="gen-controls-title">{t_fill}</div>
                {yozuv}
            </div>

            <div class="step-dots" id="stepDots" hidden></div>

            <div class="gen-grid">
                <div class="gen-form-pane" id="formPane">
                    <div class="pane-label">{t_data}</div>
                    <div id="formArea"></div>
                    <div class="step-nav" id="stepNav" hidden></div>
                </div>

                <div class="gen-result-pane" id="resultPane">
                    <button class="result-back" id="btnBackForm">← {t_edit}</button>
                    <div class="paper-shadow">
                        <div class="preview-sheet"><div id="previewBody"></div></div>
                    </div>
                    <button class="dl-primary" data-act="docx">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {t_dlword}
                    </button>
                    <div class="dl-secondary">
                        <button class="dl-mini" data-act="print"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>{t_pdf}</button>
                        <button class="dl-mini" data-act="txt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>{t_text}</button>
                        <button class="dl-mini" data-act="copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>{t_copy}</button>
                    </div>
                    <div class="cross-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
                        <span>{t_cross} <a href="{doc_lotin_krill}">{t_cross_link} →</a></span>
                    </div>
                </div>
            </div>
        </section>

        <section class="tool-info container">
            <article class="info-article">
{content}
            </article>
        </section>
    </main>

    <div class="gen-toast" id="toast"></div>

{scripts}
</body>
</html>'''

T = {
    'uz': dict(t_about='Haqimizda', t_contact='Aloqa', t_privacy='Maxfiylik siyosati', t_terms='Shartlar',
               t_lang='Til tanlash', t_path="Yo'l", t_noserver='Serverga yuborilmaydi', t_free='Bepul',
               t_format='Lotin va krill', t_fill="Ma'lumotlarni to'ldiring", t_data="Ma'lumotlar",
               t_edit='Tahrirlash', t_dlword='Word (.docx) yuklab olish', t_pdf='PDF / Chop',
               t_text='Matn', t_copy='Nusxa', t_cross="Tayyor faylni o'girish kerakmi?",
               t_cross_link='Hujjat Lotin ⇄ Krill', bc_home='Bosh sahifa', bc_docs='Rasmiy hujjatlar',
               home_url='https://toolbase.uz/', docs_url='https://toolbase.uz/hujjatlar/'),
    'ru': dict(t_about='О нас', t_contact='Контакты', t_privacy='Конфиденциальность', t_terms='Условия',
               t_lang='Выбор языка', t_path='Путь', t_noserver='Не отправляется на сервер', t_free='Бесплатно',
               t_format='Официальный формат', t_fill='Заполните данные', t_data='Данные',
               t_edit='Изменить', t_dlword='Скачать Word (.docx)', t_pdf='PDF / Печать',
               t_text='Текст', t_copy='Копия', t_cross='Конвертировать готовый файл?',
               t_cross_link='Документ латиница ⇄ кириллица', bc_home='Главная', bc_docs='Документы',
               home_url='https://toolbase.uz/ru/', docs_url='https://toolbase.uz/ru/hujjatlar/'),
}

YOZUV_UZ = '''<div class="yozuv-seg">
                    <button class="yozuv-btn active" data-yozuv="lat">Lotin</button>
                    <button class="yozuv-btn" data-yozuv="cyr">Krill</button>
                </div>'''


def build(slug, lang, spec):
    tt = T[lang]
    up = '../../' if lang == 'uz' else '../../../'
    canonical = f'https://toolbase.uz/{"" if lang=="uz" else "ru/"}hujjatlar/{slug}/'
    scripts = (
        f'    <script src="{up}tools/lotin-krill/js/translit.js"></script>\n'
        f'    <script src="{up}tools/lotin-krill/js/exceptions.js"></script>\n'
        f'    <script src="{up}tools/lotin-krill/js/jszip.min.js"></script>\n'
        f'    <script src="js/config.js"></script>\n'
        f'    <script src="{up}hujjatlar/_shared/hujjat-gen.js"></script>'
    ) if lang == 'uz' else (
        f'    <script src="{up}tools/lotin-krill/js/jszip.min.js"></script>\n'
        f'    <script src="js/config.js"></script>\n'
        f'    <script src="{up}hujjatlar/_shared/hujjat-gen.js"></script>'
    )
    html = PAGE.format(
        lang=lang, slug=slug, up=up, canonical=canonical, locale='uz_UZ' if lang == 'uz' else 'ru_RU',
        title=spec['title'], desc=spec['desc'], keywords=spec['keywords'],
        og_title=spec['og_title'], og_desc=spec['og_desc'], app_name=spec['app_name'],
        doc_name=spec['doc_name'], icon=spec['icon'], h1=spec['h1'], hero_sub=spec['hero_sub'],
        content=spec['content'], faq_schema=spec.get('faq_schema', ''),
        nav_about=up + ('about.html' if lang == 'uz' else 'ru/about.html'),
        nav_contact=up + ('contact.html' if lang == 'uz' else 'ru/contact.html'),
        nav_privacy=up + ('privacy.html' if lang == 'uz' else 'ru/privacy.html'),
        nav_terms=up + ('terms.html' if lang == 'uz' else 'ru/terms.html'),
        home_href=up if lang == 'uz' else up + 'ru/',
        uz_active='class="active" ' if lang == 'uz' else '',
        ru_active='class="active" ' if lang == 'ru' else '',
        uz_href=f'{up}hujjatlar/{slug}/', ru_href=f'{up}ru/hujjatlar/{slug}/',
        yozuv=YOZUV_UZ if lang == 'uz' else '',
        doc_lotin_krill=f'{up}tools/doc-lotin-krill/',
        scripts=scripts, **tt
    )
    folder = os.path.join(ROOT, ('' if lang == 'uz' else 'ru/'), f'hujjatlar/{slug}')
    os.makedirs(os.path.join(folder, 'js'), exist_ok=True)
    os.makedirs(os.path.join(folder, 'css'), exist_ok=True)
    os.makedirs(os.path.join(folder, 'namuna'), exist_ok=True)
    open(os.path.join(folder, 'index.html'), 'w', encoding='utf-8').write(html)
    # shared CSS nusxa
    import shutil
    shutil.copy(os.path.join(ROOT, 'hujjatlar/_shared/hujjat.css'), os.path.join(folder, 'css/tool.css'))
    return folder
