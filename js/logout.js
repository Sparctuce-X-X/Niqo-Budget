(function () {
  'use strict';

  const LS_KEYS = Object.freeze({ SESSION: 'niqo.session' });

  // ====== Utilitaires ======
  const safeParse = (raw) => {
    try { return JSON.parse(raw); } catch { return null; }
  };

  const getSession = () => safeParse(localStorage.getItem(LS_KEYS.SESSION));
  const clearSession = () => localStorage.removeItem(LS_KEYS.SESSION);

  // ====== Bootstrap ======
  document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();

    // Vérification de session
    if (!session || (!session.username && !session.guest)) {
      window.location.href = '../views/index.html';
      return;
    }

    // Gestion du bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = '../views/index.html';
    });
  });
})();