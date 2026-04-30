import { getFirebaseAuth, getFirebaseAuthModule, getFirebaseFirestore, getFirebaseFirestoreModule } from '../shared/firebase-client.js';
import {
  buildNewsDocument,
  createEmptyNewsItem,
  editorTextToHtml,
  escapeHtml,
  getFallbackNewsItems,
  loadNewsFromFirestore,
  newsCategories,
  newsFilterOptions,
  sortNewsItems
} from '../shared/news-store.js';
import {
  buildRankingsDocument,
  createEmptyRankingEntry,
  defaultRankingCategoryKey,
  formatRankingScore,
  getFallbackRankings,
  getRankingCategory,
  loadRankingsFromFirestore,
  rankingCategories
} from '../shared/ranking-store.js';
import {
  buildSiteLinksDocument,
  getFallbackSiteLinks,
  isValidSiteLink,
  loadSiteLinksFromFirestore
} from '../shared/site-links-store.js';

const state = {
  activeCategory: defaultRankingCategoryKey,
  activeNewsFilter: '全部',
  contentMode: 'dashboard',
  dirty: {
    rankings: false,
    news: false,
    links: false
  },
  isAdmin: false,
  links: getFallbackSiteLinks(),
  linksUpdatedAt: null,
  newsItems: getFallbackNewsItems(),
  newsUpdatedAt: null,
  rankings: getFallbackRankings(),
  rankingsUpdatedAt: null,
  user: null
};

const alertTimers = new WeakMap();
const editorModes = new Set(['rankings', 'news', 'links']);

function setAlert(element, message, tone = 'warning', options = {}) {
  if (!element) return;

  const { autoHideMs = 0 } = options;
  const activeTimer = alertTimers.get(element);

  if (activeTimer) {
    window.clearTimeout(activeTimer);
    alertTimers.delete(element);
  }

  element.textContent = message;
  element.classList.remove('is-hidden', 'is-error', 'is-success');
  if (tone === 'error') element.classList.add('is-error');
  if (tone === 'success') element.classList.add('is-success');
  if (!message) element.classList.add('is-hidden');

  if (message && autoHideMs > 0) {
    const timer = window.setTimeout(() => {
      element.textContent = '';
      element.classList.add('is-hidden');
      element.classList.remove('is-error', 'is-success');
      alertTimers.delete(element);
    }, autoHideMs);

    alertTimers.set(element, timer);
  }
}

function createReferences() {
  return {
    backButtons: Array.from(document.querySelectorAll('[data-admin-back-dashboard]')),
    dashboardPanel: document.querySelector('[data-admin-dashboard-panel]'),
    contentPanels: Array.from(document.querySelectorAll('[data-admin-content-panel]')),
    dashboardOpenButtons: Array.from(document.querySelectorAll('[data-admin-open-mode]')),
    editorPanel: document.querySelector('[data-admin-editor-panel]'),
    loginAlert: document.querySelector('[data-admin-login-alert]'),
    loginForm: document.querySelector('[data-admin-login-form]'),
    loginPanel: document.querySelector('[data-admin-login-panel]'),
    logoutButton: document.querySelector('[data-admin-logout]'),
    pendingPanel: document.querySelector('[data-admin-pending-panel]'),
    rankings: {
      addButton: document.querySelector('[data-admin-add-row]'),
      categoryLabel: document.querySelector('[data-admin-category-label]'),
      categoryTabs: document.querySelector('[data-admin-category-tabs]'),
      previewList: document.querySelector('[data-admin-preview-list]'),
      rowList: document.querySelector('[data-admin-row-list]'),
      saveButton: document.querySelector('[data-admin-save]'),
      updatedMeta: document.querySelector('[data-admin-updated-meta]')
    },
    news: {
      addButton: document.querySelector('[data-admin-news-add-row]'),
      filterTabs: document.querySelector('[data-admin-news-filter-tabs]'),
      previewList: document.querySelector('[data-admin-news-preview-list]'),
      rowList: document.querySelector('[data-admin-news-row-list]'),
      saveButton: document.querySelector('[data-admin-news-save]'),
      updatedMeta: document.querySelector('[data-admin-news-updated-meta]')
    },
    links: {
      fields: Array.from(document.querySelectorAll('[data-admin-links-field]')),
      previewList: document.querySelector('[data-admin-links-preview-list]'),
      saveButton: document.querySelector('[data-admin-links-save]'),
      updatedMeta: document.querySelector('[data-admin-links-updated-meta]')
    },
    status: document.querySelector('[data-admin-status]')
  };
}

function markDirty(mode) {
  state.dirty[mode] = true;
}

function formatUpdatedMeta(value, user) {
  if (!value?.toDate) return '当前显示的是默认内容。';

  const formatted = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(value.toDate());

  if (!user?.email) return `最近更新：${formatted}`;
  return `最近更新：${formatted} · ${user.email}`;
}

function getActiveRankingEntries() {
  return state.rankings[state.activeCategory] || [];
}

function sortRankingEntries(entries) {
  return entries
    .map((entry, index) => ({
      ...entry,
      position: Number(entry.position) > 0 ? Number(entry.position) : index + 1,
      score: Number(entry.score) > 0 ? Number(entry.score) : 0
    }))
    .sort((left, right) => {
      if (left.position !== right.position) return left.position - right.position;
      return right.score - left.score;
    })
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

function getFilteredNewsItems() {
  const items = sortNewsItems(state.newsItems);
  if (state.activeNewsFilter === '全部') return items;
  return items.filter((item) => item.category === state.activeNewsFilter);
}

function renderContentMode(refs) {
  if (refs.dashboardPanel) refs.dashboardPanel.hidden = state.contentMode !== 'dashboard';

  refs.contentPanels.forEach((panel) => {
    panel.hidden = panel.dataset.adminContentPanel !== state.contentMode;
  });
}

function getModeFromLocation() {
  const mode = window.location.hash.replace('#', '');
  return editorModes.has(mode) ? mode : 'dashboard';
}

function getModeUrl(mode) {
  const hash = editorModes.has(mode) ? `#${mode}` : '';
  return `${window.location.pathname}${window.location.search}${hash}`;
}

function writeModeHistory(mode, action = 'replace') {
  const method = action === 'push' ? 'pushState' : 'replaceState';
  window.history[method]({ adminMode: mode }, '', getModeUrl(mode));
}

function setContentMode(refs, mode, options = {}) {
  const nextMode = editorModes.has(mode) ? mode : 'dashboard';
  if (!state.isAdmin && nextMode !== 'dashboard') return;

  state.contentMode = nextMode;
  renderContentMode(refs);

  if (options.history) {
    writeModeHistory(nextMode, options.history);
  }
}

function hasUnsavedChanges(mode = state.contentMode) {
  return editorModes.has(mode) && Boolean(state.dirty[mode]);
}

function hasAnyUnsavedChanges() {
  return Object.values(state.dirty).some(Boolean);
}

function getModeLabel(mode) {
  if (mode === 'rankings') return '排行榜';
  if (mode === 'news') return '快报公告';
  if (mode === 'links') return '站点链接';
  return '当前内容';
}

function renderRankingCategoryTabs(refs) {
  if (!refs.rankings.categoryTabs) return;

  refs.rankings.categoryTabs.innerHTML = rankingCategories.map((category) => `
    <button
      type="button"
      role="tab"
      class="${category.key === state.activeCategory ? 'is-active' : ''}"
      data-admin-category="${category.key}"
    >
      ${category.label}
    </button>
  `).join('');
}

function renderRankingPreview(refs) {
  const previewList = refs.rankings.previewList;
  if (!previewList) return;

  const previewEntries = sortRankingEntries(getActiveRankingEntries());
  previewList.innerHTML = previewEntries.map((entry) => `
    <li>
      <span>${entry.position}. ${escapeHtml(entry.name || '未命名')}</span>
      <strong>${escapeHtml(entry.school || '未设置帮派')} · ${formatRankingScore(entry.score)}</strong>
    </li>
  `).join('');

  if (!previewEntries.length) {
    previewList.innerHTML = '<li><span>当前分类还没有榜单数据。</span><strong>新增一行后即可开始编辑。</strong></li>';
  }
}

function renderRankingRows(refs) {
  const rowList = refs.rankings.rowList;
  if (!rowList) return;

  const entries = sortRankingEntries(getActiveRankingEntries());
  state.rankings[state.activeCategory] = entries;

  rowList.innerHTML = entries.map((entry) => `
    <article class="admin-row-card" data-entry-id="${escapeHtml(entry.id)}">
      <div class="admin-row-card-head">
        <strong>第 ${entry.position} 名</strong>
        <button class="text-button admin-danger-button" type="button" data-admin-remove-row="${escapeHtml(entry.id)}">删除</button>
      </div>

      <div class="admin-row-fields">
        <label class="auth-field">
          <span>排序</span>
          <input type="number" min="1" value="${entry.position}" data-admin-field="position">
        </label>

        <label class="auth-field">
          <span>豪侠 / 帮会名</span>
          <input type="text" value="${escapeHtml(entry.name)}" data-admin-field="name" placeholder="请输入名字">
        </label>

        <label class="auth-field">
          <span>帮派 / 类型</span>
          <input type="text" value="${escapeHtml(entry.school)}" data-admin-field="school" placeholder="请输入帮派">
        </label>

        <label class="auth-field">
          <span>等级</span>
          <input type="number" min="0" step="1" value="${entry.score}" data-admin-field="score" placeholder="请输入等级">
        </label>
      </div>
    </article>
  `).join('');
}

function renderRankings(refs) {
  const category = getRankingCategory(state.activeCategory);

  if (refs.rankings.categoryLabel) refs.rankings.categoryLabel.textContent = category.label;
  if (refs.rankings.updatedMeta) refs.rankings.updatedMeta.textContent = formatUpdatedMeta(state.rankingsUpdatedAt, state.user);
  if (refs.rankings.saveButton) refs.rankings.saveButton.textContent = state.dirty.rankings ? '保存榜单 *' : '保存榜单';

  renderRankingCategoryTabs(refs);
  renderRankingRows(refs);
  renderRankingPreview(refs);
}

function renderNewsFilterTabs(refs) {
  const tabs = refs.news.filterTabs;
  if (!tabs) return;

  tabs.innerHTML = newsFilterOptions.map((filter) => `
    <button
      type="button"
      role="tab"
      class="${filter === state.activeNewsFilter ? 'is-active' : ''}"
      data-admin-news-filter="${filter}"
    >
      ${filter}
    </button>
  `).join('');
}

function renderNewsPreview(refs) {
  const previewList = refs.news.previewList;
  if (!previewList) return;

  const items = getFilteredNewsItems().slice(0, 6);
  previewList.innerHTML = items.map((item) => `
    <li>
      <span>【${escapeHtml(item.category)}】${escapeHtml(item.title || '未命名快报')}</span>
      <strong>${escapeHtml(item.date)}</strong>
    </li>
  `).join('');

  if (!items.length) {
    previewList.innerHTML = '<li><span>当前筛选下还没有快报内容。</span><strong>新增快报后即可开始编辑。</strong></li>';
  }
}

function renderNewsRows(refs) {
  const rowList = refs.news.rowList;
  if (!rowList) return;

  const items = getFilteredNewsItems();
  rowList.innerHTML = items.map((item, index) => `
    <article class="admin-row-card" data-news-id="${escapeHtml(item.id)}">
      <div class="admin-row-card-head">
        <strong>${escapeHtml(item.title || `第 ${index + 1} 条快报`)}</strong>
        <button class="text-button admin-danger-button" type="button" data-admin-news-remove-row="${escapeHtml(item.id)}">删除</button>
      </div>

      <div class="admin-row-fields admin-row-fields--news">
        <label class="auth-field">
          <span>发布日期</span>
          <input type="date" value="${escapeHtml(item.date)}" data-admin-news-field="date">
        </label>

        <label class="auth-field">
          <span>分类</span>
          <select data-admin-news-field="category">
            ${newsCategories.map((category) => `<option value="${escapeHtml(category)}"${category === item.category ? ' selected' : ''}>${escapeHtml(category)}</option>`).join('')}
          </select>
        </label>

        <label class="auth-field auth-field--full">
          <span>标题</span>
          <input type="text" value="${escapeHtml(item.title)}" data-admin-news-field="title" placeholder="请输入快报标题">
        </label>

        <label class="auth-field auth-field--full">
          <span>正文内容</span>
          <textarea rows="8" data-admin-news-field="bodyDraft" placeholder="请输入快报正文">${escapeHtml(item.bodyDraft || '')}</textarea>
        </label>
      </div>
    </article>
  `).join('');
}

function renderNews(refs) {
  if (refs.news.updatedMeta) refs.news.updatedMeta.textContent = formatUpdatedMeta(state.newsUpdatedAt, state.user);
  if (refs.news.saveButton) refs.news.saveButton.textContent = state.dirty.news ? '保存快报 *' : '保存快报';

  renderNewsFilterTabs(refs);
  renderNewsRows(refs);
  renderNewsPreview(refs);
}

function getLinkLabel(key) {
  if (key === 'discordUrl') return 'Discord 社群链接';
  if (key === 'downloadUrl') return '客户端下载文件链接';
  return key;
}

function renderLinks(refs) {
  refs.links.fields.forEach((input) => {
    const key = input.dataset.adminLinksField;
    if (!key) return;
    if (document.activeElement !== input) input.value = state.links[key] || '';
  });

  if (refs.links.previewList) {
    const rows = Object.entries(state.links).map(([key, value]) => `
      <li>
        <span>${escapeHtml(getLinkLabel(key))}</span>
        <strong>${escapeHtml(value || '未设置')}</strong>
      </li>
    `);

    refs.links.previewList.innerHTML = rows.join('');
  }

  if (refs.links.updatedMeta) refs.links.updatedMeta.textContent = formatUpdatedMeta(state.linksUpdatedAt, state.user);
  if (refs.links.saveButton) refs.links.saveButton.textContent = state.dirty.links ? '保存链接 *' : '保存链接';
}

function renderSession(refs) {
  if (!state.isAdmin) {
    state.contentMode = 'dashboard';
  }

  if (refs.logoutButton) refs.logoutButton.hidden = !state.user;

  if (refs.loginPanel) refs.loginPanel.hidden = Boolean(state.user);
  if (refs.pendingPanel) refs.pendingPanel.hidden = !(state.user && !state.isAdmin);
  if (refs.editorPanel) refs.editorPanel.hidden = !state.isAdmin;
  renderContentMode(refs);
}

function renderAdmin(refs) {
  renderContentMode(refs);
  renderRankings(refs);
  renderNews(refs);
  renderLinks(refs);
}

async function isAuthorizedAdmin(user) {
  const db = await getFirebaseFirestore();
  const firestore = await getFirebaseFirestoreModule();

  if (!db || !firestore || !user) return false;

  const snapshot = await firestore.getDoc(firestore.doc(db, 'admins', user.uid));
  return snapshot.exists() && snapshot.data().active === true;
}

async function refreshRankings(refs, statusMessage = '') {
  const result = await loadRankingsFromFirestore();
  state.rankings = result.rankings;
  state.rankingsUpdatedAt = result.updatedAt ?? null;
  state.dirty.rankings = false;
  renderRankings(refs);

  if (statusMessage) {
    setAlert(refs.status, statusMessage, 'success', { autoHideMs: 2600 });
  }
}

async function refreshNews(refs, statusMessage = '') {
  const result = await loadNewsFromFirestore();
  state.newsItems = result.items;
  state.newsUpdatedAt = result.updatedAt ?? null;
  state.dirty.news = false;
  renderNews(refs);

  if (statusMessage) {
    setAlert(refs.status, statusMessage, 'success', { autoHideMs: 2600 });
  }
}

async function refreshLinks(refs, statusMessage = '') {
  const result = await loadSiteLinksFromFirestore();
  state.links = result.links;
  state.linksUpdatedAt = result.updatedAt ?? null;
  state.dirty.links = false;
  renderLinks(refs);

  if (statusMessage) {
    setAlert(refs.status, statusMessage, 'success', { autoHideMs: 2600 });
  }
}

function focusRankingField(refs, entryId, field) {
  window.requestAnimationFrame(() => {
    const row = Array.from(refs.rankings.rowList?.querySelectorAll('[data-entry-id]') || [])
      .find((item) => item.dataset.entryId === entryId);
    const input = row?.querySelector(`[data-admin-field="${field}"]`);
    input?.focus();
    input?.select?.();
  });
}

function focusNewsField(refs, newsId, field) {
  window.requestAnimationFrame(() => {
    const row = Array.from(refs.news.rowList?.querySelectorAll('[data-news-id]') || [])
      .find((item) => item.dataset.newsId === newsId);
    const input = row?.querySelector(`[data-admin-news-field="${field}"]`);
    input?.focus();
    input?.select?.();
  });
}

function focusLinkField(refs, field) {
  window.requestAnimationFrame(() => {
    const input = refs.links.fields.find((item) => item.dataset.adminLinksField === field);
    input?.focus();
    input?.select?.();
  });
}

function validateRankingsForSave(refs) {
  for (const category of rankingCategories) {
    const entries = state.rankings[category.key] || [];

    for (const [index, entry] of entries.entries()) {
      const checks = [
        { field: 'name', label: '豪侠 / 帮会名', invalid: !String(entry.name || '').trim() },
        { field: 'school', label: '帮派 / 类型', invalid: !String(entry.school || '').trim() },
        { field: 'score', label: '等级', invalid: !Number.isFinite(Number(entry.score)) || Number(entry.score) <= 0 }
      ];
      const failed = checks.find((check) => check.invalid);

      if (failed) {
        state.activeCategory = category.key;
        renderRankings(refs);
        setAlert(refs.status, `请先补全「${category.label}」第 ${index + 1} 名的${failed.label}。`, 'error', { autoHideMs: 4200 });
        focusRankingField(refs, entry.id, failed.field);
        return false;
      }
    }
  }

  return true;
}

function validateNewsForSave(refs) {
  for (const [index, item] of state.newsItems.entries()) {
    const bodyDraft = String(item.bodyDraft || htmlToEditorText(item.body) || '').trim();
    const checks = [
      { field: 'date', label: '发布日期', invalid: !/^\d{4}-\d{2}-\d{2}$/.test(String(item.date || '').trim()) },
      { field: 'category', label: '分类', invalid: !newsCategories.includes(item.category) },
      { field: 'title', label: '标题', invalid: !String(item.title || '').trim() },
      { field: 'bodyDraft', label: '正文内容', invalid: !bodyDraft || bodyDraft === '请填写快报正文内容。' }
    ];
    const failed = checks.find((check) => check.invalid);

    if (failed) {
      state.activeNewsFilter = newsCategories.includes(item.category) ? item.category : '全部';
      renderNews(refs);
      setAlert(refs.status, `请先补全第 ${index + 1} 条快报的${failed.label}。`, 'error', { autoHideMs: 4200 });
      focusNewsField(refs, item.id, failed.field);
      return false;
    }
  }

  return true;
}

function validateLinksForSave(refs) {
  const checks = [
    { field: 'discordUrl', label: 'Discord 社群链接', value: state.links.discordUrl },
    { field: 'downloadUrl', label: '客户端下载文件链接', value: state.links.downloadUrl }
  ];

  const failed = checks.find((check) => !isValidSiteLink(check.value));
  if (!failed) return true;

  setAlert(refs.status, `请填写有效的 ${failed.label}，链接需要以 http:// 或 https:// 开头。`, 'error', { autoHideMs: 4200 });
  focusLinkField(refs, failed.field);
  return false;
}

function confirmSave(label) {
  return window.confirm(`确定要保存${label}吗？保存后前台内容会立即更新。`);
}

async function saveRankings(refs, options = {}) {
  const { confirm = true } = options;

  if (!validateRankingsForSave(refs)) return false;
  if (confirm && !confirmSave('排行榜内容')) return false;

  const db = await getFirebaseFirestore();
  const firestore = await getFirebaseFirestoreModule();

  if (!db || !firestore || !state.user) {
    setAlert(refs.status, '服务暂时不可用，当前无法保存。', 'error');
    return false;
  }

  refs.rankings.saveButton.disabled = true;
  refs.rankings.saveButton.textContent = '正在保存...';

  try {
    const actor = {
      uid: state.user.uid,
      email: state.user.email || '',
      displayName: state.user.displayName || ''
    };

    const payload = buildRankingsDocument(state.rankings, actor, firestore.serverTimestamp());
    await firestore.setDoc(firestore.doc(db, 'siteContent', 'rankings'), payload, { merge: true });
    await refreshRankings(refs, '排行榜已成功保存。');
    return true;
  } catch (error) {
    console.error('Unable to save rankings.', error);
    setAlert(refs.status, '保存失败，请稍后重试或联系管理员。', 'error');
    return false;
  } finally {
    refs.rankings.saveButton.disabled = false;
    renderRankings(refs);
  }
}

async function saveNews(refs, options = {}) {
  const { confirm = true } = options;

  if (!validateNewsForSave(refs)) return false;
  if (confirm && !confirmSave('快报公告内容')) return false;

  const db = await getFirebaseFirestore();
  const firestore = await getFirebaseFirestoreModule();

  if (!db || !firestore || !state.user) {
    setAlert(refs.status, '服务暂时不可用，当前无法保存。', 'error');
    return false;
  }

  refs.news.saveButton.disabled = true;
  refs.news.saveButton.textContent = '正在保存...';

  try {
    const actor = {
      uid: state.user.uid,
      email: state.user.email || '',
      displayName: state.user.displayName || ''
    };

    const payload = buildNewsDocument(state.newsItems, actor, firestore.serverTimestamp());
    await firestore.setDoc(firestore.doc(db, 'siteContent', 'news'), payload, { merge: true });
    await refreshNews(refs, '快报内容已成功保存。');
    return true;
  } catch (error) {
    console.error('Unable to save news.', error);
    setAlert(refs.status, '保存失败，请稍后重试或联系管理员。', 'error');
    return false;
  } finally {
    refs.news.saveButton.disabled = false;
    renderNews(refs);
  }
}

async function saveLinks(refs, options = {}) {
  const { confirm = true } = options;

  if (!validateLinksForSave(refs)) return false;
  if (confirm && !confirmSave('社群与下载链接')) return false;

  const db = await getFirebaseFirestore();
  const firestore = await getFirebaseFirestoreModule();

  if (!db || !firestore || !state.user) {
    setAlert(refs.status, '服务暂时不可用，当前无法保存。', 'error');
    return false;
  }

  refs.links.saveButton.disabled = true;
  refs.links.saveButton.textContent = '正在保存...';

  try {
    const actor = {
      uid: state.user.uid,
      email: state.user.email || '',
      displayName: state.user.displayName || ''
    };

    const payload = buildSiteLinksDocument(state.links, actor, firestore.serverTimestamp());
    await firestore.setDoc(firestore.doc(db, 'siteContent', 'links'), payload, { merge: true });
    await refreshLinks(refs, '链接已成功保存。');
    return true;
  } catch (error) {
    console.error('Unable to save site links.', error);
    setAlert(refs.status, '保存失败，请稍后重试或联系管理员。', 'error');
    return false;
  } finally {
    refs.links.saveButton.disabled = false;
    renderLinks(refs);
  }
}

function showUnsavedChangesDialog(mode) {
  const label = getModeLabel(mode);

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'admin-confirm-backdrop';
    overlay.innerHTML = `
      <section class="admin-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-unsaved-title">
        <p class="admin-card-kicker">Unsaved Changes</p>
        <h2 id="admin-unsaved-title">您有尚未保存的${label}修改</h2>
        <p>离开前请选择如何处理这些修改。保存后会立即更新前台内容；放弃则恢复为最近一次保存的数据。</p>
        <div class="admin-confirm-actions">
          <button class="auth-submit admin-save-button" type="button" data-unsaved-action="save">保存并返回</button>
          <button class="text-button admin-danger-button" type="button" data-unsaved-action="discard">放弃更改</button>
          <button class="text-button" type="button" data-unsaved-action="cancel">取消</button>
        </div>
      </section>
    `;

    const cleanup = (action) => {
      window.removeEventListener('keydown', onKeyDown);
      overlay.remove();
      resolve(action);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') cleanup('cancel');
    };

    overlay.addEventListener('click', (event) => {
      const action = event.target.closest('[data-unsaved-action]')?.dataset.unsavedAction;
      if (action) cleanup(action);
    });

    window.addEventListener('keydown', onKeyDown);
    document.body.append(overlay);
    overlay.querySelector('[data-unsaved-action="cancel"]')?.focus();
  });
}

async function saveContentMode(refs, mode) {
  if (mode === 'rankings') return saveRankings(refs, { confirm: false });
  if (mode === 'news') return saveNews(refs, { confirm: false });
  if (mode === 'links') return saveLinks(refs, { confirm: false });
  return true;
}

async function discardContentMode(refs, mode) {
  if (mode === 'rankings') {
    await refreshRankings(refs);
    return true;
  }

  if (mode === 'news') {
    await refreshNews(refs);
    return true;
  }

  if (mode === 'links') {
    await refreshLinks(refs);
    return true;
  }

  return true;
}

async function requestContentMode(refs, mode, options = {}) {
  const currentMode = state.contentMode;

  if (hasUnsavedChanges(currentMode) && currentMode !== mode) {
    const action = await showUnsavedChangesDialog(currentMode);

    if (action === 'cancel') return false;

    if (action === 'save') {
      const saved = await saveContentMode(refs, currentMode);
      if (!saved) return false;
    }

    if (action === 'discard') {
      await discardContentMode(refs, currentMode);
      setAlert(refs.status, `${getModeLabel(currentMode)}修改已放弃。`, 'success', { autoHideMs: 2600 });
    }
  }

  setContentMode(refs, mode, options);
  return true;
}

function wirePasswordToggles() {
  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.closest('.password-field')?.querySelector('input');
      if (!input) return;

      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
    });
  });
}

function wireRankingsEditorEvents(refs) {
  refs.rankings.categoryTabs?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-category]');
    if (!button) return;

    state.activeCategory = button.dataset.adminCategory || defaultRankingCategoryKey;
    renderRankings(refs);
  });

  refs.rankings.rowList?.addEventListener('input', (event) => {
    const field = event.target.dataset.adminField;
    const row = event.target.closest('[data-entry-id]');
    if (!field || !row) return;

    const entry = getActiveRankingEntries().find((item) => item.id === row.dataset.entryId);
    if (!entry) return;

    entry[field] = field === 'position' || field === 'score'
      ? Number(event.target.value || 0)
      : event.target.value;

    markDirty('rankings');
    renderRankingPreview(refs);
    if (refs.rankings.saveButton) refs.rankings.saveButton.textContent = '保存榜单 *';
  });

  refs.rankings.rowList?.addEventListener('change', (event) => {
    if (!event.target.dataset.adminField) return;
    state.rankings[state.activeCategory] = sortRankingEntries(getActiveRankingEntries());
    renderRankings(refs);
  });

  refs.rankings.rowList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-remove-row]');
    if (!button) return;

    state.rankings[state.activeCategory] = getActiveRankingEntries().filter((entry) => entry.id !== button.dataset.adminRemoveRow);
    state.rankings[state.activeCategory] = sortRankingEntries(getActiveRankingEntries());
    markDirty('rankings');
    renderRankings(refs);
  });

  refs.rankings.addButton?.addEventListener('click', () => {
    const nextEntries = [...getActiveRankingEntries(), createEmptyRankingEntry(state.activeCategory, getActiveRankingEntries().length)];
    state.rankings[state.activeCategory] = nextEntries;
    markDirty('rankings');
    renderRankings(refs);
  });

  document.querySelector('[data-admin-reload]')?.addEventListener('click', async () => {
    await refreshRankings(refs, '排行榜内容已刷新。');
  });

  document.querySelector('[data-admin-load-sample]')?.addEventListener('click', () => {
    state.rankings = getFallbackRankings();
    state.rankingsUpdatedAt = null;
    markDirty('rankings');
    renderRankings(refs);
    setAlert(refs.status, '示例榜单已载入，保存后将覆盖当前线上数据。', 'success', { autoHideMs: 2600 });
  });

  refs.rankings.saveButton?.addEventListener('click', async () => {
    await saveRankings(refs);
  });
}

function wireNewsEditorEvents(refs) {
  refs.news.filterTabs?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-news-filter]');
    if (!button) return;

    state.activeNewsFilter = button.dataset.adminNewsFilter || '全部';
    renderNews(refs);
  });

  refs.news.rowList?.addEventListener('input', (event) => {
    const field = event.target.dataset.adminNewsField;
    const row = event.target.closest('[data-news-id]');
    if (!field || !row) return;

    const item = state.newsItems.find((entry) => entry.id === row.dataset.newsId);
    if (!item) return;

    item[field] = event.target.value;
    if (field === 'bodyDraft') {
      item.body = editorTextToHtml(item.bodyDraft);
    }

    markDirty('news');
    renderNewsPreview(refs);
    if (refs.news.saveButton) refs.news.saveButton.textContent = '保存快报 *';
  });

  refs.news.rowList?.addEventListener('change', (event) => {
    const field = event.target.dataset.adminNewsField;
    const row = event.target.closest('[data-news-id]');
    if (!field || !row) return;

    const item = state.newsItems.find((entry) => entry.id === row.dataset.newsId);
    if (!item) return;

    if (field === 'bodyDraft') {
      item.body = editorTextToHtml(item.bodyDraft);
      return;
    }

    item[field] = event.target.value;
    markDirty('news');
    if (refs.news.saveButton) refs.news.saveButton.textContent = '保存快报 *';

    if (field === 'date' || field === 'category') {
      state.newsItems = sortNewsItems(state.newsItems);
      renderNews(refs);
    }
  });

  refs.news.rowList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-news-remove-row]');
    if (!button) return;

    state.newsItems = state.newsItems.filter((item) => item.id !== button.dataset.adminNewsRemoveRow);
    markDirty('news');
    renderNews(refs);
  });

  refs.news.addButton?.addEventListener('click', () => {
    const nextItem = createEmptyNewsItem(state.newsItems.length);
    if (state.activeNewsFilter !== '全部') {
      nextItem.category = state.activeNewsFilter;
    }

    state.newsItems = sortNewsItems([...state.newsItems, nextItem]);
    markDirty('news');
    renderNews(refs);
  });

  document.querySelector('[data-admin-news-reload]')?.addEventListener('click', async () => {
    await refreshNews(refs, '快报内容已刷新。');
  });

  document.querySelector('[data-admin-news-load-sample]')?.addEventListener('click', () => {
    state.newsItems = getFallbackNewsItems();
    state.newsUpdatedAt = null;
    markDirty('news');
    renderNews(refs);
    setAlert(refs.status, '示例快报已载入，保存后将覆盖当前线上数据。', 'success', { autoHideMs: 2600 });
  });

  refs.news.saveButton?.addEventListener('click', async () => {
    await saveNews(refs);
  });
}

function wireLinksEditorEvents(refs) {
  refs.links.fields.forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.adminLinksField;
      if (!key) return;

      state.links[key] = input.value.trim();
      markDirty('links');
      renderLinks(refs);
    });
  });

  document.querySelector('[data-admin-links-reload]')?.addEventListener('click', async () => {
    await refreshLinks(refs, '链接内容已刷新。');
  });

  document.querySelector('[data-admin-links-load-sample]')?.addEventListener('click', () => {
    state.links = getFallbackSiteLinks();
    state.linksUpdatedAt = null;
    markDirty('links');
    renderLinks(refs);
    setAlert(refs.status, '默认链接已载入，保存后将覆盖当前线上数据。', 'success', { autoHideMs: 2600 });
  });

  refs.links.saveButton?.addEventListener('click', async () => {
    await saveLinks(refs);
  });
}

function wireContentModeEvents(refs) {
  refs.dashboardOpenButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      await requestContentMode(refs, button.dataset.adminOpenMode || 'dashboard', { history: 'push' });
    });
  });

  refs.backButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      await requestContentMode(refs, 'dashboard', { history: 'replace' });
    });
  });

  window.addEventListener('popstate', async () => {
    const currentMode = state.contentMode;
    const targetMode = state.isAdmin ? getModeFromLocation() : 'dashboard';
    const changed = await requestContentMode(refs, targetMode);

    if (!changed) {
      writeModeHistory(currentMode, 'push');
    }
  });

  window.addEventListener('beforeunload', (event) => {
    if (!hasAnyUnsavedChanges()) return;

    event.preventDefault();
    event.returnValue = '';
  });
}

async function bootAdminPage() {
  const refs = createReferences();
  const auth = await getFirebaseAuth();
  const authModule = await getFirebaseAuthModule();

  if (!auth || !authModule) {
    setAlert(refs.status, '后台服务暂时不可用，请稍后再试。', 'error');
    return;
  }

  wirePasswordToggles();
  wireContentModeEvents(refs);
  wireRankingsEditorEvents(refs);
  wireNewsEditorEvents(refs);
  wireLinksEditorEvents(refs);
  setContentMode(refs, 'dashboard', { history: 'replace' });
  renderAdmin(refs);
  renderSession(refs);

  refs.loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = refs.loginForm.elements.namedItem('email')?.value?.trim();
    const password = refs.loginForm.elements.namedItem('password')?.value || '';

    if (!email || !password) {
      setAlert(refs.loginAlert, '请输入邮箱和密码。', 'error', { autoHideMs: 2600 });
      return;
    }

    refs.loginForm.querySelector('[type="submit"]').disabled = true;
    setAlert(refs.loginAlert, '正在登录后台...', 'success');

    try {
      await authModule.signInWithEmailAndPassword(auth, email, password);
      refs.loginForm.reset();
      setAlert(refs.loginAlert, '');
    } catch (error) {
      console.error('Unable to sign in to admin.', error);
      setAlert(refs.loginAlert, '登录失败，请检查邮箱和密码。', 'error', { autoHideMs: 3200 });
    } finally {
      refs.loginForm.querySelector('[type="submit"]').disabled = false;
    }
  });

  refs.logoutButton?.addEventListener('click', async () => {
    await authModule.signOut(auth);
  });

  authModule.onAuthStateChanged(auth, async (user) => {
    state.user = user;
    state.isAdmin = false;
    setContentMode(refs, 'dashboard', { history: 'replace' });
    renderSession(refs);

    if (!user) {
      setAlert(refs.status, '请先登录后再继续。', 'error');
      return;
    }

    setAlert(refs.status, '正在验证访问权限...', 'success');

    try {
      state.isAdmin = await isAuthorizedAdmin(user);
      renderSession(refs);

      if (!state.isAdmin) {
        setAlert(refs.status, '当前账号暂未获得此工作区的访问权限。', 'error');
        return;
      }

      await Promise.all([
        refreshRankings(refs),
        refreshNews(refs),
        refreshLinks(refs)
      ]);

      setContentMode(refs, 'dashboard', { history: 'replace' });
      setAlert(refs.status, '内容已载入，您可以开始编辑。', 'success', { autoHideMs: 2600 });
    } catch (error) {
      console.error('Unable to validate admin access.', error);
      setAlert(refs.status, '无法验证访问权限，请稍后重试。', 'error');
    }
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootAdminPage, { once: true });
} else {
  bootAdminPage();
}
