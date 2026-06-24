import { redirigirBackofficeError } from "../utils/cookies.js";
import { borrarToken, obtenerToken, verificarJWT } from "../utils/jwt.js";
import { baseDeDatosDisponible } from "../services/authService.js";
import { obtenerProductoPorId, productoYaExiste, modeloPorTipo } from "../services/productoService.js";
import { esValido, parsePrecio, renderErrorProducto } from "../utils/adminProducto.js";

async function sesionAdminValida(req, res) {
    const token = obtenerToken(req);

    if (!token) {
        return null;
    }

    const payload = await verificarJWT(token);
    if (!payload) {
        borrarToken(res);
        return null;
    }

    if (!(await baseDeDatosDisponible())) {
        borrarToken(res);
        return null;
    }

    return payload;
}

export async function verificarAdmin(req, res, next) {
    const payload = await sesionAdminValida(req, res);

    if (!payload) {
        return res.redirect("/admin/login");
    }

    req.admin = payload;
    next();
}

export async function verificarAdminApi(req, res, next) {
    const payload = await sesionAdminValida(req, res);

    if (!payload) {
        return res.status(401).json({ error: "no autorizado" });
    }

    req.admin = payload;
    next();
}

export async function redirigirSiAdminLogueado(req, res, next) {
    const payload = await sesionAdminValida(req, res);

    if (payload) {
        return res.redirect("/admin/backoffice");
    }

    next();
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

export async function validarProductoDuplicado(req, res, next) {
    try {
        const { tipo, nombre } = req.body;
        const tipoOriginal = req.params.tipo;
        const id = req.params.id;

        const excluirId = id != null && tipoOriginal === tipo ? Number(id) : null;

        if (await productoYaExiste(tipo, nombre, excluirId)) {
            return renderErrorProducto(req, res, "El producto ya está guardado.");
        }

        next();
    } catch (err) {
        return renderErrorProducto(req, res, "No se pudo validar el producto.");
    }
}

export function validarTipoIdParams(req, res, next) {
    const { tipo, id } = req.params;
    const idNum = Number(id);

    if (!esValido(tipo) || !Number.isInteger(idNum) || idNum <= 0) {
        return redirigirBackofficeError(res, "Parámetros inválidos.");
    }

    next();
}

export async function validarProductoParaBaja(req, res, next) {
    try {
        const { tipo, id } = req.params;
        const producto = await obtenerProductoPorId(tipo, id);

        if (!producto || producto.estado === false) {
            return redirigirBackofficeError(res, "No se pudo dar de baja ");
        }

        req.producto = producto;
        req.productoModel = modeloPorTipo(tipo);
        next();
    } catch (err) {
        console.error("Error al validar baja de producto:", err);
        return redirigirBackofficeError(res, "No se pudo dar de baja el producto");
    }
}

export async function validarProductoParaActivar(req, res, next) {
    try {
        const { tipo, id } = req.params;
        const producto = await obtenerProductoPorId(tipo, id);

        if (!producto || producto.estado !== false) {
            return redirigirBackofficeError(res, "No se pudo activar.");
        }

        req.producto = producto;
        req.productoModel = modeloPorTipo(tipo);
        next();
    } catch (err) {
        console.error("Error al validar activación de producto:", err);
        return redirigirBackofficeError(res, "No se pudo activar el producto");
    }
}
