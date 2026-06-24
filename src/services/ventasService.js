import { Op } from "sequelize";
import sequelize from "../config/database.js";
import "../models/associations.js";
import VentaProductos from "../models/ventaProductos.js";
import Venta from "../models/ventas.js";
import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import { formatearPrecio } from "../utils/precio.js";
import { normalizarBusqueda } from "../utils/paginacion.js";

function nombreProducto(vp) {
    if (vp.accesorio) {
        return vp.accesorio.nombre ?? "-";
    }
    if (vp.alimento) {
        return vp.alimento.nombre ?? "-";
    }
    return "-";
}

function formatearFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires"
    });
}

function construirFiltroVentas(q) {
    const termino = normalizarBusqueda(q);
    if (!termino) return {};

    return {
        [Op.or]: [
            sequelize.where(
                sequelize.cast(sequelize.col("VENTA_PRODUCTOS.id"), "varchar"),
                { [Op.iLike]: `%${termino}%` }
            ),
            { "$accesorio.nombre$": { [Op.iLike]: `%${termino}%` } },
            { "$alimento.nombre$": { [Op.iLike]: `%${termino}%` } }
        ]
    };
}

function construirIncludeVenta(fechaBusqueda) {
    const fecha = normalizarBusqueda(fechaBusqueda);
    const ventaInclude = {
        model: Venta,
        as: "venta",
        attributes: ["id", "fecha"],
        required: true
    };

    if (fecha) {
        ventaInclude.where = sequelize.where(
            sequelize.fn(
                "TO_CHAR",
                sequelize.fn("timezone", "America/Argentina/Buenos_Aires", sequelize.col("venta.fecha")),
                "YYYY-MM-DD"
            ),
            fecha
        );
    }

    return [
        ventaInclude,
        { model: Accesorio, as: "accesorio", attributes: ["id", "nombre"], required: false },
        { model: Alimento, as: "alimento", attributes: ["id", "nombre"], required: false }
    ];
}

export async function listarVentaProductosBackoffice({ page, limit, offset, q, fecha }) {
    const [result, totalInventario] = await Promise.all([
        VentaProductos.findAndCountAll({
            include: construirIncludeVenta(fecha),
            where: construirFiltroVentas(q),
            order: [["id", "DESC"]],
            limit,
            offset,
            distinct: true,
            col: "id"
        }),
        VentaProductos.count()
    ]);

    const items = result.rows.map((row) => {
        const vp = row.get({ plain: true });
        return {
            id: vp.id,
            id_venta: vp.id_venta,
            id_accesorio: vp.id_accesorio,
            id_alimento: vp.id_alimento,
            cantidad: vp.cantidad,
            precio_unitario: vp.precio_unitario,
            precio_total: vp.precio_total,
            descripcion: nombreProducto(vp),
            fecha: vp.venta?.fecha ?? null,
            fechaFormateada: formatearFecha(vp.venta?.fecha),
            precioUnitarioFormateado: formatearPrecio(vp.precio_unitario),
            precioFormateado: formatearPrecio(vp.precio_total)
        };
    });

    return {
        items,
        total: result.count,
        totalInventario
    };
}
