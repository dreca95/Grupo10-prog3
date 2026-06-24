export const LIMITE_POR_DEFECTO_CATALOGO = 12;
export const LIMITE_POR_DEFECTO_ADMIN = 10;
export const LIMITE_MAXIMO = 50;

// parsea entero positivo o usa el default si ta mal
export function parsearEnteroPositivo(valor, valorPorDefecto) {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : valorPorDefecto;
}

// clampa n entre min y max
export function acotar(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

// arma el objeto paginado con hasPrev/hasNext etc
export function armarPaginado({ page, limit, total }) {
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1 && totalPages > 0,
        hasNext: page < totalPages
    };
}

// trim del query de busqueda, vacio si no hay nada
export function normalizarBusqueda(valor) {
    const q = String(valor ?? "").trim();
    return q.length ? q : "";
}

// saca page/limit/offset de la query string ya acotado
export function parsearConsultaPaginacion(consulta, limitePorDefecto = LIMITE_POR_DEFECTO_CATALOGO) {
    const page = parsearEnteroPositivo(consulta.page, 1);
    const limiteCrudo = parsearEnteroPositivo(consulta.limit, limitePorDefecto);
    const limit = acotar(limiteCrudo, 1, LIMITE_MAXIMO);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}
