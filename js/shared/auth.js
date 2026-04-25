import { getFirebaseAuth, getFirebaseAuthModule } from './firebase-client.js';

const authCopy = {
  login: ['账号', '邮箱登录'],
  register: ['注册', '初入江湖'],
  forgot: ['重置', '找回密码']
};
const authSetupMessage = '请先在 js/shared/firebase-config.js 填入完整的 Firebase Web App 配置。';
const authLoadingMessage = '正在连接江湖命脉...';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[A-Za-z0-9]{4,20}$/;
const phonePattern = /^\+?[0-9\s-]{7,20}$/;
const secondaryPasswordPattern = /^\d{4}$/;

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
    default:
      return '操作未完成，请稍后再试。';
  }
}

function getUserLabel(user) {
  const source = user?.displayName?.trim() || user?.email?.split('@')[0] || '少侠';
  return source.length > 10 ? `${source.slice(0, 10)}...` : source;
}

function syncAuthActions(user) {
  document.querySelectorAll('.auth-actions').forEach((actions) => {
    const [loginButton, primaryButton] = actions.querySelectorAll('button');
    if (!loginButton || !primaryButton) return;

    if (user) {
      loginButton.textContent = getUserLabel(user);
      loginButton.disabled = true;
      loginButton.classList.add('auth-user');
      loginButton.removeAttribute('data-auth-open');
      loginButton.setAttribute('aria-label', `当前登录账号：${getUserLabel(user)}`);

      primaryButton.textContent = '退出';
      primaryButton.disabled = false;
      primaryButton.dataset.authLogout = 'true';
      primaryButton.removeAttribute('data-auth-open');
    } else {
      loginButton.textContent = '登录';
      loginButton.disabled = false;
      loginButton.classList.remove('auth-user');
      loginButton.dataset.authOpen = 'login';
      loginButton.removeAttribute('aria-label');

      primaryButton.textContent = '注册';
      primaryButton.disabled = false;
      primaryButton.dataset.authOpen = 'register';
      primaryButton.removeAttribute('data-auth-logout');
    }
  });
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
    const logoutButton = event.target.closest('[data-auth-logout]');
    if (logoutButton) {
      event.preventDefault();

      const auth = await getFirebaseAuth();
      const authModule = await getFirebaseAuthModule();
      if (!auth || !authModule) return;

      await authModule.signOut(auth);
      closeAuth();
      return;
    }

    const openButton = event.target.closest('[data-auth-open]');
    if (!openButton) return;

    event.preventDefault();
    openAuth(openButton.dataset.authOpen);
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
          await authModule.signInWithEmailAndPassword(
            auth,
            getTrimmedValue(form, 'email'),
            getRawValue(form, 'password')
          );

          setAuthAlert(form, '登录成功，正在进入江湖...', 'success');
          form.reset();
          window.setTimeout(closeAuth, 600);
        }

        if (form.dataset.authForm === 'register') {
          const credential = await authModule.createUserWithEmailAndPassword(
            auth,
            getTrimmedValue(form, 'email'),
            getRawValue(form, 'password')
          );

          const username = getTrimmedValue(form, 'username');
          if (username) {
            await authModule.updateProfile(credential.user, { displayName: username });
          }

          try {
            await authModule.sendEmailVerification(credential.user);
          } catch {}

          setAuthAlert(form, '账号创建成功，已自动登录。验证邮件也已发往你的邮箱。', 'success');
          form.reset();
          window.setTimeout(closeAuth, 900);
        }

        if (form.dataset.authForm === 'forgot') {
          await authModule.sendPasswordResetEmail(auth, getTrimmedValue(form, 'email'));
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
    if (event.key === 'Escape') closeAuth();
  });

  syncAuthActions(null);

  void (async () => {
    const auth = await getFirebaseAuth();
    const authModule = await getFirebaseAuthModule();

    if (!auth || !authModule) {
      syncAuthActions(null);
      return;
    }

    authModule.onAuthStateChanged(auth, (user) => {
      syncAuthActions(user);
    });
  })();
}
