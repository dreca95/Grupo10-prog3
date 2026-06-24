import apiController from "../controllers/apiController.js";
import { verificarAdminApi } from "../middlewares/adminMiddlewares.js";
import {validarAdministradorDuplicado,validarCrearAdministrador,validarCrearVenta,validarTokenVentaQuery,validarVentaIdParam} from "../middlewares/apiMiddlewares.js";
import { Router } from "express";

const router = Router();

router.get("/accesorios", apiController.getAccesorios);
router.get("/alimentos", apiController.getAlimentos);

router.post("/administradores",verificarAdminApi,validarCrearAdministrador,validarAdministradorDuplicado,apiController.crearAdministrador);

router.post("/ventas", validarCrearVenta, apiController.crearVenta);
router.get("/ventas/:id", validarVentaIdParam, validarTokenVentaQuery, apiController.getVenta);
router.get("/ventas/:id/ticket.pdf",validarVentaIdParam,validarTokenVentaQuery,apiController.descargarTicketPdf);

router.use((req, res) => {
  res.status(404).json({ error: "ruta no encontrada" });
});

export default router;
