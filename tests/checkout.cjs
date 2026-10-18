// Verifica a lógica do pedido com DOM simulado, sem dependências externas.
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const app = readFileSync("assents/JS/app.js", "utf8");
function setup(config = {}, saved = "{}") {
  const nodes = new Map();
  function node(selector) {
    if (!nodes.has(selector))
      nodes.set(selector, {
        value: "",
        textContent: "",
        innerHTML: "",
        hidden: false,
        disabled: false,
        handlers: {},
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener(type, fn) {
          this.handlers[type] = fn;
        },
        querySelectorAll() {
          return [];
        },
        focus() {},
        showModal() {
          this.open = true;
        },
        close() {
          this.open = false;
        },
      });
    return nodes.get(selector);
  }
  const elements = Object.fromEntries(
    [
      "customer",
      "address",
      "complement",
      "payment",
      "change",
      "notes",
      "fulfillment",
    ].map((k) => [k, { value: "", required: false }]),
  );
  elements.fulfillment.value = "delivery";
  node("#checkout").elements = elements;
  let storage = saved,
    url = "";
  const context = {
    window: {
      LUMINA_CONFIG: config,
      location: {
        assign(v) {
          url = v;
        },
      },
    },
    document: {
      querySelector: node,
      querySelectorAll() {
        return [];
      },
    },
    localStorage: {
      getItem() {
        return storage;
      },
      setItem(k, v) {
        storage = v;
      },
    },
    location: { pathname: "/index.html" },
    setTimeout() {
      return 1;
    },
    clearTimeout() {},
    requestAnimationFrame(fn) {
      fn();
    },
  };
  vm.runInNewContext(app, context);
  const click = (selector, dataset) =>
    node(selector).handlers.click({
      target: {
        closest() {
          return { dataset };
        },
      },
    });
  return {
    node,
    elements,
    click,
    submit() {
      node("#checkout").handlers.submit({
        preventDefault() {},
        currentTarget: node("#checkout"),
      });
    },
    storage: () => storage,
    url: () => url,
  };
}
const app1 = setup({ whatsapp: "5511987654321", deliveryFee: null });
assert.equal(app1.node("#checkout-button").disabled, true);
assert.equal(app1.node("#mobile-order").hidden, true);
assert.equal(app1.node("#checkout").hidden, true);
app1.click("#pizza-grid", { add: "margherita" });
app1.click("#pizza-grid", { add: "pepperoni" });
assert.equal(app1.node("#cart-count").textContent, 2);
assert.equal(app1.node("#mobile-order").hidden, false);
assert.equal(app1.node("#mobile-count").textContent, "2 itens");
assert.match(app1.node("#mobile-subtotal").textContent, /97/);
assert.equal(app1.node("#checkout").hidden, false);
assert.match(app1.node("#subtotal").textContent, /97/);
assert.equal(app1.node("#delivery-fee").textContent, "A confirmar");
app1.elements.customer.value = "Ana & João";
app1.elements.address.value = "Rua Itália, 10 #2";
app1.elements.payment.value = "Pix";
app1.elements.notes.value = "Sem cebola & bem assada";
app1.submit();
const url = new URL(app1.url());
assert.equal(url.hostname, "wa.me");
assert.equal(url.pathname, "/5511987654321");
const message = url.searchParams.get("text");
assert.match(message, /1x Margherita/);
assert.match(message, /1x Pepperoni/);
assert.match(message, /Ana & João/);
assert.match(message, /Rua Itália, 10 #2/);
assert.match(message, /Sem cebola & bem assada/);
assert.match(message, /taxa a confirmar/);
app1.elements.fulfillment.value = "pickup";
app1.node("#checkout").handlers.change();
assert.equal(app1.elements.address.required, false);
app1.submit();
assert.doesNotMatch(new URL(app1.url()).searchParams.get("text"), /Endereço:/);
const restored = setup(
  { whatsapp: "5511987654321", deliveryFee: 8 },
  app1.storage(),
);
assert.equal(restored.node("#cart-count").textContent, 2);
assert.match(restored.node("#total").textContent, /105/);
restored.click("#cart-items", { quantity: "margherita", delta: "-1" });
assert.equal(restored.node("#cart-count").textContent, 1);
const blocked = setup();
blocked.click("#pizza-grid", { add: "burrata" });
blocked.elements.customer.value = "Ana";
blocked.elements.address.value = "Rua A";
blocked.elements.payment.value = "Pix";
blocked.submit();
assert.equal(blocked.url(), "");
assert.match(
  blocked.node("#checkout-error").textContent,
  /não foi configurado/,
);
const malformed = setup({}, "{invalid");
assert.equal(malformed.node("#cart-count").textContent, 0);
const safe = setup({}, '{"margherita":-2,"pepperoni":200,"other":7}');
assert.equal(safe.node("#cart-count").textContent, 99);
const troco = setup({ whatsapp: "5511987654321" });
troco.click("#pizza-grid", { add: "funghi" });
troco.elements.customer.value = "Ana";
troco.elements.address.value = "Rua A";
troco.elements.payment.value = "Dinheiro";
troco.elements.change.value = "20";
troco.submit();
assert.match(troco.node("#checkout-error").textContent, /troco/);
assert.equal(troco.url(), "");
console.log(
  "OK: carrinho, persistência, totais, entrega/retirada, mensagem codificada, configuração e troco.",
);

const empty = setup();
empty.click("#pizza-grid", { add: "margherita" });
assert.match(empty.node("#pizza-grid").innerHTML, /pizza-info/);
empty.click("#cart-items", { quantity: "margherita", delta: "-1" });
assert.equal(empty.node("#mobile-order").hidden, true);
assert.equal(empty.node("#checkout").hidden, true);
empty.node("#search").value = "cogumelos";
empty.node("#search").handlers.input();
assert.match(empty.node("#pizza-grid").innerHTML, /Funghi/);
assert.doesNotMatch(empty.node("#pizza-grid").innerHTML, /Margherita/);
console.log(
  "OK: barra de pedido mobile, checkout vazio e busca por ingrediente.",
);

// Integração do catálogo ampliado com a configuração real de teste.
const configured = { window: {} };
vm.runInNewContext(readFileSync("assents/JS/config.js", "utf8"), configured);
assert.equal(configured.window.LUMINA_CONFIG.whatsapp, "5519994906750");
const expanded = setup(configured.window.LUMINA_CONFIG);
assert.equal(
  (expanded.node("#pizza-grid").innerHTML.match(/class="pizza-card"/g) || [])
    .length,
  10,
);
const newFlavors = [
  ["calabresa", "Calabresa"],
  ["quatro-queijos", "Quatro Queijos"],
  ["portuguesa", "Portuguesa"],
  ["frango-catupiry", "Frango com Catupiry"],
  ["caprese", "Caprese"],
  ["parma-rucula", "Parma e Rúcula"],
];
for (const [id, name] of newFlavors) {
  assert.ok(expanded.node("#pizza-grid").innerHTML.includes(name));
  expanded.click("#pizza-grid", { add: id });
}
assert.equal(expanded.node("#cart-count").textContent, 6);
assert.match(expanded.node("#subtotal").textContent, /336/);
expanded.elements.customer.value = "Teste do cardápio";
expanded.elements.fulfillment.value = "pickup";
expanded.elements.payment.value = "Pix";
expanded.submit();
const configuredURL = new URL(expanded.url());
assert.equal(configuredURL.pathname, "/5519994906750");
for (const [, name] of newFlavors)
  assert.ok(configuredURL.searchParams.get("text").includes("1x " + name));
console.log(
  "OK: dez sabores, seis novos itens no pedido e destino do WhatsApp de teste.",
);
