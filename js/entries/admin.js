import { initClickSound } from '../shared/click-sound.js';
import { initLeafCanvas } from '../shared/leaf-canvas.js';
import { getFirebaseAuth, getFirebaseAuthModule, getFirebaseFirestore, getFirebaseFirestoreModule } from '../shared/firebase-client.js';
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

const state = {
  activeCategory: defaultRankingCategoryKey,
  dirty: false,
  isAdmin: false,
  rankings: getFallbackRankings(),
  user: null,
  updatedAt: null
};

function setAlert(element, message, tone = 'warning') {
  if (!element) return;

  element.textContent = message;
  element.classList.remove('is-hidden', 'is-error', 'is-success');
  if (tone === 'error') element.classList.add('is-error');
  if (tone === 'success') element.classList.add('is-success');
  if (!message) element.classList.add('is-hidden');
}

function createReferences() {
  return {
    categoryLabel: document.querySelector('[data-admin-category-label]'),
    categoryTabs: document.querySelector('[data-admin-category-tabs]'),
    editorPanel: document.querySelector('[data-admin-editor-panel]'),
    email: document.querySelector('[data-admin-email]'),
    loginAlert: document.querySelector('[data-admin-login-alert]'),
    loginForm: document.querySelector('[data-admin-login-form]'),
    loginPanel: document.querySelector('[data-admin-login-panel]'),
    logoutButton: document.querySelector('[data-admin-logout]'),
    pendingPanel: document.querySelector('[data-admin-pending-panel]'),
    previewList: document.querySelector('[data-admin-preview-list]'),
    rowList: document.querySelector('[data-admin-row-list]'),
    saveButton: document.querySelector('[data-admin-save]'),
    sessionLabel: document.querySelector('[data-admin-session-label]'),
    status: document.querySelector('[data-admin-status]'),
    uid: document.querySelector('[data-admin-uid]'),
    updatedMeta: document.querySelector('[data-admin-updated-meta]')
  };
}

function getActiveEntries() {
  return state.rankings[state.activeCategory] || [];
}

function sortEntries(entries) {
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

function markDirty() {
  state.dirty = true;
}

function formatUpdatedMeta(value, user) {
  if (!value?.toDate) return '当前显示的是本地或默认数据。';

  const formatted = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(value.toDate());

  if (!user?.email) return `最近保存时间：${formatted}`;
  return `最近保存时间：${formatted} · ${user.email}`;
}

function renderCategoryTabs(refs) {
  if (!refs.categoryTabs) return;

  refs.categoryTabs.innerHTML = rankingCategories.map((category) => `
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

function renderPreview(refs) {
  if (!refs.previewList) return;

  const previewEntries = sortEntries(getActiveEntries());
  refs.previewList.innerHTML = previewEntries.map((entry) => `
    <li>
      <span>${entry.position}. ${entry.name || '未命名'}</span>
      <strong>${entry.school || '未设置流派'} · ${formatRankingScore(entry.score)}</strong>
    </li>
  `).join('');

  if (!previewEntries.length) {
    refs.previewList.innerHTML = '<li><span>当前分类还没有榜单数据。</span><strong>新增一行后即可开始编辑。</strong></li>';
  }
}

function renderRows(refs) {
  if (!refs.rowList) return;

  const entries = sortEntries(getActiveEntries());
  state.rankings[state.activeCategory] = entries;

  refs.rowList.innerHTML = entries.map((entry) => `
    <article class="admin-row-card" data-entry-id="${entry.id}">
      <div class="admin-row-card-head">
        <strong>第 ${entry.position} 名</strong>
        <button class="text-button" type="button" data-admin-remove-row="${entry.id}">删除</button>
      </div>

      <div class="admin-row-fields">
        <label class="auth-field">
          <span>排序</span>
          <input type="number" min="1" value="${entry.position}" data-admin-field="position">
        </label>

        <label class="auth-field">
          <span>豪侠 / 帮会名</span>
          <input type="text" value="${entry.name}" data-admin-field="name" placeholder="请输入名字">
        </label>

        <label class="auth-field">
          <span>流派 / 类型</span>
          <input type="text" value="${entry.school}" data-admin-field="school" placeholder="请输入流派">
        </label>

        <label class="auth-field">
          <span>战力 / 积分</span>
          <input type="number" min="0" step="1" value="${entry.score}" data-admin-field="score" placeholder="请输入分数">
        </label>
      </div>
    </article>
  `).join('');
}

function renderEditor(refs) {
  const category = getRankingCategory(state.activeCategory);

  if (refs.categoryLabel) refs.categoryLabel.textContent = category.label;
  if (refs.updatedMeta) refs.updatedMeta.textContent = formatUpdatedMeta(state.updatedAt, state.user);
  if (refs.saveButton) refs.saveButton.textContent = state.dirty ? '保存榜单 *' : '保存榜单';

  renderCategoryTabs(refs);
  renderRows(refs);
  renderPreview(refs);
}

function renderSession(refs) {
  const email = state.user?.email || '未登录';
  const uid = state.user?.uid || '等待登录';

  if (refs.email) refs.email.textContent = email;
  if (refs.uid) refs.uid.textContent = uid;
  if (refs.sessionLabel) refs.sessionLabel.textContent = state.user ? email : '未登录';
  if (refs.logoutButton) refs.logoutButton.hidden = !state.user;

  if (refs.loginPanel) refs.loginPanel.hidden = Boolean(state.user);
  if (refs.pendingPanel) refs.pendingPanel.hidden = !(state.user && !state.isAdmin);
  if (refs.editorPanel) refs.editorPanel.hidden = !state.isAdmin;
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
  state.updatedAt = result.updatedAt ?? null;
  state.dirty = false;
  renderEditor(refs);

  if (statusMessage) {
    setAlert(refs.status, statusMessage, 'success');
  }
}

async function saveRankings(refs) {
  const db = await getFirebaseFirestore();
  const firestore = await getFirebaseFirestoreModule();

  if (!db || !firestore || !state.user) {
    setAlert(refs.status, 'Firebase 连接未完成，暂时无法保存。', 'error');
    return;
  }

  refs.saveButton.disabled = true;
  refs.saveButton.textContent = '正在保存...';

  try {
    const actor = {
      uid: state.user.uid,
      email: state.user.email || '',
      displayName: state.user.displayName || ''
    };

    const payload = buildRankingsDocument(state.rankings, actor, firestore.serverTimestamp());
    await firestore.setDoc(firestore.doc(db, 'siteContent', 'rankings'), payload, { merge: true });
    await refreshRankings(refs, '榜单已保存到 Firestore。');
  } catch (error) {
    console.error('Unable to save rankings.', error);
    setAlert(refs.status, '保存失败，请检查 Firestore 规则与管理员权限。', 'error');
  } finally {
    refs.saveButton.disabled = false;
    renderEditor(refs);
  }
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

function wireEditorEvents(refs) {
  refs.categoryTabs?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-category]');
    if (!button) return;

    state.activeCategory = button.dataset.adminCategory || defaultRankingCategoryKey;
    renderEditor(refs);
  });

  refs.rowList?.addEventListener('input', (event) => {
    const field = event.target.dataset.adminField;
    const row = event.target.closest('[data-entry-id]');
    if (!field || !row) return;

    const entries = getActiveEntries();
    const entry = entries.find((item) => item.id === row.dataset.entryId);
    if (!entry) return;

    entry[field] = field === 'position' || field === 'score'
      ? Number(event.target.value || 0)
      : event.target.value;

    markDirty();
    renderPreview(refs);
    if (refs.saveButton) refs.saveButton.textContent = '保存榜单 *';
  });

  refs.rowList?.addEventListener('change', (event) => {
    const field = event.target.dataset.adminField;
    if (!field) return;

    state.rankings[state.activeCategory] = sortEntries(getActiveEntries());
    renderEditor(refs);
  });

  refs.rowList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-remove-row]');
    if (!button) return;

    state.rankings[state.activeCategory] = getActiveEntries().filter((entry) => entry.id !== button.dataset.adminRemoveRow);
    state.rankings[state.activeCategory] = sortEntries(getActiveEntries());
    markDirty();
    renderEditor(refs);
  });

  document.querySelector('[data-admin-add-row]')?.addEventListener('click', () => {
    const nextEntries = [...getActiveEntries(), createEmptyRankingEntry(state.activeCategory, getActiveEntries().length)];
    state.rankings[state.activeCategory] = nextEntries;
    markDirty();
    renderEditor(refs);
  });

  document.querySelector('[data-admin-reload]')?.addEventListener('click', async () => {
    await refreshRankings(refs, '已重新读取云端榜单。');
  });

  document.querySelector('[data-admin-load-sample]')?.addEventListener('click', () => {
    state.rankings = getFallbackRankings();
    state.updatedAt = null;
    markDirty();
    renderEditor(refs);
    setAlert(refs.status, '已恢复示例数据，记得点击“保存榜单”发布到云端。', 'success');
  });

  refs.saveButton?.addEventListener('click', async () => {
    await saveRankings(refs);
  });
}

async function bootAdminPage() {
  await initClickSound();
  initLeafCanvas();

  const refs = createReferences();
  const auth = await getFirebaseAuth();
  const authModule = await getFirebaseAuthModule();

  if (!auth || !authModule) {
    setAlert(refs.status, '请先完成 js/shared/firebase-config.js 配置后再使用后台。', 'error');
    return;
  }

  wirePasswordToggles();
  wireEditorEvents(refs);
  renderEditor(refs);
  renderSession(refs);

  refs.loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = refs.loginForm.elements.namedItem('email')?.value?.trim();
    const password = refs.loginForm.elements.namedItem('password')?.value || '';

    if (!email || !password) {
      setAlert(refs.loginAlert, '请输入邮箱和密码。', 'error');
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
      setAlert(refs.loginAlert, '登录失败，请检查邮箱、密码与 Firebase Auth 设置。', 'error');
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
    renderSession(refs);

    if (!user) {
      setAlert(refs.status, '请先使用管理员邮箱登录。', 'error');
      return;
    }

    setAlert(refs.status, '正在验证管理员权限...', 'success');

    try {
      state.isAdmin = await isAuthorizedAdmin(user);
      renderSession(refs);

      if (!state.isAdmin) {
        setAlert(refs.status, '当前账号已登录，但尚未进入 admins 白名单。', 'error');
        return;
      }

      await refreshRankings(refs, '管理员身份已确认，云端榜单已载入。');
    } catch (error) {
      console.error('Unable to validate admin access.', error);
      setAlert(refs.status, '无法验证后台权限，请检查 Firestore 规则。', 'error');
    }
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootAdminPage, { once: true });
} else {
  bootAdminPage();
}
