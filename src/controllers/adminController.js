import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";
import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";

const adminController = {
    loginPost: async (req, res) => {
        const { usuario, password } = req.body;

        try {
            const admin = await Administrador.findOne({ where: { usuario } });

            if (!admin) {
                return res.render("login", { error: "Usuario y/o Password incorrecto(s)." });
            }

            const coincide = await bcrypt.compare(password, admin.password);

            if (!coincide) {
                return res.render("login", { error: "Usuario y/o Password incorrecto(s)." });
            }

            // Obtener listados para backoffice
            const accesorios = await Accesorio.findAll({
                attributes: ["nombre", "precio", "descripcion"],
                order: [["nombre", "ASC"]]
            });

            const alimentos = await Alimento.findAll({
                attributes: ["nombre", "precio", "descripcion"],
                order: [["nombre", "ASC"]]
            });

            return res.render("indexBackoffice", { accesorios, alimentos });
        } catch (err) {
            console.error("Error en login:", err);
            res.render("login", { error: "No se pudo conectar a la base de datos." });
        }
    }
};

export default adminController;
