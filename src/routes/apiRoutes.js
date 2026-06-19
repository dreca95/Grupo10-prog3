import apiController from "../controllers/apiController.js";
import { Router } from "express";

const router = Router();

router.get("/accesorios", apiController.getAccesorios);
router.get("/alimentos", apiController.getAlimentos);

router.post("/administradores", apiController.crearAdministrador);

router.post("/ventas", apiController.crearVenta);
router.get("/ventas/:id", apiController.getVenta);
router.get("/ventas/:id/ticket.pdf", apiController.descargarTicketPdf);

export default router;
