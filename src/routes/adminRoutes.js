import express from "express";
import adminController from "../controllers/adminController.js";
import {validarLogin, validarProducto, validarTipoIdParams, verificarAdmin} from "../middlewares/adminMiddlewares.js";

const router = express.Router();

router.get("/admin/login", adminController.loginGet);
router.post("/admin/login", validarLogin, adminController.loginPost);

router.get("/admin/backoffice", verificarAdmin, adminController.backofficeGet);

router.get("/admin/alta", verificarAdmin, adminController.altaGet);
router.post("/admin/productos/alta", verificarAdmin, validarProducto, adminController.altaPost);

router.get("/admin/edicion/:tipo/:id", verificarAdmin, validarTipoIdParams, adminController.edicionGet);
router.post(
    "/admin/productos/edicion/:tipo/:id", verificarAdmin, validarTipoIdParams, validarProducto, adminController.edicionPost);

router.post("/admin/productos/baja/:tipo/:id", verificarAdmin, validarTipoIdParams, adminController.bajaPost);
router.post("/admin/productos/activar/:tipo/:id", verificarAdmin, validarTipoIdParams, adminController.activarPost);

export default router;
