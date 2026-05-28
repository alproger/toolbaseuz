#!/usr/bin/env python3
"""Generate comprehensive sitemap.xml with all translations."""

from pathlib import Path
from datetime import datetime

def generate_sitemap():
    """Generate sitemap.xml with all pages."""
    root = Path('.')
    
    # Base URL
    base_url = "https://toolbase.uz"
    today = datetime.now().strftime("%Y-%m-%d")
    
    urls = []
    
    # 1. Root pages (Uzbek)
    root_pages_uz = [
        ("", "1.0", "weekly"),
        ("index.html", "1.0", "daily"),
        ("about.html", "0.8", "monthly"),
        ("blog.html", "0.9", "daily"),
        ("contact.html", "0.6", "monthly"),
        ("privacy.html", "0.5", "monthly"),
        ("terms.html", "0.5", "monthly"),
    ]
    
    for page, priority, freq in root_pages_uz:
        urls.append({
            'loc': f"{base_url}/{page}",
            'lastmod': today,
            'changefreq': freq,
            'priority': priority
        })
    
    # 2. Root pages (English)
    root_pages_en = [
        ("en/", "0.9", "daily"),
        ("en/index.html", "0.9", "daily"),
        ("en/about.html", "0.7", "monthly"),
        ("en/blog.html", "0.85", "daily"),
        ("en/contact.html", "0.5", "monthly"),
        ("en/privacy.html", "0.4", "monthly"),
        ("en/terms.html", "0.4", "monthly"),
    ]
    
    for page, priority, freq in root_pages_en:
        urls.append({
            'loc': f"{base_url}/{page}",
            'lastmod': today,
            'changefreq': freq,
            'priority': priority
        })
    
    # 3. Root pages (Russian)
    root_pages_ru = [
        ("ru/", "0.9", "daily"),
        ("ru/index.html", "0.9", "daily"),
        ("ru/about.html", "0.7", "monthly"),
        ("ru/blog.html", "0.85", "daily"),
        ("ru/contact.html", "0.5", "monthly"),
        ("ru/privacy.html", "0.4", "monthly"),
        ("ru/terms.html", "0.4", "monthly"),
    ]
    
    for page, priority, freq in root_pages_ru:
        urls.append({
            'loc': f"{base_url}/{page}",
            'lastmod': today,
            'changefreq': freq,
            'priority': priority
        })
    
    # 4. Tool pages (Uzbek)
    uz_tools_dir = root / 'tools'
    for tool_dir in sorted(uz_tools_dir.iterdir()):
        if tool_dir.is_dir() and (tool_dir / 'index.html').exists():
            tool_name = tool_dir.name
            urls.append({
                'loc': f"{base_url}/tools/{tool_name}/",
                'lastmod': today,
                'changefreq': 'monthly',
                'priority': '0.7'
            })
    
    # 5. Tool pages (English)
    en_tools_dir = root / 'en' / 'tools'
    for tool_dir in sorted(en_tools_dir.iterdir()):
        if tool_dir.is_dir() and (tool_dir / 'index.html').exists():
            tool_name = tool_dir.name
            urls.append({
                'loc': f"{base_url}/en/tools/{tool_name}/",
                'lastmod': today,
                'changefreq': 'monthly',
                'priority': '0.6'
            })
    
    # 6. Tool pages (Russian)
    ru_tools_dir = root / 'ru' / 'tools'
    for tool_dir in sorted(ru_tools_dir.iterdir()):
        if tool_dir.is_dir() and (tool_dir / 'index.html').exists():
            tool_name = tool_dir.name
            urls.append({
                'loc': f"{base_url}/ru/tools/{tool_name}/",
                'lastmod': today,
                'changefreq': 'monthly',
                'priority': '0.6'
            })
    
    # 7. Blog posts (Uzbek)
    uz_blog_dir = root / 'blog'
    for blog_file in sorted(uz_blog_dir.glob('*.html')):
        if blog_file.name != 'index.html':
            urls.append({
                'loc': f"{base_url}/blog/{blog_file.name}",
                'lastmod': today,
                'changefreq': 'never',
                'priority': '0.7'
            })
    
    # 8. Blog posts (English)
    en_blog_dir = root / 'en' / 'blog'
    for blog_file in sorted(en_blog_dir.glob('*.html')):
        if blog_file.name not in ('index.html', 'test-write.txt'):
            urls.append({
                'loc': f"{base_url}/en/blog/{blog_file.name}",
                'lastmod': today,
                'changefreq': 'never',
                'priority': '0.65'
            })
    
    # 9. Blog posts (Russian)
    ru_blog_dir = root / 'ru' / 'blog'
    for blog_file in sorted(ru_blog_dir.glob('*.html')):
        if blog_file.name not in ('index.html', 'test-write.txt'):
            urls.append({
                'loc': f"{base_url}/ru/blog/{blog_file.name}",
                'lastmod': today,
                'changefreq': 'never',
                'priority': '0.65'
            })
    
    # Generate XML
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml += '  <url>\n'
        xml += f'    <loc>{url["loc"]}</loc>\n'
        xml += f'    <lastmod>{url["lastmod"]}</lastmod>\n'
        xml += f'    <changefreq>{url["changefreq"]}</changefreq>\n'
        xml += f'    <priority>{url["priority"]}</priority>\n'
        xml += '  </url>\n'
    
    xml += '</urlset>\n'
    
    return xml

if __name__ == '__main__':
    sitemap_content = generate_sitemap()
    Path('sitemap.xml').write_text(sitemap_content, encoding='utf-8')
    
    # Count URLs
    import re
    url_count = len(re.findall(r'<loc>', sitemap_content))
    print(f"✓ Sitemap generated: {url_count} URLs")
    print("  - Uzbek pages: ~33")
    print("  - English pages: ~31")
    print("  - Russian pages: ~31")
    print("  - Total: ~95 pages")
