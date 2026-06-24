import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import { listarProductosBackoffice } from "../services/backofficeService.js";
import { listarVentaProductosBackoffice } from "../services/ventasService.js";
import {
    construirPaginado,
    LIMITE_POR_DEFECTO_ADMIN,
    normalizarBusqueda,
    parsearConsultaPaginacion
} from "../utils/paginacion.js";

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
            paginado: construirPaginado({ page, limit, total }),
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

const obtenerVentaProductos = async (req, res) => {
    const { page, limit, offset } = parsearConsultaPaginacion(req.query, LIMITE_POR_DEFECTO_ADMIN);
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
            paginado: construirPaginado({ page, limit, total }),
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

export default {
    obtenerAccesorios,
    obtenerAlimentos,
    obtenerVentaProductos
};
