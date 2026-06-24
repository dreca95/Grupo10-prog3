import Administrador from "../models/administradores.js";
import { validarTokenTicket } from "../utils/ticketTokens.js";

const MAX_LONGITUD_CLIENTE = 100;
const MAX_LONGITUD_EMAIL = 100;
const MAX_CANTIDAD_ITEM = 100;
const TIPOS_ITEM = new Set(["accesorio", "alimento"]);

// parsea y valida el id de venta q viene en la url
export function validarVentaIdParam(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "id inválido" });
    }

    req.ventaId = id;
    next();
}

//chequea el token del ticket en query string (para ver/descargar venta)
export function validarTokenVentaQuery(req, res, next) {
    const id = req.ventaId ?? Number(req.params.id);
    const token = String(req.query.token ?? "").trim();

    if (!token || !validarTokenTicket(id, token)) {
        return res.status(403).json({ error: "token inválido o expirado" });
    }

    next();
}

//valida body de POST venta: cliente + array de items con cantidades
export function validarCrearVenta(req, res, next) {
    const { cliente, items } = req.body || {};

    if (!cliente || typeof cliente !== "string" || !cliente.trim()) {
        return res.status(400).json({ error: "cliente requerido" });
    }

    const clienteTrim = cliente.trim();
    if (clienteTrim.length > MAX_LONGITUD_CLIENTE) {
        return res.status(400).json({
            error: `El nombre no puede superar ${MAX_LONGITUD_CLIENTE} caracteres`
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items requerido" });
    }

    for (const it of items) {
        if (!it || typeof it !== "object") {
            return res.status(400).json({ error: "item inválido" });
        }

        const id = Number(it.id);
        const tipo = String(it.tipo ?? "").trim().toLowerCase();
        const cantidad = Number(it.cantidad);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "id de producto inválido" });
        }
        if (!TIPOS_ITEM.has(tipo)) {
            return res.status(400).json({ error: "tipo de producto inválido" });
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > MAX_CANTIDAD_ITEM) {
            return res.status(400).json({
                error: `cantidad inválida (máximo ${MAX_CANTIDAD_ITEM} por producto)`
            });
        }
    }

    req.ventaCliente = clienteTrim;
    req.ventaItems = items;
    next();
}

// valida email y password al crear admin por api
export function validarCrearAdministrador(req, res, next) {
    const { email, password } = req.body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ error: "email requerido" });
    }
    if (!password || typeof password !== "string" || !password.trim()) {
        return res.status(400).json({ error: "password requerido" });
    }

    const emailTrim = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
        return res.status(400).json({ error: "email inválido" });
    }
    if (emailTrim.length > MAX_LONGITUD_EMAIL) {
        return res.status(400).json({ error: "email demasiado largo" });
    }

    req.body.email = emailTrim;
    req.body.password = password;
    next();
}

// no pasa si el mail del admin ya esta registrado en la db
export async function validarAdministradorDuplicado(req, res, next) {
    try {
        const existe = await Administrador.findOne({ where: { email: req.body.email } });
        if (existe) {
            return res.status(409).json({ error: "el email ya existe" });
        }
        next();
    } catch (e) {
        console.error("validarAdministradorDuplicado", e);
        return res.status(500).json({ error: "error interno del servidor" });
    }
}
