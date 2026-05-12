(function () {
  const supported = ['en', 'ru', 'uz'];
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get('lang');
  const stored = localStorage.getItem('tb_lang');
  const navLang = (navigator.language || navigator.userLanguage || 'en').slice(0, 2).toLowerCase();
  const target = explicit || stored || (supported.includes(navLang) ? navLang : 'en');
  localStorage.setItem('tb_lang', target);
  if (!window.location.pathname.startsWith(`/${target}/`)) {
    window.location.replace(`/${target}/`);
  }
})();
