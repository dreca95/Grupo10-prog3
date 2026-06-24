import Administrador from "../models/administradores.js";
import { validarTokenTicket } from "../utils/ticketTokens.js";

const MAX_LONGITUD_CLIENTE = 100;
const MAX_LONGITUD_USUARIO = 50;

export function validarVentaIdParam(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "id inválido" });
    }

    req.ventaId = id;
    next();
}

export function validarTokenVentaQuery(req, res, next) {
    const id = req.ventaId ?? Number(req.params.id);
    const token = String(req.query.token ?? "").trim();

    if (!token || !validarTokenTicket(id, token)) {
        return res.status(403).json({ error: "token inválido o expirado" });
    }

    next();
}

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

    req.ventaCliente = clienteTrim;
    req.ventaItems = items;
    next();
}

export function validarCrearAdministrador(req, res, next) {
    const { usuario, password } = req.body || {};

    if (!usuario || typeof usuario !== "string" || !usuario.trim()) {
        return res.status(400).json({ error: "usuario requerido" });
    }
    if (!password || typeof password !== "string" || !password.trim()) {
        return res.status(400).json({ error: "password requerido" });
    }

    const usuarioTrim = usuario.trim();
    if (usuarioTrim.length > MAX_LONGITUD_USUARIO) {
        return res.status(400).json({ error: "usuario demasiado largo" });
    }

    req.body.usuario = usuarioTrim;
    req.body.password = password;
    next();
}

export async function validarAdministradorDuplicado(req, res, next) {
    try {
        const existe = await Administrador.findOne({ where: { usuario: req.body.usuario } });
        if (existe) {
            return res.status(409).json({ error: "el usuario ya existe" });
        }
        next();
    } catch (e) {
        console.error("validarAdministradorDuplicado", e);
        return res.status(500).json({ error: "error interno del servidor" });
    }
}
