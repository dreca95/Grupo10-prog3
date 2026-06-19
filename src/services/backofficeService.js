import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";

export async function obtenerDatosBackoffice() {
    const accesorios = await Accesorio.findAll({
        attributes: ["id", "nombre", "precio", "descripcion", "estado"],
        order: [["nombre", "ASC"]]
    });

    const alimentos = await Alimento.findAll({
        attributes: ["id", "nombre", "precio", "descripcion", "estado"],
        order: [["nombre", "ASC"]]
    });

    return { accesorios, alimentos };
}
