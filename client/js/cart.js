// Carrito simple en localStorage (flujo inicial)
// Clave: mascotero_cart
const CART_KEY = "mascotero_cart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || { items: [] };
  } catch {
    return { items: [] };
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart:updated"));
}


function normalizeItem(item) {
  return {
    tipo: item.tipo,
    id: Number(item.id),
    nombre: item.nombre,
    precio: __utils.convertirTextoMoneyANumero(item.precio),
    descripcion: item.descripcion ?? "",
    img: item.img ?? item.imagen ?? null,
    cantidad: Number(item.cantidad) || 0
  };
}

function keyOf(tipo, id) {
  return `${tipo}:${id}`;
}

function addItem(item) {
  const cart = loadCart();
  const it = normalizeItem(item);

  const k = keyOf(it.tipo, it.id);
  const existing = cart.items.find((x) => keyOf(x.tipo, x.id) === k);

  if (existing) {
    existing.cantidad += 1;
    if (it.img) existing.img = it.img;
  } else cart.items.push({ ...it, cantidad: 1 });

  saveCart(cart);
  return cart;
}

function removeItem(tipo, id) {
  const cart = loadCart();
  const k = keyOf(tipo, id);

  const existing = cart.items.find((x) => keyOf(x.tipo, x.id) === k);
  if (!existing) return cart;

  existing.cantidad -= 1;
  cart.items = cart.items.filter((x) => x.cantidad > 0);

  saveCart(cart);
  return cart;
}

function setQuantity(tipo, id, cantidad) {
  const cart = loadCart();
  const k = keyOf(tipo, id);
  const q = Number(cantidad) || 0;

  const existing = cart.items.find((x) => keyOf(x.tipo, x.id) === k);
  if (!existing) return cart;

  existing.cantidad = q;
  cart.items = cart.items.filter((x) => x.cantidad > 0);

  saveCart(cart);
  return cart;
}

function clearCart() {
  saveCart({ items: [] });
}

function getTotalCount() {
  const cart = loadCart();
  return cart.items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
}

function getTotalPrice() {
  const cart = loadCart();
  return cart.items.reduce(
    (acc, it) =>
      acc +
      (Number(it.cantidad) || 0) *
        (__utils.convertirTextoMoneyANumero(it.precio) || 0),
    0
  );
}

function getItemQuantity(tipo, id) {
  const cart = loadCart();
  const k = keyOf(tipo, id);
  const existing = cart.items.find((x) => keyOf(x.tipo, x.id) === k);
  return existing ? Number(existing.cantidad) || 0 : 0;
}

// Badge en header (#cartCount)
function updateCartBadge() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.textContent = String(getTotalCount());
}

window.addEventListener("cart:updated", updateCartBadge);
window.addEventListener("storage", updateCartBadge);

// API pública
window.__cart = {
  loadCart,
  addItem,
  removeItem,
  setQuantity,
  clearCart,
  getTotalCount,
  getTotalPrice,
  getItemQuantity,
  updateCartBadge
};
