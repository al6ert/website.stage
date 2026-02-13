// Selector de idiomas con navegación SSR para Jekyll multiidioma
(function() {
  'use strict';

  const languages = {
    'es': 'Español',
    'ca': 'Català',
    'en': 'English'
  };

  function init() {
    const currentLang = getCurrentLanguageFromURL() || localStorage.getItem('language') || 'es';
    updateDisplay(currentLang);
    setupEventListeners();
  }

  function getCurrentLanguageFromURL() {
    const path = window.location.pathname;
    if (path.startsWith('/en/')) return 'en';
    if (path.startsWith('/ca/')) return 'ca';
    return 'es';
  }

  function updateDisplay(lang) {
    const currentFlag = document.getElementById('current-flag');
    const currentLangText = document.getElementById('current-lang');
    
    if (currentFlag) {
      currentFlag.src = `/assets/images/languages/${lang}.svg`;
      currentFlag.alt = languages[lang];
    }
    if (currentLangText) currentLangText.textContent = languages[lang];
  }

  function navigateToLanguage(lang) {
    // Verificar si ya estamos en el idioma seleccionado
    const currentLang = getCurrentLanguageFromURL();
    if (currentLang === lang) {
      // Ya estamos en el idioma seleccionado, no hacer nada
      return;
    }

    // Guardar preferencia en localStorage
    localStorage.setItem('language', lang);

    // Intentar leer el mapa de permalinks de la página actual
    const permalinkMapElement = document.getElementById('permalink-map');
    let targetURL;

    if (permalinkMapElement) {
      try {
        const permalinkMap = JSON.parse(permalinkMapElement.textContent);
        if (permalinkMap && permalinkMap[lang]) {
          targetURL = permalinkMap[lang];
        }
      } catch (e) {
        console.warn('Error parsing permalink map:', e);
      }
    }

    // Si no hay mapa específico, usar fallback por prefijo
    if (!targetURL) {
      targetURL = generateFallbackURL(lang);
    }

    // En desarrollo, verificar si la URL existe antes de navegar
    if (isDevelopment()) {
      checkURLAndNavigate(targetURL, lang);
    } else {
      // En producción, navegar directamente
      window.location.href = targetURL;
    }
  }

  function isDevelopment() {
    return window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  }

  function checkURLAndNavigate(targetURL, lang) {
    fetch(targetURL, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          window.location.href = targetURL;
        } else {
          // En desarrollo, si la URL no existe, actualizar solo la UI
          console.warn(`URL ${targetURL} not available in development mode`);
          updateDisplay(lang);
        }
      })
      .catch(() => {
        // Si hay error, asumir que no existe y actualizar solo la UI
        console.warn(`Cannot access ${targetURL} in development mode`);
        updateDisplay(lang);
      });
  }

  function generateFallbackURL(lang) {
    let pathname = window.location.pathname;
    
    // Normalizar pathname eliminando prefijos de idioma existentes
    const cleanPath = pathname.replace(/^\/(en|ca)/, '') || '/';
    
    // Generar nueva URL según el idioma
    switch (lang) {
      case 'es':
        return cleanPath === '/' ? '/' : cleanPath;
      case 'en':
        return '/en' + (cleanPath === '/' ? '/' : cleanPath);
      case 'ca':
        return '/ca' + (cleanPath === '/' ? '/' : cleanPath);
      default:
        return cleanPath;
    }
  }

  function setupEventListeners() {
    document.querySelectorAll('.language-option').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.dataset.lang;
        
        if (languages[lang]) {
          navigateToLanguage(lang);
        }
      });
    });
  }

  // API pública para otros scripts
  window.PersualiaPlusI18n = {
    getCurrentLanguage: getCurrentLanguageFromURL,
    
    setLanguage: (lang) => {
      if (languages[lang]) {
        navigateToLanguage(lang);
      }
    },

    generateFallbackURL: generateFallbackURL,
    
    isDevelopment: isDevelopment
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
