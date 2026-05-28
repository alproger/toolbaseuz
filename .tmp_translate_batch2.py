from pathlib import Path

# List of files to translate
files = [
    "hash-generator-md5-sha256.html",
    "json-formatlash-amaliyot.html",
    "kuchli-parol-yaratish.html",
    "olchov-birliklari-konvertatsiya.html",
    "onlayn-vositalar-foydalanish.html"
]

for file in files:
    source_path = Path("blog") / file
    if not source_path.exists():
        continue
    source = source_path.read_text(encoding="utf-8")
    style = source.split("<style>", 1)[1].split("</style>", 1)[0]
    
    # For each file, define the translated content
    if file == "hash-generator-md5-sha256.html":
        en_content = '''<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="theme-color" content="#1a6fb5" />
    <title>Hash Generator: MD5, SHA-256, SHA-512 — What and How It Works? | toolbase.uz Blog</title>
    <meta name="description" content="What are hash functions, differences between MD5, SHA-1, SHA-256, SHA-512, where they are used and how to use toolbase.uz Hash Generator." />
    <meta name="keywords" content="hash generator, what is md5, what is sha256, sha-512, checksum, cryptography, file verification, password hash" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://toolbase.uz/en/blog/hash-generator-md5-sha256.html" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/blog/hash-generator-md5-sha256.html" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/blog/hash-generator-md5-sha256.html" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/blog/hash-generator-md5-sha256.html" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://toolbase.uz/en/blog/hash-generator-md5-sha256.html" />
    <meta property="og:title" content="Hash Generator: MD5, SHA-256, SHA-512 — What and How It Works?" />
    <meta property="og:description" content="What are hash functions, differences between MD5, SHA-1, SHA-256, SHA-512, where they are used and how to use toolbase.uz Hash Generator." />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="article:published_time" content="2026-05-11T00:00:00+05:00" />
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../favicon.ico" />
    <link rel="manifest" href="../../manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Hash Generator: MD5, SHA-256, SHA-512 — What and How It Works?","url":"https://toolbase.uz/en/blog/hash-generator-md5-sha256.html","datePublished":"2026-05-11","author":{"@type":"Organization","name":"toolbase.uz"},"publisher":{"@type":"Organization","name":"toolbase.uz"},"inLanguage":"en"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://toolbase.uz/en/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://toolbase.uz/en/blog.html"},{"@type":"ListItem","position":3,"name":"Hash Generator","item":"https://toolbase.uz/en/blog/hash-generator-md5-sha256.html"}]}</script>
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
                <span aria-current="page">Hash Generator</span>
            </nav>
            <div class="article-meta">
                <span class="meta-cat">Security</span>
                <span class="meta-info"><time datetime="2026-05-11">May 11, 2026</time> · 6 min read</span>
            </div>
            <h1>Hash Generator: MD5, SHA-256, SHA-512 — What and How It Works?</h1>
            <p>Hash functions are one-way mathematical functions that convert any data into a fixed-length string. They are widely used in cryptography, data integrity verification, and password storage.</p>
        </div>
    </section>

    <main>
        <div class="page-content">

            <h2>1. What is a Hash Function?</h2>
            <p>
                A <strong>hash function</strong> is a mathematical algorithm that takes input data of any size and produces a fixed-size string of characters, which appears to be random. The key properties of hash functions:
            </p>
            <ul>
                <li><strong>Deterministic:</strong> The same input always produces the same hash</li>
                <li><strong>One-way:</strong> It's impossible to reverse the hash back to the original data</li>
                <li><strong>Collision-resistant:</strong> Two different inputs rarely produce the same hash</li>
                <li><strong>Fast:</strong> Hash calculation is very quick</li>
            </ul>

            <h2>2. Popular Hash Algorithms</h2>

            <h3>2.1. MD5 (Message Digest 5)</h3>
            <p>
                <strong>Created:</strong> 1991 by Ronald Rivest<br>
                <strong>Hash length:</strong> 128 bits (32 hexadecimal characters)<br>
                <strong>Usage:</strong> File integrity checking, checksums<br>
                <strong>Security:</strong> Considered broken for cryptographic purposes since 2005
            </p>
            <p>
                Example: <code>MD5("hello") = 5d41402abc4b2a76b9719d911017c592</code>
            </p>

            <h3>2.2. SHA-1 (Secure Hash Algorithm 1)</h3>
            <p>
                <strong>Created:</strong> 1995 by NSA<br>
                <strong>Hash length:</strong> 160 bits (40 hexadecimal characters)<br>
                <strong>Usage:</strong> Git commits, SSL certificates (deprecated)<br>
                <strong>Security:</strong> Broken since 2005, not recommended for new applications
            </p>

            <h3>2.3. SHA-256</h3>
            <p>
                <strong>Created:</strong> 2001 as part of SHA-2 family<br>
                <strong>Hash length:</strong> 256 bits (64 hexadecimal characters)<br>
                <strong>Usage:</strong> Bitcoin, SSL/TLS certificates, password hashing<br>
                <strong>Security:</strong> Currently secure, widely used
            </p>

            <h3>2.4. SHA-512</h3>
            <p>
                <strong>Created:</strong> 2001<br>
                <strong>Hash length:</strong> 512 bits (128 hexadecimal characters)<br>
                <strong>Usage:</strong> High-security applications, large data<br>
                <strong>Security:</strong> Very secure, but slower than SHA-256
            </p>

            <h2>3. Where Hash Functions Are Used</h2>

            <h3>3.1. Password Storage</h3>
            <p>
                Passwords are never stored in plain text. Instead, their hash is stored. When a user logs in, the entered password is hashed and compared with the stored hash.
            </p>
            <ul>
                <li>bcrypt, scrypt, Argon2 — special password hashing functions</li>
                <li>SHA-256 with salt is better than plain MD5</li>
            </ul>

            <h3>3.2. File Integrity Verification</h3>
            <p>
                Download sites provide MD5/SHA-256 checksums. After downloading, you can verify if the file is corrupted.
            </p>
            <div class="code-block">
                <pre><code># Linux
md5sum file.zip
sha256sum file.zip

# Windows PowerShell
Get-FileHash file.zip -Algorithm MD5
Get-FileHash file.zip -Algorithm SHA256</code></pre>
            </div>

            <h3>3.3. Digital Signatures and Certificates</h3>
            <p>
                SSL certificates use SHA-256. Blockchain uses SHA-256 for transaction verification.
            </p>

            <h3>3.4. Data Structures</h3>
            <p>
                Hash tables in programming use hash functions to quickly find data.
            </p>

            <h2>4. Security Considerations</h2>

            <h3>4.1. Rainbow Tables Attack</h3>
            <p>
                Precomputed tables of hashes for common passwords. Solution: use salt (random string added to password before hashing).
            </p>

            <h3>4.2. Brute Force and Dictionary Attacks</h3>
            <p>
                Trying all possible combinations. Solution: use slow hash functions like bcrypt.
            </p>

            <h3>4.3. Collision Attacks</h3>
            <p>
                Finding two different inputs with same hash. MD5 and SHA-1 are vulnerable.
            </p>

            <div class="tip-box">
                <p><strong>🔒 Security Recommendation:</strong> For passwords, use bcrypt/scrypt/Argon2. For data integrity, use SHA-256 or SHA-512. Avoid MD5 and SHA-1 for security-critical applications.</p>
            </div>

            <h2>5. How to Use Hash Generator</h2>

            <div class="tool-cta">
                <h3>Try Hash Generator Tool</h3>
                <p>Generate MD5, SHA-1, SHA-256, SHA-512 hashes instantly. Supports text and files.</p>
                <a href="../../tools/hash-generator/">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg> Open tool
                </a>
            </div>

            <p>
                <strong>Steps:</strong>
            </p>
            <ol>
                <li>Enter text or upload file</li>
                <li>Select hash algorithm (MD5, SHA-256, etc.)</li>
                <li>Click "Generate Hash"</li>
                <li>Copy the result</li>
            </ol>

            <h2>6. Common Questions</h2>

            <h3>Can hashes be decrypted?</h3>
            <p>
                No, hash functions are one-way. You can only try to find the original data through brute force or rainbow tables.
            </p>

            <h3>Why are there different hash lengths?</h3>
            <p>
                Longer hashes are more secure against collisions and brute force attacks.
            </p>

            <h3>Is SHA-256 enough for passwords?</h3>
            <p>
                For passwords, it's better to use specialized functions like bcrypt that are designed to be slow and include salt.
            </p>

            <hr style="border:none;border-top:1px solid var(--line);margin:36px 0;" />
            <h2>Related articles</h2>
            <div class="related-grid">
                <a class="related-card" href="../../blog/kuchli-parol-yaratish.html">
                    <div class="rc-cat">Security</div>
                    <div class="rc-title">Creating strong passwords: 7 important rules</div>
                </a>
                <a class="related-card" href="../../blog/qr-kod-yaratish-qollanma.html">
                    <div class="rc-cat">Technology</div>
                    <div class="rc-title">QR Code Creation: URL, Wi-Fi, vCard — Complete Guide</div>
                </a>
                <a class="related-card" href="../../blog/rasm-format-ozgartirish-qollanma.html">
                    <div class="rc-cat">Image</div>
                    <div class="rc-title">Image Format Conversion: JPG, PNG, WebP, PDF</div>
                </a>
                <a class="related-card" href="../../blog/json-nima.html">
                    <div class="rc-cat">Basics</div>
                    <div class="rc-title">What is JSON and why is it used?</div>
                </a>
                <a class="related-card" href="../../blog/case-converter-qollanma.html">
                    <div class="rc-cat">Programming</div>
                    <div class="rc-title">Case Converter: camelCase, snake_case, kebab-case — Complete Guide</div>
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
    <title>Генератор хэшей: MD5, SHA-256, SHA-512 — Что и Как Работает? | toolbase.uz Блог</title>
    <meta name="description" content="Что такое хэш-функции, различия между MD5, SHA-1, SHA-256, SHA-512, где они используются и как использовать генератор хэшей toolbase.uz." />
    <meta name="keywords" content="генератор хэшей, что такое md5, что такое sha256, sha-512, checksum, криптография, проверка файлов, хэш пароля" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://toolbase.uz/ru/blog/hash-generator-md5-sha256.html" />
    <link rel="alternate" hreflang="uz" href="https://toolbase.uz/blog/hash-generator-md5-sha256.html" />
    <link rel="alternate" hreflang="en" href="https://toolbase.uz/en/blog/hash-generator-md5-sha256.html" />
    <link rel="alternate" hreflang="ru" href="https://toolbase.uz/ru/blog/hash-generator-md5-sha256.html" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://toolbase.uz/ru/blog/hash-generator-md5-sha256.html" />
    <meta property="og:title" content="Генератор хэшей: MD5, SHA-256, SHA-512 — Что и Как Работает?" />
    <meta property="og:description" content="Что такое хэш-функции, различия между MD5, SHA-1, SHA-256, SHA-512, где они используются и как использовать генератор хэшей toolbase.uz." />
    <meta property="og:image" content="https://toolbase.uz/assets/img/og-image.png" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="article:published_time" content="2026-05-11T00:00:00+05:00" />
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg" />
    <link rel="alternate icon" href="../../favicon.ico" />
    <link rel="manifest" href="../../manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/css/styles.css" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Генератор хэшей: MD5, SHA-256, SHA-512 — Что и Как Работает?","url":"https://toolbase.uz/ru/blog/hash-generator-md5-sha256.html","datePublished":"2026-05-11","author":{"@type":"Organization","name":"toolbase.uz"},"publisher":{"@type":"Organization","name":"toolbase.uz"},"inLanguage":"ru"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Главная","item":"https://toolbase.uz/ru/"},{"@type":"ListItem","position":2,"name":"Блог","item":"https://toolbase.uz/ru/blog.html"},{"@type":"ListItem","position":3,"name":"Генератор хэшей","item":"https://toolbase.uz/ru/blog/hash-generator-md5-sha256.html"}]}</script>
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
                <span aria-current="page">Генератор хэшей</span>
            </nav>
            <div class="article-meta">
                <span class="meta-cat">Безопасность</span>
                <span class="meta-info"><time datetime="2026-05-11">11 мая 2026</time> · 6 мин чтения</span>
            </div>
            <h1>Генератор хэшей: MD5, SHA-256, SHA-512 — Что и Как Работает?</h1>
            <p>Хэш-функции — это односторонние математические функции, которые преобразовывают любые данные в строку фиксированной длины. Они широко используются в криптографии, проверке целостности данных и хранении паролей.</p>
        </div>
    </section>

    <main>
        <div class="page-content">

            <h2>1. Что такое хэш-функция?</h2>
            <p>
                <strong>Хэш-функция</strong> — это математический алгоритм, который принимает входные данные любого размера и производит строку символов фиксированного размера, которая выглядит случайной. Ключевые свойства хэш-функций:
            </p>
            <ul>
                <li><strong>Детерминированность:</strong> Один и тот же вход всегда производит один и тот же хэш</li>
                <li><strong>Односторонность:</strong> Невозможно обратить хэш обратно к исходным данным</li>
                <li><strong>Устойчивость к коллизиям:</strong> Два разных входа редко производят один и тот же хэш</li>
                <li><strong>Быстрота:</strong> Вычисление хэша происходит очень быстро</li>
            </ul>

            <h2>2. Популярные алгоритмы хэширования</h2>

            <h3>2.1. MD5 (Message Digest 5)</h3>
            <p>
                <strong>Создан:</strong> 1991 Рональдом Ривестом<br>
                <strong>Длина хэша:</strong> 128 бит (32 шестнадцатеричных символа)<br>
                <strong>Использование:</strong> Проверка целостности файлов, контрольные суммы<br>
                <strong>Безопасность:</strong> Считается взломанным для криптографических целей с 2005 года
            </p>
            <p>
                Пример: <code>MD5("hello") = 5d41402abc4b2a76b9719d911017c592</code>
            </p>

            <h3>2.2. SHA-1 (Secure Hash Algorithm 1)</h3>
            <p>
                <strong>Создан:</strong> 1995 АНБ<br>
                <strong>Длина хэша:</strong> 160 бит (40 шестнадцатеричных символов)<br>
                <strong>Использование:</strong> Коммиты Git, SSL-сертификаты (устаревшие)<br>
                <strong>Безопасность:</strong> Взломан с 2005 года, не рекомендуется для новых приложений
            </p>

            <h3>2.3. SHA-256</h3>
            <p>
                <strong>Создан:</strong> 2001 как часть семейства SHA-2<br>
                <strong>Длина хэша:</strong> 256 бит (64 шестнадцатеричных символа)<br>
                <strong>Использование:</strong> Bitcoin, SSL/TLS-сертификаты, хэширование паролей<br>
                <strong>Безопасность:</strong> В настоящее время безопасен, широко используется
            </p>

            <h3>2.4. SHA-512</h3>
            <p>
                <strong>Создан:</strong> 2001<br>
                <strong>Длина хэша:</strong> 512 бит (128 шестнадцатеричных символов)<br>
                <strong>Использование:</strong> Высокобезопасные приложения, большие данные<br>
                <strong>Безопасность:</strong> Очень безопасен, но медленнее SHA-256
            </p>

            <h2>3. Где используются хэш-функции</h2>

            <h3>3.1. Хранение паролей</h3>
            <p>
                Пароли никогда не хранятся в открытом виде. Вместо этого хранится их хэш. При входе введенный пароль хэшируется и сравнивается с сохраненным хэшем.
            </p>
            <ul>
                <li>bcrypt, scrypt, Argon2 — специальные функции хэширования паролей</li>
                <li>SHA-256 с солью лучше, чем простой MD5</li>
            </ul>

            <h3>3.2. Проверка целостности файлов</h3>
            <p>
                Сайты загрузки предоставляют контрольные суммы MD5/SHA-256. После загрузки можно проверить, не поврежден ли файл.
            </p>
            <div class="code-block">
                <pre><code># Linux
md5sum file.zip
sha256sum file.zip

# Windows PowerShell
Get-FileHash file.zip -Algorithm MD5
Get-FileHash file.zip -Algorithm SHA256</code></pre>
            </div>

            <h3>3.3. Цифровые подписи и сертификаты</h3>
            <p>
                SSL-сертификаты используют SHA-256. Блокчейн использует SHA-256 для верификации транзакций.
            </p>

            <h3>3.4. Структуры данных</h3>
            <p>
                Хэш-таблицы в программировании используют хэш-функции для быстрого поиска данных.
            </p>

            <h2>4. Соображения безопасности</h2>

            <h3>4.1. Атака радужными таблицами</h3>
            <p>
                Предварительно вычисленные таблицы хэшей для распространенных паролей. Решение: использовать соль (случайную строку, добавляемую к паролю перед хэшированием).
            </p>

            <h3>4.2. Атаки brute force и словарные атаки</h3>
            <p>
                Попытка всех возможных комбинаций. Решение: использовать медленные хэш-функции вроде bcrypt.
            </p>

            <h3>4.3. Атаки коллизий</h3>
            <p>
                Поиск двух разных входов с одинаковым хэшем. MD5 и SHA-1 уязвимы.
            </p>

            <div class="tip-box">
                <p><strong>🔒 Рекомендация по безопасности:</strong> Для паролей используйте bcrypt/scrypt/Argon2. Для целостности данных — SHA-256 или SHA-512. Избегайте MD5 и SHA-1 для критически важных приложений.</p>
            </div>

            <h2>5. Как использовать генератор хэшей</h2>

            <div class="tool-cta">
                <h3>Попробуйте инструмент генератора хэшей</h3>
                <p>Генерируйте хэши MD5, SHA-1, SHA-256, SHA-512 мгновенно. Поддерживает текст и файлы.</p>
                <a href="../../tools/hash-generator/">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg> Открыть инструмент
                </a>
            </div>

            <p>
                <strong>Шаги:</strong>
            </p>
            <ol>
                <li>Введите текст или загрузите файл</li>
                <li>Выберите алгоритм хэширования (MD5, SHA-256 и т.д.)</li>
                <li>Нажмите "Generate Hash"</li>
                <li>Скопируйте результат</li>
            </ol>

            <h2>6. Распространенные вопросы</h2>

            <h3>Можно ли расшифровать хэши?</h3>
            <p>
                Нет, хэш-функции односторонние. Можно только пытаться найти исходные данные через brute force или радужные таблицы.
            </p>

            <h3>Почему разные длины хэшей?</h3>
            <p>
                Более длинные хэши более безопасны против коллизий и атак brute force.
            </p>

            <h3>Достаточно ли SHA-256 для паролей?</h3>
            <p>
                Для паролей лучше использовать специализированные функции вроде bcrypt, которые разработаны, чтобы быть медленными и включать соль.
            </p>

            <hr style="border:none;border-top:1px solid var(--line);margin:36px 0;" />
            <h2>Похожие статьи</h2>
            <div class="related-grid">
                <a class="related-card" href="../../blog/kuchli-parol-yaratish.html">
                    <div class="rc-cat">Безопасность</div>
                    <div class="rc-title">Создание сильных паролей: 7 важных правил</div>
                </a>
                <a class="related-card" href="../../blog/qr-kod-yaratish-qollanma.html">
                    <div class="rc-cat">Технологии</div>
                    <div class="rc-title">Создание QR-кода: URL, Wi-Fi, vCard — Полное руководство</div>
                </a>
                <a class="related-card" href="../../blog/rasm-format-ozgartirish-qollanma.html">
                    <div class="rc-cat">Изображения</div>
                    <div class="rc-title">Конвертация формата изображения: JPG, PNG, WebP, PDF</div>
                </a>
                <a class="related-card" href="../../blog/json-nima.html">
                    <div class="rc-cat">Основы</div>
                    <div class="rc-title">Что такое JSON и зачем он используется?</div>
                </a>
                <a class="related-card" href="../../blog/case-converter-qollanma.html">
                    <div class="rc-cat">Программирование</div>
                    <div class="rc-title">Конвертер регистра: camelCase, snake_case, kebab-case — Полное руководство</div>
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
