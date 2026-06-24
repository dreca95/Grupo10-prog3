import { Op } from "sequelize";
import { normalizarBusqueda } from "../utils/paginacion.js";

export async function listarProductosBackoffice({ Model, page, limit, offset, q }) {
    const busqueda = normalizarBusqueda(q);
    const where = {};

    if (busqueda) {
        where.nombre = { [Op.iLike]: `%${busqueda}%` };
    }

    const [result, totalInventario] = await Promise.all([
        Model.findAndCountAll({
            attributes: ["id", "nombre", "precio", "descripcion", "estado", "imagen"],
            where,
            order: [["nombre", "ASC"]],
            limit,
            offset,
            raw: true
        }),
        Model.count()
    ]);

    return {
        items: result.rows,
        total: result.count,
        totalInventario
    };
}
