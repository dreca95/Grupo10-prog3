const CANT_POR_PAGINA = 10;

export function paginarLista(todos, numPagina = 1) {
    const total = todos.length;

    if (total === 0) {
        return {
            items: [],
            total: 0,
            haySiguiente: false,
            hayAnterior: false,
            numPagina: 0
        };
    }

    const totalPaginas = Math.ceil(total / CANT_POR_PAGINA);
    const pagina = Math.min(Math.max(1, Number(numPagina) || 1), totalPaginas);
    const primera = (pagina - 1) * CANT_POR_PAGINA;
    const ultima = Math.min(primera + CANT_POR_PAGINA, total);

    return {
        items: todos.slice(primera, ultima),
        total,
        haySiguiente: pagina < totalPaginas,
        hayAnterior: pagina > 1,
        numPagina: pagina
    };
}
