import express from "express";
import adminController from "../controllers/adminController.js";

const router = express.Router();
router.post("/login", adminController.loginPost);
router.get("/backoffice", adminController.backofficeGet);
router.get("/alta", adminController.altaGet);
router.post("/productos/alta", adminController.altaPost);
router.get("/edicion/:tipo/:id", adminController.edicionGet);
router.post("/productos/edicion/:tipo/:id", adminController.edicionPost);

export default router;
