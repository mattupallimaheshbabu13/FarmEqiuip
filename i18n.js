/**
 * FarmEquip Multilingual i18n Manager
 * Supports English (en) and Telugu (te) with pluggable JSON resource architecture
 */

class I18nManager {
  constructor() {
    this.currentLocale = localStorage.getItem('farmequip_lang') || 'en';
    this.translations = {};
    this.loaded = false;
  }

  async init() {
    try {
      await this.loadLocale(this.currentLocale);
      this.applyTranslations();
      this.updateLanguageUI();
    } catch (e) {
      console.warn('I18n initialization fallback:', e);
    }
  }

  async loadLocale(lang) {
    const localeMap = { en: 'english', te: 'telugu', hi: 'hindi' };
    const fileName = localeMap[lang] || lang;

    try {
      const response = await fetch(`/assets/locales/${fileName}.json`);
      if (!response.ok) {
        // Try relative path if accessed directly from file:// or pages/
        const fallbackRes = await fetch(`../assets/locales/${fileName}.json`);
        if (fallbackRes.ok) {
          this.translations = await fallbackRes.json();
          this.currentLocale = lang;
          this.loaded = true;
          return;
        }
      } else {
        this.translations = await response.json();
        this.currentLocale = lang;
        this.loaded = true;
        return;
      }
    } catch (err) {
      console.warn(`Could not load locale ${lang}, falling back to defaults`, err);
    }
  }

  async setLanguage(lang) {
    if (lang === this.currentLocale && this.loaded) return;
    await this.loadLocale(lang);
    this.currentLocale = lang;
    localStorage.setItem('farmequip_lang', lang);
    document.documentElement.lang = lang;
    if (lang === 'te') {
      document.body.classList.add('lang-te');
    } else {
      document.body.classList.remove('lang-te');
    }
    this.applyTranslations();
    this.updateLanguageUI();
    // Dispatch custom event for dynamic components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  t(key, defaultVal = '') {
    return this.translations[key] || defaultVal || key;
  }

  applyTranslations() {
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[key]) {
        el.textContent = this.translations[key];
      }
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (this.translations[key]) {
        el.setAttribute('placeholder', this.translations[key]);
      }
    });

    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (this.translations[key]) {
        el.setAttribute('title', this.translations[key]);
      }
    });
  }

  updateLanguageUI() {
    const currentLabel = document.getElementById('currentLangLabel');
    if (currentLabel) {
      currentLabel.textContent = this.currentLocale === 'te' ? 'తెలుగు' : 'English';
    }
    document.querySelectorAll('.lang-option').forEach((opt) => {
      if (opt.getAttribute('data-lang') === this.currentLocale) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }
}

// Global singleton instance
window.i18n = new I18nManager();
document.addEventListener('DOMContentLoaded', () => {
  window.i18n.init();
});
