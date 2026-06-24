import { Op } from "sequelize";
import sequelize from "../config/database.js";
import VentaProductos from "../models/ventaProductos.js";
import Venta from "../models/ventas.js";
import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import { formatearPrecio } from "../utils/precio.js";
import { normalizarBusqueda } from "../utils/paginacion.js";

Venta.hasMany(VentaProductos, { foreignKey: "id_venta", as: "detalle" });
VentaProductos.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });

VentaProductos.belongsTo(Accesorio, { foreignKey: "id_accesorio", as: "accesorio" });
VentaProductos.belongsTo(Alimento, { foreignKey: "id_alimento", as: "alimento" });

Accesorio.hasMany(VentaProductos, { foreignKey: "id_accesorio", as: "ventaProductos" });
Alimento.hasMany(VentaProductos, { foreignKey: "id_alimento", as: "ventaProductos" });

Venta.belongsToMany(Accesorio, {
    through: VentaProductos,
    foreignKey: "id_venta",
    otherKey: "id_accesorio",
    as: "accesorios"
});

Accesorio.belongsToMany(Venta, {
    through: VentaProductos,
    foreignKey: "id_accesorio",
    otherKey: "id_venta",
    as: "ventas"
});

Venta.belongsToMany(Alimento, {
    through: VentaProductos,
    foreignKey: "id_venta",
    otherKey: "id_alimento",
    as: "alimentos"
});

Alimento.belongsToMany(Venta, {
    through: VentaProductos,
    foreignKey: "id_alimento",
    otherKey: "id_venta",
    as: "ventas"
});

const includeDetalle = {
    model: VentaProductos,
    as: "detalle",
    include: [
        {
            model: Accesorio,
            as: "accesorio",
            attributes: ["id", "nombre"],
            required: false
        },
        {
            model: Alimento,
            as: "alimento",
            attributes: ["id", "nombre"],
            required: false
        }
    ]
};

const includeVentaProductos = [
    {
        model: Venta,
        as: "venta",
        attributes: ["id", "fecha"],
        required: true
    },
    {
        model: Accesorio,
        as: "accesorio",
        attributes: ["id", "nombre"],
        required: false
    },
    {
        model: Alimento,
        as: "alimento",
        attributes: ["id", "nombre"],
        required: false
    }
];

// saca el nombre del accesorio o alimento del detalle
function nombreProducto(vp) {
    if (vp.accesorio) {
        return vp.accesorio.nombre ?? "-";
    }
    if (vp.alimento) {
        return vp.alimento.nombre ?? "-";
    }
    return "-";
}

// fecha a string es-AR timezone BA
function formatearFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires"
    });
}

// mapea una linea de detalle con precios formateados
function mapearProductoDetalle(vp) {
    return {
        id: vp.id,
        id_accesorio: vp.id_accesorio,
        id_alimento: vp.id_alimento,
        cantidad: vp.cantidad,
        precio_unitario: vp.precio_unitario,
        precio_total: vp.precio_total,
        descripcion: nombreProducto(vp),
        precioUnitarioFormateado: formatearPrecio(vp.precio_unitario),
        precioFormateado: formatearPrecio(vp.precio_total)
    };
}

// venta completa con productos del detalle ya mapeados
function mapearVentaConProductos(row) {
    const venta = row.get({ plain: true });

    return {
        id: venta.id,
        cliente: venta.cliente,
        descripcion: venta.descripcion,
        precio: venta.precio,
        precioFormateado: formatearPrecio(venta.precio),
        cantidad: venta.cantidad,
        fecha: venta.fecha,
        fechaFormateada: formatearFecha(venta.fecha),
        productos: (venta.detalle ?? []).map(mapearProductoDetalle)
    };
}

//fila de venta_productos con datos de venta y precios
function mapearVentaProducto(row) {
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
}

//filtro de busqueda x id linea o nombre producto
function armarFiltroVentas(q) {
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

// rango del dia si hay fecha
function armarFiltroFechaVenta(fechaBusqueda) {
    const fecha = normalizarBusqueda(fechaBusqueda);
    if (!fecha) return undefined;

    const inicio = new Date(`${fecha}T00:00:00-03:00`);
    const fin = new Date(`${fecha}T23:59:59.999-03:00`);

    return {
        fecha: { [Op.between]: [inicio, fin] }
    };
}

// clona includes y mete filtro fecha en venta si aplica
function armarIncludeVenta(fechaBusqueda) {
    const filtroFecha = armarFiltroFechaVenta(fechaBusqueda);

    return includeVentaProductos.map((include) => {
        if (include.as !== "venta" || !filtroFecha) {
            return include;
        }

        return {
            ...include,
            where: filtroFecha
        };
    });
}

// listado de lineas venta_productos con include venta
export async function listarVentaProductosBackoffice({ page, limit, offset, q, fecha }) {
    const [result, totalInventario] = await Promise.all([
        VentaProductos.findAndCountAll({
            include: armarIncludeVenta(fecha),
            where: armarFiltroVentas(q),
            order: [["id", "DESC"]],
            limit,
            offset,
            distinct: true,
            col: "id"
        }),
        VentaProductos.count()
    ]);

    return {
        items: result.rows.map(mapearVentaProducto),
        total: result.count,
        totalInventario
    };
}

// agrega items al detalle de la venta en la transaction
export async function agregarDetalleVenta(venta, items, transaction) {
    for (const item of items) {
        const through = {
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            precio_total: item.precio * item.cantidad
        };

        if (item.tipo === "accesorio") {
            await venta.addAccesorio(item.id, { through, transaction });
        } else {
            await venta.addAlimento(item.id, { through, transaction });
        }
    }
}

//trae una venta x id con todo el detalle mapeado
export async function obtenerVentaConDetalle(ventaId) {
    const venta = await Venta.findByPk(ventaId, {
        include: [includeDetalle]
    });

    if (!venta) return null;

    return mapearVentaConProductos(venta);
}
