document.addEventListener('DOMContentLoaded' , () => {
    const monthSpan = document.getElementById('current-month');
    const mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    const date = new Date();
    const moisActuel = mois[date.getMonth()];
    const annee = date.getFullYear();

    monthSpan.textContent = `${moisActuel} ${annee}`;

});