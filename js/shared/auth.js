import {
  getFirebaseAuth,
  getFirebaseAuthModule,
  getFirebaseFirestore,
  getFirebaseFirestoreModule
} from './firebase-client.js';

const authCopy = {
  login: ['账号', '邮箱登录'],
  register: ['注册', '初入江湖'],
  forgot: ['重置', '找回密码']
};
const authSetupMessage = '请先在 js/shared/firebase-config.js 填入完整的 Firebase Web App 配置。';
const authLoadingMessage = '正在连接江湖命脉...';
const emailVerificationMessage = '验证邮件已发送，请前往邮箱点击验证链接。本窗口会自动确认并登录。';
const emailVerificationWaitingMessage = '正在等待邮箱验证... 验证完成后会自动登录。若未立即收到，请检查垃圾邮件/Spam。';
const emailVerificationTimeoutMessage = '暂未检测到邮箱验证。请验证后使用邮箱和密码登录。';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[A-Za-z0-9]{4,20}$/;
const phonePattern = /^\+?[0-9\s-]{7,20}$/;
const smsPhonePattern = /^\+[1-9]\d{7,14}$/;
const secondaryPasswordPattern = /^\d{4}$/;
const usernameTakenCode = 'auth/username-already-in-use';
const verificationPollMs = 5000;
const verificationTimeoutMs = 10 * 60 * 1000;
const pendingSignupStorageKey = 'hongxiPendingSignupProfiles';
let currentAuthUser = null;
let currentUserProfile = null;
let profileClockTimer = null;
let profileOriginalValues = null;
let phoneVerificationState = { phone: '', verificationId: '', verified: false };
let recaptchaVerifier = null;

function getAuthAlert(form) {
  return form?.querySelector('[data-auth-alert]');
}

function setAuthAlert(form, message, state = 'warning') {
  const alert = getAuthAlert(form);
  if (!alert) return;

  alert.textContent = message;
  alert.classList.remove('is-hidden', 'is-error', 'is-success');
  if (state === 'error') alert.classList.add('is-error');
  if (state === 'success') alert.classList.add('is-success');
  if (!message) alert.classList.add('is-hidden');
}

function setInputInvalid(input, isInvalid) {
  if (!input) return;
  input.classList.toggle('is-invalid', isInvalid);
  input.setAttribute('aria-invalid', String(isInvalid));
}

function resetAuthFeedback(form) {
  if (!form) return;

  form.querySelectorAll('input').forEach((input) => setInputInvalid(input, false));
  setAuthAlert(form, '');
}

function getNamedInput(form, name) {
  return form.elements.namedItem(name);
}

function getSubmitButton(form) {
  return form?.querySelector('[type="submit"]');
}

function setFormPending(form, isPending, pendingLabel = '处理中...') {
  const submit = getSubmitButton(form);

  if (submit) {
    if (!submit.dataset.originalLabel) {
      submit.dataset.originalLabel = submit.textContent.trim();
    }

    submit.textContent = isPending ? pendingLabel : submit.dataset.originalLabel;
    submit.setAttribute('aria-busy', String(isPending));
  }

  form?.querySelectorAll('input, button').forEach((field) => {
    field.disabled = isPending;
  });
}

function getTrimmedValue(form, name) {
  const input = getNamedInput(form, name);
  return typeof input?.value === 'string' ? input.value.trim() : '';
}

function getRawValue(form, name) {
  const input = getNamedInput(form, name);
  return typeof input?.value === 'string' ? input.value : '';
}

function normalizeUsername(username) {
  return username.trim();
}

function normalizeUsernameKey(username) {
  return normalizeUsername(username).toLowerCase();
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone) {
  return phone.trim().replace(/\s+/g, ' ');
}

function normalizeSmsPhone(phone) {
  return phone.trim().replace(/[\s-]+/g, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  return null;
}

function formatLastOnline(value, isOnline = false) {
  if (isOnline) return '当前在线';

  const date = timestampToDate(value);
  if (!date) return '暂无在线记录';

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return '刚刚在线';

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes} 分钟前在线`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} 小时前在线`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} 天前在线`;
}

function readPendingSignupProfiles() {
  try {
    return JSON.parse(window.localStorage.getItem(pendingSignupStorageKey) || '{}');
  } catch {
    return {};
  }
}

function writePendingSignupProfiles(profiles) {
  try {
    window.localStorage.setItem(pendingSignupStorageKey, JSON.stringify(profiles));
  } catch {}
}

function savePendingSignupProfile(uid, profile) {
  const profiles = readPendingSignupProfiles();
  profiles[uid] = profile;
  writePendingSignupProfiles(profiles);
}

function getPendingSignupProfile(user) {
  if (!user?.uid) return null;
  const profiles = readPendingSignupProfiles();
  return profiles[user.uid] || null;
}

function removePendingSignupProfile(uid) {
  if (!uid) return;
  const profiles = readPendingSignupProfiles();
  delete profiles[uid];
  writePendingSignupProfiles(profiles);
}

function validateAuthForm(form) {
  const mode = form.dataset.authForm;
  const invalid = [];

  form.querySelectorAll('input').forEach((input) => setInputInvalid(input, false));

  if (mode === 'login') {
    const email = getNamedInput(form, 'email');
    const password = getNamedInput(form, 'password');

    if (email && !email.value.trim()) invalid.push([email, '请输入注册邮箱']);
    if (email && email.value.trim() && !emailPattern.test(email.value.trim())) invalid.push([email, '请输入有效电子邮箱']);
    if (password && !password.value) invalid.push([password, '请输入密码']);
    if (password && password.value && password.value.length < 8) invalid.push([password, '请输入至少8位密码']);
  }

  if (mode === 'register') {
    const username = getNamedInput(form, 'username');
    const password = getNamedInput(form, 'password');
    const confirmPassword = getNamedInput(form, 'confirmPassword');
    const email = getNamedInput(form, 'email');
    const phone = getNamedInput(form, 'phone');
    const secondaryPassword = getNamedInput(form, 'secondaryPassword');

    if (username && !usernamePattern.test(username.value.trim())) {
      invalid.push([username, '账号需为4-20位字母或数字']);
    }

    if (password && password.value.length < 8) {
      invalid.push([password, '通关密语至少8位']);
    }

    if (confirmPassword && password && (confirmPassword.value !== password.value || !confirmPassword.value)) {
      invalid.push([confirmPassword, '两次输入的通关密语不一致']);
    }

    if (email && !email.value.trim()) {
      invalid.push([email, '请输入注册邮箱']);
    }

    if (email && email.value.trim() && !emailPattern.test(email.value.trim())) {
      invalid.push([email, '请输入有效电子邮箱']);
    }

    if (phone && phone.value.trim() && !phonePattern.test(phone.value.trim())) {
      invalid.push([phone, '请输入有效手机号码']);
    }

    if (secondaryPassword && secondaryPassword.value.trim() && !secondaryPasswordPattern.test(secondaryPassword.value.trim())) {
      invalid.push([secondaryPassword, '二级密码必须为4位数字']);
    }
  }

  if (mode === 'forgot') {
    const email = getNamedInput(form, 'email');
    if (email && !email.value.trim()) invalid.push([email, '请输入注册邮箱']);
    if (email && email.value.trim() && !emailPattern.test(email.value.trim())) invalid.push([email, '请输入有效电子邮箱']);
  }

  if (invalid.length) {
    invalid.forEach(([input]) => setInputInvalid(input, true));
    return { valid: false, input: invalid[0][0], message: invalid[0][1] };
  }

  return { valid: true };
}

function formatAuthError(error) {
  const code = error?.code || '';

  switch (code) {
    case 'permission-denied':
    case 'firestore/permission-denied':
      return '账号资料无法保存，请先部署最新 Firestore 规则后再注册。';
    case usernameTakenCode:
      return '该账号名已被使用，请换一个大侠名。';
    case 'auth/email-already-in-use':
      return '该邮箱已被注册，请直接登录。';
    case 'auth/invalid-email':
      return '邮箱格式不正确，请重新输入。';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return '邮箱或密码不正确，请重新尝试。';
    case 'auth/weak-password':
      return '密码强度不足，请至少使用 6 位字符。';
    case 'auth/too-many-requests':
      return '尝试次数过多，请稍后再试。';
    case 'auth/network-request-failed':
      return '网络连接异常，请检查后重试。';
    case 'auth/invalid-verification-code':
      return '验证码不正确，请重新输入。';
    case 'auth/code-expired':
      return '验证码已过期，请重新发送。';
    case 'auth/captcha-check-failed':
      return '短信验证校验失败，请刷新页面后重试。';
    case 'auth/requires-recent-login':
      return '为了安全，请退出后重新登录，再修改手机号。';
    case 'auth/credential-already-in-use':
      return '该手机号已绑定其他账号。';
    default:
      return '操作未完成，请稍后再试。';
  }
}

async function deleteIncompleteUser(authModule, user) {
  if (!user || typeof authModule?.deleteUser !== 'function') return;

  try {
    await authModule.deleteUser(user);
  } catch {}
}

async function refreshUserToken(user) {
  if (typeof user?.getIdToken !== 'function') return;

  try {
    await user.getIdToken(true);
  } catch {}
}

async function waitForEmailVerification(auth, authModule, user, onStatus) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < verificationTimeoutMs) {
    if (typeof authModule?.reload === 'function') {
      await authModule.reload(user);
    }

    if (user.emailVerified) {
      await refreshUserToken(user);
      return true;
    }

    onStatus?.();
    await new Promise((resolve) => {
      window.setTimeout(resolve, verificationPollMs);
    });
  }

  await authModule.signOut(auth);
  return false;
}

function buildUserProfile(form, user) {
  const username = normalizeUsername(getTrimmedValue(form, 'username'));
  const phone = normalizeSmsPhone(getTrimmedValue(form, 'phone'));

  return {
    uid: user.uid,
    username,
    usernameLower: normalizeUsernameKey(username),
    email: user.email || normalizeEmail(getTrimmedValue(form, 'email')),
    phone,
    online: true
  };
}

async function createUserProfile(profile, user) {
  const firestore = await getFirebaseFirestore();
  const firestoreModule = await getFirebaseFirestoreModule();

  if (!firestore || !firestoreModule) {
    throw new Error('Firestore is not configured.');
  }

  const { doc, runTransaction, serverTimestamp } = firestoreModule;
  const userRef = doc(firestore, 'users', user.uid);
  const usernameRef = doc(firestore, 'usernames', profile.usernameLower);

  await runTransaction(firestore, async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef);

    if (usernameSnapshot.exists() && usernameSnapshot.data()?.uid !== user.uid) {
      const error = new Error('Username already in use.');
      error.code = usernameTakenCode;
      throw error;
    }

    transaction.set(usernameRef, {
      uid: user.uid,
      username: profile.username,
      usernameLower: profile.usernameLower,
      createdAt: serverTimestamp()
    });

    transaction.set(userRef, {
      uid: user.uid,
      username: profile.username,
      usernameLower: profile.usernameLower,
      email: profile.email,
      phone: profile.phone,
      online: true,
      lastOnlineAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  });
}

async function loadUserProfile(user) {
  if (!user?.uid) return null;

  const firestore = await getFirebaseFirestore();
  const firestoreModule = await getFirebaseFirestoreModule();
  if (!firestore || !firestoreModule) return null;

  const snapshot = await firestoreModule.getDoc(firestoreModule.doc(firestore, 'users', user.uid));
  return snapshot.exists() ? snapshot.data() : null;
}

async function updateUserPresence(user, online) {
  if (!user?.uid || !user.emailVerified) return;

  const firestore = await getFirebaseFirestore();
  const firestoreModule = await getFirebaseFirestoreModule();
  if (!firestore || !firestoreModule) return;

  const { doc, getDoc, serverTimestamp, setDoc } = firestoreModule;
  const userRef = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return;

  const profile = snapshot.data();
  const username = profile.username || user.displayName || '';
  const patch = {
    uid: user.uid,
    email: user.email || '',
    username,
    usernameLower: profile.usernameLower || normalizeUsernameKey(username),
    phone: profile.phone || '',
    online,
    lastOnlineAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, patch, { merge: true });
}

async function saveUserProfile(form) {
  if (!currentAuthUser?.uid) throw new Error('No signed-in user.');

  const firestore = await getFirebaseFirestore();
  const firestoreModule = await getFirebaseFirestoreModule();
  const authModule = await getFirebaseAuthModule();
  if (!firestore || !firestoreModule) throw new Error('Firestore is not configured.');

  const username = normalizeUsername(getTrimmedValue(form, 'username'));
  const usernameLower = normalizeUsernameKey(username);
  const phone = normalizeSmsPhone(getTrimmedValue(form, 'phone'));
  const { doc, runTransaction, serverTimestamp } = firestoreModule;
  const userRef = doc(firestore, 'users', currentAuthUser.uid);

  await runTransaction(firestore, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const previousProfile = userSnapshot.exists() ? userSnapshot.data() : {};
    const previousUsernameLower = previousProfile.usernameLower || normalizeUsernameKey(previousProfile.username || '');
    const usernameRef = doc(firestore, 'usernames', usernameLower);
    const usernameSnapshot = await transaction.get(usernameRef);

    if (usernameSnapshot.exists() && usernameSnapshot.data()?.uid !== currentAuthUser.uid) {
      const error = new Error('Username already in use.');
      error.code = usernameTakenCode;
      throw error;
    }

    if (!usernameSnapshot.exists()) {
      transaction.set(usernameRef, {
        uid: currentAuthUser.uid,
        username,
        usernameLower,
        createdAt: serverTimestamp()
      });
    }

    if (usernameLower !== previousUsernameLower) {
      if (previousUsernameLower) {
        transaction.delete(doc(firestore, 'usernames', previousUsernameLower));
      }
    }

    transaction.set(userRef, {
      uid: currentAuthUser.uid,
      username,
      usernameLower,
      email: currentAuthUser.email || previousProfile.email || '',
      phone,
      online: true,
      lastOnlineAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: previousProfile.createdAt || serverTimestamp()
    });
  });

  if (typeof authModule?.updateProfile === 'function') {
    await authModule.updateProfile(currentAuthUser, { displayName: username });
  }

  currentUserProfile = {
    ...(currentUserProfile || {}),
    uid: currentAuthUser.uid,
    username,
    usernameLower,
    email: currentAuthUser.email || currentUserProfile?.email || '',
    phone,
    online: true
  };
}

function getUserLabel(user, profile = currentUserProfile) {
  const source = profile?.username?.trim() || user?.displayName?.trim() || user?.email?.split('@')[0] || '少侠';
  return source.length > 10 ? `${source.slice(0, 10)}...` : source;
}

function buildUserButtonContent(user) {
  const label = escapeHtml(getUserLabel(user));
  return `
    <span class="auth-user-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M20 21a8 8 0 0 0-16 0"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span class="auth-status-dot"></span>
    </span>
    <span class="auth-user-name">${label}</span>
  `;
}

function syncAuthActions(user) {
  document.querySelectorAll('.auth-actions').forEach((actions) => {
    const [loginButton, primaryButton] = actions.querySelectorAll('button');
    if (!loginButton || !primaryButton) return;

    if (user?.emailVerified) {
      loginButton.innerHTML = buildUserButtonContent(user);
      loginButton.disabled = false;
      loginButton.classList.add('auth-user');
      loginButton.removeAttribute('data-auth-open');
      loginButton.dataset.profileOpen = 'true';
      loginButton.setAttribute('aria-label', `查看账号资料：${getUserLabel(user)}`);

      primaryButton.hidden = true;
      primaryButton.removeAttribute('data-auth-open');
      primaryButton.removeAttribute('data-auth-logout');
    } else {
      loginButton.textContent = '登录';
      loginButton.disabled = false;
      loginButton.classList.remove('auth-user');
      loginButton.dataset.authOpen = 'login';
      loginButton.removeAttribute('data-profile-open');
      loginButton.removeAttribute('aria-label');

      primaryButton.textContent = '注册';
      primaryButton.hidden = false;
      primaryButton.disabled = false;
      primaryButton.dataset.authOpen = 'register';
      primaryButton.removeAttribute('data-auth-logout');
    }
  });
}

function ensureProfileModal() {
  let modal = document.querySelector('[data-profile-modal]');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.className = 'profile-modal';
  modal.dataset.profileModal = 'true';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <button class="modal-close" type="button" aria-label="关闭" data-profile-close>×</button>
      <h2 id="profile-title">账号资料</h2>
      <div class="profile-card">
        <div class="profile-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M20 21a8 8 0 0 0-16 0"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="profile-status-dot"></span>
        </div>
        <div>
          <strong data-profile-name>少侠</strong>
          <span data-profile-email></span>
          <small data-profile-last-online>暂无在线记录</small>
        </div>
      </div>
      <form class="profile-form" data-profile-form novalidate>
        <div class="auth-alert is-hidden" role="alert" aria-live="polite" data-profile-alert></div>
        <label class="auth-field">
          <span>尊称（账号）</span>
          <input type="text" name="username" autocomplete="username" placeholder="4-20位字母或数字" readonly>
        </label>
        <label class="auth-field">
          <span>电子邮箱</span>
          <input type="email" name="email" autocomplete="email" readonly>
        </label>
        <label class="auth-field">
          <span>手机号码（可选）</span>
          <input type="tel" name="phone" autocomplete="tel" placeholder="国际格式，例如 +639171234567" readonly>
        </label>
        <div class="phone-verify-panel" data-phone-verify-panel hidden>
          <div class="phone-verify-row">
            <button class="profile-secondary" type="button" data-phone-send-code>发送短信验证码</button>
            <button class="profile-secondary" type="button" data-phone-verify-code disabled>验证手机</button>
          </div>
          <div class="otp-boxes" aria-label="短信验证码">
            <input data-otp-input type="text" inputmode="numeric" maxlength="1" autocomplete="one-time-code" aria-label="验证码第1位">
            <input data-otp-input type="text" inputmode="numeric" maxlength="1" aria-label="验证码第2位">
            <input data-otp-input type="text" inputmode="numeric" maxlength="1" aria-label="验证码第3位">
            <input data-otp-input type="text" inputmode="numeric" maxlength="1" aria-label="验证码第4位">
            <input data-otp-input type="text" inputmode="numeric" maxlength="1" aria-label="验证码第5位">
            <input data-otp-input type="text" inputmode="numeric" maxlength="1" aria-label="验证码第6位">
          </div>
          <p class="phone-verify-status" data-phone-verify-status></p>
          <div data-recaptcha-container></div>
        </div>
        <div class="profile-actions">
          <button class="profile-secondary" type="button" data-profile-edit>编辑资料</button>
          <button class="profile-save" type="submit" disabled>保存更改</button>
          <button class="profile-secondary" type="button" data-profile-reset-password>申请重置密码</button>
          <button class="profile-danger" type="button" data-auth-logout>退出登录</button>
        </div>
      </form>
    </div>
  `;
  document.body.append(modal);
  return modal;
}

function setProfileAlert(modal, message, state = 'warning') {
  const alert = modal?.querySelector('[data-profile-alert]');
  if (!alert) return;

  alert.textContent = message;
  alert.classList.remove('is-hidden', 'is-error', 'is-success');
  if (state === 'error') alert.classList.add('is-error');
  if (state === 'success') alert.classList.add('is-success');
  if (!message) alert.classList.add('is-hidden');
}

function getProfileFormValues(form) {
  return {
    username: normalizeUsername(getTrimmedValue(form, 'username')),
    phone: normalizeSmsPhone(getTrimmedValue(form, 'phone'))
  };
}

function updateProfileSaveState(modal) {
  const form = modal?.querySelector('[data-profile-form]');
  const saveButton = modal?.querySelector('[data-profile-save], .profile-save');
  if (!form || !saveButton) return;

  const editing = modal.dataset.profileEditing === 'true';
  const values = getProfileFormValues(form);
  const changed = Boolean(profileOriginalValues) &&
    (values.username !== profileOriginalValues.username || values.phone !== profileOriginalValues.phone);
  const phoneChanged = Boolean(profileOriginalValues) && values.phone !== profileOriginalValues.phone;
  const needsPhoneVerification = Boolean(values.phone) && phoneChanged;
  const phoneReady = !needsPhoneVerification ||
    (phoneVerificationState.verified && phoneVerificationState.phone === values.phone);

  saveButton.disabled = !editing || !changed || !phoneReady;
}

function setProfileEditMode(modal, isEditing) {
  const form = modal?.querySelector('[data-profile-form]');
  if (!form) return;

  modal.dataset.profileEditing = String(isEditing);

  const usernameInput = getNamedInput(form, 'username');
  const phoneInput = getNamedInput(form, 'phone');
  const emailInput = getNamedInput(form, 'email');
  const editButton = modal.querySelector('[data-profile-edit]');

  if (isEditing) {
    profileOriginalValues = getProfileFormValues(form);
  } else if (profileOriginalValues) {
    usernameInput.value = profileOriginalValues.username;
    phoneInput.value = profileOriginalValues.phone;
  }

  usernameInput.readOnly = !isEditing;
  phoneInput.readOnly = !isEditing;
  emailInput.readOnly = true;
  editButton.textContent = isEditing ? '取消编辑' : '编辑资料';
  setInputInvalid(usernameInput, false);
  setInputInvalid(phoneInput, false);
  syncPhoneVerificationUi(modal);
  updateProfileSaveState(modal);

  if (isEditing) usernameInput.focus();
}

function rememberProfileValues(modal) {
  const form = modal?.querySelector('[data-profile-form]');
  if (!form) return;
  profileOriginalValues = getProfileFormValues(form);
  updateProfileSaveState(modal);
}

function getOtpCode(modal) {
  return Array.from(modal?.querySelectorAll('[data-otp-input]') || [])
    .map((input) => input.value.trim())
    .join('');
}

function clearOtpCode(modal) {
  modal?.querySelectorAll('[data-otp-input]').forEach((input) => {
    input.value = '';
  });
}

function setPhoneVerificationMessage(modal, message, state = 'neutral') {
  const status = modal?.querySelector('[data-phone-verify-status]');
  if (!status) return;

  status.textContent = message;
  status.dataset.state = state;
}

function syncPhoneVerificationUi(modal) {
  const form = modal?.querySelector('[data-profile-form]');
  const panel = modal?.querySelector('[data-phone-verify-panel]');
  if (!form || !panel) return;

  const phone = normalizeSmsPhone(getTrimmedValue(form, 'phone'));
  const phoneChanged = Boolean(profileOriginalValues) && phone !== profileOriginalValues.phone;
  const needsVerification = modal.dataset.profileEditing === 'true' && Boolean(phone) && phoneChanged;
  const phoneMatchesVerification = phoneVerificationState.phone === phone;
  const verified = phoneVerificationState.verified && phoneMatchesVerification;

  panel.hidden = !needsVerification;
  panel.classList.toggle('is-verified', verified);

  const sendButton = modal.querySelector('[data-phone-send-code]');
  const verifyButton = modal.querySelector('[data-phone-verify-code]');
  if (sendButton) sendButton.disabled = !needsVerification || verified || !smsPhonePattern.test(phone);
  if (verifyButton) {
    verifyButton.disabled = !needsVerification ||
      verified ||
      !phoneMatchesVerification ||
      !phoneVerificationState.verificationId ||
      getOtpCode(modal).length !== 6;
  }

  if (!needsVerification) {
    setPhoneVerificationMessage(modal, '');
    clearOtpCode(modal);
    phoneVerificationState = { phone: '', verificationId: '', verified: false };
  } else if (verified) {
    setPhoneVerificationMessage(modal, '手机号已通过短信验证。', 'success');
  } else if (!smsPhonePattern.test(phone)) {
    setPhoneVerificationMessage(modal, '请输入国际格式手机号，例如 +639171234567。', 'error');
  } else if (!phoneMatchesVerification || !phoneVerificationState.verificationId) {
    setPhoneVerificationMessage(modal, '请先发送短信验证码。', 'neutral');
  }
}

async function getRecaptchaVerifier(auth, authModule) {
  if (recaptchaVerifier) return recaptchaVerifier;

  const container = document.querySelector('[data-recaptcha-container]');
  if (!container || typeof authModule?.RecaptchaVerifier !== 'function') return null;

  recaptchaVerifier = new authModule.RecaptchaVerifier(auth, container, { size: 'invisible' });
  return recaptchaVerifier;
}

async function sendPhoneVerificationCode(modal) {
  const form = modal?.querySelector('[data-profile-form]');
  if (!form) return;

  const phone = normalizeSmsPhone(getTrimmedValue(form, 'phone'));
  if (!smsPhonePattern.test(phone)) {
    setInputInvalid(getNamedInput(form, 'phone'), true);
    setPhoneVerificationMessage(modal, '请输入国际格式手机号，例如 +639171234567。', 'error');
    updateProfileSaveState(modal);
    return;
  }

  const auth = await getFirebaseAuth();
  const authModule = await getFirebaseAuthModule();
  if (!auth || !authModule) {
    setPhoneVerificationMessage(modal, authSetupMessage, 'error');
    return;
  }

  const sendButton = modal.querySelector('[data-phone-send-code]');
  if (sendButton) sendButton.disabled = true;
  setPhoneVerificationMessage(modal, '正在发送短信验证码...', 'neutral');

  try {
    const verifier = await getRecaptchaVerifier(auth, authModule);
    if (!verifier) {
      throw new Error('Phone verification is not configured.');
    }

    const provider = new authModule.PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(phone, verifier);

    phoneVerificationState = { phone, verificationId, verified: false };
    clearOtpCode(modal);
    modal.querySelector('[data-otp-input]')?.focus();
    setPhoneVerificationMessage(modal, '验证码已发送，请输入 6 位验证码。', 'success');
  } catch (error) {
    if (typeof recaptchaVerifier?.clear === 'function') recaptchaVerifier.clear();
    recaptchaVerifier = null;
    setPhoneVerificationMessage(modal, formatAuthError(error), 'error');
  } finally {
    syncPhoneVerificationUi(modal);
    updateProfileSaveState(modal);
  }
}

async function confirmPhoneVerificationCode(modal) {
  const form = modal?.querySelector('[data-profile-form]');
  const code = getOtpCode(modal);
  const phone = normalizeSmsPhone(getTrimmedValue(form, 'phone'));

  if (!phoneVerificationState.verificationId || phoneVerificationState.phone !== phone || code.length !== 6) return;

  const authModule = await getFirebaseAuthModule();
  if (!authModule || !currentAuthUser) return;

  const verifyButton = modal.querySelector('[data-phone-verify-code]');
  if (verifyButton) verifyButton.disabled = true;
  setPhoneVerificationMessage(modal, '正在验证手机号...', 'neutral');

  try {
    const credential = authModule.PhoneAuthProvider.credential(phoneVerificationState.verificationId, code);

    if (currentAuthUser.phoneNumber) {
      await authModule.updatePhoneNumber(currentAuthUser, credential);
    } else {
      await authModule.linkWithCredential(currentAuthUser, credential);
    }

    phoneVerificationState = { phone, verificationId: phoneVerificationState.verificationId, verified: true };
    setPhoneVerificationMessage(modal, '手机号已通过短信验证。', 'success');
  } catch (error) {
    setPhoneVerificationMessage(modal, formatAuthError(error), 'error');
  } finally {
    syncPhoneVerificationUi(modal);
    updateProfileSaveState(modal);
  }
}

function renderProfileModal(modal) {
  if (!modal || !currentAuthUser) return;

  const profile = currentUserProfile || {};
  const username = profile.username || currentAuthUser.displayName || getUserLabel(currentAuthUser, profile);
  const email = currentAuthUser.email || profile.email || '';
  const online = profile.online !== false;

  modal.querySelector('[data-profile-name]').textContent = username;
  modal.querySelector('[data-profile-email]').textContent = email;
  modal.querySelector('[data-profile-last-online]').textContent = formatLastOnline(profile.lastOnlineAt, online);
  modal.querySelector('.profile-card')?.classList.toggle('is-online', online);

  const form = modal.querySelector('[data-profile-form]');
  if (!form) return;

  if (modal.dataset.profileEditing !== 'true') {
    getNamedInput(form, 'username').value = username;
    getNamedInput(form, 'email').value = email;
    getNamedInput(form, 'phone').value = profile.phone || '';
    rememberProfileValues(modal);
    setProfileEditMode(modal, false);
  }
}

async function openProfileModal() {
  const modal = ensureProfileModal();
  setProfileAlert(modal, '');

  if (!currentAuthUser?.emailVerified) {
    setProfileAlert(modal, '请先登录后再查看账号资料。', 'error');
    return;
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  try {
    currentUserProfile = await loadUserProfile(currentAuthUser);
    renderProfileModal(modal);
    setProfileEditMode(modal, false);
    syncAuthActions(currentAuthUser);
  } catch {
    setProfileAlert(modal, '账号资料暂时无法读取，请稍后重试。', 'error');
  }
}

function closeProfileModal() {
  const modal = document.querySelector('[data-profile-modal]');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function startProfileClock() {
  window.clearInterval(profileClockTimer);
  profileClockTimer = window.setInterval(() => {
    const modal = document.querySelector('[data-profile-modal].is-open');
    if (modal) renderProfileModal(modal);
  }, 60 * 1000);
}

function stopProfileClock() {
  window.clearInterval(profileClockTimer);
  profileClockTimer = null;
}

export function initAuth() {
  const authModal = document.querySelector('[data-auth-modal]');
  const authTitle = document.querySelector('[data-auth-title]');
  const authEyebrow = document.querySelector('[data-auth-eyebrow]');
  if (!authModal) return;

  function openAuth(mode = 'login') {
    const nextMode = authCopy[mode] ? mode : 'login';
    document.querySelectorAll('[data-auth-form]').forEach((form) => {
      form.classList.toggle('is-active', form.dataset.authForm === nextMode);
      resetAuthFeedback(form);
    });
    authModal.dataset.authMode = nextMode;

    if (authEyebrow) authEyebrow.textContent = authCopy[nextMode][0];
    if (authTitle) authTitle.textContent = authCopy[nextMode][1];

    authModal.classList.add('is-open');
    authModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    authModal.querySelector(`[data-auth-form="${nextMode}"] input`)?.focus();
  }

  function closeAuth() {
    authModal.classList.remove('is-open');
    authModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelector('[data-auth-close]')?.addEventListener('click', closeAuth);

  authModal.addEventListener('click', (event) => {
    if (event.target === authModal) closeAuth();
  });

  document.addEventListener('click', async (event) => {
    const profileButton = event.target.closest('[data-profile-open]');
    if (profileButton) {
      event.preventDefault();
      await openProfileModal();
      return;
    }

    const logoutButton = event.target.closest('[data-auth-logout]');
    if (logoutButton) {
      event.preventDefault();

      const auth = await getFirebaseAuth();
      const authModule = await getFirebaseAuthModule();
      if (!auth || !authModule) return;

      try {
        await updateUserPresence(auth.currentUser, false);
      } catch {}

      await authModule.signOut(auth);
      closeAuth();
      closeProfileModal();
      return;
    }

    const openButton = event.target.closest('[data-auth-open]');
    if (!openButton) return;

    event.preventDefault();
    openAuth(openButton.dataset.authOpen);
  });

  const profileModal = ensureProfileModal();

  profileModal.querySelector('[data-profile-close]')?.addEventListener('click', closeProfileModal);
  profileModal.addEventListener('click', (event) => {
    if (event.target === profileModal) closeProfileModal();
  });

  profileModal.querySelector('[data-profile-edit]')?.addEventListener('click', () => {
    const isEditing = profileModal.dataset.profileEditing === 'true';
    setProfileAlert(profileModal, '');
    setProfileEditMode(profileModal, !isEditing);
  });

  profileModal.querySelectorAll('[data-profile-form] input').forEach((input) => {
    input.addEventListener('input', () => {
      setInputInvalid(input, false);
      setProfileAlert(profileModal, '');
      syncPhoneVerificationUi(profileModal);
      updateProfileSaveState(profileModal);
    });
  });

  profileModal.querySelectorAll('[data-otp-input]').forEach((input, index, inputs) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && inputs[index + 1]) inputs[index + 1].focus();
      syncPhoneVerificationUi(profileModal);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (event) => {
      const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6);
      if (!pasted) return;

      event.preventDefault();
      inputs.forEach((otpInput, otpIndex) => {
        otpInput.value = pasted[otpIndex] || '';
      });
      inputs[Math.min(pasted.length, inputs.length) - 1]?.focus();
      syncPhoneVerificationUi(profileModal);
    });
  });

  profileModal.querySelector('[data-phone-send-code]')?.addEventListener('click', () => {
    void sendPhoneVerificationCode(profileModal);
  });

  profileModal.querySelector('[data-phone-verify-code]')?.addEventListener('click', () => {
    void confirmPhoneVerificationCode(profileModal);
  });

  profileModal.querySelector('[data-profile-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const usernameInput = getNamedInput(form, 'username');
    const phoneInput = getNamedInput(form, 'phone');
    const saveButton = profileModal.querySelector('.profile-save');

    if (saveButton?.disabled || profileModal.dataset.profileEditing !== 'true') return;

    setInputInvalid(usernameInput, false);
    setInputInvalid(phoneInput, false);
    setProfileAlert(profileModal, '');

    if (!usernamePattern.test(usernameInput.value.trim())) {
      setInputInvalid(usernameInput, true);
      setProfileAlert(profileModal, '账号需为4-20位字母或数字。', 'error');
      usernameInput.focus();
      return;
    }

    const phoneValue = normalizeSmsPhone(phoneInput.value);
    const phoneChanged = Boolean(profileOriginalValues) && phoneValue !== profileOriginalValues.phone;

    if (phoneValue && !smsPhonePattern.test(phoneValue)) {
      setInputInvalid(phoneInput, true);
      setProfileAlert(profileModal, '请输入国际格式手机号，例如 +639171234567。', 'error');
      phoneInput.focus();
      return;
    }

    if (phoneValue && phoneChanged && !(phoneVerificationState.verified && phoneVerificationState.phone === phoneValue)) {
      setProfileAlert(profileModal, '请先完成短信验证码验证。', 'error');
      phoneInput.focus();
      return;
    }

    form.querySelectorAll('input, button').forEach((field) => {
      field.disabled = true;
    });
    setProfileAlert(profileModal, '正在保存账号资料...', 'success');

    try {
      await saveUserProfile(form);
      currentUserProfile = await loadUserProfile(currentAuthUser);
      profileOriginalValues = getProfileFormValues(form);
      profileModal.dataset.profileEditing = 'false';
      renderProfileModal(profileModal);
      setProfileEditMode(profileModal, false);
      syncAuthActions(currentAuthUser);
      setProfileAlert(profileModal, '账号资料已更新。', 'success');
    } catch (error) {
      setProfileAlert(profileModal, formatAuthError(error), 'error');
    } finally {
      form.querySelectorAll('input, button').forEach((field) => {
        field.disabled = false;
      });
      getNamedInput(form, 'email').readOnly = true;
      updateProfileSaveState(profileModal);
    }
  });

  profileModal.querySelector('[data-profile-reset-password]')?.addEventListener('click', async () => {
    if (!currentAuthUser?.email) return;

    const auth = await getFirebaseAuth();
    const authModule = await getFirebaseAuthModule();
    if (!auth || !authModule) {
      setProfileAlert(profileModal, authSetupMessage, 'error');
      return;
    }

    try {
      await authModule.sendPasswordResetEmail(auth, currentAuthUser.email);
      setProfileAlert(profileModal, '重置邮件已发送，请前往邮箱查收。', 'success');
    } catch (error) {
      setProfileAlert(profileModal, formatAuthError(error), 'error');
    }
  });

  document.querySelectorAll('.auth-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      resetAuthFeedback(form);

      const result = validateAuthForm(form);
      if (!result.valid) {
        setAuthAlert(form, result.message, 'error');
        result.input?.focus();
        return;
      }

      const auth = await getFirebaseAuth();
      const authModule = await getFirebaseAuthModule();

      if (!auth || !authModule) {
        setAuthAlert(form, authSetupMessage, 'error');
        return;
      }

      setFormPending(form, true, authLoadingMessage);

      try {
        if (form.dataset.authForm === 'login') {
          const credential = await authModule.signInWithEmailAndPassword(
            auth,
            normalizeEmail(getTrimmedValue(form, 'email')),
            getRawValue(form, 'password')
          );

          if (typeof authModule?.reload === 'function') {
            await authModule.reload(credential.user);
          }

          if (!credential.user.emailVerified) {
            try {
              await authModule.sendEmailVerification(credential.user);
            } catch {}

            setAuthAlert(form, emailVerificationMessage, 'success');
            setFormPending(form, true, '等待验证...');

            const isVerified = await waitForEmailVerification(auth, authModule, credential.user, () => {
              setAuthAlert(form, emailVerificationWaitingMessage, 'success');
            });

            if (!isVerified) {
              setAuthAlert(form, emailVerificationTimeoutMessage, 'error');
              return;
            }
          }

          await refreshUserToken(credential.user);
          const pendingProfile = getPendingSignupProfile(credential.user);
          if (pendingProfile) {
            await createUserProfile(pendingProfile, credential.user);
            removePendingSignupProfile(credential.user.uid);
          }

          syncAuthActions(credential.user);
          setAuthAlert(form, '登录成功，正在进入江湖...', 'success');
          form.reset();
          window.setTimeout(closeAuth, 600);
        }

        if (form.dataset.authForm === 'register') {
          const credential = await authModule.createUserWithEmailAndPassword(
            auth,
            normalizeEmail(getTrimmedValue(form, 'email')),
            getRawValue(form, 'password')
          );

          const username = getTrimmedValue(form, 'username');
          const profile = buildUserProfile(form, credential.user);

          try {
            if (username) {
              await authModule.updateProfile(credential.user, { displayName: normalizeUsername(username) });
            }
          } catch (profileError) {
            await deleteIncompleteUser(authModule, credential.user);
            throw profileError;
          }

          savePendingSignupProfile(credential.user.uid, profile);

          try {
            await authModule.sendEmailVerification(credential.user);
          } catch {}

          setAuthAlert(form, emailVerificationMessage, 'success');
          setFormPending(form, true, '等待验证...');

          const isVerified = await waitForEmailVerification(auth, authModule, credential.user, () => {
            setAuthAlert(form, emailVerificationWaitingMessage, 'success');
          });

          if (!isVerified) {
            setAuthAlert(form, emailVerificationTimeoutMessage, 'error');
            return;
          }

          await createUserProfile(profile, credential.user);
          removePendingSignupProfile(credential.user.uid);
          syncAuthActions(credential.user);
          setAuthAlert(form, '邮箱验证成功，正在进入江湖...', 'success');
          form.reset();
          window.setTimeout(closeAuth, 700);
        }

        if (form.dataset.authForm === 'forgot') {
          await authModule.sendPasswordResetEmail(auth, normalizeEmail(getTrimmedValue(form, 'email')));
          setAuthAlert(form, '重置邮件已发送，请前往邮箱查收。', 'success');
          form.reset();
        }
      } catch (error) {
        setAuthAlert(form, formatAuthError(error), 'error');
      } finally {
        setFormPending(form, false);
      }
    });

    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        setInputInvalid(input, false);
        setAuthAlert(form, '');
      });
    });
  });

  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.closest('.password-field')?.querySelector('input');
      if (!input) return;

      const shouldShow = input.type === 'password';
      input.type = shouldShow ? 'text' : 'password';
      button.setAttribute('aria-label', shouldShow ? '隐藏密码' : '显示密码');
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAuth();
      closeProfileModal();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!currentAuthUser?.emailVerified) return;

    void updateUserPresence(currentAuthUser, document.visibilityState === 'visible').catch(() => {});
  });

  window.addEventListener('pagehide', () => {
    if (!currentAuthUser?.emailVerified) return;

    void updateUserPresence(currentAuthUser, false).catch(() => {});
  });

  syncAuthActions(null);

  void (async () => {
    const auth = await getFirebaseAuth();
    const authModule = await getFirebaseAuthModule();

    if (!auth || !authModule) {
      syncAuthActions(null);
      return;
    }

    authModule.onAuthStateChanged(auth, async (user) => {
      currentAuthUser = user?.emailVerified ? user : null;
      currentUserProfile = null;

      if (!currentAuthUser) {
        stopProfileClock();
        closeProfileModal();
        syncAuthActions(null);
        return;
      }

      syncAuthActions(currentAuthUser);

      try {
        await updateUserPresence(currentAuthUser, true);
        currentUserProfile = await loadUserProfile(currentAuthUser);
        syncAuthActions(currentAuthUser);
        renderProfileModal(document.querySelector('[data-profile-modal]'));
        startProfileClock();
      } catch {
        syncAuthActions(currentAuthUser);
      }
    });
  })();
}
