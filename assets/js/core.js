const html = document.documentElement;
const prefersReducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage indisponível */ }
  },
};

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
