function initNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const navMenu = document.querySelector('.nav-links');
  if (!hamburger || !navMenu) return;

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

function initMarquee() {
  const marqueeInner = document.querySelector('.marquee-inner');
  if (!marqueeInner) return;
  [...marqueeInner.children].forEach(item => marqueeInner.appendChild(item.cloneNode(true)));
}

function makeWarningBand(cls) {
  const band = document.createElement('span');
  band.classList.add('warning-tape__band', ...cls.split(' '));
  band.setAttribute('aria-hidden', 'true');
  return band;
}

function buildTapeText(message) {
  return new Array(6).fill(message).join('  ●  ');
}

function initWarningTapes() {
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
}

function initRevealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in, .timeline-item').forEach(node => observer.observe(node));
}
