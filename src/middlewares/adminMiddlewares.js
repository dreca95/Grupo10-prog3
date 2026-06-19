import { redirigirBackofficeError } from "../utils/cookies.js";

const TIPOS = ["accesorio", "alimento"];

function esValido(tipo) {
    return TIPOS.includes(tipo);
}

function parsePrecio(precio) {
    const precioNum = Number(precio);
    if (precio === "" || Number.isNaN(precioNum) || precioNum <= 0) {
        return null;
    }
    return precioNum;
}

export function validarLogin(req, res, next) {
    const usuario = String(req.body.usuario ?? "").trim();
    const password = String(req.body.password ?? "").trim();

    if (!usuario || !password) {
        return res.render("admin/login", {
            error: "Usuario y contraseña deben ser ingresados"
        });
    }

    req.body.usuario = usuario;
    req.body.password = password;
    next();
}

function renderErrorProducto(req, res, error) {
    const { tipo, nombre, precio, descripcion } = req.body;
    const id = req.params.id;

    if (id) {
        return res.render("admin/edicion", {
            producto: {
                id,
                nombre: String(nombre ?? "").trim(),
                precio: Number(precio) || 0,
                descripcion: String(descripcion ?? "").trim()
            },
            tipo,
            error
        });
    }

    return res.render("admin/alta", { error });
}

export function validarProducto(req, res, next) {
    const { tipo, nombre, precio, descripcion } = req.body;
    const nombreTrim = String(nombre ?? "").trim();
    const descripcionTrim = String(descripcion ?? "").trim();

    if (!esValido(tipo)) {
        return renderErrorProducto(req, res, "Tipo de producto inválido.");
    }

    if (!nombreTrim) {
        return renderErrorProducto(req, res, "El nombre debe ser ingresado.");
    }

    if (!descripcionTrim) {
        return renderErrorProducto(req, res, "La descripción debe ser ingresada.");
    }

    const precioNum = parsePrecio(precio);
    if (precioNum === null) {
        return renderErrorProducto(req, res, "El precio debe ser mayor a $0.");
    }

    req.body.nombre = nombreTrim;
    req.body.descripcion = descripcionTrim;
    req.body.precioNum = precioNum;
    next();
}

export function validarTipoIdParams(req, res, next) {
    const { tipo, id } = req.params;
    const idNum = Number(id);

    if (!esValido(tipo) || !Number.isInteger(idNum) || idNum <= 0) {
        return redirigirBackofficeError(res, "Parámetros inválidos.");
    }

    next();
}
