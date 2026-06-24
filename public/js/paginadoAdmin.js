const CANT_POR_PAGINA = 10;
const LIMITE_MAXIMO_API = 50;

function escaparHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

async function consultarApiAdmin(url) {
    const response = await fetch(url);

    if (response.status === 401) {
        window.location.href = "/admin/login";
        throw new Error("no autorizado");
    }

    if (!response.ok) {
        throw new Error("No se pudo cargar " + url);
    }

    return response.json();
}

function crearPaginadorProductosAdmin({
    apiUrl,
    tipo,
    gridId,
    prevId,
    nextId,
    pageTextId,
    buscarInputId,
    buscarBtnId,
    limpiarBtnId,
    sinCoincidenciasId,
    vacioId,
    contenidoId
}) {
    const grid = document.getElementById(gridId);
    const anterior = document.getElementById(prevId);
    const siguiente = document.getElementById(nextId);
    const pageText = document.getElementById(pageTextId);
    const inputBuscar = document.getElementById(buscarInputId);
    const btnBuscar = document.getElementById(buscarBtnId);
    const btnLimpiar = document.getElementById(limpiarBtnId);
    const sinCoincidencias = document.getElementById(sinCoincidenciasId);
    const vacio = document.getElementById(vacioId);
    const contenido = document.getElementById(contenidoId);

    let page = 1;
    let limit = CANT_POR_PAGINA;
    let terminoBusqueda = "";
    let totalPages = 0;
    let totalInventario = 0;
    let loading = false;

    function reiniciarPagina() {
        page = 1;
    }

    function actualizarBotones() {
        const numPagina = totalPages > 0 ? page : 0;
        pageText.textContent = "Página " + numPagina;
        anterior.classList.toggle("disabled", page <= 1);
        siguiente.classList.toggle("disabled", totalPages === 0 || page >= totalPages);
    }

    function renderizarCard(prod) {
        const id = prod.id;
        const nombre = escaparHtml(prod.nombre);
        const precio = escaparHtml(prod.precio);
        const descripcion = escaparHtml(prod.descripcion ?? "");
        const inactivo = prod.estado === false;
        const imagenHtml = prod.imagen
            ? `<img src="${escaparHtml(prod.imagen)}" alt="${nombre}" class="miniaturaProductoAdmin" />`
            : `<div class="sinImagenProductoAdmin">Sin imagen</div>`;

        const accionesHtml = inactivo
            ? `<form action="/admin/productos/activar/${tipo}/${id}" method="post" class="activarForm">
                    <button type="submit" class="productoBtn activarBtn">Activar</button>
               </form>`
            : `<button type="button" class="productoBtn editarBtn"
                    onclick="window.location.href='/admin/edicion/${tipo}/${id}'">Editar</button>
               <form action="/admin/productos/baja/${tipo}/${id}" method="post" class="bajaForm">
                    <button type="submit" class="productoBtn eliminarBtn">Eliminar</button>
               </form>`;

        const card = document.createElement("div");
        card.className = "productoCard" + (inactivo ? " inactivo" : "");
        card.innerHTML = `
            ${inactivo ? '<span class="estadoInactivo">INACTIVO</span>' : ""}
            ${imagenHtml}
            <div class="productoInfo">
                <strong>${nombre}</strong>
                <p>Precio: ${precio}</p>
                ${descripcion ? `<p>Descripción: ${descripcion}</p>` : ""}
            </div>
            <div class="productoActions">${accionesHtml}</div>
        `;
        return card;
    }

    async function cargarProductos() {
        if (loading) return;
        loading = true;

        const q = (terminoBusqueda || "").trim();
        btnLimpiar.hidden = !q;

        const safeLimit = Math.max(1, Math.min(LIMITE_MAXIMO_API, Number(limit) || CANT_POR_PAGINA));
        const url = `${apiUrl}?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(
            safeLimit
        )}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

        try {
            const data = await consultarApiAdmin(url);
            const items = Array.isArray(data?.items) ? data.items : [];

            totalPages = Number(data?.paginado?.totalPages) || 0;
            page = Number(data?.paginado?.page) || 1;
            totalInventario = Number(data?.totalInventario) || 0;

            vacio.hidden = totalInventario > 0;
            contenido.hidden = totalInventario === 0;

            if (totalInventario === 0) {
                return;
            }

            grid.replaceChildren();
            sinCoincidencias.hidden = true;

            if (!items.length) {
                if (q) {
                    sinCoincidencias.hidden = false;
                }
                actualizarBotones();
                return;
            }

            items.forEach((prod) => {
                grid.appendChild(renderizarCard(prod));
            });

            actualizarBotones();
        } catch (e) {
            if (e.message !== "no autorizado") {
                grid.replaceChildren();
                const p = document.createElement("p");
                p.className = "error";
                p.textContent = e.message;
                grid.appendChild(p);
            }
        } finally {
            loading = false;
        }
    }

    function paginaSiguiente() {
        if (totalPages > 0 && page < totalPages) {
            page += 1;
            cargarProductos();
        }
    }

    function paginaAnterior() {
        if (page > 1) {
            page -= 1;
            cargarProductos();
        }
    }

    function aplicarBusqueda() {
        terminoBusqueda = inputBuscar.value;
        reiniciarPagina();
        cargarProductos();
    }

    function limpiarBusqueda() {
        terminoBusqueda = "";
        inputBuscar.value = "";
        reiniciarPagina();
        cargarProductos();
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

function crearPaginadorVentasAdmin({
    apiUrl,
    tbodyId,
    prevId,
    nextId,
    pageTextId,
    buscarInputId,
    buscarFechaInputId,
    buscarBtnId,
    limpiarBtnId,
    sinCoincidenciasId,
    vacioId,
    contenidoId,
    tablaWrapId
}) {
    const tbody = document.getElementById(tbodyId);
    const anterior = document.getElementById(prevId);
    const siguiente = document.getElementById(nextId);
    const pageText = document.getElementById(pageTextId);
    const inputBuscar = document.getElementById(buscarInputId);
    const inputFecha = document.getElementById(buscarFechaInputId);
    const btnBuscar = document.getElementById(buscarBtnId);
    const btnLimpiar = document.getElementById(limpiarBtnId);
    const sinCoincidencias = document.getElementById(sinCoincidenciasId);
    const vacio = document.getElementById(vacioId);
    const contenido = document.getElementById(contenidoId);
    const tablaWrap = document.getElementById(tablaWrapId);

    let page = 1;
    let limit = CANT_POR_PAGINA;
    let terminoBusqueda = "";
    let terminoFecha = "";
    let totalPages = 0;
    let totalInventario = 0;
    let loading = false;

    function reiniciarPagina() {
        page = 1;
    }

    function actualizarBotones() {
        const numPagina = totalPages > 0 ? page : 0;
        pageText.textContent = "Página " + numPagina;
        anterior.classList.toggle("disabled", page <= 1);
        siguiente.classList.toggle("disabled", totalPages === 0 || page >= totalPages);
    }

    function hayBusquedaActiva() {
        return Boolean((terminoBusqueda || "").trim() || (terminoFecha || "").trim());
    }

    function convertirAFilas(ventas) {
        const filas = [];

        ventas.forEach((venta) => {
            const productos = Array.isArray(venta.productos) ? venta.productos : [];

            if (!productos.length) {
                filas.push({
                    id: "-",
                    id_venta: venta.id,
                    id_accesorio: "-",
                    id_alimento: "-",
                    descripcion: venta.descripcion ?? "-",
                    cantidad: venta.cantidad ?? "-",
                    precioUnitarioFormateado: "-",
                    precioFormateado: venta.precioFormateado ?? "-",
                    fechaFormateada: venta.fechaFormateada ?? "-"
                });
                return;
            }

            productos.forEach((producto) => {
                filas.push({
                    id: producto.id,
                    id_venta: venta.id,
                    id_accesorio: producto.id_accesorio ?? "-",
                    id_alimento: producto.id_alimento ?? "-",
                    descripcion: producto.descripcion,
                    cantidad: producto.cantidad,
                    precioUnitarioFormateado: producto.precioUnitarioFormateado,
                    precioFormateado: producto.precioFormateado,
                    fechaFormateada: venta.fechaFormateada
                });
            });
        });

        return filas;
    }

    async function cargarVentas() {
        if (loading) return;
        loading = true;

        const q = (terminoBusqueda || "").trim();
        const fecha = (terminoFecha || "").trim();
        btnLimpiar.hidden = !hayBusquedaActiva();

        const safeLimit = Math.max(1, Math.min(LIMITE_MAXIMO_API, Number(limit) || CANT_POR_PAGINA));
        const params = new URLSearchParams({
            page: String(page),
            limit: String(safeLimit)
        });
        if (q) params.set("q", q);
        if (fecha) params.set("fecha", fecha);

        try {
            const data = await consultarApiAdmin(`${apiUrl}?${params.toString()}`);
            const items = Array.isArray(data?.items) ? data.items : [];

            totalPages = Number(data?.paginado?.totalPages) || 0;
            page = Number(data?.paginado?.page) || 1;
            totalInventario = Number(data?.totalInventario) || 0;

            vacio.hidden = totalInventario > 0;
            contenido.hidden = totalInventario === 0;

            if (totalInventario === 0) {
                return;
            }

            tbody.replaceChildren();
            sinCoincidencias.hidden = true;
            tablaWrap.hidden = false;

            if (!items.length) {
                if (hayBusquedaActiva()) {
                    sinCoincidencias.hidden = false;
                }
                tablaWrap.hidden = true;
                actualizarBotones();
                return;
            }

            const filas = convertirAFilas(items);

            if (!filas.length) {
                if (hayBusquedaActiva()) {
                    sinCoincidencias.hidden = false;
                }
                tablaWrap.hidden = true;
                actualizarBotones();
                return;
            }

            filas.forEach((vp) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${escaparHtml(vp.id)}</td>
                    <td>${escaparHtml(vp.id_venta)}</td>
                    <td>${escaparHtml(vp.id_accesorio ?? "-")}</td>
                    <td>${escaparHtml(vp.id_alimento ?? "-")}</td>
                    <td>${escaparHtml(vp.descripcion)}</td>
                    <td>${escaparHtml(vp.cantidad)}</td>
                    <td>${escaparHtml(vp.precioUnitarioFormateado)}</td>
                    <td>${escaparHtml(vp.precioFormateado)}</td>
                    <td>${escaparHtml(vp.fechaFormateada)}</td>
                `;
                tbody.appendChild(tr);
            });

            actualizarBotones();
        } catch (e) {
            if (e.message !== "no autorizado") {
                tbody.replaceChildren();
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="9" class="error">${escaparHtml(e.message)}</td>`;
                tbody.appendChild(tr);
            }
        } finally {
            loading = false;
        }
    }

    function paginaSiguiente() {
        if (totalPages > 0 && page < totalPages) {
            page += 1;
            cargarVentas();
        }
    }

    function paginaAnterior() {
        if (page > 1) {
            page -= 1;
            cargarVentas();
        }
    }

    function aplicarBusqueda() {
        terminoBusqueda = inputBuscar.value;
        terminoFecha = inputFecha.value;
        reiniciarPagina();
        cargarVentas();
    }

    function limpiarBusqueda() {
        terminoBusqueda = "";
        terminoFecha = "";
        inputBuscar.value = "";
        inputFecha.value = "";
        reiniciarPagina();
        cargarVentas();
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
    btnLimpiar.addEventListener("click", limpiarBusqueda);

    return { cargarVentas };
}

window.__paginadoAdmin = {
    iniciarProductos: crearPaginadorProductosAdmin,
    iniciarVentas: crearPaginadorVentasAdmin
};
