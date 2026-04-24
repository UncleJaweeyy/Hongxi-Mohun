import { loadSectionIncludes } from './shared/section-loader.js';
import { initNavigation } from './shared/navigation.js';
import { initAuth } from './shared/auth.js';
import { initBackTop } from './shared/back-top.js';
import { initLeafCanvas } from './shared/leaf-canvas.js';
import { initRunningBorders } from './shared/running-borders.js';
import { initHeroLogoAnimation } from './home/hero-logo.js';
import { initRanking } from './home/ranking.js';
import { initClassShowcase } from './home/classes.js';
import { initFeatureReveal } from './home/features.js';
import { initGallery } from './home/gallery.js';
import { initNewsPage } from './pages/news.js';
import { initGuidesPage } from './pages/guides.js';

async function boot() {
  await loadSectionIncludes();

  initNavigation();
  initAuth();
  initBackTop();
  initNewsPage();
  initGuidesPage();
  initRanking();
  initClassShowcase();
  initGallery();
  initFeatureReveal();
  initRunningBorders();
  initHeroLogoAnimation();
  initLeafCanvas();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
