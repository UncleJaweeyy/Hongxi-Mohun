import { loadSectionIncludes } from './shared/section-loader.js';
import { initNavigation } from './shared/navigation.js';
import { initAuth } from './shared/auth.js';
import { initBackTop } from './shared/back-top.js';
import { initClickSound } from './shared/click-sound.js';
import { initLeafCanvas } from './shared/leaf-canvas.js';
import { initRunningBorders } from './shared/running-borders.js';
import { initBackgroundMusic } from './shared/background-music.js';
import { initHeroLogoAnimation } from './home/hero-logo.js';
import { initRanking } from './home/ranking.js';
import { initClassShowcase } from './home/classes.js';
import { initFeatureReveal } from './home/features.js';
import { initGallery } from './home/gallery.js';
import { initNewsPage } from './pages/news.js';
import { initGuidesPage } from './pages/guides.js';

function createLoaderController() {
  const loader = document.querySelector('[data-loader]');
  const ring = loader?.querySelector('.loading-ring');
  const label = ring?.querySelector('span');

  if (!loader || !ring || !label) {
    return {
      setProgress() {},
      async hide() {}
    };
  }

  let currentProgress = 0;
  let animationFrameId = 0;

  const renderProgress = (value) => {
    ring.style.setProperty('--progress', String(value));
    label.textContent = `${value}%`;
  };

  renderProgress(currentProgress);

  return {
    setProgress(target, duration = 220) {
      const nextProgress = Math.max(currentProgress, Math.min(100, Math.round(target)));
      if (nextProgress === currentProgress) return;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      const startedAt = performance.now();
      const startingValue = currentProgress;

      const tick = (timestamp) => {
        const elapsed = timestamp - startedAt;
        const ratio = duration <= 0 ? 1 : Math.min(elapsed / duration, 1);
        currentProgress = Math.round(startingValue + ((nextProgress - startingValue) * ratio));
        renderProgress(currentProgress);

        if (ratio < 1) {
          animationFrameId = requestAnimationFrame(tick);
          return;
        }

        animationFrameId = 0;
      };

      animationFrameId = requestAnimationFrame(tick);
    },
    async hide() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }

      currentProgress = 100;
      renderProgress(currentProgress);
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      loader.classList.add('is-hidden');
    }
  };
}

function waitForWindowLoad() {
  if (document.readyState === 'complete') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.addEventListener('load', resolve, { once: true });
  });
}

async function boot() {
  const loader = createLoaderController();
  loader.setProgress(5, 0);

  await loadSectionIncludes(({ completed, total }) => {
    loader.setProgress(10 + ((completed / total) * 50));
  });

  await initClickSound();
  await initBackgroundMusic();

  const initializers = [
    initNavigation,
    initAuth,
    initBackTop,
    initNewsPage,
    initGuidesPage,
    initRanking,
    initClassShowcase,
    initGallery,
    initFeatureReveal,
    initRunningBorders,
    initHeroLogoAnimation,
    initLeafCanvas
  ];

  initializers.forEach((initialize, index) => {
    initialize();
    loader.setProgress(60 + (((index + 1) / initializers.length) * 35));
  });

  await waitForWindowLoad();
  loader.setProgress(100);
  await loader.hide();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
