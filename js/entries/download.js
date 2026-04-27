import { initClickSound } from '../shared/click-sound.js';
import { initLeafCanvas } from '../shared/leaf-canvas.js';
import { applySiteLinks } from '../shared/site-links-store.js';

async function bootDownloadPage() {
  await initClickSound();
  await applySiteLinks();
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootDownloadPage, { once: true });
} else {
  bootDownloadPage();
}
