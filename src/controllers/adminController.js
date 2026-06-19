import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";
import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";
import { leerCookie, redirigirBackoffice } from "../utils/cookies.js";

function precioParaInput(precio) {
    const num = Number(String(precio).replace(/[^0-9.-]/g, ""));
    return Number.isNaN(num) ? 0 : num;
}


async function obtenerDatosBackoffice() {
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

const adminController = {
 
    loginPost: async (req, res) => {
        const { usuario, password } = req.body;

        try {
            const admin = await Administrador.findOne({ where: { usuario } });

            if (!admin) {
                return res.render("admin/login", { error: "Usuario y/o Password incorrecto(s)." });
            }

            const coincide = await bcrypt.compare(password, admin.password);

            if (!coincide) {
                return res.render("admin/login", { error: "Usuario y/o Password incorrecto(s)." });
            }

            const { accesorios, alimentos } = await obtenerDatosBackoffice();
            return res.render("admin/indexBackoffice", { accesorios, alimentos });
        } catch (err) {
            console.error("Error en login:", err);
            res.render("admin/login", { error: "No se pudo conectar a la base de dato" });
        }
    },


    altaGet: (req, res) => {
        return res.render("admin/alta");
    },


    backofficeGet: async (req, res) => {
        const { accesorios, alimentos } = await obtenerDatosBackoffice();
        const cookie = leerCookie(req, res);
        return res.render("admin/indexBackoffice", {
            accesorios,
            alimentos,
            cookie
        });
    },


    altaPost: async (req, res) => {
        const { tipo, nombre, descripcion, precioNum } = req.body;

        try {
            const datos = {
                nombre,
                precio: precioNum,
                descripcion,
                estado: true
            };

            if (tipo === "accesorio") {
                await Accesorio.create(datos);
            } else {
                await Alimento.create(datos);
            }

            return redirigirBackoffice(res, "exito", `Producto ${nombre} agregado exitosamente`);
        } catch (err) {
            console.error("Error en alta:", err);
            return res.render("admin/alta", { error: "No se pudo guardar " });
        }
    },


    edicionGet: async (req, res) => {
        const { tipo, id } = req.params;

        try {
            const Model = tipo === "accesorio" ? Accesorio : Alimento;
            const producto = await Model.findByPk(id);

            //en caso que se modifique a mano el id y sea uno q no existe agrego !producto
            if (!producto || producto.estado === false) {
                return redirigirBackoffice(res, "error", "No se pudo editar");
            }

            const data = producto.toJSON();
            data.precio = precioParaInput(data.precio);

            return res.render("admin/edicion", { producto: data, tipo });
        } catch (err) {
            console.error("Error en edición:", err);
            return redirigirBackoffice(res, "error", "No se pudo editar.");
        }
    },

 
    edicionPost: async (req, res) => {
        const { tipo: tipoOriginal, id } = req.params;
        const { tipo: tipoNuevo, nombre, descripcion, precioNum } = req.body;
        const producto = { id, nombre, precio: precioNum, descripcion };

        try {
            const ModelOriginal = tipoOriginal === "accesorio" ? Accesorio : Alimento;
            const existente = await ModelOriginal.findByPk(id);

            //en caso que se modifique a mano el id y sea uno que no existe se agrego !existente
            if (!existente || existente.estado === false) {
                return redirigirBackoffice(res, "error", "No se pudo editar el producto.");
            }

            if (tipoOriginal !== tipoNuevo) {
                const ModelNuevo = tipoNuevo === "accesorio" ? Accesorio : Alimento;

                await ModelNuevo.create({
                    nombre,
                    precio: precioNum,
                    descripcion,
                    estado: existente.estado
                });

                await ModelOriginal.destroy({ where: { id } });
            } else {
                await ModelOriginal.update(
                    { nombre, precio: precioNum, descripcion },
                    { where: { id } }
                );
            }

            return redirigirBackoffice(res, "exito", `Producto "${nombre}" editado con éxito`);
        } catch (err) {
            return res.render("admin/edicion", {
                producto,
                tipo: tipoNuevo,
                error: "No se pudo guardar "
            });
        }
    },

 
    bajaPost: async (req, res) => {
        const { tipo, id } = req.params;


        try {
            const Model = tipo === "accesorio" ? Accesorio : Alimento;
            const producto = await Model.findByPk(id);

            if (!producto || producto.estado === false) {
                return redirigirBackoffice(res, "error", "No se pudo dar de baja ");
            }

            await Model.update({ estado: false }, { where: { id } });

            return redirigirBackoffice(res, "exito", `Producto "${producto.nombre}" eliminado con éxito`);
        } catch (err) {
            return redirigirBackoffice(res, "error", "No se pudo dar de baja el producto");
        }
    },

    activarPost: async (req, res) => {
        const { tipo, id } = req.params;

        try {
            const Model = tipo === "accesorio" ? Accesorio : Alimento;
            const producto = await Model.findByPk(id);

            if (!producto || producto.estado !== false) {
                return redirigirBackoffice(res, "error", "No se pudo activar.");
            }

            await Model.update({ estado: true }, { where: { id } });

            return redirigirBackoffice(res, "exito", `Producto "${producto.nombre}" activado con éxito`);
        } catch (err) {
            return redirigirBackoffice(res, "error", "No se pudo activar el producto");
        }
    }
};

export default adminController;
