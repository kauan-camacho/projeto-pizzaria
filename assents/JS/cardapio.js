// Substitua o número abaixo pelo WhatsApp do seu negócio
const numberWhatsApp = "5511999999999"; 

const pizzas = [
    { id: 1, nome: "Margherita", desc: "Molho pelati, mozzarella de búfala e manjericão fresco.", img: "https://picsum.photos/seed/margherita/400/300", preco: 45.00 },
    { id: 2, nome: "Pepperoni", desc: "Molho pelati, mozzarella e pepperoni curado artesanal.", img: "https://picsum.photos/seed/pepperoni/400/300", preco: 52.00 },
    { id: 3, nome: "Burrata", desc: "Molho pelati, burrata cremosa e pesto de manjericão.", img: "https://picsum.photos/seed/burrata/400/300", preco: 60.00 },
    { id: 4, nome: "Funghi", desc: "Mix de cogumelos, mozzarella e azeite trufado.", img: "https://picsum.photos/seed/funghi/400/300", preco: 58.00 }
];

let carrinho = [];

document.addEventListener('DOMContentLoaded', () => {
    renderizarCardapio();
    document.getElementById('btn-whatsapp').addEventListener('click', finalizarPedido);
});

function renderizarCardapio() {
    const grid = document.getElementById('pizza-grid');
    grid.innerHTML = '';
    
    pizzas.forEach(pizza => {
        const card = document.createElement('div');
        card.className = 'pizza-card';
        card.innerHTML = `
            <img src="${pizza.img}" alt="${pizza.nome}" class="pizza-img">
            <h3>${pizza.nome}</h3>
            <p>${pizza.desc}</p>
            <span class="price">R$ ${pizza.preco.toFixed(2).replace('.', ',')}</span>
            <button onclick="adicionarAoCarrinho(${pizza.id})">Adicionar</button>
        `;
        grid.appendChild(card);
    });
}

function adicionarAoCarrinho(id) {
    const pizza = pizzas.find(p => p.id === id);
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ ...pizza, quantidade: 1 });
    }
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">O carrinho está vazio.</p>';
        totalPrice.innerText = 'R$ 0,00';
        return;
    }
    
    carrinho.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.quantidade}x ${item.nome}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
        `;
        cartItems.appendChild(div);
        total += item.preco * item.quantidade;
    });
    
    totalPrice.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const endereco = document.getElementById('endereco').value;
    const pagamento = document.getElementById('pagamento').value;
    
    if (!endereco || !pagamento) {
        alert('Por favor, preencha o endereço de entrega e a forma de pagamento.');
        return;
    }
    
    let textoPedido = "Olá, Lumina! Gostaria de fazer o seguinte pedido:%0A%0A";
    let total = 0;
    
    carrinho.forEach(item => {
        textoPedido += `- ${item.quantidade}x ${item.nome} (R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')})%0A`;
        total += item.preco * item.quantidade;
    });
    
    textoPedido += `%0A*Total: R$ ${total.toFixed(2).replace('.', ',')}*%0A`;
    textoPedido += `%0A*Endereço:* ${endereco}`;
    textoPedido += `%0A*Pagamento:* ${pagamento}`;
    
    const urlWhatsApp = `https://wa.me/${numberWhatsApp}?text=${textoPedido}`;
    window.open(urlWhatsApp, '_blank');
}