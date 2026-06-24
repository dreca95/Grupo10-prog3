import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import {listarProductosBackoffice,activarProducto,crearProducto,darBajaProducto,editarProducto,obtenerProductoBackoffice} from "../services/backofficeService.js";
import { listarVentaProductosBackoffice } from "../services/ventasService.js";
import {armarPaginado,LIMITE_POR_DEFECTO_ADMIN,normalizarBusqueda,parsearConsultaPaginacion} from "../utils/paginacion.js";

//pagina productos del backofficeactivos e inactivos con busqueda opcional
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

//lista accesorios para el panel admin via json
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

//trae lineas de venta-producto paginadas, filtra x cliente o fecha
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

// crea producto desde la api del admin
const crearProductoApi = async (req, res) => {
    const { tipo, nombre, descripcion, precioNum } = req.body;

    try {
        const producto = await crearProducto({
            tipo,
            nombre,
            descripcion,
            precio: precioNum,
            file: req.file
        });

        return res.status(201).json({ ok: true, producto });
    } catch (e) {
        return res.status(500).json({
            error: "error al crear producto",
            details: e.message
        });
    }
};

//  trae un producto puntual por tipo e id para editar en el front
const obtenerProductoApi = async (req, res) => {
    const { tipo, id } = req.params;

    try {
        const producto = await obtenerProductoBackoffice(tipo, id);

        if (!producto) {
            return res.status(404).json({ error: "producto no encontrado" });
        }

        return res.json({ ok: true, producto });
    } catch (e) {
        return res.status(500).json({
            error: "error al obtener producto",
            details: e.message
        });
    }
};

//actualiza producto existente desde la api admin
const editarProductoApi = async (req, res) => {
    const { tipo: tipoOriginal, id } = req.params;
    const { tipo: tipoNuevo, nombre, descripcion, precioNum } = req.body;

    try {
        const producto = await editarProducto({
            tipoOriginal,
            id,
            tipoNuevo,
            nombre,
            descripcion,
            precio: precioNum,
            file: req.file
        });

        if (!producto) {
            return res.status(404).json({ error: "No se pudo editar el producto." });
        }

        return res.json({ ok: true, producto });
    } catch (e) {
        return res.status(500).json({
            error: "error al editar producto",
            details: e.message
        });
    }
};

//baja logica de producto via api
const darBajaProductoApi = async (req, res) => {
    const { tipo, id } = req.params;

    try {
        const producto = await darBajaProducto(tipo, id);

        if (!producto) {
            return res.status(404).json({ error: "No se pudo dar de baja el producto." });
        }

        return res.json({ ok: true, producto });
    } catch (e) {
        return res.status(500).json({
            error: "error al dar de baja producto",
            details: e.message
        });
    }
};

//     reactiva producto dado de baja via api
const activarProductoApi = async (req, res) => {
    const { tipo, id } = req.params;

    try {
        const producto = await activarProducto(tipo, id);

        if (!producto) {
            return res.status(404).json({ error: "No se pudo activar el producto." });
        }

        return res.json({ ok: true, producto });
    } catch (e) {
        return res.status(500).json({
            error: "error al activar producto",
            details: e.message
        });
    }
};

export default {
    obtenerAccesorios,
    obtenerAlimentos,
    obtenerVentaProductos,
    crearProductoApi,
    obtenerProductoApi,
    editarProductoApi,
    darBajaProductoApi,
    activarProductoApi
};
