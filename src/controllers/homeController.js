import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";
import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";

const CANT_PRODUCTOS = 10;

function obtenerPaginado(page) {
  const limit = CANT_PRODUCTOS;
  const offset = (page - 1) * limit;
  return { limit, offset };
}

const homeController = {
  login: (req, res) => res.render("login"),

  loginPost: async (req, res) => {
    const { usuario, password } = req.body;

    try {
      const admin = await Administrador.findOne({ where: { usuario } });
      //REVISAR

      if (!admin) {
        return res.render("login", { error: "Usuario y/o Password incorrecto(s)." });
      }

      const coincide = await bcrypt.compare(password, admin.password);

      if (!coincide) {
        return res.render("login", { error: "Usuario y/o Password incorrecto(s)." });
      }

      res.render("indexBackoffice");
    } catch (err) {
      console.error("Error en login:", err);
      res.render("login", { error: "No se pudo conectar a la base de datos." });  
    }
  },

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
