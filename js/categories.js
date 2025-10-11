(function () {
  'use strict';

  // ====== Constants ======
  const LS_KEYS = Object.freeze({ SESSION: 'niqo.session', CATS: 'niqo.categories' });
  const DEFAULT_CATS = Object.freeze({
    expense: ['Housing', 'Food', 'Transport', 'Health', 'Subscriptions', 'Leisure', 'Shopping', 'Education', 'Taxes', 'Others'],
    income: ['Salary', 'Freelance', 'Investments', 'Reimbursement', 'Gifts', 'Others'],
  });

  // ====== Utils ======
  const q = (id) => document.getElementById(id);
  const normalize = (s) => s.normalize('NFKC').trim().toLowerCase();
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

  // ====== Storage ======
  const storage = {
    getSession() {
      try { return JSON.parse(localStorage.getItem(LS_KEYS.SESSION)); } catch { return null; }
    },
    loadCustom() {
      try { return JSON.parse(localStorage.getItem(LS_KEYS.CATS)) ?? []; } catch { return []; }
    },
    saveCustom(arr) {
      localStorage.setItem(LS_KEYS.CATS, JSON.stringify(arr));
    },
  };

  // ====== Rendering ======
  function makeDefaultItem(name, type) {
    const li = document.createElement('li');
    li.className = 'cat-item';
    li.innerHTML = `<span class="cat-name">${name}</span><span class="badge ${type}">${type === 'expense' ? 'Expense' : 'Income'}</span>`;
    return li;
  }

  function renderDefaults(ul) {
    if (!ul) return;
    ul.innerHTML = '';
    DEFAULT_CATS.expense.forEach((n) => ul.appendChild(makeDefaultItem(n, 'expense')));
    DEFAULT_CATS.income.forEach((n) => ul.appendChild(makeDefaultItem(n, 'income')));
  }

  function renderCustom(ul, emptyStateEl) {
    if (!ul) return;
    const data = storage.loadCustom();
    ul.innerHTML = '';
    data.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'cat-item';
      li.dataset.id = item.id;
      li.innerHTML = `
        <span class="cat-name">${item.name}</span>
        <span class="badge ${item.type}">${item.type === 'expense' ? 'Expense' : 'Income'}</span>
        <button class="btn btn-small cat-del" data-id="${item.id}">Delete</button>
      `;
      ul.appendChild(li);
    });
    if (emptyStateEl) emptyStateEl.style.display = data.length ? 'none' : '';
  }

  // ====== Validation / Deduplication ======
  const existsInDefaults = (name, type) => {
    const n = normalize(name);
    const list = type === 'expense' ? DEFAULT_CATS.expense : DEFAULT_CATS.income;
    return list.some((x) => normalize(x) === n);
  };

  const existsInCustom = (name, type) => {
    const n = normalize(name);
    return storage.loadCustom().some((x) => x.type === type && normalize(x.name) === n);
  };

  // ====== Bindings ======
  function bindForm(formEl, lists) {
    formEl?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(formEl);
      const name = (fd.get('name') || '').toString();
      const type = (fd.get('type') || 'expense').toString();

      if (!name || name.trim().length < 2) return;

      if (existsInDefaults(name, type) || existsInCustom(name, type)) {
        formEl.reset();
        renderCustom(lists.customList, lists.customEmpty);
        return;
      }

      const item = { id: uuid(), name: name.trim(), type };
      const all = storage.loadCustom();
      all.push(item);
      storage.saveCustom(all);
      formEl.reset();
      renderCustom(lists.customList, lists.customEmpty);
    });
  }

  function bindDelete(customListEl, lists) {
    customListEl?.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const delBtn = target.closest('.cat-del');
      if (!delBtn) return;
      const id = delBtn.getAttribute('data-id');
      if (!id) return;
      const remaining = storage.loadCustom().filter((x) => x.id !== id);
      storage.saveCustom(remaining);
      renderCustom(lists.customList, lists.customEmpty);
    });
  }

  // ====== Bootstrap ======
  document.addEventListener('DOMContentLoaded', () => {
    // Session check (unchanged)
    const session = storage.getSession();
    if (!session || (!session.username && !session.guest)) {
      window.location.href = './login.html';
      return;
    }

    const lists = {
      defaultList: q('default-cats'),
      customList: q('custom-cats'),
      customEmpty: q('custom-empty'),
    };

    renderDefaults(lists.defaultList);
    renderCustom(lists.customList, lists.customEmpty);

    bindForm(q('cat-form'), lists);
    bindDelete(lists.customList, lists);
  });
})();