// ============================================
// SHARED SITE BEHAVIOUR
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const burger = document.querySelector('.navbar__burger');
  const linksWrap = document.querySelector('.navbar__links-wrap');
  if (burger && linksWrap) {
    burger.addEventListener('click', () => {
      linksWrap.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', linksWrap.classList.contains('is-open'));
    });
    linksWrap.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => linksWrap.classList.remove('is-open'));
    });
  }

  // Active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Stagger children that share a [data-stagger] group
  document.querySelectorAll('[data-stagger]').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
    });
  });
});
