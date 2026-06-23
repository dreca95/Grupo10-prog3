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

    function renderizarCard(prod) {
        const id = Number(prod.id ?? prod.ID ?? prod.Id);
        const nombre = prod.nombre;
        const precioNumero = __utils.ConvertirTextoMoneyANumero(prod.precio);
        const precioTexto = __utils.FormatearNumeroAPrecio(prod.precio);
        const descripcion = prod.descripcion ?? "";
        const imagenHtml = prod.imagen
            ? `<img src="${prod.imagen}" alt="${nombre}" onerror="this.onerror=null;this.src='/client/img/error.png';">`
            : `<div class="sinImagenProducto">Sin imagen</div>`;

        const card = document.createElement("div");
        card.className = "productoCard";
        card.innerHTML = `
            <div class="productoImagen">${imagenHtml}</div>
            <div class="productoInfo">
                <h3>${nombre}</h3>
                <p><strong>Precio:</strong> ${precioTexto}</p>
                <p><strong>Descripción:</strong> ${descripcion}</p>
                <div class="productoActions">
                    <button type="button" class="productoBtn editarBtn" data-action="add">+</button>
                    <button type="button" class="productoBtn eliminarBtn" data-action="remove">-</button>
                </div>
            </div>
        `;

        card.querySelector('[data-action="add"]').addEventListener("click", () => {
            if (!id) return;
            __cart.addItem({
                tipo,
                id,
                nombre,
                precio: precioNumero,
                descripcion,
                img: prod.imagen || null
            });
        });

        card.querySelector('[data-action="remove"]').addEventListener("click", () => {
            if (!id) return;
            __cart.removeItem(tipo, id);
        });

        return card;
    }

    function mostrarProductos() {
        grid.innerHTML = "";
        sinCoincidencias.hidden = true;

        if (!arrayTodos.length) {
            grid.innerHTML = "<p>No hay productos.</p>";
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
            ultima -= CANT_POR_PAGINA;

            if (primera < 0) {
                primera = 0;
            }

            if (ultima <= primera) {
                ultima = Math.min(primera + CANT_POR_PAGINA, lista.length);
            }

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
        grid.innerHTML = "<p>Cargando...</p>";
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
            grid.innerHTML = `<p class="error">${e.message}</p>`;
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

    return { cargarProductos };
}

window.__paginado = {
    iniciarCatalogo: crearPaginadorCatalogo
};
