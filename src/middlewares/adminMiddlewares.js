import { redirigirBackofficeError } from "../utils/cookies.js";
import { borrarToken, obtenerToken, verificarJWT } from "../utils/jwt.js";
import { baseDeDatosDisponible } from "../services/authService.js";
import { obtenerProductoPorId, productoYaExiste, modeloPorTipo } from "../services/productoService.js";
import { esValido, parsePrecio, renderErrorProducto } from "../utils/adminProducto.js";

// chequea si hay token valido y la db responde, sino limpia cookie
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

// helper chico para responder errores json en rutas api admin
function responderErrorApi(res, status, error) {
    return res.status(status).json({ error });
}

//        valida q tipo e id de la url sean correctos (api)
export function validarTipoIdParamsApi(req, res, next) {
    const { tipo, id } = req.params;
    const idNum = Number(id);

    if (!esValido(tipo) || !Number.isInteger(idNum) || idNum <= 0) {
        return responderErrorApi(res, 400, "Parámetros inválidos.");
    }

    next();
}

// valida campos del body al crear/editar producto respuesta json
export function validarProductoApi(req, res, next) {
    const { tipo, nombre, precio, descripcion } = req.body;
    const nombreTrim = String(nombre ?? "").trim();
    const descripcionTrim = String(descripcion ?? "").trim();

    if (!esValido(tipo)) {
        return responderErrorApi(res, 400, "Tipo de producto inválido.");
    }

    if (!nombreTrim) {
        return responderErrorApi(res, 400, "El nombre debe ser ingresado.");
    }

    if (!descripcionTrim) {
        return responderErrorApi(res, 400, "La descripción debe ser ingresada.");
    }

    const precioNum = parsePrecio(precio);
    if (precioNum === null) {
        return responderErrorApi(res, 400, "El precio debe ser mayor a $0.");
    }

    req.body.nombre = nombreTrim;
    req.body.descripcion = descripcionTrim;
    req.body.precioNum = precioNum;
    next();
}

// impide si ya existe otro producto con el mismo nombre api
export async function validarProductoDuplicadoApi(req, res, next) {
    try {
        const { tipo, nombre } = req.body;
        const tipoOriginal = req.params.tipo;
        const id = req.params.id;

        const excluirId = id != null && tipoOriginal === tipo ? Number(id) : null;

        if (await productoYaExiste(tipo, nombre, excluirId)) {
            return responderErrorApi(res, 409, "El producto ya está guardado.");
        }

        next();
    } catch (err) {
        return responderErrorApi(res, 500, "No se pudo validar el producto.");
    }
}

//busca el producto y confirma q este activo antes de dar de baja api
export async function validarProductoParaBajaApi(req, res, next) {
    try {
        const { tipo, id } = req.params;
        const producto = await obtenerProductoPorId(tipo, id);

        if (!producto || producto.estado === false) {
            return responderErrorApi(res, 404, "No se pudo dar de baja el producto.");
        }

        req.producto = producto;
        req.productoModel = modeloPorTipo(tipo);
        next();
    } catch (err) {
        console.error("Error al validar baja de producto:", err);
        return responderErrorApi(res, 500, "No se pudo dar de baja el producto.");
    }
}

// busca producto inactivo y pasa si se puede reactivar -api
export async function validarProductoParaActivarApi(req, res, next) {
    try {
        const { tipo, id } = req.params;
        const producto = await obtenerProductoPorId(tipo, id);

        if (!producto || producto.estado !== false) {
            return responderErrorApi(res, 404, "No se pudo activar el producto.");
        }

        req.producto = producto;
        req.productoModel = modeloPorTipo(tipo);
        next();
    } catch (err) {
        console.error("Error al validar activación de producto:", err);
        return responderErrorApi(res, 500, "No se pudo activar el producto.");
    }
}

// middleware de rutas html: si no hay sesion manda al login
export async function verificarAdmin(req, res, next) {
    const payload = await sesionAdminValida(req, res);

    if (!payload) {
        return res.redirect("/admin/login");
    }

    req.admin = payload;
    next();
}

// lo mismo pero para endpoints json, responde 401
export async function verificarAdminApi(req, res, next) {
    const payload = await sesionAdminValida(req, res);

    if (!payload) {
        return res.status(401).json({ error: "no autorizado" });
    }

    req.admin = payload;
    next();
}

//si ya esta logueado no deja ver el login otra vez
export async function redirigirSiAdminLogueado(req, res, next) {
    const payload = await sesionAdminValida(req, res);

    if (payload) {
        return res.redirect("/admin/backoffice");
    }

    next();
}

//valida email y password del form de login antes del controller
export function validarLogin(req, res, next) {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "").trim();

    if (!email || !password) {
        return res.render("admin/login", {
            error: "Email y contraseña deben ser ingresados"
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.render("admin/login", {
            error: "El email ingresado no es válido"
        });
    }

    req.body.email = email;
    req.body.password = password;
    next();
}

//valida campos del producto en formularios html del backoffice
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

// evita nombres duplicados al alta/edicion desde el backoffice html
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

// valida tipo e id en params de rutas html (redirige si estan mal)
export function validarTipoIdParams(req, res, next) {
    const { tipo, id } = req.params;
    const idNum = Number(id);

    if (!esValido(tipo) || !Number.isInteger(idNum) || idNum <= 0) {
        return redirigirBackofficeError(res, "Parámetros inválidos.");
    }

    next();
}

// carga producto activo en req antes de dar de baja (html)
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

// carga producto inactivo en req antes de activarlo (html
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
