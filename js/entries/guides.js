import { initClickSound } from '../shared/click-sound.js';
import { initLeafCanvas } from '../shared/leaf-canvas.js';
import { initGuidesPage } from '../pages/guides.js';

async function bootGuidesPage() {
  await initClickSound();
  initGuidesPage();
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGuidesPage, { once: true });
} else {
  bootGuidesPage();
}
