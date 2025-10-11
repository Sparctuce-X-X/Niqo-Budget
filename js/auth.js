(function () {
  'use strict';

  // ====== Constants & utilities ======
  const LS_KEYS = Object.freeze({
    USERS: 'niqo.users',
    SESSION: 'niqo.session',
  });

  const q = (id) => document.getElementById(id);

  function redirect(url) {
    if (window.__TEST_MODE__) {
      window.__lastRedirect = url;
      return;
    }
    window.location.href = url;
  }

  function showMessage(el, msg, type = 'error') {
    if (!el) return;
    el.classList.remove('hidden', 'error', 'success');
    el.classList.add(type);
    el.textContent = msg;
  }

  function hideMessage(el) {
    if (!el) return;
    el.classList.add('hidden');
    el.textContent = '';
  }

  async function sha256(text) {
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const storage = {
    loadUsers() {
      try {
        return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) ?? [];
      } catch {
        return [];
      }
    },
    saveUsers(users) {
      localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
    },
    setSession(session) {
      localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(session));
    },
    getSession() {
      try {
        const raw = localStorage.getItem(LS_KEYS.SESSION);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    clearSession() {
      localStorage.removeItem(LS_KEYS.SESSION);
    },
  };

  function bindViewToggles({ loginView, registerView, showLoginBtn, showRegisterBtn }) {
    showRegisterBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      loginView?.classList.add('hidden');
      registerView?.classList.remove('hidden');
    });

    showLoginBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      registerView?.classList.add('hidden');
      loginView?.classList.remove('hidden');
    });
  }

  function bindLogin({ loginForm, loginMsg }) {
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage(loginMsg);

      const form = new FormData(e.currentTarget);
      const username = (form.get('username') || '').toString().trim();
      const password = (form.get('password') || '').toString();

      if (!username || !password) {
        showMessage(loginMsg, 'All fields are required.');
        return;
      }

      const users = storage.loadUsers();
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

      if (!user) {
        showMessage(loginMsg, 'User not found');
        return;
      }

      const passHash = await sha256(password);
      if (user.passwordHash !== passHash) {
        showMessage(loginMsg, 'Incorrect password.');
        return;
      }

      storage.setSession({ username: user.username, currency: user.currency, guest: false });
      redirect('./dashboard.html');
    });
  }

  function bindGuest({ guestBtn }) {
    guestBtn?.addEventListener('click', () => {
      storage.setSession({ guest: true, username: 'Guest', currency: 'EUR' });
      redirect('./dashboard.html');
    });
  }

  function bindRegister({ registerForm, registerMsg, views: { loginView, registerView } }) {
    registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage(registerMsg);

      const form = new FormData(registerForm);
      const username = (form.get('username') || '').toString().trim();
      const password = (form.get('password') || '').toString();
      const currency = (form.get('currency') || 'EUR').toString();

      if (!username || !password) {
        showMessage(registerMsg, 'All fields are required.');
        return;
      }
      if (username.length < 3) {
        showMessage(registerMsg, 'Username must be at least 3 characters.');
        return;
      }
      if (password.length < 6) {
        showMessage(registerMsg, 'Password too short (≥ 6 characters).');
        return;
      }

      const users = storage.loadUsers();
      const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        showMessage(registerMsg, 'This username is already taken.');
        return;
      }

      const passwordHash = await sha256(password);
      users.push({ username, passwordHash, currency, createdAt: Date.now() });
      storage.saveUsers(users);

      showMessage(registerMsg, 'Account created! You can sign in.', 'success');
      setTimeout(() => {
        registerView?.classList.add('hidden');
        loginView?.classList.remove('hidden');
      }, 800);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const views = {
      loginView: q('login-view'),
      registerView: q('register-view'),
    };

    bindViewToggles({
      loginView: views.loginView,
      registerView: views.registerView,
      showLoginBtn: q('show-login'),
      showRegisterBtn: q('show-register'),
    });

    bindLogin({
      loginForm: q('login-form'),
      loginMsg: q('login-message'),
    });

    bindGuest({ guestBtn: q('guest-login') });

    bindRegister({
      registerForm: q('register-form'),
      registerMsg: q('register-message'),
      views,
    });

    // Auto-redirect kept commented out as in the original code
    /*
    const session = storage.getSession();
    if (session && (session.username || session.guest)) {
      redirect('./dashboard.html');
      return;
    }
    */

    // Minimal exposure for manual tests if needed
    window.__authDemo__ = { storage, sha256 };
  });
})();