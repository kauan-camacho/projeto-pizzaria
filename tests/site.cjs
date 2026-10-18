const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const files = ["index.html", "cardapio.html", "sobre.html", "contato.html"];
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: IDs únicos`);
  for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!m[1].startsWith("http"))
      assert.ok(fs.existsSync(m[1]), `${file}: ${m[1]}`);
  }
  assert.ok(html.includes('id="menu-toggle"'));
  assert.ok(html.includes(`href="${file}" aria-current="page"`));
  for (const m of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.includes(m[1]), `${file}: âncora ${m[1]}`);
  assert.ok(!html.includes("??"));
  const stack = [];
  for (const match of html.matchAll(
    /<(\/?)(article|section|div|main|nav|header|footer|dialog)\b[^>]*>/g,
  )) {
    if (match[1])
      assert.equal(stack.pop(), match[2], `${file}: fechamento de ${match[2]}`);
    else stack.push(match[2]);
  }
  assert.deepEqual(stack, []);
}
function runSite(config = {}) {
  const nodes = new Map();
  function node(s) {
    if (!nodes.has(s))
      nodes.set(s, {
        handlers: {},
        hidden: true,
        attributes: {},
        textContent: "",
        addEventListener(e, fn) {
          this.handlers[e] = fn;
        },
        setAttribute(k, v) {
          this.attributes[k] = v;
        },
        showModal() {
          this.open = true;
        },
        close() {
          this.open = false;
          this.handlers.close?.();
        },
        focus() {
          this.focused = true;
        },
      });
    return nodes.get(s);
  }
  vm.runInNewContext(fs.readFileSync("assents/JS/site.js", "utf8"), {
    window: { LUMINA_CONFIG: config },
    document: { querySelector: node },
  });
  return node;
}
const blank = runSite();
assert.equal(blank("#map-actions").hidden, true);
const site = runSite({
  address: "Rua Itália, 42 & Centro, São Paulo",
  hours: "Terça a domingo, 18h–23h",
  bio: "História real da casa.",
});
site("#menu-toggle").handlers.click();
assert.equal(site("#navigation-dialog").open, true);
assert.equal(site("#menu-toggle").attributes["aria-expanded"], "true");
site("#close-navigation").handlers.click();
assert.equal(site("#navigation-dialog").open, false);
assert.equal(site("#menu-toggle").attributes["aria-expanded"], "false");
assert.equal(site("#menu-toggle").focused, true);
assert.equal(site("#map-actions").hidden, false);
assert.equal(
  new URL(site("#maps-link").href).searchParams.get("query"),
  "Rua Itália, 42 & Centro, São Paulo",
);
assert.equal(
  new URL(site("#directions-link").href).searchParams.get("destination"),
  "Rua Itália, 42 & Centro, São Paulo",
);
assert.equal(site("#business-bio").textContent, "História real da casa.");
// As páginas institucionais não têm a grade nem os filtros do cardápio.
const app = fs.readFileSync("assents/JS/app.js", "utf8");
const nodes = new Map();
function node(s) {
  if (["#pizza-grid", "#search", "#contact-button"].includes(s)) return null;
  if (!nodes.has(s))
    nodes.set(s, {
      value: "",
      hidden: false,
      innerHTML: "",
      textContent: "",
      handlers: {},
      addEventListener(e, f) {
        this.handlers[e] = f;
      },
      querySelectorAll() {
        return [];
      },
    });
  return nodes.get(s);
}
node("#checkout").elements = { fulfillment: { value: "delivery" } };
vm.runInNewContext(app, {
  window: { LUMINA_CONFIG: {} },
  document: {
    querySelector: node,
    querySelectorAll() {
      return [];
    },
  },
  localStorage: {
    getItem() {
      return "{}";
    },
    setItem() {},
  },
  setTimeout() {},
  clearTimeout() {},
});
assert.equal(node("#cart-count").textContent, 0);
console.log(
  "OK: quatro páginas, links, estrutura HTML, menu acessível, Maps e carrinho fora do cardápio.",
);
