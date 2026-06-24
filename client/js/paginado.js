const CANT_POR_PAGINA = 12; // default (consumo API)

const MAX_LIMIT_API = 50;

// monta paginador del catalogo cliente con carrito integrado
function crearPaginadorCatalogo({
    apiUrl,
    tipo,
    gridId,
    prevId,
    nextId,
    pageTextId,
    buscarInputId,
    buscarBtnId,
    limpiarBtnId,
    sinCoincidenciasId
}) {
    const grid = document.getElementById(gridId);
    const anterior = document.getElementById(prevId);
    const siguiente = document.getElementById(nextId);
    const pageText = document.getElementById(pageTextId);
    const inputBuscar = document.getElementById(buscarInputId);
    const btnBuscar = document.getElementById(buscarBtnId);
    const btnLimpiar = document.getElementById(limpiarBtnId);
    const sinCoincidencias = document.getElementById(sinCoincidenciasId);

   
    // Paginación desde la API
    let page = 1;
    let limit = CANT_POR_PAGINA;
    let terminoBusqueda = "";
    let totalPages = 0;
    let loading = false;

    // vuelve a pag 1 al buscar
    function reiniciarPagina() {
        page = 1;
    }

    //        actualiza prev/next y texto de pagina
    function actualizarBotones() {
        const numPagina = totalPages > 0 ? page : 0;
        pageText.textContent = "Página " + numPagina;

        anterior.classList.toggle("disabled", page <= 1);
        siguiente.classList.toggle("disabled", totalPages === 0 || page >= totalPages);
    }

    //muestra o oculta el numerito de cantidad en la card
    function setCantidadVisible(cantidadEl, cantidad) {
        cantidadEl.textContent = cantidad > 0 ? String(cantidad) : "";
    }

    //refresca cantidades en todas las cards segun el carrito
    function actualizarCantidadEnCards() {
        grid.querySelectorAll(".productoCard[data-producto-id]").forEach((card) => {
            const id = Number(card.dataset.productoId);
            const cantidadEl = card.querySelector(".productoCantidad");
            if (cantidadEl && id) {
                setCantidadVisible(cantidadEl, __cart.getItemQuantity(tipo, id));
            }
        });
    }

    //pone un mensaje solo en el grid (cargando, error, vacio)
    function mostrarMensajeGrid(texto, className) {
        grid.replaceChildren();
        const p = document.createElement("p");
        if (className) p.className = className;
        p.textContent = texto;
        grid.appendChild(p);
    }

    // arma la card de producto con botones + y - del carrito
    function renderizarCard(prod) {
        const id = Number(prod.id ?? prod.ID ?? prod.Id);
        const nombre = prod.nombre;
        const precioNumero = __utils.convertirTextoMoneyANumero(prod.precio);
        const precioTexto = __utils.formatearNumeroAPrecio(prod.precio);
        const descripcion = prod.descripcion ?? "";
        const cantidad = __cart.getItemQuantity(tipo, id);

        const card = document.createElement("div");
        card.className = "productoCard";
        card.dataset.productoId = id;

        const imagenWrap = document.createElement("div");
        imagenWrap.className = "productoImagen";
        if (prod.imagen) {
            const img = document.createElement("img");
            img.src = prod.imagen;
            img.alt = nombre;
            // si la img falla pone placeholder de error
            img.onerror = function () {
                this.onerror = null;
                this.src = "/client/img/error.png";
            };
            imagenWrap.appendChild(img);
        } else {
            const sin = document.createElement("div");
            sin.className = "sinImagenProducto";
            sin.textContent = "Sin imagen";
            imagenWrap.appendChild(sin);
        }
        card.appendChild(imagenWrap);

        const info = document.createElement("div");
        info.className = "productoInfo";

        const titulo = document.createElement("h3");
        titulo.textContent = nombre;
        info.appendChild(titulo);

        const pPrecio = document.createElement("p");
        const lblPrecio = document.createElement("strong");
        lblPrecio.textContent = "Precio:";
        pPrecio.appendChild(lblPrecio);
        pPrecio.appendChild(document.createTextNode(" " + precioTexto));
        info.appendChild(pPrecio);

        const pDesc = document.createElement("p");
        const lblDesc = document.createElement("strong");
        lblDesc.textContent = "Descripción:";
        pDesc.appendChild(lblDesc);
        pDesc.appendChild(document.createTextNode(" " + descripcion));
        info.appendChild(pDesc);

        const actions = document.createElement("div");
        actions.className = "productoActions";

        const btnAdd = document.createElement("button");
        btnAdd.type = "button";
        btnAdd.className = "productoBtn editarBtn";
        btnAdd.dataset.action = "add";
        btnAdd.textContent = "+";

        const spanCant = document.createElement("span");
        spanCant.className = "productoCantidad";
        setCantidadVisible(spanCant, cantidad);

        const btnRemove = document.createElement("button");
        btnRemove.type = "button";
        btnRemove.className = "productoBtn eliminarBtn";
        btnRemove.dataset.action = "remove";
        btnRemove.textContent = "-";

        actions.appendChild(btnAdd);
        actions.appendChild(spanCant);
        actions.appendChild(btnRemove);
        info.appendChild(actions);
        card.appendChild(info);

        // suma 1 al carrito y refresca el num
        btnAdd.addEventListener("click", () => {
            if (!id) return;
            __cart.addItem({
                tipo,
                id,
                nombre,
                precio: precioNumero,
                descripcion,
                img: prod.imagen || null
            });
            actualizarCantidadEnCards();
        });

        //  resta 1 del carrito
        btnRemove.addEventListener("click", () => {
            if (!id) return;
            __cart.removeItem(tipo, id);
            actualizarCantidadEnCards();
        });

        return card;
    }

    //   fetch productos paginados y los mete al grid
    async function cargarProductos() {
        if (loading) return;
        loading = true;

        mostrarMensajeGrid("Cargando...");
        sinCoincidencias.hidden = true;

        const q = (terminoBusqueda || "").trim();
        btnLimpiar.hidden = !q;

        const safeLimit = Math.max(1, Math.min(MAX_LIMIT_API, Number(limit) || CANT_POR_PAGINA));
        const url = `${apiUrl}?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(
            safeLimit
        )}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("No se pudo cargar " + apiUrl);
            }

            const data = await response.json();

            const items = Array.isArray(data?.items) ? data.items : [];

            totalPages = Number(data?.paginado?.totalPages) || 0;
            page = Number(data?.paginado?.page) || 1;

            grid.replaceChildren();

            if (!items.length) {
                if (q) {
                    sinCoincidencias.hidden = false;
                } else {
                    mostrarMensajeGrid("No hay productos.");
                }
                actualizarBotones();
                return;
            }

            items.forEach((prod) => {
                grid.appendChild(renderizarCard(prod));
            });

            actualizarBotones();
        } catch (e) {
            mostrarMensajeGrid(e.message, "error");
        } finally {
            loading = false;
        }
    }

    //  siguiente pagina del catalogo
    function paginaSiguiente() {
        if (totalPages > 0 && page < totalPages) {
            page += 1;
            cargarProductos();
        }
    }

    //pagina ant
    function paginaAnterior() {
        if (page > 1) {
            page -= 1;
            cargarProductos();
        }
    }

    //busca por texto y recarga desde pag 1
    function aplicarBusqueda() {
        terminoBusqueda = inputBuscar.value;
        reiniciarPagina();
        cargarProductos();
    }

    // limpia filtro
    function limpiarBusqueda() {
        terminoBusqueda = "";
        inputBuscar.value = "";
        reiniciarPagina();
        cargarProductos();
    }

    //click boton anterior
    anterior.addEventListener("click", (e) => {
        e.preventDefault();
        paginaAnterior();
    });

    // click boton siguiente
    siguiente.addEventListener("click", (e) => {
        e.preventDefault();
        paginaSiguiente();
    });

    btnBuscar.addEventListener("click", aplicarBusqueda);

    //enter aplicar busqueda
    inputBuscar.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            aplicarBusqueda();
        }
    });

    btnLimpiar.addEventListener("click", limpiarBusqueda);

    window.addEventListener("cart:updated", actualizarCantidadEnCards);

    return { cargarProductos };
}

window.__paginado = {
    iniciarCatalogo: crearPaginadorCatalogo
};
