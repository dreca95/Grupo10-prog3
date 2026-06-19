import express from "express";
import adminController from "../controllers/adminController.js";
import {
    validarLogin,
    validarProducto,
    validarTipoIdParams
} from "../middlewares/adminMiddlewares.js";

const router = express.Router();

router.get("/admin/login", (req, res) => res.render("admin/login"));
router.post("/admin/login", validarLogin, adminController.loginPost);

router.get("/admin/backoffice", adminController.backofficeGet);

router.get("/admin/alta", adminController.altaGet);
router.post("/admin/productos/alta", validarProducto, adminController.altaPost);

router.get("/admin/edicion/:tipo/:id", validarTipoIdParams, adminController.edicionGet);
router.post(
    "/admin/productos/edicion/:tipo/:id",
    validarTipoIdParams,
    validarProducto,
    adminController.edicionPost
);

router.post("/admin/productos/baja/:tipo/:id", validarTipoIdParams, adminController.bajaPost);
router.post("/admin/productos/activar/:tipo/:id", validarTipoIdParams, adminController.activarPost);

export default router;
