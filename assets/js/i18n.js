const metaDesc = document.querySelector('meta[name="description"]');
const langToggle = document.getElementById('lang-toggle');
const _typewriters = new Map();
let currentLang = storage.get('lang') || 'pt-BR';

class Typewriter {
  constructor(el, { typeSpeed = 80, eraseSpeed = 45, pauseType = 2500, pauseErase = 400 } = {}) {
    this.el = el;
    this.typeSpeed = typeSpeed;
    this.eraseSpeed = eraseSpeed;
    this.pauseType = pauseType;
    this.pauseErase = pauseErase;
    this.current = '';
    this.target = '';
    this.tid = null;
  }

  setTarget(text) {
    this.target = text;
    if (prefersReducedMotion) {
      this.current = text;
      this.el.textContent = text;
    } else {
      this._type();
    }
  }

  updateTarget(text) {
    this.target = text;
    clearTimeout(this.tid);
    if (prefersReducedMotion) {
      this.current = text;
      this.el.textContent = text;
    } else {
      this._erase();
    }
  }

  _type() {
    if (this.current.length < this.target.length) {
      this.current = this.target.slice(0, this.current.length + 1);
      this.el.textContent = this.current;
      this.tid = setTimeout(() => this._type(), this.typeSpeed);
    } else {
      this.tid = setTimeout(() => this._erase(), this.pauseType);
    }
  }

  _erase() {
    if (this.current.length > 0) {
      this.current = this.current.slice(0, -1);
      this.el.textContent = this.current;
      this.tid = setTimeout(() => this._erase(), this.eraseSpeed);
    } else {
      this.tid = setTimeout(() => this._type(), this.pauseErase);
    }
  }
}

function initTypewriters() {
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const tw = new Typewriter(el);
    tw.setTarget(translations[currentLang]?.[el.dataset.typewriter] || '');
    _typewriters.set(el, tw);
  });
}

function applyLang(lang) {
  renderProjects(lang);
  renderExperience(lang);

  html.lang = lang;
  document.title = translations[lang]['page.title'];
  if (metaDesc) metaDesc.setAttribute('content', translations[lang]['page.description']);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = translations[lang][el.dataset.i18n];
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const [attr, key] = el.dataset.i18nAttr.split(':');
    const val = translations[lang][key];
    if (val !== undefined) el.setAttribute(attr, val);
  });

  langToggle?.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  document.querySelectorAll('.warning-tape__msg[data-tape-i18n]').forEach(el => {
    const val = translations[lang]?.[el.dataset.tapeI18n];
    if (val !== undefined) el.textContent = buildTapeText(val);
  });

  _typewriters.forEach((tw, el) => {
    const val = translations[lang]?.[el.dataset.typewriter];
    if (val !== undefined) tw.updateTarget(val);
  });

  storage.set('lang', lang);
  currentLang = lang;
}

function initLangToggle() {
  langToggle?.addEventListener('click', (e) => {
    const opt = e.target.closest('.lang-option');
    const next = opt?.dataset.lang ?? (currentLang === 'pt-BR' ? 'en-US' : 'pt-BR');
    if (next !== currentLang) applyLang(next);
  });
}
