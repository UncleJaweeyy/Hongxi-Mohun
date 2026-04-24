// ------------------------------------------------------------
// One-shot running borders
// ------------------------------------------------------------
// Triggers the amber/gold border stroke once when a dark container scrolls
// into view, and again when focus moves into that container.
export function initRunningBorders() {
  const borderPanels = Array.from(document.querySelectorAll([
    ".feature-showcase .section-heading",
    ".feature-item",
    ".framed-section",
    ".gallery-slide",
    ".guide-card",
    ".download-client-card",
    ".auth-dialog"
  ].join(",")));

  if (!borderPanels.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const visiblePanels = new WeakSet();
  const strokeTimers = new WeakMap();

  function runBorderStroke(panel) {
    window.clearTimeout(strokeTimers.get(panel));
    panel.classList.remove("border-stroke-run");

    // Force a style flush so re-adding the class restarts the one-shot animation.
    void panel.offsetWidth;

    panel.classList.add("border-stroke-run");
    strokeTimers.set(panel, window.setTimeout(() => {
      panel.classList.remove("border-stroke-run");
      strokeTimers.delete(panel);
    }, 4600));
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!visiblePanels.has(entry.target)) {
            visiblePanels.add(entry.target);
            runBorderStroke(entry.target);
          }
        } else {
          visiblePanels.delete(entry.target);
        }
      });
    }, {
      threshold: 0.24,
      rootMargin: "-8% 0px -18% 0px"
    });

    borderPanels.forEach((panel) => observer.observe(panel));
  }

  borderPanels.forEach((panel) => {
    panel.addEventListener("focusin", () => runBorderStroke(panel));
  });
}
