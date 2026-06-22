import express from "express";
import adminController from "../controllers/adminController.js";
import {validarLogin, validarProducto, validarProductoDuplicado, validarProductoParaActivar, validarProductoParaBaja, validarTipoIdParams, verificarAdmin, redirigirSiAdminLogueado} from "../middlewares/adminMiddlewares.js";
import { subirImagenProducto } from "../middlewares/imagenesMiddleware.js";

const router = express.Router();

router.get("/admin/login", redirigirSiAdminLogueado, adminController.loginGet);
router.post("/admin/login", validarLogin, adminController.loginPost);

const adminProtegido = express.Router();
adminProtegido.use(verificarAdmin);

adminProtegido.get("/backoffice", adminController.backofficeGet);
adminProtegido.post("/logout", adminController.logoutPost);
adminProtegido.get("/ventas", adminController.ventasGet);
adminProtegido.get("/alta", adminController.altaGet);
adminProtegido.post("/productos/alta", subirImagenProducto, validarProducto, validarProductoDuplicado, adminController.altaPost);
adminProtegido.get("/edicion/:tipo/:id", validarTipoIdParams, adminController.edicionGet);
adminProtegido.post("/productos/edicion/:tipo/:id", validarTipoIdParams, subirImagenProducto, validarProducto, validarProductoDuplicado, adminController.edicionPost);
adminProtegido.post("/productos/baja/:tipo/:id", validarTipoIdParams, validarProductoParaBaja, adminController.bajaPost);
adminProtegido.post("/productos/activar/:tipo/:id", validarTipoIdParams, validarProductoParaActivar, adminController.activarPost);

router.use("/admin", adminProtegido);

export default router;
