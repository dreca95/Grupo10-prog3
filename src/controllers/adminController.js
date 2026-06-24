import Alimento from "../models/alimentos.js";
import Accesorio from "../models/accesorios.js";
import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";
import { leerCookie, redirigirBackoffice, leerPaginas, guardarPaginas, borrarPaginas, moverPagina, sincronizarBusqueda } from "../utils/cookies.js";
import { generarJWT, guardarToken, borrarToken } from "../utils/jwt.js";
import { precioANumero } from "../utils/precio.js";
import { obtenerDatosBackoffice } from "../services/backofficeService.js";
import { obtenerDatosVentas } from "../services/ventasService.js";
import { copiarImagenProducto, eliminarImagenLocal, guardarImagenLocal } from "../services/imagenProductoService.js";

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
        borrarPaginas(res);
        return res.redirect("/admin/login");
    },


    altaGet: (req, res) => {
        return res.render("admin/alta");
    },


    backofficeGet: async (req, res) => {
        try {
            const paginas = leerPaginas(req);
            sincronizarBusqueda(paginas, "buscarAcc", req.query.buscarAcc, "Acc");
            sincronizarBusqueda(paginas, "buscarAli", req.query.buscarAli, "Ali");
            guardarPaginas(res, paginas);

            const datos = await obtenerDatosBackoffice(req.query, paginas);
            paginas.Acc = datos.pagAcc.numPagina || 1;
            paginas.Ali = datos.pagAli.numPagina || 1;
            guardarPaginas(res, paginas);
            const cookie = leerCookie(req, res);

            return res.render("admin/indexBackoffice", {
                accesorios: datos.accesorios,
                alimentos: datos.alimentos,
                pagAcc: datos.pagAcc,
                pagAli: datos.pagAli,
                buscarAcc: datos.buscarAcc,
                buscarAli: datos.buscarAli,
                cookie
            });
        } catch (err) {
            console.error("Error en backoffice:", err);

            const pagVacio = {
                totalInventario: 0,
                total: 0,
                numPagina: 0,
                hayAnterior: false,
                haySiguiente: false
            };

            return res.render("admin/indexBackoffice", {
                accesorios: [],
                alimentos: [],
                pagAcc: pagVacio,
                pagAli: pagVacio,
                buscarAcc: "",
                buscarAli: "",
                cookie: { tipo: "error", mensaje: "No se pudo cargar el backoffice" }
            });
        }
    },

    backofficePaginaPost: (req, res) => {
        const { pagSeccion, pagDir, buscarAcc, buscarAli } = req.body;

        if ((pagSeccion === "Acc" || pagSeccion === "Ali") && (pagDir === "sig" || pagDir === "ant")) {
            const paginas = leerPaginas(req);
            moverPagina(paginas, pagSeccion, pagDir);
            guardarPaginas(res, paginas);
        }

        const params = new URLSearchParams();
        if (buscarAcc) params.set("buscarAcc", buscarAcc);
        if (buscarAli) params.set("buscarAli", buscarAli);
        const qs = params.toString();
        return res.redirect(303, "/admin/backoffice" + (qs ? "?" + qs : ""));
    },

    ventasGet: async (req, res) => {
        try {
            const paginas = leerPaginas(req);
            sincronizarBusqueda(paginas, "buscarVen", req.query.buscarVen, "Ven");
            sincronizarBusqueda(paginas, "buscarFechaVen", req.query.buscarFechaVen, "Ven");
            guardarPaginas(res, paginas);

            const datos = await obtenerDatosVentas(req.query, paginas);
            paginas.Ven = datos.pagVen.numPagina || 1;
            guardarPaginas(res, paginas);
            return res.render("admin/ventas", {
                ventaProductos: datos.ventaProductos,
                pagVen: datos.pagVen,
                buscarVen: datos.buscarVen,
                buscarFechaVen: datos.buscarFechaVen
            });
        } catch (err) {
            console.error("Error en ventas:", err);
            return redirigirBackoffice(res, "error", "No se pudieron cargar las ventas");
        }
    },

    ventasPaginaPost: (req, res) => {
        const { pagDir, buscarVen, buscarFechaVen } = req.body;

        if (pagDir === "sig" || pagDir === "ant") {
            const paginas = leerPaginas(req);
            moverPagina(paginas, "Ven", pagDir);
            guardarPaginas(res, paginas);
        }

        const params = new URLSearchParams();
        if (buscarVen) params.set("buscarVen", buscarVen);
        if (buscarFechaVen) params.set("buscarFechaVen", buscarFechaVen);
        const qs = params.toString();
        return res.redirect(303, "/admin/ventas" + (qs ? "?" + qs : ""));
    },


    altaPost: async (req, res) => {
        const { tipo, nombre, descripcion, precioNum } = req.body;

        try {
            const model = tipo === "accesorio" ? Accesorio : Alimento;
            const creado = await model.create({
                nombre,
                precio: precioNum,
                descripcion,
                estado: true
            });

            if (req.file) {
                const imagen = guardarImagenLocal(tipo, creado.id, req.file);
                await creado.update({ imagen });
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
            const model = tipo === "accesorio" ? Accesorio : Alimento;
            const producto = await model.findByPk(id);

            //en caso que se modifique a mano el id y sea uno q no existe agrego !producto
            if (!producto || producto.estado === false) {
                return redirigirBackoffice(res, "error", "No se pudo editar");
            }

            const data = producto.toJSON();
            data.precio = precioANumero(data.precio);

            return res.render("admin/edicion", { producto: data, tipo });
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
            const modelOriginal = tipoOriginal === "accesorio" ? Accesorio : Alimento;
            const existente = await modelOriginal.findByPk(id);

            //en caso que se modifique a mano el id y sea uno que no existe se agrego !existente
            if (!existente || existente.estado === false) {
                return redirigirBackoffice(res, "error", "No se pudo editar el producto.");
            }

            producto.imagen = existente.imagen;

            if (tipoOriginal !== tipoNuevo) {
                const modelNuevo = tipoNuevo === "accesorio" ? Accesorio : Alimento;
                const nuevo = await modelNuevo.create({
                    nombre,
                    precio: precioNum,
                    descripcion,
                    estado: existente.estado
                });

                let imagen = null;

                if (req.file) {
                    imagen = guardarImagenLocal(tipoNuevo, nuevo.id, req.file);
                } else if (existente.imagen) {
                    imagen = copiarImagenProducto(tipoOriginal, id, tipoNuevo, nuevo.id);
                }

                if (imagen) {
                    await nuevo.update({ imagen });
                }

                producto.imagen = imagen;

                eliminarImagenLocal(tipoOriginal, id);
                await modelOriginal.destroy({ where: { id } });
            } else {
                let imagen = existente.imagen;

                if (req.file) {
                    imagen = guardarImagenLocal(tipoNuevo, id, req.file);
                }

                await modelOriginal.update(
                    { nombre, precio: precioNum, descripcion, imagen },
                    { where: { id } }
                );

                producto.imagen = imagen;
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
        const { id } = req.params;
        const { producto, productoModel } = req;

        try {
            await productoModel.update({ estado: false }, { where: { id } });
            return redirigirBackoffice(res, "exito", `Producto "${producto.nombre}" eliminado con éxito`);
        } catch (err) {
            return redirigirBackoffice(res, "error", "No se pudo dar de baja el producto");
        }
    },

    activarPost: async (req, res) => {
        const { id } = req.params;
        const { producto, productoModel } = req;

        try {
            await productoModel.update({ estado: true }, { where: { id } });
            return redirigirBackoffice(res, "exito", `Producto "${producto.nombre}" activado con éxito`);
        } catch (err) {
            return redirigirBackoffice(res, "error", "No se pudo activar el producto");
        }
    }
};

export default adminController;
