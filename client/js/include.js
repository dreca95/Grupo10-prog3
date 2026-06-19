async function include(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar include: ${url}`);

  el.innerHTML = await res.text();
}

// Exponer en global para usarlo fácil en cada página
window.__include = include;
