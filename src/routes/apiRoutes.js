import apiController from "../controllers/apiController.js";
import { verificarAdminApi } from "../middlewares/adminMiddlewares.js";
import { Router } from "express";

const router = Router();

router.get("/accesorios", apiController.getAccesorios);
router.get("/alimentos", apiController.getAlimentos);

router.post("/administradores", verificarAdminApi, apiController.crearAdministrador);

router.post("/ventas", apiController.crearVenta);
router.get("/ventas/:id", apiController.getVenta);
router.get("/ventas/:id/ticket.pdf", apiController.descargarTicketPdf);

router.use((req, res) => {
  res.status(404).json({ error: "ruta no encontrada" });
});

export default router;
