(() => {
  "use strict";
  const config = window.LUMINA_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const toggle = $("#menu-toggle");
  const menu = $("#navigation-dialog");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.showModal();
      toggle.setAttribute("aria-expanded", "true");
    });
    $("#close-navigation").addEventListener("click", () => menu.close());
    menu.addEventListener("close", () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    });
    menu.addEventListener("click", (event) => {
      if (event.target === menu) {
        const rect = menu.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientY > rect.bottom)
          menu.close();
      }
    });
  }
  function text(selector, value) {
    if ($(selector) && value) $(selector).textContent = value;
  }
  text("#business-bio", config.bio);
  text("#business-address", config.address);
  text("#business-hours", config.hours);
  text("#business-delivery", config.deliveryArea);
  if (config.address && $("#map-actions")) {
    const address = encodeURIComponent(config.address.trim());
    $("#maps-link").href =
      `https://www.google.com/maps/search/?api=1&query=${address}`;
    $("#directions-link").href =
      `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    $("#map-status").textContent = config.address;
    $("#map-actions").hidden = false;
  }
})();
