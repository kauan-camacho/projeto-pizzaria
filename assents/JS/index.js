document.addEventListener('DOMContentLoaded', () => {
    const btnPedir = document.getElementById('btn-pedir');
    if (btnPedir) {
        btnPedir.addEventListener('click', () => {
            window.location.href = 'cardapio.html'; // Redireciona para o fluxo de compra
        });
    }
});