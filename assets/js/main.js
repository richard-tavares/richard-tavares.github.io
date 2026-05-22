document.getElementById('footer-year').textContent = new Date().getFullYear();

const html = document.documentElement;
const themeToggle = document.querySelector('.nav-theme-toggle');
const metaDesc = document.querySelector('meta[name="description"]');

if (localStorage.getItem('theme') === 'light') html.dataset.theme = 'light';

// ── Language ──────────────────────────────────────────────────────────────────
const langToggle = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('lang') || 'pt-BR';

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

  localStorage.setItem('lang', lang);
  currentLang = lang;
}

langToggle?.addEventListener('click', (e) => {
  const opt = e.target.closest('.lang-option');
  if (opt) applyLang(opt.dataset.lang);
});

applyLang(currentLang);

// ── Theme ─────────────────────────────────────────────────────────────────────
function getGlitchColors() {
  return html.dataset.theme === 'light'
    ? ['#c4c1ba', '#bcb9b2', '#b4b1aa', '#c8c5be', '#bab7b0']
    : ['#1a1a1a', '#222222', '#2a2a2a', '#333333', '#202020'];
}

let glitchInstance = null;

themeToggle?.addEventListener('click', () => {
  const isLight = html.dataset.theme === 'light';
  if (isLight) {
    delete html.dataset.theme;
    localStorage.setItem('theme', 'dark');
    themeToggle.setAttribute('aria-checked', 'false');
  } else {
    html.dataset.theme = 'light';
    localStorage.setItem('theme', 'light');
    themeToggle.setAttribute('aria-checked', 'true');
  }
  glitchInstance?.setColors(getGlitchColors());
});

// ── Hamburger ─────────────────────────────────────────────────────────────────
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

// ── Lightbox ──────────────────────────────────────────────────────────────────
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.innerHTML = `
  <div class="lightbox-backdrop"></div>
  <div class="lightbox-inner">
    <button class="lightbox-close" aria-label="Fechar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
    <p class="lightbox-title"></p>
    <img class="lightbox-img" src="" alt="" />
  </div>
`;
document.body.appendChild(lightbox);

const lightboxTitle = lightbox.querySelector('.lightbox-title');
const lightboxImg = lightbox.querySelector('.lightbox-img');

function openLightbox(src, alt, title) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxTitle.textContent = title;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ── Project thumbnails ────────────────────────────────────────────────────────
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

// ── Marquee duplication ───────────────────────────────────────────────────────
const marqueeInner = document.querySelector('.marquee-inner');
if (marqueeInner) {
  [...marqueeInner.children].forEach(item => marqueeInner.appendChild(item.cloneNode(true)));
}

// ── Intersection observers ────────────────────────────────────────────────────
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

// ── GlitchMatrix ──────────────────────────────────────────────────────────────
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
    this.colors = colors.map(this.hexToRgb);
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
    window.addEventListener('resize', this.handleResize);
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.resize(), 100);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
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
    this.colors = colors.map(this.hexToRgb);
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

const glitchCanvas = document.getElementById('glitch-canvas');
if (glitchCanvas) {
  glitchInstance = new GlitchMatrix({
    canvas: glitchCanvas,
    glitchInterval: 33,
    colors: getGlitchColors()
  });
}
