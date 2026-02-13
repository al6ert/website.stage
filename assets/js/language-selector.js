// Selector de idiomas con navegación SSR para Jekyll multiidioma
(function() {
  'use strict';

  const languages = {
    es: 'Español',
    ca: 'Català',
    en: 'English'
  };
  const siteRoot = detectSiteRoot();

  function init() {
    const currentLang = getCurrentLanguageFromURL() || localStorage.getItem('language') || 'es';
    updateDisplay(currentLang);
    setupEventListeners();
  }

  function detectSiteRoot() {
    const marker = '/assets/images/languages/';
    const currentFlag = document.getElementById('current-flag');
    const flagSrc = currentFlag && currentFlag.getAttribute('src');
    if (flagSrc && flagSrc.includes(marker)) {
      return normalizeRoot(flagSrc.split(marker)[0] || '');
    }

    const scriptSrc = Array.from(document.scripts)
      .map((script) => script.getAttribute('src'))
      .find((src) => src && src.includes('/assets/js/language-selector.js'));
    if (scriptSrc) {
      const scriptMarker = '/assets/js/language-selector.js';
      return normalizeRoot(scriptSrc.split(scriptMarker)[0] || '');
    }

    return '';
  }

  function normalizeRoot(root) {
    if (!root || root === '/') return '';
    const normalized = root.startsWith('/') ? root : `/${root}`;
    return normalized.replace(/\/+$/, '');
  }

  function stripSiteRoot(pathname) {
    const safePath = pathname || '/';
    if (!siteRoot) return safePath;
    if (safePath === siteRoot) return '/';
    if (safePath.startsWith(`${siteRoot}/`)) {
      return safePath.slice(siteRoot.length) || '/';
    }
    return safePath;
  }

  function withSiteRoot(pathname) {
    const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    if (!siteRoot) return safePath;
    if (safePath === '/') return `${siteRoot}/`;
    if (safePath.startsWith(`${siteRoot}/`)) return safePath;
    return `${siteRoot}${safePath}`;
  }

  function getCurrentLanguageFromURL() {
    const path = stripSiteRoot(window.location.pathname);
    if (path.startsWith('/en/') || path === '/en') return 'en';
    if (path.startsWith('/ca/') || path === '/ca') return 'ca';
    return 'es';
  }

  function updateDisplay(lang) {
    const currentFlag = document.getElementById('current-flag');
    const currentLangText = document.getElementById('current-lang');

    if (currentFlag) {
      currentFlag.src = withSiteRoot(`/assets/images/languages/${lang}.svg`);
      currentFlag.alt = languages[lang];
    }
    if (currentLangText) currentLangText.textContent = languages[lang];
  }

  function normalizeTargetURL(targetURL) {
    if (!targetURL) return withSiteRoot('/');
    if (/^https?:\/\//i.test(targetURL)) return targetURL;
    return withSiteRoot(targetURL);
  }

  function navigateToLanguage(lang) {
    const currentLang = getCurrentLanguageFromURL();
    if (currentLang === lang) return;

    localStorage.setItem('language', lang);

    const permalinkMapElement = document.getElementById('permalink-map');
    let targetURL;

    if (permalinkMapElement) {
      try {
        const permalinkMap = JSON.parse(permalinkMapElement.textContent);
        if (permalinkMap && permalinkMap[lang]) {
          targetURL = normalizeTargetURL(permalinkMap[lang]);
        }
      } catch (e) {
        console.warn('Error parsing permalink map:', e);
      }
    }

    if (!targetURL) targetURL = generateFallbackURL(lang);

    if (isDevelopment()) {
      checkURLAndNavigate(targetURL, lang);
    } else {
      window.location.href = targetURL;
    }
  }

  function isDevelopment() {
    return window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  }

  function checkURLAndNavigate(targetURL, lang) {
    fetch(targetURL, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          window.location.href = targetURL;
        } else {
          console.warn(`URL ${targetURL} not available in development mode`);
          updateDisplay(lang);
        }
      })
      .catch(() => {
        console.warn(`Cannot access ${targetURL} in development mode`);
        updateDisplay(lang);
      });
  }

  function generateFallbackURL(lang) {
    const pathname = stripSiteRoot(window.location.pathname);
    const cleanPath = pathname.replace(/^\/(en|ca)(\/|$)/, '/') || '/';

    switch (lang) {
      case 'es':
        return withSiteRoot(cleanPath === '/' ? '/' : cleanPath);
      case 'en':
        return withSiteRoot('/en' + (cleanPath === '/' ? '/' : cleanPath));
      case 'ca':
        return withSiteRoot('/ca' + (cleanPath === '/' ? '/' : cleanPath));
      default:
        return withSiteRoot(cleanPath);
    }
  }

  function setupEventListeners() {
    document.querySelectorAll('.language-option').forEach((button) => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.dataset.lang;
        if (languages[lang]) navigateToLanguage(lang);
      });
    });
  }

  window.PersualiaPlusI18n = {
    getCurrentLanguage: getCurrentLanguageFromURL,
    setLanguage: (lang) => {
      if (languages[lang]) navigateToLanguage(lang);
    },
    generateFallbackURL: generateFallbackURL,
    isDevelopment: isDevelopment
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
