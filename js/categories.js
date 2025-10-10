document.addEventListener('DOMContentLoaded', () => {
  const LS_KEYS = { SESSION: 'niqo.session', CATS: 'niqo.categories' };

  const getSession = () => { try { return JSON.parse(localStorage.getItem(LS_KEYS.SESSION)); } catch { return null; } };
  const session = getSession();
  if (!session || (!session.username && !session.guest)) { window.location.href = './login.html'; return; }

  const DEFAULT_CATS = {
    expense: ['Logement', 'Alimentation', 'Transport', 'Santé', 'Abonnements', 'Loisirs', 'Achats', 'Éducation', 'Impôts', 'Autres'],
    income: ['Salaire', 'Freelance', 'Investissements', 'Remboursement', 'Cadeaux', 'Autres']
  };

  const defaultList = document.getElementById('default-cats');
  const customList = document.getElementById('custom-cats');
  const customEmpty = document.getElementById('custom-empty');
  const form = document.getElementById('cat-form');

  const loadCustom = () => { try { return JSON.parse(localStorage.getItem(LS_KEYS.CATS)) ?? []; } catch { return []; } };
  const saveCustom = (arr) => localStorage.setItem(LS_KEYS.CATS, JSON.stringify(arr));

  const renderDefaults = () => {
    if (!defaultList) return;
    defaultList.innerHTML = '';
    const makeItem = (name, type) => {
      const li = document.createElement('li');
      li.className = 'cat-item';
      li.innerHTML = `<span class="cat-name">${name}</span><span class="badge ${type}">${type === 'expense' ? 'Dépense' : 'Revenu'}</span>`;
      return li;
    };
    DEFAULT_CATS.expense.forEach(n => defaultList.appendChild(makeItem(n, 'expense')));
    DEFAULT_CATS.income.forEach(n => defaultList.appendChild(makeItem(n, 'income')));
  };

  const renderCustom = () => {
    if (!customList) return;
    const data = loadCustom();
    customList.innerHTML = '';
    data.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cat-item';
      li.dataset.id = item.id;
      li.innerHTML = `
        <span class="cat-name">${item.name}</span>
        <span class="badge ${item.type}">${item.type === 'expense' ? 'Dépense' : 'Revenu'}</span>
        <button class="btn btn-small cat-del" data-id="${item.id}">Supprimer</button>
      `;
      customList.appendChild(li);
    });
    if (customEmpty) customEmpty.style.display = data.length ? 'none' : '';
  };

  const normalize = (s) => s.normalize('NFKC').trim().toLowerCase();

  const existsInDefaults = (name, type) => {
    const n = normalize(name);
    return (type === 'expense' ? DEFAULT_CATS.expense : DEFAULT_CATS.income).some(x => normalize(x) === n);
  };

  const existsInCustom = (name, type) => {
    const n = normalize(name);
    return loadCustom().some(x => x.type === type && normalize(x.name) === n);
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString();
    const type = (data.get('type') || 'expense').toString();

    if (!name || name.trim().length < 2) return;

    if (existsInDefaults(name, type) || existsInCustom(name, type)) {
      form.reset();
      renderCustom();
      return;
    }

    const item = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2), name: name.trim(), type };
    const all = loadCustom();
    all.push(item);
    saveCustom(all);
    form.reset();
    renderCustom();
  });

  customList?.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const delBtn = target.closest('.cat-del');
    if (!delBtn) return;
    const id = delBtn.getAttribute('data-id');
    if (!id) return;
    const all = loadCustom().filter(x => x.id !== id);
    saveCustom(all);
    renderCustom();
  });

  renderDefaults();
  renderCustom();
});
