import apiController from "../controllers/apiController.js";
import { Router } from "express";

const router = Router();

router.get("/accesorios", apiController.getAccesorios);
router.get("/alimentos", apiController.getAlimentos);

export default router;