import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";
import { leerCookie, redirigirBackoffice } from "../utils/cookies.js";
import { generarJWT, guardarToken, borrarToken } from "../utils/jwt.js";
import { activarProducto,crearProducto,darBajaProducto,editarProducto,obtenerProductoBackoffice} from "../services/backofficeService.js";

const adminController = {

    loginGet: (req, res) => {
        return res.render("admin/login");
    },

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

            const token = await generarJWT({
                id: admin.id,
                usuario: admin.usuario
            });
            guardarToken(res, token);
            return res.redirect("/admin/backoffice");
        } catch (err) {
            console.error("Error en login:", err);
            res.render("admin/login", { error: "No se pudo conectar a la base de dato" });
        }
    },


    logoutPost: (req, res) => {
        borrarToken(res);
        return res.redirect("/admin/login");
    },


    altaGet: (req, res) => {
        return res.render("admin/alta");
    },


    backofficeGet: (req, res) => {
        const cookie = leerCookie(req, res);
        return res.render("admin/indexBackoffice", { cookie });
    },

    ventasGet: (req, res) => {
        return res.render("admin/ventas");
    },


    altaPost: async (req, res) => {
        const { tipo, nombre, descripcion, precioNum } = req.body;

        try {
            await crearProducto({
                tipo,
                nombre,
                descripcion,
                precio: precioNum,
                file: req.file
            });

            return redirigirBackoffice(res, "exito", `Producto ${nombre} agregado exitosamente`);
        } catch (err) {
            console.error("Error en alta:", err);
            return res.render("admin/alta", { error: "No se pudo guardar " });
        }
    },


    edicionGet: async (req, res) => {
        const { tipo, id } = req.params;

        try {
            const producto = await obtenerProductoBackoffice(tipo, id);

            if (!producto) {
                return redirigirBackoffice(res, "error", "No se pudo editar");
            }

            return res.render("admin/edicion", { producto, tipo });
        } catch (err) {
            console.error("Error en edición:", err);
            return redirigirBackoffice(res, "error", "No se pudo editar.");
        }
    },


    edicionPost: async (req, res) => {
        const { tipo: tipoOriginal, id } = req.params;
        const { tipo: tipoNuevo, nombre, descripcion, precioNum } = req.body;
        const producto = { id, nombre, precio: precioNum, descripcion, imagen: null };

        try {
            const editado = await editarProducto({
                tipoOriginal,
                id,
                tipoNuevo,
                nombre,
                descripcion,
                precio: precioNum,
                file: req.file
            });

            if (!editado) {
                return redirigirBackoffice(res, "error", "No se pudo editar el producto.");
            }

            return redirigirBackoffice(res, "exito", `Producto "${nombre}" editado con éxito`);
        } catch (err) {
            console.error("Error en edición:", err);
            return res.render("admin/edicion", {
                producto,
                tipo: tipoNuevo,
                error: "No se pudo guardar "
            });
        }
    },


    bajaPost: async (req, res) => {
        const { tipo, id } = req.params;
        const { producto } = req;

        try {
            await darBajaProducto(tipo, id);
            return redirigirBackoffice(res, "exito", `Producto "${producto.nombre}" eliminado con éxito`);
        } catch (err) {
            return redirigirBackoffice(res, "error", "No se pudo dar de baja el producto");
        }
    },

    activarPost: async (req, res) => {
        const { tipo, id } = req.params;
        const { producto } = req;

        try {
            await activarProducto(tipo, id);
            return redirigirBackoffice(res, "exito", `Producto "${producto.nombre}" activado con éxito`);
        } catch (err) {
            return redirigirBackoffice(res, "error", "No se pudo activar el producto");
        }
    }
};

export default adminController;
