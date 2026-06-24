const CANT_POR_PAGINA = 10;

export function paginarLista(todos, query, prefijo) {
    const total = todos.length;
    const keyPrimera = "primera" + prefijo;
    const keyUltima = "ultima" + prefijo;

    let primera = Math.max(0, Number(query[keyPrimera]) || 0);
    let ultima = Number(query[keyUltima]) || CANT_POR_PAGINA;

    if (total === 0) {
        return {
            items: [],
            primera: 0,
            ultima: 0,
            total: 0,
            haySiguiente: false,
            hayAnterior: false,
            numPagina: 0,
            sigPrimera: 0,
            sigUltima: 0,
            antPrimera: 0,
            antUltima: 0
        };
    }

    if (primera >= total) {
        primera = Math.max(0, total - CANT_POR_PAGINA);
    }
    if (ultima > total) {
        ultima = total;
    }
    if (ultima <= primera) {
        ultima = Math.min(primera + CANT_POR_PAGINA, total);
    }

    const items = todos.slice(primera, ultima);
    const haySiguiente = ultima < total;
    const hayAnterior = primera > 0;
    const numPagina = Math.floor(primera / CANT_POR_PAGINA) + 1;

    let sigPrimera = primera;
    let sigUltima = ultima;
    if (haySiguiente) {
        sigPrimera = primera + CANT_POR_PAGINA;
        sigUltima = ultima + CANT_POR_PAGINA;
        if (sigUltima > total) {
            sigUltima = total;
        }
    }

    let antPrimera = primera;
    let antUltima = ultima;
    if (hayAnterior) {
        antPrimera = primera - CANT_POR_PAGINA;
        antUltima = ultima - CANT_POR_PAGINA;
        if (antPrimera < 0) {
            antPrimera = 0;
        }
        if (antUltima <= antPrimera) {
            antUltima = Math.min(antPrimera + CANT_POR_PAGINA, total);
        }
    }

    return {
        items,
        primera,
        ultima,
        total,
        haySiguiente,
        hayAnterior,
        numPagina,
        sigPrimera,
        sigUltima,
        antPrimera,
        antUltima
    };
}
