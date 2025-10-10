document.addEventListener('DOMContentLoaded', () => {
    // Récupère la session utilisateur
    const session = JSON.parse(localStorage.getItem('niqo.session'));
    // Si pas de session, redirige vers la page de login
    if (!session || !session.username) {
        window.location.href = './login.html';
        return;
    }

    // Utilise le nom d'utilisateur comme clé unique
    const storageKey = `transactions_${session.username}`;
    let transactions = JSON.parse(localStorage.getItem(storageKey)) || [];

    const categories = ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé'];

    const categorySelect = document.getElementById('category-select');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    function renderTransactions() {
        const tbody = document.getElementById('tx-tbody');
        tbody.innerHTML = '';
        if (transactions.length === 0) {
            document.getElementById('tx-empty').style.display = 'block';
            return;
        }
        document.getElementById('tx-empty').style.display = 'none';
        transactions.forEach((tx, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tx.date}</td>
                <td>${tx.type === 'expense' ? 'Dépense' : 'Revenu'}</td>
                <td>${tx.category}</td>
                <td>${parseFloat(tx.amount).toFixed(2)} €</td>
                <td>${tx.note || ''}</td>
                <td>
                    <button data-idx="${idx}" class="btn-delete">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function saveTransactions() {
        localStorage.setItem(storageKey, JSON.stringify(transactions));
    }

    document.getElementById('tx-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const form = e.target;
        const tx = {
            type: form.type.value,
            amount: form.amount.value,
            date: form.date.value,
            category: form.category.value,
            note: form.note.value
        };
        transactions.push(tx);
        saveTransactions();
        renderTransactions();
        form.reset();
    });

    document.getElementById('tx-tbody').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const idx = e.target.getAttribute('data-idx');
            transactions.splice(idx, 1);
            saveTransactions();
            renderTransactions();
        }
    });

    renderTransactions();
});