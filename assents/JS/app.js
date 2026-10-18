(() => {
  "use strict";
  const config = window.LUMINA_CONFIG || {};
  const money = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const image = (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=420&q=75`;
  const pizzas = [
    {
      id: "margherita",
      name: "Margherita",
      description: "Molho pelati, mozzarella de búfala e manjericão fresco.",
      price: 45,
      category: "classic",
      vegetarian: true,
      tag: "O clássico italiano",
      image: image("photo-1574071318508-1cdbab80d002"),
    },
    {
      id: "pepperoni",
      name: "Pepperoni",
      description: "Molho pelati, mozzarella e pepperoni curado artesanal.",
      price: 52,
      category: "classic",
      vegetarian: false,
      tag: "Sabor marcante",
      image: image("photo-1628840042765-356cda07504e"),
    },
    {
      id: "burrata",
      name: "Burrata",
      description: "Molho pelati, burrata cremosa e pesto de manjericão.",
      price: 60,
      category: "special",
      vegetarian: true,
      tag: "Especial da casa",
      image: image("photo-1571407970349-bc81e7e96d47"),
    },
    {
      id: "funghi",
      name: "Funghi",
      description: "Mix de cogumelos, mozzarella e azeite trufado.",
      price: 58,
      category: "special",
      vegetarian: true,
      tag: "Para sair do comum",
      image: image("photo-1513104890138-7c749659a591"),
    },
    {
      id: "calabresa",
      name: "Calabresa",
      description:
        "Molho pelati, mozzarella, calabresa fatiada, cebola e orégano.",
      price: 49,
      category: "classic",
      vegetarian: false,
      tag: "Clássica da casa",
      image: image("photo-1628840042765-356cda07504e"),
    },
    {
      id: "quatro-queijos",
      name: "Quatro Queijos",
      description:
        "Mozzarella, provolone, parmesão e gorgonzola sobre molho pelati.",
      price: 56,
      category: "classic",
      vegetarian: true,
      tag: "Para quem ama queijo",
      image: image("photo-1571407970349-bc81e7e96d47"),
    },
    {
      id: "portuguesa",
      name: "Portuguesa",
      description:
        "Molho pelati, mozzarella, presunto, ovo, cebola e azeitonas.",
      price: 54,
      category: "classic",
      vegetarian: false,
      tag: "Uma combinação completa",
      image: image("photo-1513104890138-7c749659a591"),
    },
    {
      id: "frango-catupiry",
      name: "Frango com Catupiry",
      description:
        "Molho pelati, mozzarella, frango desfiado e Catupiry cremoso.",
      price: 55,
      category: "classic",
      vegetarian: false,
      tag: "Cremosa na medida",
      image: image("photo-1571407970349-bc81e7e96d47"),
    },
    {
      id: "caprese",
      name: "Caprese",
      description:
        "Molho pelati, mozzarella de búfala, tomate fresco, manjericão e azeite.",
      price: 57,
      category: "special",
      vegetarian: true,
      tag: "Frescor italiano",
      image: image("photo-1574071318508-1cdbab80d002"),
    },
    {
      id: "parma-rucula",
      name: "Parma e Rúcula",
      description:
        "Molho pelati, mozzarella, presunto de Parma, rúcula e lascas de parmesão.",
      price: 65,
      category: "special",
      vegetarian: false,
      tag: "Especial italiana",
      image: image("photo-1513104890138-7c749659a591"),
    },
  ];
  const $ = (selector) => document.querySelector(selector);
  let cart = {};
  try {
    const saved = JSON.parse(localStorage.getItem("lumina-cart-v1") || "{}");
    for (const p of pizzas)
      if (Number.isInteger(saved?.[p.id]) && saved[p.id] > 0)
        cart[p.id] = Math.min(saved[p.id], 99);
  } catch {
    /* O carrinho funciona mesmo quando o armazenamento está indisponível. */
  }
  let filter = "all",
    toastTimer;
  const subtotal = () =>
    pizzas.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
  const count = () => Object.values(cart).reduce((sum, n) => sum + n, 0);
  const feeKnown = () =>
    typeof config.deliveryFee === "number" &&
    Number.isFinite(config.deliveryFee) &&
    config.deliveryFee >= 0;
  const pickup = () => $("#checkout").elements.fulfillment.value === "pickup";
  function notify(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      3000,
    );
  }
  function fallbackImage(img) {
    img.addEventListener(
      "error",
      () => {
        img.src = "assents/images/pizza-fallback.svg";
      },
      { once: true },
    );
  }
  document.querySelectorAll(".welcome-photo img").forEach(fallbackImage);
  function renderMenu() {
    if (!$("#pizza-grid")) return;
    const term = $("#search")
      .value.trim()
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const visible = pizzas.filter(
      (p) =>
        (filter === "all" ||
          p.category === filter ||
          (filter === "vegetarian" && p.vegetarian)) &&
        `${p.name} ${p.description}`
          .toLocaleLowerCase("pt-BR")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(term),
    );
    $("#pizza-grid").innerHTML = visible
      .map(
        (p) =>
          `<article class="pizza-card"><div class="pizza-photo"><img src="${p.image}" alt="Pizza ${p.name}" loading="lazy" width="650" height="590"></div><div class="pizza-info"><h3>${p.name}</h3><p>${p.description}</p><div class="card-bottom"><strong>${money(p.price)}</strong><button class="add-button" data-add="${p.id}" aria-label="Adicionar pizza ${p.name} ao pedido">Adicionar +</button></div><span class="in-cart" data-in-cart="${p.id}">${cart[p.id] ? `${cart[p.id]} no pedido` : ""}</span></div></article>`,
      )
      .join("");
    $("#no-results").hidden = visible.length > 0;
    $("#pizza-grid").querySelectorAll("img").forEach(fallbackImage);
  }
  function updateTotals() {
    const isPickup = pickup();
    const known = isPickup || feeKnown();
    const fee = isPickup ? 0 : feeKnown() ? config.deliveryFee : 0;
    $("#subtotal").textContent = money(subtotal());
    $("#delivery-fee").textContent = isPickup
      ? "Retirada · sem taxa"
      : feeKnown()
        ? config.deliveryFee === 0
          ? "Grátis"
          : money(fee)
        : "A confirmar";
    $("#total-label").textContent = known ? "Total" : "Total dos produtos";
    $("#total").textContent = money(subtotal() + fee);
    $("#checkout-button").disabled = !count();
  }
  function renderCart() {
    $("#cart-count").textContent = count();
    $("#mobile-order").hidden = !count();
    $("#mobile-count").textContent =
      count() === 1 ? "1 item" : count() + " itens";
    $("#mobile-subtotal").textContent = money(subtotal());
    $("#checkout").hidden = !count();
    document.querySelectorAll("[data-in-cart]").forEach((el) => {
      el.textContent = cart[el.dataset.inCart]
        ? cart[el.dataset.inCart] + " no pedido"
        : "";
    });
    $("#cart-items").innerHTML = count()
      ? pizzas
          .filter((p) => cart[p.id])
          .map(
            (p) =>
              `<div class="cart-item"><img src="${p.image}" alt="" width="65" height="65"><div class="cart-item-info"><h3>${p.name}</h3><p>${money(p.price * cart[p.id])}</p></div><div class="quantity"><button type="button" data-quantity="${p.id}" data-delta="-1" aria-label="Diminuir quantidade de ${p.name}">−</button><span aria-label="${cart[p.id]} unidades">${cart[p.id]}</span><button type="button" data-quantity="${p.id}" data-delta="1" aria-label="Aumentar quantidade de ${p.name}" ${cart[p.id] >= 99 ? "disabled" : ""}>+</button></div></div>`,
          )
          .join("")
      : '<div class="empty-cart">Uma boa pizza está esperando por você.<br>Escolha seu sabor favorito no cardápio.</div>';
    $("#cart-items").querySelectorAll("img").forEach(fallbackImage);
    updateTotals();
    try {
      localStorage.setItem("lumina-cart-v1", JSON.stringify(cart));
    } catch {
      /* Persistência opcional. */
    }
  }
  function openCart() {
    $("#checkout-error").textContent = "";
    $("#cart-dialog").showModal();
  }
  function closeCart() {
    $("#cart-dialog").close();
  }
  document
    .querySelectorAll("[data-open-cart]")
    .forEach((b) => b.addEventListener("click", openCart));
  $("#close-cart").addEventListener("click", closeCart);
  $("#keep-shopping").addEventListener("click", closeCart);
  $("#cart-dialog").addEventListener("click", (e) => {
    if (
      e.target === $("#cart-dialog") &&
      e.clientX < $("#cart-dialog").getBoundingClientRect().left
    )
      closeCart();
  });
  $("#pizza-grid")?.addEventListener("click", (e) => {
    const button = e.target.closest("[data-add]");
    if (!button) return;
    const id = button.dataset.add;
    if ((cart[id] || 0) >= 99)
      return notify("Limite de 99 unidades por sabor.");
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    notify(
      `${pizzas.find((p) => p.id === id).name} adicionada ao pedido. Toque em Ver pedido para finalizar.`,
    );
  });
  $("#cart-items").addEventListener("click", (e) => {
    const button = e.target.closest("[data-quantity]");
    if (!button) return;
    const id = button.dataset.quantity;
    cart[id] = Math.max(
      0,
      Math.min(99, (cart[id] || 0) + Number(button.dataset.delta)),
    );
    if (!cart[id]) delete cart[id];
    const previousIndex = [
      ...$("#cart-items").querySelectorAll("button"),
    ].indexOf(button);
    renderCart();
    const controls = $("#cart-items").querySelectorAll("button");
    (
      controls[Math.min(previousIndex, controls.length - 1)] ||
      $("#keep-shopping")
    ).focus();
  });
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((b) => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      renderMenu();
    }),
  );
  $("#search")?.addEventListener("input", renderMenu);
  $("#checkout").addEventListener("change", () => {
    $("#address-fields").hidden = pickup();
    $("#checkout").elements.address.required = !pickup();
    $("#change-field").hidden =
      $("#checkout").elements.payment.value !== "Dinheiro";
    updateTotals();
  });
  function whatsappURL(message) {
    const number = String(config.whatsapp || "").replace(/\D/g, "");
    if (!/^[1-9]\d{9,14}$/.test(number)) return null;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }
  function launchWhatsApp(message, errorNode) {
    const url = whatsappURL(message);
    if (!url) {
      const text =
        "O WhatsApp da pizzaria ainda não foi configurado. O envio estará disponível assim que o contato oficial for cadastrado.";
      if (errorNode) errorNode.textContent = text;
      else notify(text);
      return;
    }
    // A navegação direta mantém o funcionamento mesmo com bloqueadores de pop-up.
    window.location.assign(url);
  }
  $("#checkout").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!count()) return;
    const form = e.currentTarget;
    const name = form.elements.customer.value.trim();
    const address = form.elements.address.value.trim();
    $("#checkout-error").textContent = "";
    if (!name || (!pickup() && !address)) {
      $("#checkout-error").textContent =
        "Preencha seu nome e o endereço de entrega.";
      return;
    }
    const lines = [
      "Olá, Lumina! Gostaria de fazer um pedido.",
      "",
      ...pizzas
        .filter((p) => cart[p.id])
        .map(
          (p) => `${cart[p.id]}x ${p.name} — ${money(p.price * cart[p.id])}`,
        ),
      "",
      `Subtotal: ${money(subtotal())}`,
    ];
    const isPickup = pickup();
    const fee = isPickup ? 0 : feeKnown() ? config.deliveryFee : null;
    lines.push(
      `Entrega: ${isPickup ? "retirada no local (sem taxa)" : fee === null ? "taxa a confirmar" : money(fee)}`,
    );
    lines.push(
      `${fee === null ? "Total dos produtos" : "Total"}: ${money(subtotal() + (fee || 0))}`,
      "",
      `Nome: ${name}`,
      `Recebimento: ${isPickup ? "Retirada" : "Entrega"}`,
    );
    if (!isPickup) {
      lines.push(`Endereço: ${address}`);
      if (form.elements.complement.value.trim())
        lines.push(`Complemento: ${form.elements.complement.value.trim()}`);
    }
    lines.push(`Pagamento: ${form.elements.payment.value}`);
    if (
      form.elements.payment.value === "Dinheiro" &&
      form.elements.change.value
    ) {
      const change = Number(form.elements.change.value);
      if (change < subtotal() + (fee || 0)) {
        $("#checkout-error").textContent =
          "O valor para troco deve ser igual ou maior que o total.";
        return;
      }
      lines.push(`Troco para: ${money(change)}`);
    }
    if (form.elements.notes.value.trim())
      lines.push(`Observações: ${form.elements.notes.value.trim()}`);
    lines.push(
      "",
      "Aguardo a confirmação de disponibilidade, valor final e prazo.",
    );
    launchWhatsApp(lines.join("\n"), $("#checkout-error"));
  });
  $("#contact-button")?.addEventListener("click", () =>
    launchWhatsApp("Olá, Lumina! Gostaria de falar com vocês."),
  );

  renderMenu();
  renderCart();
})();
