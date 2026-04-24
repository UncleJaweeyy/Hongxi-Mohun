import { rankData } from '../data/rank-data.js';

// ------------------------------------------------------------
// Ranking render helpers
// ------------------------------------------------------------
// Returns the small crown SVG used for the top three ranking rows.
function crownIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5Zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z"></path>
    </svg>
  `;
}

// Renders ranking rows for the selected tab/category.
// It also adds special classes to the top three rows for gold/silver/bronze styling.
function renderRank(category = "世界头目") {
  const body = document.getElementById("rank-body");
  if (!body) return;

  const rows = rankData[category] || [];
  const list = body.closest(".rank-list");
  list?.classList.toggle("has-rows", rows.length > 0);

  body.innerHTML = rows.map(([name, school, score], index) => {
    const place = index + 1;
    const medalClass = place === 1 ? " rank-row--gold" : place === 2 ? " rank-row--silver" : place === 3 ? " rank-row--bronze" : "";
    const icon = place <= 3 ? crownIcon() : "";

    return `
      <div class="rank-row${medalClass}" role="row">
        <span class="rank-place">${place}</span>
        <span class="rank-player">${icon}${name}</span>
        <span class="rank-school">${school}</span>
        <span class="rank-score">${score}</span>
      </div>
    `;
  }).join("");
}

export function initRanking() {
  document.querySelectorAll('[data-rank-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-rank-tab]').forEach((tab) => tab.classList.remove('is-active'));
      button.classList.add('is-active');
      renderRank(button.dataset.rankTab);
    });
  });

  renderRank();
}
