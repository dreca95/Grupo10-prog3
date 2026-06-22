async function include(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar include: ${url}`);

  el.innerHTML = await res.text();

  document.querySelectorAll("[dataThemeToggle]").forEach(function (btn) {
    const oscuro = (localStorage.getItem("mascoteroTheme") || "light") === "dark";
    btn.textContent = oscuro ? "Modo claro" : "Modo oscuro";
  });
}

window.__include = include;
