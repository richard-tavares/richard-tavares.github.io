const html = document.documentElement;
const themeToggle = document.querySelector('.nav-theme-toggle');
const metaDesc = document.querySelector('meta[name="description"]');

if (localStorage.getItem('theme') === 'light') html.dataset.theme = 'light';

const langToggle = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('lang') || 'pt-BR';
const _typewriters = new Map();

function applyLang(lang) {
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

  localStorage.setItem('lang', lang);
  currentLang = lang;
}

langToggle?.addEventListener('click', (e) => {
  const opt = e.target.closest('.lang-option');
  if (opt) applyLang(opt.dataset.lang);
});

const prefersReducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

document.querySelectorAll('[data-typewriter]').forEach(el => {
  const tw = new Typewriter(el);
  tw.setTarget(translations[currentLang]?.[el.dataset.typewriter] || '');
  _typewriters.set(el, tw);
});

applyLang(currentLang);

class GlitchMatrix {
  constructor({
    canvas,
    fontSize = 16,
    cellWidth = 10,
    cellHeight = 20,
    glitchInterval = 33,
    colors,
characters = Array.from({ length: 94 }, (_, i) => String.fromCodePoint(i + 33)).join('')
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fontSize = fontSize;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.glitchInterval = glitchInterval;
    this.characters = characters.split('');
    this.colors = colors.map(h => this.hexToRgb(h));
    this.cells = [];
    this.lastTime = 0;
    this.lastGlitchTime = 0;
    this.animationFrame = null;
    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);
    this.init();
  }

  init() {
    this.resize();
    globalThis.addEventListener('resize', this.handleResize);
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.resize(), 100);
  }

  resize() {
    const dpr = globalThis.devicePixelRatio || 1;
    const { width, height } = this.canvas.parentElement.getBoundingClientRect();

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.columns = Math.ceil(width / this.cellWidth);
    this.rows = Math.ceil(height / this.cellHeight);
    this.createGrid();
  }

  createGrid() {
    this.cells.length = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const color = this.randomColor();
        this.cells.push({
          x: col * this.cellWidth,
          y: row * this.cellHeight,
          char: this.randomChar(),
          color: { ...color },
          startColor: { ...color },
          targetColor: this.randomColor(),
          progress: 1
        });
      }
    }
  }

  randomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  randomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(v => v + v).join('');
    return {
      r: Number.parseInt(hex.substring(0, 2), 16),
      g: Number.parseInt(hex.substring(2, 4), 16),
      b: Number.parseInt(hex.substring(4, 6), 16)
    };
  }

  setColors(colors) {
    this.colors = colors.map(h => this.hexToRgb(h));
    for (const cell of this.cells) {
      cell.startColor = { ...cell.color };
      cell.targetColor = this.randomColor();
      cell.progress = 0;
    }
  }

  update(delta) {
    if (performance.now() - this.lastGlitchTime >= this.glitchInterval) {
      const updates = Math.max(1, Math.floor(this.cells.length * 0.05));
      for (let i = 0; i < updates; i++) {
        const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
        cell.char = this.randomChar();
        cell.startColor = { ...cell.color };
        cell.targetColor = this.randomColor();
        cell.progress = 0;
      }
      this.lastGlitchTime = performance.now();
    }

    for (const cell of this.cells) {
      if (cell.progress < 1) {
        cell.progress = Math.min(1, cell.progress + delta * 0.003);
        const t = cell.progress;
        cell.color.r = cell.startColor.r + (cell.targetColor.r - cell.startColor.r) * t;
        cell.color.g = cell.startColor.g + (cell.targetColor.g - cell.startColor.g) * t;
        cell.color.b = cell.startColor.b + (cell.targetColor.b - cell.startColor.b) * t;
      }
    }
  }

  render() {
    const { ctx, canvas, fontSize } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    for (const cell of this.cells) {
      ctx.fillStyle = `rgb(${Math.trunc(cell.color.r)},${Math.trunc(cell.color.g)},${Math.trunc(cell.color.b)})`;
      ctx.fillText(cell.char, cell.x, cell.y);
    }
  }

  animate(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.update(delta);
    this.render();
    this.animationFrame = requestAnimationFrame(this.animate);
  }
}

function getGlitchColors() {
  return html.dataset.theme === 'light'
    ? ['#a8a8a8', '#a0a0a0', '#989898', '#b0b0b0', '#a4a4a4']
    : ['#222222', '#2c2c2c', '#363636', '#3e3e3e', '#2a2a2a'];
}

let glitchInstance = null;

const glitchCanvas = document.getElementById('glitch-canvas');
if (glitchCanvas) {
  glitchInstance = new GlitchMatrix({
    canvas: glitchCanvas,
    glitchInterval: 33,
    colors: getGlitchColors()
  });
}

document.addEventListener('visibilitychange', () => {
  if (!glitchInstance) return;
  if (document.hidden) {
    cancelAnimationFrame(glitchInstance.animationFrame);
  } else {
    glitchInstance.animationFrame = requestAnimationFrame(glitchInstance.animate);
  }
});

const metaThemeColor = document.querySelector('meta[name="theme-color"]');

themeToggle?.addEventListener('click', () => {
  const isLight = html.dataset.theme === 'light';
  if (isLight) {
    delete html.dataset.theme;
    localStorage.setItem('theme', 'dark');
    themeToggle.setAttribute('aria-checked', 'false');
    metaThemeColor?.setAttribute('content', '#0a0a0a');
  } else {
    html.dataset.theme = 'light';
    localStorage.setItem('theme', 'light');
    themeToggle.setAttribute('aria-checked', 'true');
    metaThemeColor?.setAttribute('content', '#fafafa');
  }
  glitchInstance?.setColors(getGlitchColors());
});

const hamburger = document.querySelector('.nav-hamburger');
const navMenu = document.querySelector('.nav-links');

if (hamburger && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => { if (!e.target.closest('nav')) closeMenu(); });
}

const marqueeInner = document.querySelector('.marquee-inner');
if (marqueeInner) {
  [...marqueeInner.children].forEach(item => marqueeInner.appendChild(item.cloneNode(true)));
}

function makeWarningBand(cls) {
  const el = document.createElement('span');
  el.classList.add('warning-tape__band', ...cls.split(' '));
  el.setAttribute('aria-hidden', 'true');
  return el;
}

function buildTapeText(message) {
  return new Array(6).fill(message).join('  ●  ');
}

document.querySelectorAll('.warning-tape').forEach((card) => {
  const i18nKey = (card.dataset.tapeI18n || '').trim();
  const message = (card.dataset.tapeMessage || '').trim();

  card.appendChild(makeWarningBand('warning-tape__stripe warning-tape__stripe--a'));
  card.appendChild(makeWarningBand('warning-tape__stripe warning-tape__stripe--b'));

  if (i18nKey || message) {
    const msg = makeWarningBand('warning-tape__msg');
    if (i18nKey) {
      msg.dataset.tapeI18n = i18nKey;
      const val = translations[currentLang]?.[i18nKey];
      if (val) msg.textContent = buildTapeText(val);
    } else {
      msg.textContent = buildTapeText(message);
    }
    card.appendChild(msg);
  }
});

const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-labelledby', 'lightbox-title');
lightbox.innerHTML = `
  <div class="lightbox-backdrop"></div>
  <div class="lightbox-inner">
    <button class="lightbox-close" data-i18n-attr="aria-label:lightbox.close" aria-label="Fechar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
    <p id="lightbox-title" class="lightbox-title"></p>
    <img class="lightbox-img" src="" alt="" />
  </div>
`;
document.body.appendChild(lightbox);

const lightboxTitle = lightbox.querySelector('.lightbox-title');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const lightboxClose = lightbox.querySelector('.lightbox-close');
let lightboxPreviousFocus = null;

const lightboxFocusable = () => [...lightbox.querySelectorAll('button, [href], img[tabindex], [tabindex]:not([tabindex="-1"])')];

function openLightbox(src, alt, title) {
  lightboxPreviousFocus = document.activeElement;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxTitle.textContent = title;
  lightbox.classList.add('open');
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.classList.remove('lightbox-open');
  lightboxPreviousFocus?.focus();
}

lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
lightboxClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLightbox(); return; }
  if (e.key !== 'Tab' || !lightbox.classList.contains('open')) return;
  const focusable = lightboxFocusable();
  const first = focusable[0];
  const last = focusable.at(-1);
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else if (document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});

const overlayIcon = `
  <div class="thumb-overlay-btn">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
    </svg>
  </div>
`;

document.querySelectorAll('.project-thumb img').forEach(img => {
  img.addEventListener('error', () => img.remove());

  function onLoaded() {
    img.classList.add('loaded');
    const overlay = document.createElement('div');
    overlay.className = 'thumb-overlay';
    overlay.innerHTML = overlayIcon;
    img.parentElement.appendChild(overlay);
    overlay.addEventListener('click', () => {
      const title = img.closest('.project-card').querySelector('.entry-title').textContent;
      openLightbox(img.src, img.alt, title);
    });
  }

  if (img.complete && img.naturalWidth) onLoaded();
  else img.addEventListener('load', onLoaded);
});

const visibilityObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in, .timeline-item').forEach(el => visibilityObserver.observe(el));

const navLinks = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector(`.nav-link[href="#${e.target.id}"]`)?.classList.add('active');
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

document.getElementById('footer-year').textContent = new Date().getFullYear();
