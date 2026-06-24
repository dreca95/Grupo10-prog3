import { Op } from "sequelize";
import VentaProductos from "../models/ventaProductos.js";
import Venta from "../models/ventas.js";
import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import { formatearPrecio } from "../utils/precio.js";
import { paginarLista } from "../utils/paginacionAdmin.js";

function nombreProducto(vp, mapAcc, mapAli) {
    if (vp.id_accesorio) {
        return mapAcc[vp.id_accesorio] ?? "-";
    }
    if (vp.id_alimento) {
        return mapAli[vp.id_alimento] ?? "-";
    }
    return "-";
}

function formatearFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires"
    });
}

function filtrarVentas(items, termino) {
    const t = String(termino || "").trim();
    if (!t) return items;

    const tl = t.toLowerCase();
    return items.filter(
        (vp) =>
            String(vp.id).includes(t) ||
            (vp.descripcion || "").toLowerCase().includes(tl)
    );
}

function fecha(valor) {
    return new Date(valor).toLocaleDateString("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires"
    });
}

function filtrarPorFecha(items, fechaBusqueda) {
    const f = String(fechaBusqueda || "").trim();
    if (!f) return items;

    return items.filter((vp) => vp.fecha && fecha(vp.fecha) === f);
}

export async function obtenerDatosVentas(query = {}, paginas = {}) {
    const buscarVen = String(query.buscarVen ?? "").trim();
    const buscarFechaVen = String(query.buscarFechaVen ?? "").trim();

    const rows = await VentaProductos.findAll({
        order: [["id", "DESC"]],
        raw: true
    });

    const idsAcc = [...new Set(rows.filter((r) => r.id_accesorio).map((r) => r.id_accesorio))];
    const idsAli = [...new Set(rows.filter((r) => r.id_alimento).map((r) => r.id_alimento))];

    const idsVenta = [...new Set(rows.map((r) => r.id_venta))];

    const [accesorios, alimentos, ventas] = await Promise.all([
        idsAcc.length
            ? Accesorio.findAll({ where: { id: { [Op.in]: idsAcc } }, attributes: ["id", "nombre"], raw: true })
            : [],
        idsAli.length
            ? Alimento.findAll({ where: { id: { [Op.in]: idsAli } }, attributes: ["id", "nombre"], raw: true })
            : [],
        idsVenta.length
            ? Venta.findAll({ where: { id: { [Op.in]: idsVenta } }, attributes: ["id", "fecha"], raw: true })
            : []
    ]);

    const mapAcc = Object.fromEntries(accesorios.map((a) => [a.id, a.nombre]));
    const mapAli = Object.fromEntries(alimentos.map((a) => [a.id, a.nombre]));
    const mapFecha = Object.fromEntries(ventas.map((v) => [v.id, v.fecha]));

    const todas = rows.map((vp) => ({
        ...vp,
        descripcion: nombreProducto(vp, mapAcc, mapAli),
        fecha: mapFecha[vp.id_venta] ?? null,
        fechaFormateada: formatearFecha(mapFecha[vp.id_venta]),
        precioUnitarioFormateado: formatearPrecio(vp.precio_unitario),
        precioFormateado: formatearPrecio(vp.precio_total)
    }));

    let filtradas = filtrarVentas(todas, buscarVen);
    filtradas = filtrarPorFecha(filtradas, buscarFechaVen);
    const pag = paginarLista(filtradas, paginas.Ven);

    return {
        ventaProductos: pag.items,
        pagVen: { ...pag, totalInventario: todas.length },
        buscarVen,
        buscarFechaVen
    };
}
