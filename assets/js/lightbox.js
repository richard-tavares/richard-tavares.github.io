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
  if (!lightbox.classList.contains('open')) return;
  lightbox.classList.remove('open');
  document.body.classList.remove('lightbox-open');
  lightboxPreviousFocus?.focus();
}

lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
lightboxClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') { closeLightbox(); return; }
  if (e.key !== 'Tab') return;
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

function initProjectThumbs() {
  document.querySelectorAll('.project-thumb img').forEach(img => {
    img.addEventListener('error', () => img.remove());

    function onLoaded() {
      img.classList.add('loaded');
      const overlay = document.createElement('div');
      overlay.className = 'thumb-overlay';
      overlay.innerHTML = overlayIcon;
      img.parentElement.appendChild(overlay);
      overlay.addEventListener('click', () => openLightbox(img.src, img.alt, img.dataset.title));
    }

    if (img.complete && img.naturalWidth) onLoaded();
    else img.addEventListener('load', onLoaded);
  });
}
