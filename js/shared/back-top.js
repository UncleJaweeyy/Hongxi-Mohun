export function initBackTop() {
  const backTop = document.querySelector('[data-back-top]');
  if (!backTop) return;

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    backTop.classList.toggle('is-visible', window.scrollY > 520);
  }, { passive: true });
}
