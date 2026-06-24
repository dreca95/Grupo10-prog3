function setCookie(res, tipo, mensaje) {
    res.cookie("flash", JSON.stringify({ tipo, mensaje }), {
        maxAge: 5000,
        httpOnly: true,
        secure: true
    });
}

export function leerCookie(req, res) {
    const raw = req.cookies.flash;
    if (!raw) return null;

    res.clearCookie("flash", { httpOnly: true, secure: true });

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
