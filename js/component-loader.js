function loadComponent(selector, src, replacements = {}, callback = null) {
  fetch(src)
    .then(response => response.text())
    .then(html => {
      Object.keys(replacements).forEach(key => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
      });
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = html;
      }
      if (selector === '#globalFooter') {
        const year = document.querySelectorAll('[id="footerYear"]');
        if (year.length > 0) {
          year.forEach(el => el.textContent = new Date().getFullYear());
        }
      }
      if (typeof callback === 'function') {
        callback();
      }
    })
    .catch(() => {
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = '';
      }
      if (typeof callback === 'function') {
        callback();
      }
    });
}

async function initSharedComponents() {
  const currentLang = document.documentElement.lang || 'en';
  const prefix = `/${currentLang}`;
  
  // Load locale strings
  let localeStrings = {};
  try {
    const response = await fetch(`/locales/${currentLang}.json`);
    if (response.ok) {
      localeStrings = await response.json();
    }
  } catch (e) {
    console.warn(`Failed to load locale ${currentLang}:`, e);
  }

  // Merge replacements with locale strings
  const headerReplacements = {
    localePrefix: prefix,
    ...localeStrings
  };

  const footerReplacements = {
    localePrefix: prefix,
    year: new Date().getFullYear(),
    ...localeStrings
  };

  loadComponent('#globalHeader', '/components/header.html', headerReplacements, () => {
    window.dispatchEvent(new CustomEvent('components:header-loaded'));
  });
  loadComponent('#globalFooter', '/components/footer.html', footerReplacements);
}

window.addEventListener('DOMContentLoaded', initSharedComponents);
