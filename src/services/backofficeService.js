import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";
import { paginarLista } from "../utils/paginacionAdmin.js";

function filtrarPorNombre(items, termino) {
    const t = String(termino || "").trim().toLowerCase();
    if (!t) return items;
    return items.filter((p) => (p.nombre || "").toLowerCase().includes(t));
}

export async function obtenerDatosBackoffice(query = {}, paginas = {}) {
    const buscarAcc = String(query.buscarAcc ?? "").trim();
    const buscarAli = String(query.buscarAli ?? "").trim();

    const todosAcc = await Accesorio.findAll({
        attributes: ["id", "nombre", "precio", "descripcion", "estado", "imagen"],
        order: [["nombre", "ASC"]]
    });

    const todosAli = await Alimento.findAll({
        attributes: ["id", "nombre", "precio", "descripcion", "estado", "imagen"],
        order: [["nombre", "ASC"]]
    });

    const filtradosAcc = filtrarPorNombre(todosAcc, buscarAcc);
    const filtradosAli = filtrarPorNombre(todosAli, buscarAli);

    const acc = paginarLista(filtradosAcc, paginas.Acc);
    const ali = paginarLista(filtradosAli, paginas.Ali);

    return {
        accesorios: acc.items,
        alimentos: ali.items,
        pagAcc: { ...acc, totalInventario: todosAcc.length },
        pagAli: { ...ali, totalInventario: todosAli.length },
        buscarAcc,
        buscarAli
    };
}
