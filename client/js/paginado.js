const CANT_POR_PAGINA = 12;

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

    let primera = 0;
    let ultima = CANT_POR_PAGINA;
    let arrayTodos = [];
    let terminoBusqueda = "";

    function productosFiltrados() {
        const t = terminoBusqueda.trim().toLowerCase();
        if (!t) return arrayTodos;
        return arrayTodos.filter((p) => (p.nombre || "").toLowerCase().includes(t));
    }

    function reiniciarPagina() {
        primera = 0;
        ultima = CANT_POR_PAGINA;
    }

    function actualizarBotones(lista) {
        const numPagina = lista.length ? Math.floor(primera / CANT_POR_PAGINA) + 1 : 0;
        pageText.textContent = "Página " + numPagina;

        anterior.classList.toggle("disabled", primera <= 0);
        siguiente.classList.toggle("disabled", ultima >= lista.length);
    }

    function setCantidadVisible(cantidadEl, cantidad) {
        cantidadEl.textContent = cantidad > 0 ? String(cantidad) : "";
    }

    function actualizarCantidadEnCards() {
        grid.querySelectorAll(".productoCard[data-producto-id]").forEach((card) => {
            const id = Number(card.dataset.productoId);
            const cantidadEl = card.querySelector(".productoCantidad");
            if (cantidadEl && id) {
                setCantidadVisible(cantidadEl, __cart.getItemQuantity(tipo, id));
            }
        });
    }

    function mostrarMensajeGrid(texto, className) {
        grid.replaceChildren();
        const p = document.createElement("p");
        if (className) p.className = className;
        p.textContent = texto;
        grid.appendChild(p);
    }

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

        btnRemove.addEventListener("click", () => {
            if (!id) return;
            __cart.removeItem(tipo, id);
            actualizarCantidadEnCards();
        });

        return card;
    }

    function mostrarProductos() {
        grid.replaceChildren();
        sinCoincidencias.hidden = true;

        if (!arrayTodos.length) {
            mostrarMensajeGrid("No hay productos.");
            actualizarBotones([]);
            return;
        }

        const lista = productosFiltrados();

        if (!lista.length) {
            sinCoincidencias.hidden = false;
            actualizarBotones([]);
            return;
        }

        if (primera >= lista.length) {
            reiniciarPagina();
        }
        if (ultima > lista.length) {
            ultima = lista.length;
        }
        if (ultima <= primera) {
            ultima = Math.min(primera + CANT_POR_PAGINA, lista.length);
        }

        const pagina = lista.slice(primera, ultima);

        pagina.forEach((prod) => {
            grid.appendChild(renderizarCard(prod));
        });

        actualizarBotones(lista);
    }

    function paginaSiguiente() {
        const lista = productosFiltrados();

        if (ultima < lista.length) {
            primera += CANT_POR_PAGINA;
            ultima += CANT_POR_PAGINA;

            if (ultima > lista.length) {
                ultima = lista.length;
            }

            mostrarProductos();
        }
    }

    function paginaAnterior() {
        if (primera > 0) {
            const lista = productosFiltrados();

            primera -= CANT_POR_PAGINA;
            if (primera < 0) {
                primera = 0;
            }
            ultima = Math.min(primera + CANT_POR_PAGINA, lista.length);

            mostrarProductos();
        }
    }

    function aplicarBusqueda() {
        terminoBusqueda = inputBuscar.value;
        reiniciarPagina();
        btnLimpiar.hidden = !terminoBusqueda.trim();
        mostrarProductos();
    }

    function limpiarBusqueda() {
        terminoBusqueda = "";
        inputBuscar.value = "";
        btnLimpiar.hidden = true;
        reiniciarPagina();
        mostrarProductos();
    }

    async function cargarProductos() {
        mostrarMensajeGrid("Cargando...");
        sinCoincidencias.hidden = true;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error("No se pudo cargar " + apiUrl);
            }

            arrayTodos = await response.json();
            reiniciarPagina();
            mostrarProductos();
        } catch (e) {
            mostrarMensajeGrid(e.message, "error");
        }
    }

    anterior.addEventListener("click", (e) => {
        e.preventDefault();
        paginaAnterior();
    });

    siguiente.addEventListener("click", (e) => {
        e.preventDefault();
        paginaSiguiente();
    });

    btnBuscar.addEventListener("click", aplicarBusqueda);

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
