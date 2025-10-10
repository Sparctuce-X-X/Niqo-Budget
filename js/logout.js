document.addEventListener('DOMContentLoaded', () => {
  const LS_KEYS = { SESSION: 'niqo.session' };
  const getSession = () => { try { return JSON.parse(localStorage.getItem(LS_KEYS.SESSION)); } catch { return null; } };
  const clearSession = () => localStorage.removeItem(LS_KEYS.SESSION);

  const session = getSession();
  if (!session || (!session.username && !session.guest)) {
    window.location.href = '../views/index.html';
    return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = '../views/index.html';
    });
  }
});
