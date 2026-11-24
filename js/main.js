// ============================================
// SITE BEHAVIOUR (home page + project pages)
//   1. mobile nav   2. scroll-spy (home only)   3. reveal-on-scroll
//   4. Esc closes menu   5. PDF previews (PDF.js loaded only if a page has one)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = document.documentElement;

  /* ---------- 1. Mobile nav ---------- */
  const burger = $('.navbar__burger');
  const menu = $('.navbar__links-wrap');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  // If the window is widened past the mobile breakpoint, drop the open state
  window.matchMedia('(min-width: 921px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- 2. Scroll-spy: highlight the current section ---------- */
  const navLinks = $$('.navbar__links a[href^="#"]');
  const spyTargets = [$('.hero'), ...navLinks.map(a => $(a.getAttribute('href')))].filter(Boolean);
  const setActive = id => navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id || ''); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyTargets.forEach(t => spy.observe(t));
  }
  // The contact section is short, so also catch "scrolled to the very bottom"
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) setActive('contact');
  }, { passive: true });

  /* ---------- Theme toggle (the initial theme is set by a tiny script in <head>) ---------- */
  const toggles = $$('.theme-toggle');
  const syncToggles = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };
  syncToggles();
  toggles.forEach(btn => btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncToggles();
  }));

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
  $$('[data-stagger]').forEach(group => {
    [...group.children].forEach((child, i) => { child.style.transitionDelay = `${i * 80}ms`; });
  });

  /* ---------- 5. Lazy PDF previews (PDF.js is only fetched when a page has one) ---------- */
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  let pdfLib;
  const loadPdfJs = () => pdfLib || (pdfLib = new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const s = document.createElement('script');
    s.src = PDFJS + 'pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; resolve(window.pdfjsLib); };
    s.onerror = reject;
    document.head.appendChild(s);
  }));

  function renderThumbs(scope) {
    $$('.pdf-thumb:not([data-done])', scope).forEach(canvas => {
      canvas.dataset.done = '1';
      const note = canvas.parentElement.querySelector('.doc-loading');
      loadPdfJs()
        .then(lib => lib.getDocument(canvas.dataset.url).promise)
        .then(pdf => pdf.getPage(1))
        .then(page => {
          const viewport = page.getViewport({ scale: 0.6 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          return page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        })
        .then(() => { if (note) note.style.display = 'none'; })
        .catch(() => { if (note) note.textContent = 'preview unavailable'; });
    });
  }

  /* ---------- 4. Esc closes the mobile menu ---------- */
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- 5. Render PDF previews on any page that has them ---------- */
  renderThumbs(document);
});
