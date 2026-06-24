import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import { listarProductosBackoffice } from "../services/backofficeService.js";
import { listarVentasBackoffice, listarVentaProductosBackoffice, obtenerVentaConDetalle } from "../services/ventasService.js";
import {armarPaginado,LIMITE_POR_DEFECTO_ADMIN,normalizarBusqueda,parsearConsultaPaginacion} from "../utils/paginacion.js";

async function paginarProductosAdmin({ Model, req, res, errorTag }) {
    const { page, limit, offset } = parsearConsultaPaginacion(req.query, LIMITE_POR_DEFECTO_ADMIN);
    const q = normalizarBusqueda(req.query.q);

    try {
        const { items, total, totalInventario } = await listarProductosBackoffice({
            Model,
            page,
            limit,
            offset,
            q
        });

        return res.json({
            ok: true,
            items,
            paginado: armarPaginado({ page, limit, total }),
            q,
            totalInventario
        });
    } catch (e) {
        return res.status(500).json({
            error: `error al obtener ${errorTag}`,
            details: e.message
        });
    }
}

const obtenerAccesorios = (req, res) =>
    paginarProductosAdmin({
        Model: Accesorio,
        req,
        res,
        errorTag: "accesorios admin"
    });

const obtenerAlimentos = (req, res) =>
    paginarProductosAdmin({
        Model: Alimento,
        req,
        res,
        errorTag: "alimentos admin"
    });

const obtenerVentaProductos = async (req, res) => {    const { page, limit, offset } = parsearConsultaPaginacion(req.query, LIMITE_POR_DEFECTO_ADMIN);
    const q = normalizarBusqueda(req.query.q ?? req.query.buscarVen);
    const fecha = normalizarBusqueda(req.query.fecha ?? req.query.buscarFechaVen);

    try {
        const { items, total, totalInventario } = await listarVentaProductosBackoffice({
            page,
            limit,
            offset,
            q,
            fecha
        });

        return res.json({
            ok: true,
            items,
            paginado: armarPaginado({ page, limit, total }),
            q,
            fecha,
            totalInventario
        });
    } catch (e) {
        return res.status(500).json({
            error: "error al obtener venta productos admin",
            details: e.message
        });
    }
};

const obtenerVentas = async (req, res) => {
    const { page, limit, offset } = parsearConsultaPaginacion(req.query, LIMITE_POR_DEFECTO_ADMIN);
    const q = normalizarBusqueda(req.query.q ?? req.query.buscarVen);
    const fecha = normalizarBusqueda(req.query.fecha ?? req.query.buscarFechaVen);

    try {
        const { items, total, totalInventario } = await listarVentasBackoffice({
            page,
            limit,
            offset,
            q,
            fecha
        });

        return res.json({
            ok: true,
            items,
            paginado: armarPaginado({ page, limit, total }),
            q,
            fecha,
            totalInventario
        });
    } catch (e) {
        return res.status(500).json({
            error: "error al obtener ventas admin",
            details: e.message
        });
    }
};

const obtenerVentaPorId = async (req, res) => {
    const ventaId = Number(req.params.id);

    if (!Number.isInteger(ventaId) || ventaId <= 0) {
        return res.status(400).json({ error: "id de venta inválido" });
    }

    try {
        const venta = await obtenerVentaConDetalle(ventaId);

        if (!venta) {
            return res.status(404).json({ error: "venta no encontrada" });
        }

        return res.json({ ok: true, venta });
    } catch (e) {
        return res.status(500).json({
            error: "error al obtener venta admin",
            details: e.message
        });
    }
};

export default {
    obtenerAccesorios,
    obtenerAlimentos,
    obtenerVentaProductos,
    obtenerVentas,
    obtenerVentaPorId
};
