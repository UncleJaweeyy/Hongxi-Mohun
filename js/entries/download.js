import { initClickSound } from '../shared/click-sound.js';
import { initLeafCanvas } from '../shared/leaf-canvas.js';

async function bootDownloadPage() {
  await initClickSound();
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootDownloadPage, { once: true });
} else {
  bootDownloadPage();
}
