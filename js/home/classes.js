import { classes } from '../data/classes.js';

// ------------------------------------------------------------
// Class panel render helpers
// ------------------------------------------------------------
// Converts a number from 1 to 5 into star characters.
// Filled stars are plain text; empty stars are wrapped in <i> for dim styling.
function renderStars(difficulty) {
  const active = "★".repeat(difficulty);
  const inactive = "★".repeat(Math.max(0, 5 - difficulty));
  return `${active}<i>${inactive}</i>`;
}

// Renders the large "天下流派" panel from the selected class data.
// This updates the background image, class name, tags, quote, and description.
function renderClassPanel(classKey = "sword") {
  const selected = classes[classKey] || classes.sword;
  const panel = document.querySelector("[data-class-panel]");
  if (!panel) return;

  panel.dataset.cursor = classKey;
  panel.style.setProperty("--class-image", `url("${selected.image}")`);
  panel.innerHTML = `
    <div class="class-backdrop" aria-hidden="true"></div>
    <div class="class-watermark">${selected.name}</div>
    <div class="class-content">
      <div class="class-title-row">
        <h3>${selected.name}</h3>
        <span>【 ${selected.mark} 】</span>
      </div>
      <div class="class-tags">
        ${selected.tags.map((tag) => `<span>${tag}</span>`).join("")}
        <span class="class-stars" aria-label="上手难度${selected.difficulty}星">${renderStars(selected.difficulty)}</span>
      </div>
      <blockquote>${selected.quote}</blockquote>
      <p>${selected.body}</p>
    </div>
  `;
}

export function initClassShowcase() {
  document.querySelectorAll('[data-class]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-class]').forEach((tab) => tab.classList.remove('is-active'));
      button.classList.add('is-active');
      renderClassPanel(button.dataset.class);
    });
  });

  renderClassPanel();
}
