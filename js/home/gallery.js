// ------------------------------------------------------------
// Gallery controls
// ------------------------------------------------------------
// Turns the "水墨绘卷" slides into a simple coverflow-style gallery.
// The CSS reads the is-active/is-prev/is-next/is-far classes to position slides.
export function initGallery() {
  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));
  const dots = gallery.querySelector("[data-gallery-dots]");
  const prev = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  let activeIndex = 0;

  if (!slides.length) return;

  // Applies the right visual class to each slide based on activeIndex.
  function updateGallery() {
    slides.forEach((slide, index) => {
      const distance = (index - activeIndex + slides.length) % slides.length;
      slide.classList.toggle("is-active", distance === 0);
      slide.classList.toggle("is-next", distance === 1);
      slide.classList.toggle("is-prev", distance === slides.length - 1);
      slide.classList.toggle("is-far", distance > 1 && distance < slides.length - 1);
    });

    dots?.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  }

  // Build dot buttons dynamically so the dots always match the number of slides.
  if (dots) {
    dots.innerHTML = slides.map((_, index) => `<button type="button" aria-label="查看第${index + 1}张"></button>`).join("");
    dots.querySelectorAll("button").forEach((dot, index) => {
      dot.addEventListener("click", () => {
        activeIndex = index;
        updateGallery();
      });
    });
  }

  // Move one slide backward.
  prev?.addEventListener("click", () => {
    activeIndex = (activeIndex - 1 + slides.length) % slides.length;
    updateGallery();
  });

  // Move one slide forward.
  next?.addEventListener("click", () => {
    activeIndex = (activeIndex + 1) % slides.length;
    updateGallery();
  });

  updateGallery();
}
