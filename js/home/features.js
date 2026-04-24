// ------------------------------------------------------------
// Feature scroll reveal
// ------------------------------------------------------------
// Adds slide/fade animation to the feature image and text when each feature
// panel enters the viewport. It also resets when the panel leaves, so scrolling
// back to it can replay the same animation.
export function initFeatureReveal() {
  const featureItems = document.querySelectorAll(".feature-item");
  if (!featureItems.length) return;

  document.body.classList.add("feature-reveal-ready");

  if (!("IntersectionObserver" in window)) {
    featureItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  }, {
    threshold: 0.22,
    rootMargin: "-8% 0px -18% 0px"
  });

  featureItems.forEach((item) => observer.observe(item));
}
