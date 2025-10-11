(function () {
  'use strict';

  // ====== Constants ======
  const LS_KEYS = Object.freeze({
    USERS: 'niqo.users',
    SESSION: 'niqo.session',
    THEME: 'niqo.theme',
    TX: 'niqo.transactions',
    CATS: 'niqo.categories',
  });

  // ====== Utils ======
  const q = (id) => document.getElementById(id);
  const safeParse = (raw, fallback = null) => { try { return raw == null ? fallback : JSON.parse(raw); } catch { return fallback; } };

  // ====== Storage ======
  const storage = {
    getSession: () => safeParse(localStorage.getItem(LS_KEYS.SESSION)),
    setSession: (s) => localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(s)),
    loadUsers: () => safeParse(localStorage.getItem(LS_KEYS.USERS), []) ?? [],
    saveUsers: (users) => localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users)),
    setTheme: (mode) => localStorage.setItem(LS_KEYS.THEME, mode),
    getTheme: () => localStorage.getItem(LS_KEYS.THEME) || 'auto',
    resetAll() {
      localStorage.removeItem(LS_KEYS.USERS);
      localStorage.removeItem(LS_KEYS.TX);
      localStorage.removeItem(LS_KEYS.CATS);
      localStorage.removeItem(LS_KEYS.SESSION);
      localStorage.removeItem(LS_KEYS.THEME);
    },
  };

  // ====== View / messages ======
  function setMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = `muted ${type}`; // keep original class convention
  }

  function applyTheme(mode) {
    if (mode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }

  // ====== Profile ======
  function bindProfileForm(formEl, nameEl, currencyEl, msgEl, session, users, userIdx) {
    formEl?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(formEl);
      const name = (fd.get('name') || '').toString().trim();
      const currency = (fd.get('currency') || 'EUR').toString();

      if (!name) {
        setMessage(msgEl, 'Name is required.', 'error');
        return;
      }

      if (userIdx >= 0) {
        users[userIdx] = { ...users[userIdx], username: name, currency };
        storage.saveUsers(users);
      }

      storage.setSession({ ...(session || {}), username: name || session.username, currency, guest: !!session.guest });
      setMessage(msgEl, 'Profile saved.', 'success');

      // Optional: immediately reflect in inputs if needed
      if (nameEl) nameEl.value = name;
      if (currencyEl) currencyEl.value = currency;
    });
  }

  // ====== Theme ======
  function bindThemeButtons(btns, msgEl) {
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-theme') || 'auto';
        storage.setTheme(mode);
        applyTheme(mode);
        const txt = mode === 'auto' ? 'Auto theme enabled.' : `Theme ${mode === 'dark' ? 'dark' : 'light'} enabled.`;
        setMessage(msgEl, txt, 'success');
      });
    });
  }

  // ====== Reset ======
  function bindReset(buttonEl, msgEl) {
    buttonEl?.addEventListener('click', () => {
      const ok = window.confirm('Confirm resetting all local data?');
      if (!ok) return;
      storage.resetAll();
      setMessage(msgEl, 'Data reset.', 'success');
      setTimeout(() => { window.location.href = '../views/index.html'; }, 600);
    });
  }

  // ====== Bootstrap ======
  document.addEventListener('DOMContentLoaded', () => {
    // Session required
    const session = storage.getSession();
    if (!session || (!session.username && !session.guest)) {
      window.location.href = './login.html';
      return;
    }

    // DOM
    const profileForm = q('profile-form');
    const profileName = q('profile-name');
    const profileCurrency = q('profile-currency');
    const profileMsg = q('profile-message');

    const themeButtons = document.querySelectorAll('[data-theme]');
    const themeMsg = q('theme-message');

    const resetBtn = q('reset-btn');
    const resetMsg = q('reset-message');

    // Profile prefill
    const users = storage.loadUsers();
    const currentUserName = session.username || '';
    const userIdx = users.findIndex((u) => (u.username || '').toLowerCase() === currentUserName.toLowerCase());
    const user = userIdx >= 0 ? users[userIdx] : null;

    if (profileName) profileName.value = user?.username || session.username || '';
    if (profileCurrency) profileCurrency.value = user?.currency || session.currency || 'EUR';

    // Bindings
    bindProfileForm(profileForm, profileName, profileCurrency, profileMsg, session, users, userIdx);

    const savedTheme = storage.getTheme();
    applyTheme(savedTheme);
    bindThemeButtons(themeButtons, themeMsg);

    bindReset(resetBtn, resetMsg);
  });
})();