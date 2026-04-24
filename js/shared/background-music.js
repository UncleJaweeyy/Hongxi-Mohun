const AUDIO_CANDIDATES = [
  new URL('../../assets/background_music.mp3', import.meta.url).href,
  new URL('../../assets/sounds/backgound_music.mp3', import.meta.url).href
];

function createBackgroundAudio() {
  const audio = document.createElement('audio');
  audio.dataset.backgroundMusic = 'true';
  audio.loop = true;
  audio.preload = 'auto';
  audio.playsInline = true;
  audio.setAttribute('aria-hidden', 'true');
  audio.hidden = true;

  return audio;
}

async function loadFirstAvailableSource(audio) {
  for (const src of AUDIO_CANDIDATES) {
    const canUse = await fetch(src, { method: 'HEAD' })
      .then((response) => response.ok)
      .catch(() => false);

    if (canUse) {
      audio.src = src;
      return true;
    }
  }

  return false;
}

export async function initBackgroundMusic() {
  const existingAudio = document.querySelector('[data-background-music]');
  const audio = existingAudio || createBackgroundAudio();

  if (!existingAudio) {
    document.body.append(audio);
  }

  const hasSource = await loadFirstAvailableSource(audio);

  if (!hasSource) {
    return;
  }

  const startPlayback = () => {
    audio.play().catch(() => {});
  };

  startPlayback();

  const unlockOnInteraction = () => {
    startPlayback();

    if (!audio.paused) {
      window.removeEventListener('pointerdown', unlockOnInteraction);
      window.removeEventListener('keydown', unlockOnInteraction);
    }
  };

  if (audio.paused) {
    window.addEventListener('pointerdown', unlockOnInteraction, { passive: true });
    window.addEventListener('keydown', unlockOnInteraction);
  }
}
