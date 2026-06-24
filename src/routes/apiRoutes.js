import apiController from "../controllers/apiController.js";
import adminApiController from "../controllers/adminApiController.js";
import {validarProductoApi,validarProductoDuplicadoApi,validarProductoParaActivarApi,validarProductoParaBajaApi,validarTipoIdParamsApi, verificarAdminApi} from "../middlewares/adminMiddlewares.js";
import { subirImagenProductoApi } from "../middlewares/imagenesMiddleware.js";
import { validarAdministradorDuplicado,validarCrearAdministrador,validarCrearVenta,validarTokenVentaQuery,validarVentaIdParam
} from "../middlewares/apiMiddlewares.js";
import { Router } from "express";

const router = Router();

router.get("/accesorios", apiController.getAccesorios);
router.get("/alimentos", apiController.getAlimentos);

router.get("/admin/accesorios", verificarAdminApi, adminApiController.obtenerAccesorios);
router.get("/admin/alimentos", verificarAdminApi, adminApiController.obtenerAlimentos);
router.get("/admin/venta-productos", verificarAdminApi, adminApiController.obtenerVentaProductos);

router.post("/admin/productos",verificarAdminApi,subirImagenProductoApi,validarProductoApi,validarProductoDuplicadoApi,adminApiController.crearProductoApi);
router.get("/admin/productos/:tipo/:id",verificarAdminApi,validarTipoIdParamsApi,adminApiController.obtenerProductoApi);
router.post("/admin/productos/:tipo/:id",verificarAdminApi,validarTipoIdParamsApi,subirImagenProductoApi,validarProductoApi,validarProductoDuplicadoApi,adminApiController.editarProductoApi);
router.post("/admin/productos/:tipo/:id/baja",verificarAdminApi,validarTipoIdParamsApi,validarProductoParaBajaApi,adminApiController.darBajaProductoApi);
router.post("/admin/productos/:tipo/:id/activar",verificarAdminApi,validarTipoIdParamsApi,validarProductoParaActivarApi,adminApiController.activarProductoApi);
router.post("/administradores", verificarAdminApi, validarCrearAdministrador, validarAdministradorDuplicado, apiController.crearAdministrador);

router.post("/ventas", validarCrearVenta, apiController.crearVenta);
router.get("/ventas/:id", validarVentaIdParam, validarTokenVentaQuery, apiController.getVenta);
router.get("/ventas/:id/ticket.pdf", validarVentaIdParam, validarTokenVentaQuery, apiController.descargarTicketPdf);

router.use((req, res) => {
    res.status(404).json({ error: "ruta no encontrada" });
});

export default router;
