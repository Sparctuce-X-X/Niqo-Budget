document.addEventListener('DOMContentLoaded', () => {
  const session = JSON.parse(localStorage.getItem('niqo.session'));
  if (!session || (!session.username && !session.guest)) {
    window.location.href = './login.html';
    return;
  }

  const storageKey = `transactions_${session.username || 'guest'}`;
  const transactions = JSON.parse(localStorage.getItem(storageKey)) || [];
  const currency = session.currency || 'EUR';

  const balanceEl = document.getElementById('balance');
  const incomeEl = document.getElementById('income');
  const expensesEl = document.getElementById('expenses');
  const txListEl = document.getElementById('transactions-list');
  const chartCanvas = document.getElementById('chart');
  const monthEl = document.getElementById('current-month');

  const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency });

  const now = new Date();
  const monthLabel = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  if (monthEl) monthEl.textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const monthlyTx = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const income = monthlyTx
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

  const expenses = monthlyTx
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

  const balance = income - expenses;

  if (balanceEl) balanceEl.textContent = fmt.format(balance);
  if (incomeEl) incomeEl.textContent = fmt.format(income);
  if (expensesEl) expensesEl.textContent = fmt.format(expenses);

  const recent = [...monthlyTx].reverse().slice(0, 5);
  if (txListEl) {
    txListEl.innerHTML = '';
    if (recent.length === 0) {
      txListEl.innerHTML = '<p>Aucune transaction récente</p>';
    } else {
      recent.forEach(tx => {
        const item = document.createElement('div');
        item.className = 'tx-item';
        item.innerHTML = `
          <div class="tx-info">
            <strong>${tx.category}</strong>
            <span class="tx-date">${tx.date}</span>
          </div>
          <div class="tx-amount ${tx.type === 'expense' ? 'negative' : 'positive'}">
            ${tx.type === 'expense' ? '-' : '+'}${fmt.format(parseFloat(tx.amount || 0))}
          </div>
        `;
        txListEl.appendChild(item);
      });
    }
  }

  if (chartCanvas && typeof Chart !== 'undefined') {
    const expenseData = {};
    monthlyTx.filter(tx => tx.type === 'expense').forEach(tx => {
      expenseData[tx.category] = (expenseData[tx.category] || 0) + parseFloat(tx.amount || 0);
    });

    const categories = Object.keys(expenseData);
    const values = Object.values(expenseData);

    if (categories.length > 0) {
      new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: values,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ],
          }]
        },
        options: {
          plugins: { legend: { position: 'bottom' } },
          responsive: true
        }
      });
    }
  }
});
