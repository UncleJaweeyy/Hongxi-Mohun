import { initClickSound } from '../shared/click-sound.js';
import { initLeafCanvas } from '../shared/leaf-canvas.js';

async function bootLegalPage() {
  await initClickSound();
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootLegalPage, { once: true });
} else {
  bootLegalPage();
}
