(function () {
  'use strict';

  // ========= Utilities =========
  const q = (id) => document.getElementById(id);
  const safeParse = (raw, fallback = null) => {
    try { return raw == null ? fallback : JSON.parse(raw); } catch { return fallback; }
  };

  // ========= Formatting =========
  function makeFormatter(currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency });
    } catch {
      // Simple fallback if currency code is invalid
      return { format: (n) => `${n.toFixed(2)} ${currency || 'EUR'}` };
    }
  }

  // ========= Rendering =========
  function setText(el, value) { if (el) el.textContent = value; }

  function monthLabelEN(date) {
    const label = date.toLocaleString('en', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function sameMonth(a, b) { return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); }

  function summarizeMonth(txList, now) {
    const monthlyTx = txList.filter((tx) => {
      const d = new Date(tx.date);
      return sameMonth(d, now);
    });

    const sum = (type) => monthlyTx
      .filter((tx) => tx.type === type)
      .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

    return { monthlyTx, income: sum('income'), expenses: sum('expense') };
  }

  function renderKPIs({ balanceEl, incomeEl, expensesEl }, { income, expenses }, fmt) {
    const balance = income - expenses;
    setText(balanceEl, fmt.format(balance));
    setText(incomeEl, fmt.format(income));
    setText(expensesEl, fmt.format(expenses));
  }

  function renderRecent(listEl, monthlyTx, fmt) {
    if (!listEl) return;
    const recent = [...monthlyTx].reverse().slice(0, 5);
    listEl.innerHTML = '';

    if (recent.length === 0) {
      listEl.innerHTML = '<p>No recent transactions</p>';
      return;
    }

    recent.forEach((tx) => {
      const item = document.createElement('div');
      item.className = 'tx-item';
      const sign = tx.type === 'expense' ? '-' : '+';
      const cls = tx.type === 'expense' ? 'negative' : 'positive';
      item.innerHTML = `
        <div class="tx-info">
          <strong>${tx.category}</strong>
          <span class="tx-date">${tx.date}</span>
        </div>
        <div class="tx-amount ${cls}">
          ${sign}${fmt.format(parseFloat(tx.amount || 0))}
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  function renderChart(canvas, monthlyTx) {
    if (!canvas || typeof Chart === 'undefined') return;

    const expenseData = {};
    monthlyTx
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const key = tx.category;
        expenseData[key] = (expenseData[key] || 0) + parseFloat(tx.amount || 0);
      });

    const categories = Object.keys(expenseData);
    const values = Object.values(expenseData);
    if (categories.length === 0) return;

    // Keep exactly the same options/colors as the original
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          ],
        }],
      },
      options: { plugins: { legend: { position: 'bottom' } }, responsive: true },
    });
  }

  // ========= Bootstrap =========
  document.addEventListener('DOMContentLoaded', () => {
    const session = safeParse(localStorage.getItem('niqo.session'));
    if (!session || (!session.username && !session.guest)) {
      window.location.href = './login.html';
      return;
    }

    const storageKey = `transactions_${session.username || 'guest'}`;
    const transactions = safeParse(localStorage.getItem(storageKey), []) || [];
    const currency = session.currency || 'EUR';

    const fmt = makeFormatter(currency);
    const now = new Date();

    // DOM selectors
    const balanceEl = q('balance');
    const incomeEl = q('income');
    const expensesEl = q('expenses');
    const txListEl = q('transactions-list');
    const chartCanvas = q('chart');
    const monthEl = q('current-month');

    setText(monthEl, monthLabelEN(now));

    const summary = summarizeMonth(transactions, now);
    renderKPIs({ balanceEl, incomeEl, expensesEl }, summary, fmt);
    renderRecent(txListEl, summary.monthlyTx, fmt);
    renderChart(chartCanvas, summary.monthlyTx);
  });
})();