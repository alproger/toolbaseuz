const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'site-data.json'), 'utf8'));
const output = __dirname;
const domain = data.domain.replace(/\/$/, '');
const componentPaths = ['/components/header.html', '/components/footer.html'];
const scripts = ['/js/component-loader.js', '/js/page.js'];
const styles = ['/css/styles.css'];
const locales = data.languages.reduce((acc, locale) => {
  acc[locale.path] = locale;
  return acc;
}, {});
const translations = data.languages.reduce((acc, locale) => {
  const localePath = path.join(__dirname, 'locales', `${locale.path}.json`);
  acc[locale.path] = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  return acc;
}, {});
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}
function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function buildAlternateLinks(pagePath) {
  return data.languages
    .map(locale => `<link rel="alternate" hreflang="${locale.path}" href="${domain}/${locale.path}${pagePath}" />`)
    .join('\n    ');
}
function buildCommonHead(lang, title, description, keywords, canonical, pagePath, ogType = 'website', extraMeta = '') {
  const locale = locales[lang];
  const localeData = translations[lang] || {};
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#111827" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywords)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
  ${buildAlternateLinks(pagePath)}
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${domain}/assets/img/og-image.png" />
  <meta property="og:locale" content="${locale.locale}" />
  <meta property="og:site_name" content="${escapeHtml(localeData.siteName || locale.name)} ${escapeHtml(data.domain)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
  <link rel="alternate icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${styles.map(href => `<link rel="stylesheet" href="${href}" />`).join('\n  ')}
  ${extraMeta}
</head>
<body class="locale-${lang}">
`; }
function buildFooterHtml(currentLang) {
  return `  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="/${currentLang}/" class="footer-logo">ToolBase<span class="tld">.uz</span></a>
        <p>Fast multilingual browser tools for text, PDF, images and productivity.</p>
        <div class="footer-social">
          <a href="https://t.me/toolbaseuz" target="_blank" rel="noopener" aria-label="Telegram">Telegram</a>
          <a href="https://github.com/toolbaseuz" target="_blank" rel="noopener" aria-label="GitHub">GitHub</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Popular tools</h4>
        ${data.tools[currentLang].slice(0, 6).map(tool => `<a href="/${currentLang}/tools/${tool.slug}/">${escapeHtml(tool.name)}</a>`).join('\n        ')}
      </div>
      <div class="footer-col">
        <h4>Quick links</h4>
        <a href="/${currentLang}/tools/">Tools</a>
        <a href="/${currentLang}/blog/">Blog</a>
        <a href="/${currentLang}/contact/">Contact</a>
        <a href="/${currentLang}/about/">About</a>
      </div>
      <div class="footer-col">
        <h4>Categories</h4>
        ${data.categories.map(category => `<a href="/${currentLang}/tools/?category=${category.id}">${escapeHtml(category.titles[currentLang])}</a>`).join('\n        ')}
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ToolBase.uz — All rights reserved.</span>
      <span>Multilingual web tools platform.</span>
    </div>
  </footer>`;
}
function buildBreadcrumbSchema(lang, crumbs) {
  return `{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [${crumbs
      .map((crumb, index) => `{
        "@type": "ListItem",
        "position": ${index + 1},
        "name": "${escapeHtml(crumb.name)}",
        "item": "${crumb.url}"
      }`)
      .join(',')}]
  }`;
}
function buildFaqSchema(questionAnswer) {
  return `{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [${questionAnswer
      .map(item => `{
        "@type": "Question",
        "name": "${escapeHtml(item.q)}",
        "acceptedAnswer": {"@type": "Answer", "text": "${escapeHtml(item.a)}"}
      }`)
      .join(',')}]
  }`;
}
function buildToolPage(lang, tool) {
  const canonical = `${domain}/${lang}/tools/${tool.slug}/`;
  const title = tool.seo.title;
  const description = tool.seo.description;
  const keywords = tool.seo.keywords;
  const head = buildCommonHead(lang, title, description, keywords, canonical, `/tools/${tool.slug}/`, 'article', '');
  const breadcrumbs = [
    { name: lang === 'uz' ? 'Bosh sahifa' : lang === 'ru' ? 'Главная' : 'Home', url: `${domain}/${lang}/` },
    { name: lang === 'uz' ? 'Vositalar' : lang === 'ru' ? 'Инструменты' : 'Tools', url: `${domain}/${lang}/tools/` },
    { name: tool.name, url: canonical }
  ];
  const toolFaqHtml = tool.faq.map(item => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('\n          ');
  const relatedHtml = tool.related
    .map(slug => {
      const relatedTool = data.tools[lang].find(item => item.slug === slug);
      return relatedTool
        ? `<a class="related-card" href="/${lang}/tools/${relatedTool.slug}/"><h3>${escapeHtml(relatedTool.name)}</h3><p>${escapeHtml(relatedTool.shortDescription)}</p></a>`
        : '';
    })
    .join('\n          ');
  const featuresHtml = tool.features.map(text => `<li>${escapeHtml(text)}</li>`).join('\n              ');
  const useCasesHtml = tool.useCases.map(text => `<li>${escapeHtml(text)}</li>`).join('\n              ');
  const pageJsonLd = `{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${escapeHtml(tool.name)}",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "url": "${canonical}",
    "description": "${escapeHtml(description)}"
  }`;
  const faqJsonLd = buildFaqSchema(tool.faq);
  return `${head}
  <div id="globalHeader"></div>
  <main class="page-main page-tool">
    <section class="hero section-pad">
      <div class="container hero-card">
        <div>
          <span class="eyebrow">${escapeHtml(tool.category === 'text' ? (lang === 'uz' ? 'Matn vositasi' : lang === 'ru' ? 'Текстовый инструмент' : 'Text tool') : tool.category === 'pdf' ? (lang === 'uz' ? 'PDF vositasi' : lang === 'ru' ? 'PDF инструмент' : 'PDF tool') : tool.category === 'image' ? (lang === 'uz' ? 'Rasm vositasi' : lang === 'ru' ? 'Инструмент для изображений' : 'Image tool') : tool.category === 'security' ? (lang === 'uz' ? 'Xavfsizlik vositasi' : lang === 'ru' ? 'Инструмент безопасности' : 'Security tool') : tool.category === 'utility' ? (lang === 'uz' ? 'Foydali vosita' : lang === 'ru' ? 'Полезный инструмент' : 'Utility tool') : tool.category === 'developer' ? (lang === 'uz' ? 'Dasturchilar vositasi' : lang === 'ru' ? 'Инструмент разработчика' : 'Developer tool') : '' )}</span>
          <h1>${escapeHtml(tool.name)}</h1>
          <p>${escapeHtml(tool.shortDescription)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="/${lang}/tools/${tool.slug}/" target="_self">${lang === 'uz' ? 'Vositani ochish' : lang === 'ru' ? 'Открыть инструмент' : 'Open tool'}</a>
            <a class="btn btn-secondary" href="/${lang}/tools/">${lang === 'uz' ? 'Boshqa vositalar' : lang === 'ru' ? 'Другие инструменты' : 'More tools'}</a>
          </div>
        </div>
        <div class="hero-preview">
          <iframe class="tool-frame" src="/tools/${tool.slug}/" title="${escapeHtml(tool.name)} tool iframe"></iframe>
        </div>
      </div>
    </section>
    <section class="section-pad">
      <div class="container content-grid">
        <article class="content-main">
          <div class="card">
            <h2>${lang === 'uz' ? 'Vositani qo‘llash' : lang === 'ru' ? 'Как пользоваться инструментом' : 'How to use this tool'}</h2>
            <p>${escapeHtml(tool.description || tool.shortDescription)}</p>
            <div class="feature-list">
              <div>
                <h3>${lang === 'uz' ? 'Asosiy funksiyalar' : lang === 'ru' ? 'Основные функции' : 'Key features'}</h3>
                <ul>${featuresHtml}</ul>
              </div>
              <div>
                <h3>${lang === 'uz' ? 'Qanday foydalanish' : lang === 'ru' ? 'Как использовать' : 'How to use'}</h3>
                <ol>${useCasesHtml}</ol>
              </div>
            </div>
          </div>
          <div class="card faq-card">
            <div class="section-head"><h2>${lang === 'uz' ? 'Tez-tez so‘raladigan savollar' : lang === 'ru' ? 'Частые вопросы' : 'Frequently asked questions'}</h2></div>
            <div class="faq-list">${toolFaqHtml}</div>
          </div>
          <div class="card seo-card">
            <h2>${lang === 'uz' ? 'SEO mazmuni' : lang === 'ru' ? 'SEO контент' : 'SEO content'}</h2>
            <p>${escapeHtml(tool.description || tool.shortDescription)}</p>
            <p>${escapeHtml(tool.useCases.slice(0, 2).join(' '))}</p>
          </div>
        </article>
        <aside class="sidebar-card">
          <div class="tool-meta">
            <span class="meta-label">${lang === 'uz' ? 'Kategoriyalar' : lang === 'ru' ? 'Категория' : 'Category'}</span>
            <strong>${escapeHtml(data.categories.find(item => item.id === tool.category).titles[lang])}</strong>
          </div>
          <div class="related-section">
            <h3>${lang === 'uz' ? 'Bog‘liq vositalar' : lang === 'ru' ? 'Похожие инструменты' : 'Related tools'}</h3>
            ${relatedHtml}
          </div>
        </aside>
      </div>
    </section>
  </main>
  <div id="globalFooter"></div>
  ${scripts.map(src => `<script src="${src}" defer></script>`).join('\n  ')}
  <script type="application/ld+json">${pageJsonLd}</script>
  <script type="application/ld+json">${faqJsonLd}</script>
</body>
</html>`;
}
function buildBlogPage(lang, post) {
  const canonical = `${domain}/${lang}/blog/${post.slug}.html`;
  const title = post.title;
  const description = post.summary;
  const keywords = post.tags.join(', ');
  const head = buildCommonHead(lang, title, description, keywords, canonical, `/blog/${post.slug}.html`, 'article', '');
  const breadcrumbs = [
    { name: lang === 'uz' ? 'Bosh sahifa' : lang === 'ru' ? 'Главная' : 'Home', url: `${domain}/${lang}/` },
    { name: lang === 'uz' ? 'Blog' : lang === 'ru' ? 'Блог' : 'Blog', url: `${domain}/${lang}/blog/` },
    { name: post.title, url: canonical }
  ];
  const sectionsHtml = post.sections
    .map(section => `<h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p>`)
    .join('\n          ');
  const faqHtml = post.faq
    ? post.faq.map(item => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('\n          ')
    : '';
  const relatedHtml = data.blogs[lang]
    .filter(item => item.slug !== post.slug)
    .slice(0, 3)
    .map(item => `<a class="related-card" href="/${lang}/blog/${item.slug}.html"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></a>`)
    .join('\n          ');
  const jsonLd = `{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${escapeHtml(title)}",
    "description": "${escapeHtml(description)}",
    "author": {"@type": "Organization", "name": "ToolBase.uz"},
    "publisher": {"@type": "Organization", "name": "ToolBase.uz"},
    "datePublished": "${post.date}",
    "dateModified": "${post.date}",
    "mainEntityOfPage": "${canonical}"
  }`;
  const faqJsonLd = post.faq ? buildFaqSchema(post.faq) : '';
  return `${head}
  <div id="globalHeader"></div>
  <main class="page-main page-blog">
    <section class="hero section-pad hero-blog">
      <div class="container hero-card">
        <div>
          <span class="eyebrow">${lang === 'uz' ? 'Blog' : lang === 'ru' ? 'Блог' : 'Blog'}</span>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
          <div class="hero-meta">
            <span>${post.date}</span>
            <span>${post.readingTime}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="section-pad">
      <div class="container content-grid">
        <article class="content-main content-article">
          ${sectionsHtml}
          ${post.faq ? `<div class="card faq-card"><div class="section-head"><h2>${lang === 'uz' ? 'Tez-tez so‘raladigan savollar' : lang === 'ru' ? 'Частые вопросы' : 'Frequently asked questions'}</h2></div><div class="faq-list">${faqHtml}</div></div>` : ''}
        </article>
        <aside class="sidebar-card">
          <div class="related-section">
            <h3>${lang === 'uz' ? 'Bog‘liq maqolalar' : lang === 'ru' ? 'Похожие статьи' : 'Related articles'}</h3>
            ${relatedHtml}
          </div>
        </aside>
      </div>
    </section>
  </main>
  <div id="globalFooter"></div>
  ${scripts.map(src => `<script src="${src}" defer></script>`).join('\n  ')}
  <script type="application/ld+json">${jsonLd}</script>
  ${faqJsonLd ? `<script type="application/ld+json">${faqJsonLd}</script>` : ''}
</body>
</html>`;
}
function buildHomePage(lang) {
  const canonical = `${domain}/${lang}/`;
  const locale = translations[lang] || {};
  const head = buildCommonHead(lang, `${locale.siteName} – ${locale.heroEyebrow}`, locale.heroText, `${locale.toolSectionTitle}, ${locale.blogSectionTitle}, ${locale.heroTitle}`, canonical, '/', 'website', '');
  const toolCards = data.tools[lang]
    .slice(0, 10)
    .map(tool => `<a class="tool-card" href="/${lang}/tools/${tool.slug}/"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.shortDescription)}</p></a>`)
    .join('\n        ');
  const blogCards = data.blogs[lang]
    .slice(0, 4)
    .map(post => `<article class="blog-card"><a href="/${lang}/blog/${post.slug}.html"><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.summary)}</p><span>${post.date} · ${post.readingTime}</span></a></article>`)
    .join('\n        ');
  const categoriesHtml = data.categories
    .map(category => `<a class="category-chip" href="/${lang}/tools/?category=${category.id}">${escapeHtml(category.titles[lang])}</a>`)
    .join('\n        ');
  const schema = `{
    "@context":"https://schema.org",
    "@type":"WebSite",
    "name":"${escapeHtml(locale.siteName)}",
    "url":"${canonical}",
    "inLanguage":"${locales[lang].locale}",
    "potentialAction":{"@type":"SearchAction","target":"${domain}/${lang}/?q={search_term_string}","query-input":"required name=search_term_string"}
  }`;
  return `${head}
  <div id="globalHeader"></div>
  <main class="page-main page-home">
    <section class="hero section-pad home-hero">
      <div class="container hero-card hero-split">
        <div>
          <span class="eyebrow">${escapeHtml(locale.heroEyebrow)}</span>
          <h1>${escapeHtml(locale.heroTitle)}</h1>
          <p>${escapeHtml(locale.heroText)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="/${lang}/tools/">${escapeHtml(locale.toolSectionTitle)}</a>
            <a class="btn btn-secondary" href="/${lang}/blog/">${escapeHtml(locale.blogSectionTitle)}</a>
          </div>
          <div class="category-row">${categoriesHtml}</div>
        </div>
        <div class="hero-preview home-preview">
          <div class="preview-card"><strong>${escapeHtml(locale.toolSectionTitle)}</strong><p>${escapeHtml(locale.toolSectionText)}</p></div>
        </div>
      </div>
    </section>
    <section class="section-pad section-light">
      <div class="container section-head">
        <h2>${escapeHtml(locale.toolSectionTitle)}</h2>
        <p>${escapeHtml(locale.toolSectionText)}</p>
      </div>
      <div class="tool-grid">${toolCards}</div>
    </section>
    <section class="section-pad">
      <div class="container section-head">
        <h2>${escapeHtml(locale.blogSectionTitle)}</h2>
        <p>${escapeHtml(locale.blogSectionText)}</p>
      </div>
      <div class="blog-grid">${blogCards}</div>
    </section>
  </main>
  <div id="globalFooter"></div>
  ${scripts.map(src => `<script src="${src}" defer></script>`).join('\n  ')}
  <script type="application/ld+json">${schema}</script>
</body>
</html>`;
}
function buildToolsIndex(lang) {
  const canonical = `${domain}/${lang}/tools/`;
  const locale = translations[lang] || {};
  const head = buildCommonHead(lang, `${locale.siteName} — ${lang === 'uz' ? 'Vositalar' : lang === 'ru' ? 'Инструменты' : 'Tools'}`, `${locale.toolSectionText}`, `${locale.toolSectionTitle}, ${locale.heroTitle}`, canonical, '/tools/', 'website', '');
  const toolCards = data.tools[lang]
    .map(tool => `<a class="tool-card" href="/${lang}/tools/${tool.slug}/"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.shortDescription)}</p></a>`)
    .join('\n        ');
  return `${head}
  <div id="globalHeader"></div>
  <main class="page-main page-tools">
    <section class="hero section-pad">
      <div class="container hero-card">
        <div>
          <span class="eyebrow">${lang === 'uz' ? 'Vositalar katalogi' : lang === 'ru' ? 'Каталог инструментов' : 'Tools directory'}</span>
          <h1>${lang === 'uz' ? 'Hammasi bir joyda' : lang === 'ru' ? 'Все инструменты в одном месте' : 'All tools in one place'}</h1>
          <p>${escapeHtml(locale.toolSectionText)}</p>
        </div>
      </div>
    </section>
    <section class="section-pad">
      <div class="container tool-grid">${toolCards}</div>
    </section>
  </main>
  <div id="globalFooter"></div>
  ${scripts.map(src => `<script src="${src}" defer></script>`).join('\n  ')}
</body>
</html>`;
}
function buildBlogIndex(lang) {
  const canonical = `${domain}/${lang}/blog/`;
  const locale = translations[lang] || {};
  const head = buildCommonHead(lang, `${locale.siteName} — ${lang === 'uz' ? 'Blog' : lang === 'ru' ? 'Блог' : 'Blog'}`, `${locale.blogSectionText}`, `${locale.blogSectionTitle}`, canonical, '/blog/', 'website', '');
  const blogCards = data.blogs[lang]
    .map(post => `<article class="blog-card"><a href="/${lang}/blog/${post.slug}.html"><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.summary)}</p><span>${post.date} · ${post.readingTime}</span></a></article>`)
    .join('\n        ');
  return `${head}
  <div id="globalHeader"></div>
  <main class="page-main page-blog-index">
    <section class="hero section-pad">
      <div class="container hero-card">
        <div>
          <span class="eyebrow">${lang === 'uz' ? 'Maqolalar' : lang === 'ru' ? 'Статьи' : 'Articles'}</span>
          <h1>${lang === 'uz' ? 'Blogdan eng so‘nggilar' : lang === 'ru' ? 'Последние публикации' : 'Latest posts'}</h1>
          <p>${escapeHtml(locale.blogSectionText)}</p>
        </div>
      </div>
    </section>
    <section class="section-pad">
      <div class="container blog-grid">${blogCards}</div>
    </section>
  </main>
  <div id="globalFooter"></div>
  ${scripts.map(src => `<script src="${src}" defer></script>`).join('\n  ')}
</body>
</html>`;
}
function buildRobots() {
  return `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`;
}
function buildSitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`)
    .join('\n')}
</urlset>`;
}
function normalizeSlug(slug) {
  return slug.replace(/\s+/g, '-').toLowerCase();
}
function buildSite() {
  const entries = [domain];
  data.languages.forEach(locale => {
    const lang = locale.path;
    ensureDir(path.join(output, lang, 'tools'));
    ensureDir(path.join(output, lang, 'blog'));
    writeFile(path.join(output, lang, 'index.html'), buildHomePage(lang));
    entries.push(`${domain}/${lang}/`);
    writeFile(path.join(output, lang, 'tools', 'index.html'), buildToolsIndex(lang));
    entries.push(`${domain}/${lang}/tools/`);
    writeFile(path.join(output, lang, 'blog', 'index.html'), buildBlogIndex(lang));
    entries.push(`${domain}/${lang}/blog/`);
    data.tools[lang].forEach(tool => {
      const dir = path.join(output, lang, 'tools', tool.slug);
      ensureDir(dir);
      writeFile(path.join(dir, 'index.html'), buildToolPage(lang, tool));
      entries.push(`${domain}/${lang}/tools/${tool.slug}/`);
    });
    data.blogs[lang].forEach(post => {
      writeFile(path.join(output, lang, 'blog', `${post.slug}.html`), buildBlogPage(lang, post));
      entries.push(`${domain}/${lang}/blog/${post.slug}.html`);
    });
  });
  writeFile(path.join(output, 'robots.txt'), buildRobots());
  writeFile(path.join(output, 'sitemap.xml'), buildSitemap(entries));
}
buildSite();
console.log('Site generation completed.');
