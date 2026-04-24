// Replays the layered title logo entrance whenever the hero scrolls back in.
export function initHeroLogoAnimation() {
  const hero = document.querySelector("#home");
  const logo = document.querySelector("[data-hero-logo]");
  if (!hero || !logo) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  function play(delay = 0) {
    window.setTimeout(() => {
      logo.classList.remove("is-animating");
      void logo.offsetWidth;
      logo.classList.add("is-animating");
    }, delay);
  }

  if (!("IntersectionObserver" in window)) {
    play(900);
    return;
  }

  let wasVisible = false;
  let isFirstEntry = true;

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35;

    if (isVisible && !wasVisible) {
      play(isFirstEntry ? 900 : 0);
      isFirstEntry = false;
    }

    if (!isVisible && wasVisible) {
      logo.classList.remove("is-animating");
    }

    wasVisible = isVisible;
  }, { threshold: [0, 0.35, 0.65] });

  observer.observe(hero);
}
