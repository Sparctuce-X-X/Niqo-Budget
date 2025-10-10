document.addEventListener('DOMContentLoaded', () => {
  const LS_KEYS = {
    USERS: 'niqo.users',
    SESSION: 'niqo.session',
    THEME: 'niqo.theme',
    TX: 'niqo.transactions',
    CATS: 'niqo.categories'
  };

  const profileForm = document.getElementById('profile-form');
  const profileName = document.getElementById('profile-name');
  const profileCurrency = document.getElementById('profile-currency');
  const profileMsg = document.getElementById('profile-message');

  const themeButtons = document.querySelectorAll('[data-theme]');
  const themeMsg = document.getElementById('theme-message');

  const resetBtn = document.getElementById('reset-btn');
  const resetMsg = document.getElementById('reset-message');

  const getSession = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.SESSION)); } catch { return null; }
  };
  const setSession = (s) => localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(s));
  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) ?? []; } catch { return []; }
  };
  const saveUsers = (u) => localStorage.setItem(LS_KEYS.USERS, JSON.stringify(u));

  const session = getSession();
  if (!session || (!session.username && !session.guest)) {
    window.location.href = './login.html';
    return;
  }

  const currentUserName = session.username || '';
  const users = loadUsers();
  const userIdx = users.findIndex(u => (u.username || '').toLowerCase() === currentUserName.toLowerCase());
  const user = userIdx >= 0 ? users[userIdx] : null;

  if (profileName) profileName.value = user?.username || session.username || '';
  if (profileCurrency) profileCurrency.value = user?.currency || session.currency || 'EUR';

  profileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(profileForm);
    const name = (form.get('name') || '').toString().trim();
    const currency = (form.get('currency') || 'EUR').toString();

    if (!name) {
      profileMsg.textContent = 'Le nom est requis.';
      profileMsg.className = 'muted error';
      return;
    }

    if (userIdx >= 0) {
      users[userIdx] = { ...users[userIdx], username: name, currency };
      saveUsers(users);
    }

    setSession({ ...(session || {}), username: name || session.username, currency, guest: !!session.guest });
    profileMsg.textContent = 'Profil enregistré.';
    profileMsg.className = 'muted success';
  });

  const applyTheme = (mode) => {
    if (mode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  };

  const savedTheme = localStorage.getItem(LS_KEYS.THEME) || 'auto';
  applyTheme(savedTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-theme') || 'auto';
      localStorage.setItem(LS_KEYS.THEME, mode);
      applyTheme(mode);
      themeMsg.textContent = mode === 'auto' ? 'Thème automatique activé.' : `Thème ${mode === 'dark' ? 'sombre' : 'clair'} activé.`;
      themeMsg.className = 'muted success';
    });
  });

  resetBtn?.addEventListener('click', () => {
    const ok = window.confirm('Confirmer la réinitialisation de toutes les données locales ?');
    if (!ok) return;
    localStorage.removeItem(LS_KEYS.USERS);
    localStorage.removeItem(LS_KEYS.TX);
    localStorage.removeItem(LS_KEYS.CATS);
    localStorage.removeItem(LS_KEYS.SESSION);
    localStorage.removeItem(LS_KEYS.THEME);
    resetMsg.textContent = 'Données réinitialisées.';
    resetMsg.className = 'muted success';
    setTimeout(() => { window.location.href = '../views/index.html'; }, 600);
  });
});
