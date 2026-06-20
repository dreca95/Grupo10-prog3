import { Op } from "sequelize";
import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";

function modeloPorTipo(tipo) {
    return tipo === "accesorio" ? Accesorio : Alimento;
}

export { modeloPorTipo };

export async function obtenerProductoPorId(tipo, id) {
    const Model = modeloPorTipo(tipo);
    return Model.findByPk(id);
}

export async function productoYaExiste(tipo, nombre, excluirId = null) {
    const Model = modeloPorTipo(tipo);
    const where = {
        nombre: { [Op.iLike]: String(nombre).trim() }
    };

    if (excluirId != null) {
        where.id = { [Op.ne]: excluirId };
    }

    const producto = await Model.findOne({ where });
    return Boolean(producto);
}
