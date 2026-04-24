import { initLeafCanvas } from '../shared/leaf-canvas.js';
import { initGuidesPage } from '../pages/guides.js';

function bootGuidesPage() {
  initGuidesPage();
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGuidesPage, { once: true });
} else {
  bootGuidesPage();
}
