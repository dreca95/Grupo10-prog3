import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";

const CANT_PRODUCTOS = 10;

function obtenerPaginado(page) {
  const limit = CANT_PRODUCTOS;
  const offset = (page - 1) * limit;
  return { limit, offset };
}

const homeController = {
  login: (req, res) => res.render("admin/login"),

  productos: (req, res) => res.render("client/productos"),

  alimentos: async (req, res) => {
    const page = Number(req.query.page) || 1;
    const { limit, offset } = obtenerPaginado(page);

    const { rows: productos } = await Alimento.findAndCountAll({
      where: { estado: true },
      limit,
      offset,
      order: [["nombre", "ASC"]],
    });

    return res.render("client/alimentos", { productos, page });
  },

  accesorios: async (req, res) => {
    const page = Number(req.query.page) || 1;
    const { limit, offset } = obtenerPaginado(page);

    const { rows: productos } = await Accesorio.findAndCountAll({
      where: { estado: true },
      limit,
      offset,
      order: [["nombre", "ASC"]],
    });

    return res.render("client/accesorios", { productos, page });
  },
};

export default homeController;
