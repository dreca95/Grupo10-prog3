// Carrito simple en localStorage (flujo inicial)
// Clave: mascotero_cart
const CART_KEY = "mascotero_cart";
const MAX_CANTIDAD_ITEM = 100;

//lee el carrito del localStorage o array vacio si falla
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || { items: [] };
  } catch {
    return { items: [] };
  }
}

//guarda carrito y avisa q cambio con evento
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart:updated"));
}


// normaliza un item q tenga siempre la misma forma
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

// clave unica tipo:id p buscar en el array
function keyOf(tipo, id) {
  return `${tipo}:${id}`;
}

//suma 1 al item o lo agrega si no existia (tope 100)
function addItem(item) {
  const cart = loadCart();
  const it = normalizeItem(item);

  const k = keyOf(it.tipo, it.id);
  const existing = cart.items.find((x) => keyOf(x.tipo, x.id) === k);

  if (existing) {
    if (existing.cantidad >= MAX_CANTIDAD_ITEM) return false;
    existing.cantidad += 1;
    if (it.img) existing.img = it.img;
  } else {
    cart.items.push({ ...it, cantidad: 1 });
  }

  saveCart(cart);
  return true;
}

//resta 1 y saca del array si queda en 0
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

// setea cantidad exacta respetando min 0 y max 100
function setQuantity(tipo, id, cantidad) {
  const cart = loadCart();
  const k = keyOf(tipo, id);
  const q = Math.min(MAX_CANTIDAD_ITEM, Math.max(0, Number(cantidad) || 0));

  const existing = cart.items.find((x) => keyOf(x.tipo, x.id) === k);
  if (!existing) return cart;

  existing.cantidad = q;
  cart.items = cart.items.filter((x) => x.cantidad > 0);

  saveCart(cart);
  return cart;
}

// chequea q todas las cantidades sean enteros validos 1..100
function cantidadesValidas() {
  const cart = loadCart();
  return cart.items.every((it) => {
    const q = Number(it.cantidad) || 0;
    return Number.isInteger(q) && q > 0 && q <= MAX_CANTIDAD_ITEM;
  });
}

//                  vacia el carrito
function clearCart() {
  saveCart({ items: [] });
}

//           total de unidades sumando todas las lineas
function getTotalCount() {
  const cart = loadCart();
  return cart.items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
}

//        precio total del carrito (cantidad x precio unitario)
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

//   cuantas unidades hay de un producto especifico
function getItemQuantity(tipo, id) {
  const cart = loadCart();
  const k = keyOf(tipo, id);
  const existing = cart.items.find((x) => keyOf(x.tipo, x.id) === k);
  return existing ? Number(existing.cantidad) || 0 : 0;
}

// Badge en header (#cartCount)
//      actualiza el numerito del carrito en el header
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
  cantidadesValidas,
  updateCartBadge,
  MAX_CANTIDAD_ITEM
};
