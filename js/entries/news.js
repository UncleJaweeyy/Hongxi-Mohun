import { initNavigation } from '../shared/navigation.js';
import { initAuth } from '../shared/auth.js';
import { initBackTop } from '../shared/back-top.js';
import { initClickSound } from '../shared/click-sound.js';
import { initLeafCanvas } from '../shared/leaf-canvas.js';
import { initNewsPage } from '../pages/news.js';

async function bootNewsPage() {
  await initClickSound();
  initNavigation();
  initAuth();
  initBackTop();
  initNewsPage();
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootNewsPage, { once: true });
} else {
  bootNewsPage();
}
