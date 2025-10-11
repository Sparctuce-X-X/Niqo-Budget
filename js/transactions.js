(function () {
  'use strict';

  // ====== Constants ======
  const LS = Object.freeze({
    SESSION: 'niqo.session',
    CATS: 'niqo.categories',
  });

  const DEFAULT_CATS = Object.freeze({
    expense: ['Housing', 'Food', 'Transport', 'Health', 'Subscriptions', 'Leisure', 'Shopping', 'Education', 'Taxes', 'Others'],
    income: ['Salary', 'Freelance', 'Investments', 'Reimbursement', 'Gifts', 'Others'],
  });

  // ====== Utils ======
  const q = (id) => document.getElementById(id);
  const safeParse = (raw, fallback = null) => { try { return raw == null ? fallback : JSON.parse(raw); } catch { return fallback; } };

  const loadSession = () => safeParse(localStorage.getItem(LS.SESSION));
  const loadCustomCats = () => safeParse(localStorage.getItem(LS.CATS), []) ?? [];

  function getCatsByType(type) {
    const base = type === 'income' ? DEFAULT_CATS.income : DEFAULT_CATS.expense;
    const custom = loadCustomCats().filter((c) => c.type === (type || 'expense')).map((c) => c.name);
    const seen = new Set();
    return [...base, ...custom].filter((n) => {
      const k = (n || '').trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function formatter(currency) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }); }
    catch { return { format: (n) => `${(Number(n) || 0).toFixed(2)} ${currency || 'EUR'}` }; }
  }

  // ====== Rendering ======
  function populateCategories(selectEl, type) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    getCatsByType(type).forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      selectEl.appendChild(opt);
    });
  }

  function renderTransactions(tbody, emptyEl, txs, fmt) {
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!txs.length) { if (emptyEl) emptyEl.style.display = 'block'; return; }
    if (emptyEl) emptyEl.style.display = 'none';

    txs.forEach((tx, idx) => {
      const tr = document.createElement('tr');
      const amount = fmt.format(parseFloat(tx.amount || 0) || 0);
      tr.innerHTML = `
        <td>${tx.date || ''}</td>
        <td>${tx.type === 'income' ? 'Income' : 'Expense'}</td>
        <td>${tx.category || ''}</td>
        <td>${amount}</td>
        <td>${tx.note || ''}</td>
        <td><button data-idx="${idx}" class="btn-delete">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ====== Bootstrap ======
  document.addEventListener('DOMContentLoaded', () => {
    const session = loadSession();
    if (!session || (!session.username && !session.guest)) {
      window.location.href = './login.html';
      return;
    }

    const storageKey = `transactions_${session.username || 'guest'}`;
    let transactions = safeParse(localStorage.getItem(storageKey), []) || [];
    const currency = session.currency || 'EUR';
    const fmt = formatter(currency);

    // DOM references
    const form = q('tx-form');
    const tbody = q('tx-tbody');
    const empty = q('tx-empty');
    const categorySelect = q('category-select');
    const typeSelect = q('type-select') || (form ? form.type : null);

    // Initialization
    if (typeSelect) populateCategories(categorySelect, typeSelect.value || 'expense');

    typeSelect?.addEventListener('change', () => {
      populateCategories(categorySelect, typeSelect.value || 'expense');
    });

    const saveTransactions = () => localStorage.setItem(storageKey, JSON.stringify(transactions));

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const tx = {
        type: (fd.get('type') || 'expense').toString(),
        amount: (fd.get('amount') || '0').toString(),
        date: (fd.get('date') || '').toString(),
        category: (fd.get('category') || '').toString(),
        note: (fd.get('note') || '').toString(),
      };
      transactions.push(tx);
      saveTransactions();
      renderTransactions(tbody, empty, transactions, fmt);
      form.reset();
      populateCategories(categorySelect, typeSelect ? typeSelect.value : 'expense');
    });

    tbody?.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete');
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-idx') || '-1', 10);
      if (idx >= 0) {
        transactions.splice(idx, 1);
        saveTransactions();
        renderTransactions(tbody, empty, transactions, fmt);
      }
    });

    renderTransactions(tbody, empty, transactions, fmt);
  });
})();