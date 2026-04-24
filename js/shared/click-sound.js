const CLICK_SOUND_CANDIDATES = [
  new URL('../../assets/click_sound.mp3', import.meta.url).href,
  new URL('../../assets/sounds/click_sound.mp3', import.meta.url).href
];

const CLICKABLE_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  'summary'
].join(', ');

async function loadFirstAvailableSource(audio) {
  for (const src of CLICK_SOUND_CANDIDATES) {
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

export async function initClickSound() {
  const audio = document.createElement('audio');
  audio.preload = 'auto';
  audio.setAttribute('aria-hidden', 'true');
  audio.hidden = true;

  const hasSource = await loadFirstAvailableSource(audio);
  if (!hasSource) return;

  document.body.append(audio);

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) {
      return;
    }

    const control = event.target.closest(CLICKABLE_SELECTOR);
    if (!control || control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true') {
      return;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {});
  });
}
