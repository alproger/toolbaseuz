#!/usr/bin/env python3
"""Blog post generatori — mavjud shablonga mos UZ/RU postlar quradi."""
import os, json, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STYLE_UZ = open('/tmp/blog_style.html', encoding='utf-8').read()
HEADER_UZ = open('/tmp/blog_header.html', encoding='utf-8').read()
FOOTER_UZ = open('/tmp/blog_footer.html', encoding='utf-8').read()
STYLE_RU = open('/tmp/blog_style_ru.html', encoding='utf-8').read()
HEADER_RU = open('/tmp/blog_header_ru.html', encoding='utf-8').read()
FOOTER_RU = open('/tmp/blog_footer_ru.html', encoding='utf-8').read()

L = {
    'uz': dict(asset='../', home='../', bloglist='../blog.html', homeword='Bosh sahifa',
               crumbaria='Yo\'l', readword='o\'qish', toolword='vositani ochish'),
    'ru': dict(asset='../../', home='../../ru/', bloglist='../../ru/blog.html', homeword='Главная',
               crumbaria='Путь', readword='чтения', toolword='открыть инструмент'),
}


def section_html(sec):
    out = '\n        <h2>' + sec['h2'] + '</h2>\n'
    for block in sec['blocks']:
        if isinstance(block, str):
            out += '        <p>' + block + '</p>\n'
        elif block[0] == 'ul':
            out += '        <ul>\n' + ''.join('            <li>' + li + '</li>\n' for li in block[1]) + '        </ul>\n'
        elif block[0] == 'ol':
            out += '        <ol>\n' + ''.join('            <li>' + li + '</li>\n' for li in block[1]) + '        </ol>\n'
        elif block[0] == 'tip':
            out += '        <div class="tip-box"><strong>' + block[1] + '</strong> ' + block[2] + '</div>\n'
    return out


def build(spec, lang):
    t = L[lang]
    asset = t['asset']
    canonical = spec['canonical']
    schema = json.dumps(spec['schema'], ensure_ascii=False, indent=4)
    style = STYLE_UZ if lang == 'uz' else STYLE_RU
    header = HEADER_UZ if lang == 'uz' else HEADER_RU
    footer = FOOTER_UZ if lang == 'uz' else FOOTER_RU

    # Til almashtirgich blog post uchun (UZ <-> RU post)
    uz_url = f"{asset}blog/{spec['slug']}.html" if lang == 'uz' else f"{asset}blog/{spec['slug']}.html"
    ru_url = f"{asset}ru/blog/{spec['slug']}.html" if lang == 'uz' else f"{asset}ru/blog/{spec['slug']}.html"

    sections = ''.join(section_html(s) for s in spec['sections'])

    cta = f'''
        <div class="tool-cta">
            <h3>{spec['cta_title']}</h3>
            <p>{spec['cta_text']}</p>
            <a href="{asset}{spec['tool_path']}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg> {spec['cta_btn']}
            </a>
        </div>
'''

    related_cards = ''
    for rc in spec['related']:
        related_cards += f'''                <a href="{rc['url']}" class="related-card">
                    <div class="rc-cat">{rc['cat']}</div>
                    <div class="rc-title">{rc['title']}</div>
                </a>
'''
    related = f'''
    <section style="padding:30px 0 50px">
        <div class="container">
            <h2 style="font-size:1.3rem;margin-bottom:4px">{spec['related_title']}</h2>
            <div class="related-grid">
{related_cards}            </div>
        </div>
    </section>
'''

    html = f'''<!DOCTYPE html>
<html lang="{lang}">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>{spec['title']}</title>
    <meta name="description" content="{spec['desc']}" />
    <meta name="keywords" content="{spec['keywords']}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{canonical}" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/blog/{spec['slug']}.html" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/blog/{spec['slug']}.html" />
    <link rel="alternate" hreflang="x-default" href="https://toolbase.uz/blog/{spec['slug']}.html" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:title" content="{spec['og_title']}" />
    <meta property="og:description" content="{spec['desc']}" />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="{'uz_UZ' if lang == 'uz' else 'ru_RU'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="{asset}assets/img/favicon.svg" />
    <link rel="alternate icon" href="{asset}favicon.ico" />
    <link rel="manifest" href="{asset}manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="{asset}assets/css/styles.css" />
    {style}
    <script type="application/ld+json">
{schema}
    </script>
</head>

<body>

    {header}

    <section class="page-hero">
        <div class="container">
            <nav class="breadcrumb" aria-label="{t['crumbaria']}">
                <a href="{t['home']}">{t['homeword']}</a>
                <span class="bc-sep">›</span>
                <a href="{t['bloglist']}">Blog</a>
                <span class="bc-sep">›</span>
                <span>{spec['category']}</span>
            </nav>
            <div class="article-meta">
                <span class="meta-cat">{spec['category']}</span>
                <span class="meta-info">{spec['date_h']} &nbsp;·&nbsp; {spec['readtime']}</span>
            </div>
            <h1>{spec['h1']}</h1>
            <p>{spec['intro']}</p>
        </div>
    </section>

    <main class="page-content">
{sections}{cta}
    </main>
{related}
    {footer}
</body>

</html>'''

    folder = os.path.join(ROOT, 'blog' if lang == 'uz' else 'ru/blog')
    os.makedirs(folder, exist_ok=True)
    open(os.path.join(folder, spec['slug'] + '.html'), 'w', encoding='utf-8').write(html)
    return os.path.join(folder, spec['slug'] + '.html')
