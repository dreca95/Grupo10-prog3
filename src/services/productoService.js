import { Op } from "sequelize";
import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";

function modeloPorTipo(tipo) {
    return tipo === "accesorio" ? Accesorio : Alimento;
}

export { modeloPorTipo };

export async function obtenerProductoPorId(tipo, id) {
    const model = modeloPorTipo(tipo);
    return model.findByPk(id);
}

export async function productoYaExiste(tipo, nombre, excluirId = null) {
    const model = modeloPorTipo(tipo);
    const where = {
        nombre: { [Op.iLike]: String(nombre).trim() }
    };

    if (excluirId != null) {
        where.id = { [Op.ne]: excluirId };
    }

    const producto = await model.findOne({ where });
    return Boolean(producto);
}
