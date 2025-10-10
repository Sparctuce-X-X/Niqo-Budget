document.addEventListener('DOMContentLoaded', () => {
  const session = JSON.parse(localStorage.getItem('niqo.session'));
  if (!session || (!session.username && !session.guest)) { window.location.href = './login.html'; return; }

  const storageKey = `transactions_${session.username || 'guest'}`;
  let transactions = JSON.parse(localStorage.getItem(storageKey)) || [];

  const DEFAULT_CATS = {
    expense: ['Logement','Alimentation','Transport','Santé','Abonnements','Loisirs','Achats','Éducation','Impôts','Autres'],
    income: ['Salaire','Freelance','Investissements','Remboursement','Cadeaux','Autres']
  };

  const loadCustomCats = () => { try { return JSON.parse(localStorage.getItem('niqo.categories')) || []; } catch { return []; } };
  const getCatsByType = (type) => {
    const base = type === 'income' ? DEFAULT_CATS.income : DEFAULT_CATS.expense;
    const custom = loadCustomCats().filter(c => c.type === (type || 'expense')).map(c => c.name);
    const seen = new Set(); 
    return [...base, ...custom].filter(n => { const k = n.trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  };

  const form = document.getElementById('tx-form');
  const tbody = document.getElementById('tx-tbody');
  const empty = document.getElementById('tx-empty');
  const categorySelect = document.getElementById('category-select');
  const typeSelect = document.getElementById('type-select') || (form ? form.type : null);

  const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: session.currency || 'EUR' });

  const populateCategories = (type) => {
    if (!categorySelect) return;
    categorySelect.innerHTML = '';
    getCatsByType(type).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  };

  const renderTransactions = () => {
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!transactions.length) { if (empty) empty.style.display = 'block'; return; }
    if (empty) empty.style.display = 'none';
    transactions.forEach((tx, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tx.date || ''}</td>
        <td>${tx.type === 'income' ? 'Revenu' : 'Dépense'}</td>
        <td>${tx.category || ''}</td>
        <td>${fmt.format(parseFloat(tx.amount || 0) || 0)}</td>
        <td>${tx.note || ''}</td>
        <td><button data-idx="${idx}" class="btn-delete">Supprimer</button></td>
      `;
      tbody.appendChild(tr);
    });
  };

  const saveTransactions = () => localStorage.setItem(storageKey, JSON.stringify(transactions));

  if (typeSelect) populateCategories(typeSelect.value || 'expense');

  typeSelect?.addEventListener('change', () => populateCategories(typeSelect.value || 'expense'));

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const tx = {
      type: (data.get('type') || 'expense').toString(),
      amount: (data.get('amount') || '0').toString(),
      date: (data.get('date') || '').toString(),
      category: (data.get('category') || '').toString(),
      note: (data.get('note') || '').toString()
    };
    transactions.push(tx);
    saveTransactions();
    renderTransactions();
    form.reset();
    populateCategories(typeSelect ? typeSelect.value : 'expense');
  });

  tbody?.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-idx') || '-1', 10);
    if (idx >= 0) {
      transactions.splice(idx, 1);
      saveTransactions();
      renderTransactions();
    }
  });

  renderTransactions();
});
