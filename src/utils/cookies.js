const NOMBRE_COOKIE = "flash";

const OPCIONES_COOKIE = {
    maxAge: 5000,
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
