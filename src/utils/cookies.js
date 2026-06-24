// setea flash cookie con tipo y mensaje
function setCookie(res, tipo, mensaje) {
    res.cookie("flash", JSON.stringify({ tipo, mensaje }), {
        maxAge: 5000,
        httpOnly: true,
    });
}

// lee el flash y lo borra dsp de parsearlo
export function leerCookie(req, res) {
    const raw = req.cookies.flash;
    if (!raw) return null;

    res.clearCookie("flash", { httpOnly: true });

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

// flash redirect al backoffice con mensaje
export function redirigirBackoffice(res, tipo, mensaje) {
    setCookie(res, tipo, mensaje);
    return res.redirect(303, "/admin/backoffice");
}

// lo mismo pero e
export function redirigirBackofficeError(res, mensaje) {
    return redirigirBackoffice(res, "error", mensaje);
}
