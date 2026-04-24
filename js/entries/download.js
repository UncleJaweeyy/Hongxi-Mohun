import { initLeafCanvas } from '../shared/leaf-canvas.js';

function bootDownloadPage() {
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootDownloadPage, { once: true });
} else {
  bootDownloadPage();
}
