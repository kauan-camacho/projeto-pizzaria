// Substitua o número abaixo pelo WhatsApp do seu negócio
const numberWhatsApp = "5511999999999"; 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const mensagem = document.getElementById('mensagem').value;
        
        const texto = `Olá! Meu nome é ${nome}.%0A%0A${mensagem}`;
        const urlWhatsApp = `https://wa.me/${numberWhatsApp}?text=${texto}`;
        
        window.open(urlWhatsApp, '_blank');
    });
});