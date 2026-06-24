export const LIMITE_POR_DEFECTO_CATALOGO = 12;
export const LIMITE_POR_DEFECTO_ADMIN = 10;
export const LIMITE_MAXIMO = 50;

export function parsearEnteroPositivo(valor, valorPorDefecto) {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : valorPorDefecto;
}

export function acotar(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

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

export function normalizarBusqueda(valor) {
    const q = String(valor ?? "").trim();
    return q.length ? q : "";
}

export function parsearConsultaPaginacion(consulta, limitePorDefecto = LIMITE_POR_DEFECTO_CATALOGO) {
    const page = parsearEnteroPositivo(consulta.page, 1);
    const limiteCrudo = parsearEnteroPositivo(consulta.limit, limitePorDefecto);
    const limit = acotar(limiteCrudo, 1, LIMITE_MAXIMO);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}
