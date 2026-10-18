// Ajusta o mapa demonstrativo caso um endereço oficial seja cadastrado.
(() => {
  const config = window.LUMINA_CONFIG || {};
  const map = document.querySelector("#location-map");
  const address =
    typeof config.address === "string" ? config.address.trim() : "";
  if (map && address) {
    map.src =
      "https://maps.google.com/maps?q=" +
      encodeURIComponent(address) +
      "&z=16&output=embed";
    map.title = "Localização da Lumina no Google Maps: " + address;
    document.querySelector("#map-caption").textContent =
      "Explore o mapa ou abra no Google Maps para consultar a localização e as rotas.";
    document.querySelector("#directions-link").textContent =
      "Traçar rota até a Lumina ↗";
  }
  if (config.hours) document.querySelector("#demo-schedule").hidden = true;
})();
