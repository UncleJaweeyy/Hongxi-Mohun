import { initClickSound } from '../shared/click-sound.js';
import { initLeafCanvas } from '../shared/leaf-canvas.js';

const wechatOpenUrl = 'weixin://dl/';

function copyText(value) {
  if (!value) return;

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    void navigator.clipboard.writeText(value).catch(() => {});
    return;
  }

  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.append(field);
  field.select();

  try {
    document.execCommand('copy');
  } catch {}

  field.remove();
}

function initWechatLinks() {
  document.querySelectorAll('[data-wechat-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      copyText(link.dataset.wechatId || '');
      window.location.href = link.getAttribute('href') || wechatOpenUrl;
    });
  });
}

async function bootLegalPage() {
  await initClickSound();
  initLeafCanvas();
  initWechatLinks();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootLegalPage, { once: true });
} else {
  bootLegalPage();
}
