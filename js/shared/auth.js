const authCopy = {
  login: ['账号', '进入江湖'],
  register: ['注册', '初入江湖'],
  forgot: ['寻回密语', '忘记密码']
};
const authSecurityMessage = '安全验证加载超时，请检查网络连接';

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

function validateAuthForm(form) {
  const mode = form.dataset.authForm;
  const invalid = [];

  form.querySelectorAll('input').forEach((input) => setInputInvalid(input, false));

  if (mode === 'login') {
    const username = getNamedInput(form, 'username');
    const password = getNamedInput(form, 'password');

    if (username && !username.value.trim()) invalid.push([username, '请输入账号']);
    if (password && password.value.length < 8) invalid.push([password, '请输入至少8位密码']);
  }

  if (mode === 'register') {
    const username = getNamedInput(form, 'username');
    const password = getNamedInput(form, 'password');
    const confirmPassword = getNamedInput(form, 'confirmPassword');
    const email = getNamedInput(form, 'email');
    const phone = getNamedInput(form, 'phone');
    const secondaryPassword = getNamedInput(form, 'secondaryPassword');

    if (username && !/^[A-Za-z0-9]{4,20}$/.test(username.value.trim())) {
      invalid.push([username, '账号需为4-20位字母或数字']);
    }

    if (password && password.value.length < 8) {
      invalid.push([password, '通关密语至少8位']);
    }

    if (confirmPassword && password && (confirmPassword.value !== password.value || !confirmPassword.value)) {
      invalid.push([confirmPassword, '两次输入的通关密语不一致']);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      invalid.push([email, '请输入有效电子邮箱']);
    }

    if (phone && !/^\+?[0-9\s-]{7,20}$/.test(phone.value.trim())) {
      invalid.push([phone, '请输入有效手机号码']);
    }

    if (secondaryPassword && !/^\d{4}$/.test(secondaryPassword.value.trim())) {
      invalid.push([secondaryPassword, '二级密码必须为4位数字']);
    }
  }

  if (mode === 'forgot') {
    const identifier = getNamedInput(form, 'identifier');
    if (identifier && !identifier.value.trim()) invalid.push([identifier, '请输入账号或手机号']);
  }

  if (invalid.length) {
    invalid.forEach(([input]) => setInputInvalid(input, true));
    return { valid: false, input: invalid[0][0], message: invalid[0][1] };
  }

  return { valid: true };
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

  document.querySelectorAll('[data-auth-open]').forEach((button) => {
    button.addEventListener('click', () => openAuth(button.dataset.authOpen));
  });

  document.querySelector('[data-auth-close]')?.addEventListener('click', closeAuth);

  authModal.addEventListener('click', (event) => {
    if (event.target === authModal) closeAuth();
  });

  document.querySelectorAll('.auth-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const result = validateAuthForm(form);
      if (!result.valid) {
        setAuthAlert(form, result.message, 'error');
        result.input?.focus();
        return;
      }

      setAuthAlert(form, authSecurityMessage, 'error');
    });

    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        setInputInvalid(input, false);
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
}
