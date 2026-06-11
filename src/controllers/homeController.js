import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";

const CANT_PRODUCTOS = 10;

function obtenerPaginado(page) {
  const limit = CANT_PRODUCTOS;
  const offset = (page - 1) * limit;
  return { limit, offset };
}

const homeController = {
  productos: (req, res) => res.render("productos"),

  alimentos: async (req, res) => {
    const page = Number(req.query.page) || 1;
    const { limit, offset } = obtenerPaginado(page);

    const { rows: productos, count } = await Alimento.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return res.render("alimentos", { productos, page, totalPages });
  },

  accesorios: async (req, res) => {
    const page = Number(req.query.page) || 1;
    const { limit, offset } = obtenerPaginado(page);

    const { rows: productos, count } = await Accesorio.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return res.render("accesorios", { productos, page, totalPages });
  },
};

export default homeController;
