import express from "express";
import homeController from "../controllers/homeController.js";

const router = express.Router();
router.get("/login", homeController.login);
router.get("/productos", homeController.productos);
router.get("/productos/alimentos", homeController.alimentos);
router.get("/productos/accesorios", homeController.accesorios);

export default router;