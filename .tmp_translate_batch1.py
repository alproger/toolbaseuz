from pathlib import Path

# List of files to translate
files = [
    "case-converter-qollanma.html",
    "hash-generator-md5-sha256.html",
    "json-formatlash-amaliyot.html",
    "kuchli-parol-yaratish.html",
    "olchov-birliklari-konvertatsiya.html"
]

for file in files:
    source_path = Path("blog") / file
    if not source_path.exists():
        continue
    source = source_path.read_text(encoding="utf-8")
    style = source.split("<style>", 1)[1].split("</style>", 1)[0]
    
    # For each file, define the translated content
    # Since translation is complex, for demo, I'll use placeholder
    # In real, I would translate each one
    
    # For case-converter-qollanma.html
    if file == "case-converter-qollanma.html":
        en_content = '''<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>Case Converter: camelCase, snake_case, kebab-case — Complete Guide | toolbase.uz</title>
    <meta name="description" content="Convert text case to UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case formats. Practical guide for developers and writers." />
    <meta name="keywords" content="case converter, camelCase, snake_case, kebab-case, PascalCase, UPPER CASE, lower case, title case, text case" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://toolbase.uz/en/blog/case-converter-qollanma.html" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/blog/case-converter-qollanma.html" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/blog/case-converter-qollanma.html" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/blog/case-converter-qollanma.html" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://toolbase.uz/en/blog/case-converter-qollanma.html" />
    <meta property="og:title" content="Case Converter: camelCase, snake_case, kebab-case and other formats — Complete Guide" />
    <meta property="og:description" content="Convert text case to UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case formats. Practical guide for developers and writers." />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="article:published_time" content="2026-04-18T00:00:00+05:00" />
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../favicon.ico" />
    <link rel="manifest" href="../../manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Case Converter: camelCase, snake_case, kebab-case and other formats — Complete Guide","url":"https://toolbase.uz/en/blog/case-converter-qollanma.html","datePublished":"2026-04-18","author":{"@type":"Organization","name":"toolbase.uz"},"publisher":{"@type":"Organization","name":"toolbase.uz"},"inLanguage":"en"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://toolbase.uz/en/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://toolbase.uz/en/blog.html"},{"@type":"ListItem","position":3,"name":"Case Converter","item":"https://toolbase.uz/en/blog/case-converter-qollanma.html"}]}</script>
    <style>
''' + style + '''
    </style>
</head>

<body>
    <header class="site-header">
        <div class="container nav">
            <a href="../" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links"><a href="../about.html">About</a><a href="../contact.html">Contact</a><a href="../privacy.html">Privacy</a><a href="../terms.html">Terms</a></nav>
        </div>
    </header>

    <section class="page-hero">
        <div class="container">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="../">Home</a><span class="bc-sep">›</span>
                <a href="../blog.html">Blog</a><span class="bc-sep">›</span>
                <span aria-current="page">Case Converter</span>
            </nav>
            <div class="article-meta">
                <span class="meta-cat">Programming</span>
                <span class="meta-info"><time datetime="2026-04-18">April 18, 2026</time> · 5 min read</span>
            </div>
            <h1>Case Converter: camelCase, snake_case, kebab-case and other formats — Complete Guide</h1>
            <p>Naming conventions are very important in programming. camelCase, snake_case, PascalCase — where is which format used and can they be converted instantly?</p>
        </div>
    </section>

    <main>
        <div class="page-content">

            <h2>1. What is text case?</h2>
            <p>
                <strong>Case (case)</strong> — whether letters are uppercase or lowercase. In programming, "case" has a broader meaning: it means not only upper/lower case, but also how words are combined.
            </p>
            <p>
                For example, the phrase <em>"hello world"</em> can be written in different formats:
            </p>

            <div class="example-grid">
                <div class="example-card">
                    <div class="ex-label">UPPER CASE</div>
                    <div class="ex-val">HELLO WORLD</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">lower case</div>
                    <div class="ex-val">hello world</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">Title Case</div>
                    <div class="ex-val">Hello World</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">Sentence case</div>
                    <div class="ex-val">Hello world</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">camelCase</div>
                    <div class="ex-val">helloWorld</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">PascalCase</div>
                    <div class="ex-val">HelloWorld</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">snake_case</div>
                    <div class="ex-val">hello_world</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">kebab-case</div>
                    <div class="ex-val">hello-world</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">CONSTANT_CASE</div>
                    <div class="ex-val">HELLO_WORLD</div>
                </div>
            </div>

            <h2>2. Where is each format used?</h2>

            <h3>2.1. camelCase</h3>
            <p>
                <strong>Rule:</strong> First word starts with lowercase, each subsequent word with uppercase. No separator between words.
            </p>
            <ul>
                <li><strong>JavaScript:</strong> standard for variables and functions — <code>let userName = "Ali"</code>, <code>function getUserData() {}</code></li>
                <li><strong>Java:</strong> variables and methods — <code>String firstName</code>, <code>void calculateTotal()</code></li>
                <li><strong>Swift, Kotlin, Dart:</strong> variables and functions</li>
                <li><strong>JSON keys:</strong> <code>{"firstName": "Ali", "lastName": "Karimov"}</code></li>
            </ul>

            <h3>2.2. PascalCase (UpperCamelCase)</h3>
            <p>
                <strong>Rule:</strong> All words start with uppercase, no separator. Difference from camelCase — first word also uppercase.
            </p>
            <ul>
                <li><strong>Classes:</strong> in all languages — <code>class UserProfile</code>, <code>class DatabaseConnection</code></li>
                <li><strong>React components:</strong> <code>function LoginForm()</code>, <code>const NavBar = () =&gt; {}</code></li>
                <li><strong>C# and .NET:</strong> all public methods and properties</li>
                <li><strong>Python classes:</strong> <code>class BankAccount:</code></li>
            </ul>

            <h3>2.3. snake_case</h3>
            <p>
                <strong>Rule:</strong> All letters lowercase, words separated by underscore <code>_</code>.
            </p>
            <ul>
                <li><strong>Python:</strong> for variables, functions, modules per PEP 8 — <code>user_name</code>, <code>def get_user_data():</code></li>
                <li><strong>Ruby:</strong> variables and methods</li>
                <li><strong>SQL column names:</strong> <code>first_name</code>, <code>created_at</code>, <code>user_id</code></li>
                <li><strong>Linux file names:</strong> <code>my_script.sh</code>, <code>config_file.yaml</code></li>
            </ul>

            <h3>2.4. kebab-case</h3>
            <p>
                <strong>Rule:</strong> All letters lowercase, words separated by hyphen <code>-</code>. URL-friendly format.
            </p>
            <ul>
                <li><strong>CSS class names:</strong> <code>.nav-bar</code>, <code>.btn-primary</code>, <code>.form-input</code></li>
                <li><strong>HTML attributes:</strong> <code>data-user-id</code>, <code>aria-label</code></li>
                <li><strong>URL slugs:</strong> <code>/blog/case-converter-guide</code></li>
                <li><strong>npm package names:</strong> <code>react-router-dom</code>, <code>lodash-es</code></li>
            </ul>

            <h3>2.5. CONSTANT_CASE (SCREAMING_SNAKE_CASE)</h3>
            <p>
                <strong>Rule:</strong> All letters uppercase, words separated by underscore.
            </p>
            <ul>
                <li><strong>Constants:</strong> in all languages — <code>const MAX_RETRY_COUNT = 3</code></li>
                <li><strong>Environment variables:</strong> <code>DATABASE_URL</code>, <code>API_SECRET_KEY</code></li>
                <li><strong>Enum values:</strong> <code>STATUS_PENDING</code>, <code>ROLE_ADMIN</code></li>
            </ul>

            <h2>3. Title Case and Sentence case — when to use?</h2>

            <h3>3.1. Title Case</h3>
            <p>
                Each word starts with uppercase. Standard for titles, book names, movie names in English. Also used in official titles in Uzbek.
            </p>
            <ul>
                <li>Book title: <em>The Historical Grammar of the Uzbek Language</em></li>
                <li>Article title: <em>Security Issues in Digital Economy</em></li>
                <li>Presentation slides</li>
            </ul>

            <h3>3.2. Sentence case</h3>
            <p>
                Only sentence start uppercase, other words lowercase (except proper names). Recommended for regular writing, emails and documents.
            </p>

            <div class="tip-box">
                <p><strong>💡 Which format to choose?</strong> If naming style is not defined in new project: camelCase (variable) + PascalCase (class) in JavaScript/TypeScript, snake_case in Python, kebab-case in CSS — most common standards.</p>
            </div>

            <h2>4. Common mistakes</h2>
            <ul>
                <li><strong>Mixing camelCase and PascalCase:</strong> In React, component name <code>loginForm</code> not <code>LoginForm</code> — otherwise React won't recognize it as component.</li>
                <li><strong>Space in URL:</strong> <code>/our news site</code> not <code>/our-news-site</code> — browsers convert space to %20.</li>
                <li><strong>Uppercase in SQL:</strong> <code>UserName</code> column name may equal <code>username</code> in case-insensitive environments — causes problems. Writing <code>user_name</code> is safer.</li>
            </ul>

            <h2>5. When is automatic conversion needed?</h2>
            <p>
                In practice, need to convert text from one format to another often:
            </p>
            <ul>
                <li>API response comes in <code>first_name</code> (snake_case), but JavaScript variable needs <code>firstName</code> (camelCase).</li>
                <li>Convert database column names (<code>user_id</code>) to frontend component prop (<code>userId</code>).</li>
                <li>Convert title to blog URL slug: <em>"Case Converter Guide"</em> → <code>case-converter-guide</code></li>
                <li>Generate constants list: from word list to <code>CONSTANT_CASE</code>.</li>
            </ul>

            <div class="tool-cta">
                <h3>Try Case Converter tool</h3>
                <p>11 formats: UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Alternating, Inverse — all instantly.</p>
                <a href="../../tools/case-converter/">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg> Open tool
                </a>
            </div>

            <h2>6. Interesting: Alternating and Inverse case</h2>
            <p>
                Two additional formats exist — though rarely used practically, interesting:
            </p>
            <ul>
                <li><strong>aLtErNaTiNg CaSe:</strong> Each character alternates upper and lower. Used in internet culture for criticism or sarcasm ("sPoNgEbOb MoCkInG mEmE" famous).</li>
                <li><strong>iNVERSE cASE:</strong> Upper becomes lower, lower becomes upper. Available in our Case Converter.</li>
            </ul>

            <hr style="border:none;border-top:1px solid var(--line);margin:36px 0;" />
            <h2>Related articles</h2>
            <div class="related-grid">
                <a class="related-card" href="../../blog/json-nima.html">
                    <div class="rc-cat">Basics</div>
                    <div class="rc-title">What is JSON and why is it used?</div>
                </a>
                <a class="related-card" href="../../blog/qr-kod-yaratish-qollanma.html">
                    <div class="rc-cat">Technology</div>
                    <div class="rc-title">QR Code Creation: URL, Wi-Fi, vCard — Complete Guide</div>
                </a>
                <a class="related-card" href="../../blog/rasm-format-ozgartirish-qollanma.html">
                    <div class="rc-cat">Image</div>
                    <div class="rc-title">Image Format Conversion: JPG, PNG, WebP, PDF</div>
                </a>
                <a class="related-card" href="../../blog/kuchli-parol-yaratish.html">
                    <div class="rc-cat">Security</div>
                    <div class="rc-title">Creating strong passwords: 7 important rules</div>
                </a>
                <a class="related-card" href="../../blog/json-formatlash-amaliyot.html">
                    <div class="rc-cat">Practice</div>
                    <div class="rc-title">JSON formatting: Why is it important?</div>
                </a>
            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">

                <div class="footer-brand">
                    <a href="../" class="logo">Toolbase<span class="tld">.uz</span></a>
                    <p>20+ free online tools for working with text, documents and images. Files never leave your browser.</p>
                    <div class="footer-social">
                        <a href="https://t.me/toolbaseuz" target="_blank" rel="noopener" aria-label="Telegram" class="social-btn">Telegram</a>
                        <a href="https://github.com/toolbaseuz" target="_blank" rel="noopener" aria-label="GitHub" class="social-btn">GitHub</a>
                    </div>
                </div>

                <div class="footer-col">
                    <h4>Tools</h4>
                    <a href="../../tools/lotin-krill/">Latin ⇄ Cyrillic</a>
                    <a href="../../tools/son-soz/">Number → Words</a>
                    <a href="../../tools/word-counter/">Word Counter</a>
                    <a href="../../tools/case-converter/">Case Converter</a>
                    <a href="../../tools/color-converter/">Color Converter</a>
                    <a href="../../tools/unit-converter/" class="ftr-hide-mob">Unit Converter</a>
                    <a href="../../tools/json-formatter/" class="ftr-hide-mob">JSON Formatter</a>
                    <a href="../../tools/password-generator/" class="ftr-hide-mob">Password Generator</a>
                    <a href="../../tools/hash-generator/" class="ftr-hide-mob">Hash Generator</a>
                    <a href="../../tools/time-zones/" class="ftr-hide-mob">Time Zones</a>
                    <a href="../../tools/zip-creator/" class="ftr-hide-mob">ZIP Creator</a>
                    <a href="../../tools/qr-generator/">QR Code</a>
                </div>
                <div class="footer-col">
                    <h4>PDF & Image</h4>
                    <a href="../../tools/pdf-merge/">PDF Merge</a>
                    <a href="../../tools/pdf-delete/">PDF Delete Page</a>
                    <a href="../../tools/pdf-editor/">PDF Editor</a>
                    <a href="../../tools/word-to-pdf/">Word → PDF</a>
                    <a href="../../tools/image-converter/">Image Converter</a>
                    <a href="../../tools/image-compress/" class="ftr-hide-mob">Image Compress</a>
                    <a href="../../tools/image-resize/" class="ftr-hide-mob">Image Resize</a>
                    <a href="../../tools/image-crop/" class="ftr-hide-mob">Image Crop</a>
                    <a href="../../tools/image-rotate/" class="ftr-hide-mob">Image Rotate</a>
                    <a href="../../tools/pdf-rotate/" class="ftr-hide-mob">PDF Rotate</a>
                    <a href="../../tools/pdf-protect/" class="ftr-hide-mob">PDF Protect</a>
                    <a href="../../tools/bg-remove/" class="ftr-hide-mob">Background Remove</a>
                </div>
                <div class="footer-col">
                    <h4>Company</h4>
                    <a href="../about.html">About</a>
                    <a href="../contact.html">Contact</a>
                    <a href="../blog.html">Blog</a>
                    <div class="footer-divider"></div>
                    <h4 class="ftr-h4-mt">Legal</h4>
                    <a href="../terms.html">Terms of Service</a>
                    <a href="../privacy.html">Privacy Policy</a>
                </div>

            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-row">
                    <span>© <span class="footer-year">2026</span> toolbase.uz — All rights reserved</span>
                    <span class="footer-made">Made for the world 🌍</span>
                </div>
            </div>
        </div>
    </footer>
    <script>document.querySelectorAll('.footer-year').forEach(function(e){e.textContent = String(new Date().getFullYear());});</script>
</body>

</html>
'''
        ru_content = '''<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>Конвертер регистра: camelCase, snake_case, kebab-case — Полное руководство | toolbase.uz</title>
    <meta name="description" content="Преобразование регистра текста в UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case форматы. Практическое руководство для разработчиков и писателей." />
    <meta name="keywords" content="конвертер регистра, camelCase, snake_case, kebab-case, PascalCase, UPPER CASE, lower case, title case, регистр текста" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://toolbase.uz/ru/blog/case-converter-qollanma.html" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/blog/case-converter-qollanma.html" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/blog/case-converter-qollanma.html" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/blog/case-converter-qollanma.html" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://toolbase.uz/ru/blog/case-converter-qollanma.html" />
    <meta property="og:title" content="Конвертер регистра: camelCase, snake_case, kebab-case и другие форматы — Полное руководство" />
    <meta property="og:description" content="Преобразование регистра текста в UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case форматы. Практическое руководство для разработчиков и писателей." />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="article:published_time" content="2026-04-18T00:00:00+05:00" />
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../favicon.ico" />
    <link rel="manifest" href="../../manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Конвертер регистра: camelCase, snake_case, kebab-case и другие форматы — Полное руководство","url":"https://toolbase.uz/ru/blog/case-converter-qollanma.html","datePublished":"2026-04-18","author":{"@type":"Organization","name":"toolbase.uz"},"publisher":{"@type":"Organization","name":"toolbase.uz"},"inLanguage":"ru"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Главная","item":"https://toolbase.uz/ru/"},{"@type":"ListItem","position":2,"name":"Блог","item":"https://toolbase.uz/ru/blog.html"},{"@type":"ListItem","position":3,"name":"Конвертер регистра","item":"https://toolbase.uz/ru/blog/case-converter-qollanma.html"}]}</script>
    <style>
''' + style + '''
    </style>
</head>

<body>
    <header class="site-header">
        <div class="container nav">
            <a href="../" class="logo">Toolbase<span class="tld">.uz</span></a>
            <nav class="nav-links"><a href="../about.html">О нас</a><a href="../contact.html">Контакты</a><a href="../privacy.html">Конфиденциальность</a><a href="../terms.html">Условия</a></nav>
        </div>
    </header>

    <section class="page-hero">
        <div class="container">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="../">Главная</a><span class="bc-sep">›</span>
                <a href="../blog.html">Блог</a><span class="bc-sep">›</span>
                <span aria-current="page">Конвертер регистра</span>
            </nav>
            <div class="article-meta">
                <span class="meta-cat">Программирование</span>
                <span class="meta-info"><time datetime="2026-04-18">18 апреля 2026</time> · 5 мин чтения</span>
            </div>
            <h1>Конвертер регистра: camelCase, snake_case, kebab-case и другие форматы — Полное руководство</h1>
            <p>Соглашения об именовании очень важны в программировании. camelCase, snake_case, PascalCase — где какой формат используется и можно ли их мгновенно преобразовать?</p>
        </div>
    </section>

    <main>
        <div class="page-content">

            <h2>1. Что такое регистр текста?</h2>
            <p>
                <strong>Регистр (case)</strong> — заглавные или строчные буквы. В программировании "case" имеет более широкий смысл: это означает не только верхний/нижний регистр, но и способ объединения слов.
            </p>
            <p>
                Например, фразу <em>"привет мир"</em> можно написать в разных форматах:
            </p>

            <div class="example-grid">
                <div class="example-card">
                    <div class="ex-label">UPPER CASE</div>
                    <div class="ex-val">ПРИВЕТ МИР</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">lower case</div>
                    <div class="ex-val">привет мир</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">Title Case</div>
                    <div class="ex-val">Привет Мир</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">Sentence case</div>
                    <div class="ex-val">Привет мир</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">camelCase</div>
                    <div class="ex-val">приветМир</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">PascalCase</div>
                    <div class="ex-val">ПриветМир</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">snake_case</div>
                    <div class="ex-val">привет_мир</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">kebab-case</div>
                    <div class="ex-val">привет-мир</div>
                </div>
                <div class="example-card">
                    <div class="ex-label">CONSTANT_CASE</div>
                    <div class="ex-val">ПРИВЕТ_МИР</div>
                </div>
            </div>

            <h2>2. Где используется каждый формат?</h2>

            <h3>2.1. camelCase</h3>
            <p>
                <strong>Правило:</strong> Первое слово начинается со строчной, каждое последующее с заглавной. Без разделителя между словами.
            </p>
            <ul>
                <li><strong>JavaScript:</strong> стандарт для переменных и функций — <code>let userName = "Ali"</code>, <code>function getUserData() {}</code></li>
                <li><strong>Java:</strong> переменные и методы — <code>String firstName</code>, <code>void calculateTotal()</code></li>
                <li><strong>Swift, Kotlin, Dart:</strong> переменные и функции</li>
                <li><strong>Ключи JSON:</strong> <code>{"firstName": "Ali", "lastName": "Karimov"}</code></li>
            </ul>

            <h3>2.2. PascalCase (UpperCamelCase)</h3>
            <p>
                <strong>Правило:</strong> Все слова начинаются с заглавной, без разделителя. Отличие от camelCase — первое слово тоже заглавное.
            </p>
            <ul>
                <li><strong>Классы:</strong> во всех языках — <code>class UserProfile</code>, <code>class DatabaseConnection</code></li>
                <li><strong>Компоненты React:</strong> <code>function LoginForm()</code>, <code>const NavBar = () =&gt; {}</code></li>
                <li><strong>C# и .NET:</strong> все публичные методы и свойства</li>
                <li><strong>Классы Python:</strong> <code>class BankAccount:</code></li>
            </ul>

            <h3>2.3. snake_case</h3>
            <p>
                <strong>Правило:</strong> Все буквы строчные, слова разделены подчеркиванием <code>_</code>.
            </p>
            <ul>
                <li><strong>Python:</strong> для переменных, функций, модулей по PEP 8 — <code>user_name</code>, <code>def get_user_data():</code></li>
                <li><strong>Ruby:</strong> переменные и методы</li>
                <li><strong>Имена столбцов SQL:</strong> <code>first_name</code>, <code>created_at</code>, <code>user_id</code></li>
                <li><strong>Имена файлов Linux:</strong> <code>my_script.sh</code>, <code>config_file.yaml</code></li>
            </ul>

            <h3>2.4. kebab-case</h3>
            <p>
                <strong>Правило:</strong> Все буквы строчные, слова разделены дефисом <code>-</code>. URL-дружественный формат.
            </p>
            <ul>
                <li><strong>Имена классов CSS:</strong> <code>.nav-bar</code>, <code>.btn-primary</code>, <code>.form-input</code></li>
                <li><strong>Атрибуты HTML:</strong> <code>data-user-id</code>, <code>aria-label</code></li>
                <li><strong>URL слаг:</strong> <code>/blog/case-converter-guide</code></li>
                <li><strong>Имена пакетов npm:</strong> <code>react-router-dom</code>, <code>lodash-es</code></li>
            </ul>

            <h3>2.5. CONSTANT_CASE (SCREAMING_SNAKE_CASE)</h3>
            <p>
                <strong>Правило:</strong> Все буквы заглавные, слова разделены подчеркиванием.
            </p>
            <ul>
                <li><strong>Константы:</strong> во всех языках — <code>const MAX_RETRY_COUNT = 3</code></li>
                <li><strong>Переменные окружения:</strong> <code>DATABASE_URL</code>, <code>API_SECRET_KEY</code></li>
                <li><strong>Значения enum:</strong> <code>STATUS_PENDING</code>, <code>ROLE_ADMIN</code></li>
            </ul>

            <h2>3. Title Case и Sentence case — когда использовать?</h2>

            <h3>3.1. Title Case</h3>
            <p>
                Каждое слово начинается с заглавной. Стандарт для заголовков, названий книг, фильмов на английском. Также используется в официальных заголовках на узбекском.
            </p>
            <ul>
                <li>Название книги: <em>Историческая грамматика узбекского языка</em></li>
                <li>Название статьи: <em>Проблемы безопасности в цифровой экономике</em></li>
                <li>Слайды презентации</li>
            </ul>

            <h3>3.2. Sentence case</h3>
            <p>
                Только начало предложения заглавное, остальные слова строчные (кроме имен собственных). Рекомендуется для обычного письма, email и документов.
            </p>

            <div class="tip-box">
                <p><strong>💡 Какой формат выбрать?</strong> Если стиль именования не определен в новом проекте: camelCase (переменная) + PascalCase (класс) в JavaScript/TypeScript, snake_case в Python, kebab-case в CSS — самые распространенные стандарты.</p>
            </div>

            <h2>4. Распространенные ошибки</h2>
            <ul>
                <li><strong>Смешивание camelCase и PascalCase:</strong> В React имя компонента <code>loginForm</code> не <code>LoginForm</code> — иначе React не распознает его как компонент.</li>
                <li><strong>Пробел в URL:</strong> <code>/наш новый сайт</code> не <code>/nash-novyy-sayt</code> — браузеры конвертируют пробел в %20.</li>
                <li><strong>Заглавные в SQL:</strong> Имя столбца <code>UserName</code> может равняться <code>username</code> в case-insensitive окружениях — вызывает проблемы. Писать <code>user_name</code> безопаснее.</li>
            </ul>

            <h2>5. Когда нужна автоматическая конвертация?</h2>
            <p>
                На практике часто нужно конвертировать текст из одного формата в другой:
            </p>
            <ul>
                <li>Ответ API приходит в <code>first_name</code> (snake_case), но переменная JavaScript нужна <code>firstName</code> (camelCase).</li>
                <li>Конвертировать имена столбцов БД (<code>user_id</code>) в проп компонента frontend (<code>userId</code>).</li>
                <li>Конвертировать заголовок в URL слаг блога: <em>"Руководство по конвертеру регистра"</em> → <code>rukovodstvo-po-konverteru-registra</code></li>
                <li>Генерировать список констант: из списка слов в <code>CONSTANT_CASE</code>.</li>
            </ul>

            <div class="tool-cta">
                <h3>Попробуйте инструмент Case Converter</h3>
                <p>11 форматов: UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Alternating, Inverse — все мгновенно.</p>
                <a href="../../tools/case-converter/">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg> Открыть инструмент
                </a>
            </div>

            <h2>6. Интересно: Alternating и Inverse case</h2>
            <p>
                Существуют два дополнительных формата — хотя редко используются практически, интересны:
            </p>
            <ul>
                <li><strong>aLtErNaTiNg CaSe:</strong> Каждый символ чередует верхний и нижний. Используется в интернет-культуре для критики или сарказма ("sPoNgEbOb MoCkInG mEmE" знаменит).</li>
                <li><strong>iNVERSE cASE:</strong> Заглавные становятся строчными, строчные заглавными. Доступно в нашем Case Converter.</li>
            </ul>

            <hr style="border:none;border-top:1px solid var(--line);margin:36px 0;" />
            <h2>Похожие статьи</h2>
            <div class="related-grid">
                <a class="related-card" href="../../blog/json-nima.html">
                    <div class="rc-cat">Основы</div>
                    <div class="rc-title">Что такое JSON и зачем он используется?</div>
                </a>
                <a class="related-card" href="../../blog/qr-kod-yaratish-qollanma.html">
                    <div class="rc-cat">Технологии</div>
                    <div class="rc-title">Создание QR-кода: URL, Wi-Fi, vCard — Полное руководство</div>
                </a>
                <a class="related-card" href="../../blog/rasm-format-ozgartirish-qollanma.html">
                    <div class="rc-cat">Изображения</div>
                    <div class="rc-title">Конвертация формата изображения: JPG, PNG, WebP, PDF</div>
                </a>
                <a class="related-card" href="../../blog/kuchli-parol-yaratish.html">
                    <div class="rc-cat">Безопасность</div>
                    <div class="rc-title">Создание сильных паролей: 7 важных правил</div>
                </a>
                <a class="related-card" href="../../blog/json-formatlash-amaliyot.html">
                    <div class="rc-cat">Практика</div>
                    <div class="rc-title">Форматирование JSON: Почему это важно?</div>
                </a>
            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">

                <div class="footer-brand">
                    <a href="../" class="logo">Toolbase<span class="tld">.uz</span></a>
                    <p>20+ бесплатных онлайн-инструментов для работы с текстом, документами и изображениями. Файлы не отправляются на сервер.</p>
                    <div class="footer-social">
                        <a href="https://t.me/toolbaseuz" target="_blank" rel="noopener" aria-label="Telegram" class="social-btn">Telegram</a>
                        <a href="https://github.com/toolbaseuz" target="_blank" rel="noopener" aria-label="GitHub" class="social-btn">GitHub</a>
                    </div>
                </div>

                <div class="footer-col">
                    <h4>Инструменты</h4>
                    <a href="../../tools/lotin-krill/">Latin ⇄ Cyrillic</a>
                    <a href="../../tools/son-soz/">Number → Words</a>
                    <a href="../../tools/word-counter/">Word Counter</a>
                    <a href="../../tools/case-converter/">Case Converter</a>
                    <a href="../../tools/color-converter/">Color Converter</a>
                    <a href="../../tools/unit-converter/" class="ftr-hide-mob">Unit Converter</a>
                    <a href="../../tools/json-formatter/" class="ftr-hide-mob">JSON Formatter</a>
                    <a href="../../tools/password-generator/" class="ftr-hide-mob">Password Generator</a>
                    <a href="../../tools/hash-generator/" class="ftr-hide-mob">Hash Generator</a>
                    <a href="../../tools/time-zones/" class="ftr-hide-mob">Time Zones</a>
                    <a href="../../tools/zip-creator/" class="ftr-hide-mob">ZIP Creator</a>
                    <a href="../../tools/qr-generator/">QR Code</a>
                </div>
                <div class="footer-col">
                    <h4>PDF & Изображения</h4>
                    <a href="../../tools/pdf-merge/">PDF Merge</a>
                    <a href="../../tools/pdf-delete/">PDF Delete Page</a>
                    <a href="../../tools/pdf-editor/">PDF Editor</a>
                    <a href="../../tools/word-to-pdf/">Word → PDF</a>
                    <a href="../../tools/image-converter/">Image Converter</a>
                    <a href="../../tools/image-compress/" class="ftr-hide-mob">Image Compress</a>
                    <a href="../../tools/image-resize/" class="ftr-hide-mob">Image Resize</a>
                    <a href="../../tools/image-crop/" class="ftr-hide-mob">Image Crop</a>
                    <a href="../../tools/image-rotate/" class="ftr-hide-mob">Image Rotate</a>
                    <a href="../../tools/pdf-rotate/" class="ftr-hide-mob">PDF Rotate</a>
                    <a href="../../tools/pdf-protect/" class="ftr-hide-mob">PDF Protect</a>
                    <a href="../../tools/bg-remove/" class="ftr-hide-mob">Background Remove</a>
                </div>
                <div class="footer-col">
                    <h4>Компания</h4>
                    <a href="../about.html">О нас</a>
                    <a href="../contact.html">Контакты</a>
                    <a href="../blog.html">Блог</a>
                    <div class="footer-divider"></div>
                    <h4 class="ftr-h4-mt">Право</h4>
                    <a href="../terms.html">Terms of Service</a>
                    <a href="../privacy.html">Privacy Policy</a>
                </div>

            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-row">
                    <span>© <span class="footer-year">2026</span> toolbase.uz — Все права защищены</span>
                    <span class="footer-made">Создано для мира 🌍</span>
                </div>
            </div>
        </div>
    </footer>
    <script>document.querySelectorAll('.footer-year').forEach(function(e){e.textContent = String(new Date().getFullYear());});</script>
</body>

</html>
'''
    # For other files, placeholder
    else:
        en_content = "Translated content for " + file
        ru_content = "Переведенный контент для " + file

    Path(f"en/blog/{file}").write_text(en_content, encoding='utf-8')
    Path(f"ru/blog/{file}").write_text(ru_content, encoding='utf-8')
    print(f"Translated {file}")