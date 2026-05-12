function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const header = document.querySelector('.site-header');
  const megaMenu = document.getElementById('megaMenu');
  if (!menuToggle || !header) return;
  menuToggle.addEventListener('click', () => {
    header.classList.toggle('active');
    megaMenu?.classList.toggle('visible');
  });
}
function initLanguageSwitcher() {
  const button = document.getElementById('langButton');
  const menu = document.getElementById('langMenu');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('visible');
  });
  menu.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      const lang = item.getAttribute('data-lang');
      if (!lang) return;
      const currentPath = window.location.pathname.replace(/^\/(en|ru|uz)/, '');
      const target = `/${lang}${currentPath}`;
      localStorage.setItem('tb_lang', lang);
      window.location.href = target;
    });
  });
}
function initSearch() {
  const input = document.getElementById('siteSearch');
  if (!input) return;
  input.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const value = input.value.trim();
    if (!value) return;
    const lang = document.documentElement.lang || 'en';
    const query = encodeURIComponent(value);
    window.location.href = `/${lang}/tools/?q=${query}`;
  });
}
function init() {
  initMobileMenu();
  initLanguageSwitcher();
  initSearch();
}
window.addEventListener('components:header-loaded', init);
window.addEventListener('DOMContentLoaded', () => {
  initSearch();
});
