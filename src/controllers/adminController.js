import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";
import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";

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
                return res.render("login", { error: "Usuario y/o Password incorrecto(s)." });
            }

            const coincide = await bcrypt.compare(password, admin.password);

            if (!coincide) {
                return res.render("login", { error: "Usuario y/o Password incorrecto(s)." });
            }

            const { accesorios, alimentos } = await obtenerDatosBackoffice();
            return res.render("indexBackoffice", { accesorios, alimentos });
        } catch (err) {
            console.error("Error en login:", err);
            res.render("login", { error: "No se pudo conectar a la base de datos." });
        }
    }
    ,
    altaGet: (req, res) => {
        return res.render("alta");
    },

    backofficeGet: async (req, res) => {
        const { accesorios, alimentos } = await obtenerDatosBackoffice();
        return res.render("indexBackoffice", {
            accesorios,
            alimentos,
            mensaje: req.query.mensaje
        });
    },

    altaPost: async (req, res) => {
        const { tipo, nombre, precio, descripcion } = req.body;
        const precioNum = Number(precio);

        if (precio === "" || Number.isNaN(precioNum) || precioNum <= 0) {
            return res.render("alta", { error: "El precio debe ser mayor a $0." });
        }

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

            const mensaje = encodeURIComponent(`Producto ${nombre} agregado con éxito`);
            return res.redirect(303, `/backoffice?mensaje=${mensaje}`);
        } catch (err) {
            console.error("Error en alta:", err);
            return res.render("alta", { error: "No se pudo guardar el producto." });
        }
    },

    edicionGet: async (req, res) => {
        const { tipo, id } = req.params;

        if (tipo !== "accesorio" && tipo !== "alimento") {
            return res.redirect("/backoffice");
        }

        try {
            const Model = tipo === "accesorio" ? Accesorio : Alimento;
            const producto = await Model.findByPk(id);

            if (!producto || producto.estado === false) {
                return res.redirect("/backoffice");
            }

            const data = producto.toJSON();
            data.precio = precioParaInput(data.precio);

            return res.render("edicion", { producto: data, tipo });
        } catch (err) {
            console.error("Error en edición:", err);
            return res.redirect("/backoffice");
        }
    },

    edicionPost: async (req, res) => {
        const { tipo: tipoOriginal, id } = req.params;
        const { tipo: tipoNuevo, nombre, precio, descripcion } = req.body;
        const precioNum = Number(precio);
        const producto = { id, nombre, precio: precioNum, descripcion };

        if (tipoNuevo !== "accesorio" && tipoNuevo !== "alimento") {
            return res.render("edicion", {
                producto,
                tipo: tipoOriginal,
                error: "Tipo de producto inválido."
            });
        }

        if (precio === "" || Number.isNaN(precioNum) || precioNum <= 0) {
            return res.render("edicion", {
                producto,
                tipo: tipoNuevo,
                error: "El precio debe ser mayor a $0."
            });
        }

        try {
            const ModelOriginal = tipoOriginal === "accesorio" ? Accesorio : Alimento;
            const existente = await ModelOriginal.findByPk(id);

            if (!existente || existente.estado === false) {
                return res.redirect("/backoffice");
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

            const mensaje = encodeURIComponent(`Producto "${nombre}" editado con éxito`);
            return res.redirect(303, `/backoffice?mensaje=${mensaje}`);
        } catch (err) {
            console.error("Error en edición:", err);
            return res.render("edicion", {
                producto,
                tipo: tipoNuevo,
                error: "No se pudo guardar el producto."
            });
        }
    },

    bajaPost: async (req, res) => {
        const { tipo, id } = req.params;

        if (tipo !== "accesorio" && tipo !== "alimento") {
            return res.redirect("/backoffice");
        }

        try {
            const Model = tipo === "accesorio" ? Accesorio : Alimento;
            const producto = await Model.findByPk(id);

            if (!producto || producto.estado === false) {
                return res.redirect("/backoffice");
            }

            await Model.update({ estado: false }, { where: { id } });

            const mensaje = encodeURIComponent(`Producto "${producto.nombre}" eliminado con éxito`);
            return res.redirect(303, `/backoffice?mensaje=${mensaje}`);
        } catch (err) {
            console.error("Error en baja:", err);
            return res.redirect("/backoffice");
        }
    },

    activarPost: async (req, res) => {
        const { tipo, id } = req.params;

        if (tipo !== "accesorio" && tipo !== "alimento") {
            return res.redirect("/backoffice");
        }

        try {
            const Model = tipo === "accesorio" ? Accesorio : Alimento;
            const producto = await Model.findByPk(id);

            if (!producto || producto.estado !== false) {
                return res.redirect("/backoffice");
            }

            await Model.update({ estado: true }, { where: { id } });

            const mensaje = encodeURIComponent(`Producto "${producto.nombre}" activado con éxito`);
            return res.redirect(303, `/backoffice?mensaje=${mensaje}`);
        } catch (err) {
            console.error("Error en activación:", err);
            return res.redirect("/backoffice");
        }
    }
};

export default adminController;
