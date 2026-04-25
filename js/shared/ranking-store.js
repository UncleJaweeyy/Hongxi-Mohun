import { rankData } from '../data/rank-data.js';
import { getFirebaseFirestore, getFirebaseFirestoreModule } from './firebase-client.js';

export const rankingCategories = [
  { key: 'worldBoss', label: '世界头目', metricLabel: '战力/积分' },
  { key: 'dungeon', label: '副本榜单', metricLabel: '战力/积分' },
  { key: 'slaughter', label: '杀戮战场', metricLabel: '战力/积分' },
  { key: 'siege', label: '攻城争霸', metricLabel: '战力/积分' }
];

export const defaultRankingCategoryKey = rankingCategories[0].key;

const categoryLabelToKey = Object.fromEntries(rankingCategories.map((category) => [category.label, category.key]));

function cloneRankings(rankings) {
  return Object.fromEntries(
    rankingCategories.map((category) => [
      category.key,
      (rankings?.[category.key] || []).map((entry) => ({ ...entry }))
    ])
  );
}

function parseScore(value) {
  const numeric = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function makeEntryId(categoryKey, position, name) {
  const slug = String(name || position)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${categoryKey}-${slug || position}`;
}

function normalizeEntry(entry, index, categoryKey) {
  const name = String(entry?.name ?? entry?.[0] ?? '').trim();
  const school = String(entry?.school ?? entry?.[1] ?? '').trim();
  const score = parseScore(entry?.score ?? entry?.[2]);
  const rawPosition = Number(entry?.position ?? index + 1);
  const position = Number.isFinite(rawPosition) && rawPosition > 0 ? rawPosition : index + 1;
  const id = String(entry?.id || makeEntryId(categoryKey, position, name));

  return { id, position, name, school, score };
}

function normalizeCategoryEntries(entries, categoryKey) {
  const list = Array.isArray(entries)
    ? entries
    : Array.isArray(entries?.entries)
      ? entries.entries
      : [];

  return list
    .map((entry, index) => normalizeEntry(entry, index, categoryKey))
    .filter((entry) => entry.name || entry.school || entry.score > 0)
    .sort((left, right) => {
      if (left.position !== right.position) return left.position - right.position;
      return right.score - left.score;
    })
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

function buildFallbackRankings() {
  const fallback = {};

  rankingCategories.forEach((category) => {
    const sourceRows = rankData[category.label] || [];
    fallback[category.key] = normalizeCategoryEntries(
      sourceRows.map((row, index) => ({
        id: `${category.key}-${index + 1}`,
        position: index + 1,
        name: row[0],
        school: row[1],
        score: row[2]
      })),
      category.key
    );
  });

  return fallback;
}

const fallbackRankings = buildFallbackRankings();

export function getFallbackRankings() {
  return cloneRankings(fallbackRankings);
}

export function getRankingCategory(categoryKey) {
  return rankingCategories.find((category) => category.key === categoryKey) || rankingCategories[0];
}

export function getRankingCategoryKey(input) {
  if (!input) return defaultRankingCategoryKey;
  if (rankingCategories.some((category) => category.key === input)) return input;
  return categoryLabelToKey[input] || defaultRankingCategoryKey;
}

export function createEmptyRankingEntry(categoryKey, count = 0) {
  const position = count + 1;

  return {
    id: `${categoryKey}-${Date.now()}-${position}`,
    position,
    name: '',
    school: '',
    score: 0
  };
}

export function formatRankingScore(score) {
  return new Intl.NumberFormat('en-US').format(parseScore(score));
}

export function normalizeRankingsPayload(payload) {
  const normalized = {};

  rankingCategories.forEach((category) => {
    const source = payload?.categories?.[category.key] ?? payload?.[category.key];
    normalized[category.key] = source
      ? normalizeCategoryEntries(source, category.key)
      : cloneRankings(fallbackRankings)[category.key];
  });

  return normalized;
}

export async function loadRankingsFromFirestore() {
  const db = await getFirebaseFirestore();
  const firestore = await getFirebaseFirestoreModule();

  if (!db || !firestore) {
    return {
      rankings: getFallbackRankings(),
      source: 'fallback',
      hasRemoteData: false
    };
  }

  try {
    const snapshot = await firestore.getDoc(firestore.doc(db, 'siteContent', 'rankings'));

    if (!snapshot.exists()) {
      return {
        rankings: getFallbackRankings(),
        source: 'fallback',
        hasRemoteData: false
      };
    }

    const data = snapshot.data();
    return {
      rankings: normalizeRankingsPayload(data),
      source: 'firestore',
      hasRemoteData: true,
      updatedAt: data.updatedAt ?? null,
      updatedBy: data.updatedBy ?? null
    };
  } catch (error) {
    console.error('Unable to load rankings from Firestore.', error);
    return {
      rankings: getFallbackRankings(),
      source: 'fallback',
      hasRemoteData: false,
      error
    };
  }
}

export function buildRankingsDocument(rankings, actor, serverTimestamp) {
  const categories = {};

  rankingCategories.forEach((category) => {
    categories[category.key] = {
      label: category.label,
      metricLabel: category.metricLabel,
      entries: normalizeCategoryEntries(rankings?.[category.key], category.key).map((entry) => ({
        id: entry.id,
        position: entry.position,
        name: entry.name,
        school: entry.school,
        score: parseScore(entry.score)
      }))
    };
  });

  return {
    categories,
    updatedAt: serverTimestamp,
    updatedBy: actor
  };
}
