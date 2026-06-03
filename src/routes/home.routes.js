import express from "express";
import homeController from "../controllers/homeController.js";

const router = express.Router();
router.get("/productos", homeController.productos);
router.get("/productos/comida", homeController.comida);
router.get("/productos/accesorios", homeController.accesorios);

export default router;