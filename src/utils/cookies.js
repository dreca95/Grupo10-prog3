const NOMBRE_COOKIE = "flash";
const NOMBRE_PAGINAS = "pagAdmin";

const OPCIONES_COOKIE = {
    maxAge: 5000,
    httpOnly: true
};

const OPCIONES_PAGINAS = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true
};

function setCookie(res, tipo, mensaje) {
    res.cookie(NOMBRE_COOKIE, JSON.stringify({ tipo, mensaje }), OPCIONES_COOKIE);
}

export function leerCookie(req, res) {
    const raw = req.cookies[NOMBRE_COOKIE];
    if (!raw) return null;

    res.clearCookie(NOMBRE_COOKIE);

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function redirigirBackoffice(res, tipo, mensaje) {
    setCookie(res, tipo, mensaje);
    return res.redirect(303, "/admin/backoffice");
}

export function redirigirBackofficeError(res, mensaje) {
    return redirigirBackoffice(res, "error", mensaje);
}

export function leerPaginas(req) {
    try {
        return JSON.parse(req.cookies[NOMBRE_PAGINAS] || "{}");
    } catch {
        return {};
    }
}

export function guardarPaginas(res, paginas) {
    res.cookie(NOMBRE_PAGINAS, JSON.stringify(paginas), OPCIONES_PAGINAS);
}

export function borrarPaginas(res) {
    res.clearCookie(NOMBRE_PAGINAS);
}

export function numPagina(paginas, prefijo) {
    return Math.max(1, Number(paginas[prefijo]) || 1);
}

export function moverPagina(paginas, prefijo, dir) {
    const actual = numPagina(paginas, prefijo);
    paginas[prefijo] = dir === "sig" ? actual + 1 : Math.max(1, actual - 1);
}

export function sincronizarBusqueda(paginas, campo, valor, prefijoPagina) {
    const clave = "_" + campo;
    const actual = String(valor ?? "");
    if (actual !== String(paginas[clave] ?? "")) {
        paginas[prefijoPagina] = 1;
        paginas[clave] = actual;
    }
}
