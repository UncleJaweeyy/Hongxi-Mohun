import { getFirebaseFirestore, getFirebaseFirestoreModule } from './firebase-client.js';

export const fallbackSiteLinks = {
  discordUrl: 'https://discord.gg/TRDX3ggHpf',
  downloadUrl: 'https://drive.google.com/file/d/1uxxRYByUoUk1pi8rP9VOa-_GHsiJeOW6/view?usp=sharing'
};

const linkKeys = Object.keys(fallbackSiteLinks);

function cloneSiteLinks(links = fallbackSiteLinks) {
  return Object.fromEntries(
    linkKeys.map((key) => [key, String(links?.[key] || fallbackSiteLinks[key])])
  );
}

function isHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidSiteLink(value) {
  return isHttpUrl(value);
}

export function getFallbackSiteLinks() {
  return cloneSiteLinks();
}

export function normalizeSiteLinksPayload(payload) {
  const normalized = {};

  linkKeys.forEach((key) => {
    const value = String(payload?.[key] || '').trim();
    normalized[key] = isHttpUrl(value) ? value : fallbackSiteLinks[key];
  });

  return normalized;
}

export async function loadSiteLinksFromFirestore() {
  const db = await getFirebaseFirestore();
  const firestore = await getFirebaseFirestoreModule();

  if (!db || !firestore) {
    return {
      links: getFallbackSiteLinks(),
      source: 'fallback',
      hasRemoteData: false
    };
  }

  try {
    const snapshot = await firestore.getDoc(firestore.doc(db, 'siteContent', 'links'));

    if (!snapshot.exists()) {
      return {
        links: getFallbackSiteLinks(),
        source: 'fallback',
        hasRemoteData: false
      };
    }

    const data = snapshot.data();
    return {
      links: normalizeSiteLinksPayload(data),
      source: 'firestore',
      hasRemoteData: true,
      updatedAt: data.updatedAt ?? null,
      updatedBy: data.updatedBy ?? null
    };
  } catch (error) {
    console.error('Unable to load site links from Firestore.', error);
    return {
      links: getFallbackSiteLinks(),
      source: 'fallback',
      hasRemoteData: false,
      error
    };
  }
}

export function buildSiteLinksDocument(links, actor, serverTimestamp) {
  return {
    ...normalizeSiteLinksPayload(links),
    updatedAt: serverTimestamp,
    updatedBy: actor
  };
}

export async function applySiteLinks(root = document) {
  let result;

  try {
    result = await loadSiteLinksFromFirestore();
  } catch (error) {
    console.error('Unable to apply site links.', error);
    result = {
      links: getFallbackSiteLinks(),
      source: 'fallback',
      hasRemoteData: false,
      error
    };
  }

  const links = result.links;

  root.querySelectorAll('[data-site-link]').forEach((element) => {
    const key = element.dataset.siteLink;
    const href = links[key];

    if (!href) return;
    element.setAttribute('href', href);
  });

  return result;
}
