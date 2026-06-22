import Venta from "../models/ventas.js";
import { formatearPrecio } from "../utils/precio.js";
import { paginarLista } from "../utils/paginacionAdmin.js";

export async function obtenerDatosVentas(query = {}) {
    const rows = await Venta.findAll({
        order: [["id", "DESC"]],
        raw: true
    });

    const todas = rows.map((v) => ({
        ...v,
        precioFormateado: formatearPrecio(v.precio)
    }));

    const pag = paginarLista(todas, query, "Ven");

    return {
        ventas: pag.items,
        pagVen: { ...pag, totalInventario: todas.length }
    };
}
