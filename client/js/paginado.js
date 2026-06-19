function getPage() {
  const page = Number(new URLSearchParams(location.search).get("page") || "1");
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function setPaginaTexto(selector, page) {
  const el = document.querySelector(selector);
  if (el) el.textContent = `Página ${page}`;
}

function setLink(selector, href, disabled) {
  const el = document.querySelector(selector);
  if (!el) return;

  if (disabled) {
    el.setAttribute("href", "#");
    el.classList.add("disabled");
  } else {
    el.setAttribute("href", href);
    el.classList.remove("disabled");
  }
}

// Pagina y Next siempre existen en el EJS original.
// Para imitarlo 1:1:
// - Anterior deshabilitado en page=1
// - Siguiente siempre apunta a page+1 (aunque no haya más; igual que el EJS)
function renderPagination({ page, prevSelector, nextSelector, pageTextSelector }) {
  setPaginaTexto(pageTextSelector, page);
  setLink(prevSelector, `?page=${page - 1}`, page <= 1);
  setLink(nextSelector, `?page=${page + 1}`, false);
}

window.__paginado = {
  getPage,
  renderPagination
};
