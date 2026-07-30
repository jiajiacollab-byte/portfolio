(function () {
  var STORAGE_KEY = 'jiajia-lang';
  var SUPPORTED = ['en', 'de', 'zh'];
  var DEFAULT_LANG = 'en';
  var HTML_LANG_CODE = { en: 'en', de: 'de', zh: 'zh-Hant' };

  function basePath() {
    return location.pathname.indexOf('/projects/') !== -1 ? '../' : '';
  }

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.indexOf(stored) !== -1 ? stored : DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function applyTranslations(dict, lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] === undefined) return;
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr');
      spec.split(';').forEach(function (pair) {
        var parts = pair.split(':');
        var attr = parts[0];
        var key = parts[1];
        if (attr && key && dict[key] !== undefined) {
          el.setAttribute(attr, dict[key]);
        }
      });
    });

    var page = document.body.getAttribute('data-page');
    if (page) {
      var titleKey = 'meta.' + page + '.title';
      var descKey = 'meta.' + page + '.description';
      if (dict[titleKey]) document.title = dict[titleKey];
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict[descKey]) metaDesc.setAttribute('content', dict[descKey]);
    }

    document.documentElement.setAttribute('lang', HTML_LANG_CODE[lang] || 'en');

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  var cache = {};

  function loadAndApply(lang) {
    if (cache[lang]) {
      applyTranslations(cache[lang], lang);
      return;
    }
    fetch(basePath() + 'assets/i18n/' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (dict) {
        cache[lang] = dict;
        applyTranslations(dict, lang);
      })
      .catch(function (err) {
        console.error('i18n: failed to load', lang, err);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var lang = getLang();
    loadAndApply(lang);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        setLang(lang);
        loadAndApply(lang);
      });
    });
  });
})();
