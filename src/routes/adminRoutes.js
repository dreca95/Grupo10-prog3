import express from "express";
import adminController from "../controllers/adminController.js";

const router = express.Router();

// Admin bajo /admin/*
router.get("/admin/login", (req, res) => res.render("admin/login"));
router.post("/admin/login", adminController.loginPost);

router.get("/admin/backoffice", adminController.backofficeGet);

router.get("/admin/alta", adminController.altaGet);
router.post("/admin/productos/alta", adminController.altaPost);

router.get("/admin/edicion/:tipo/:id", adminController.edicionGet);
router.post("/admin/productos/edicion/:tipo/:id", adminController.edicionPost);

router.post("/admin/productos/baja/:tipo/:id", adminController.bajaPost);
router.post("/admin/productos/activar/:tipo/:id", adminController.activarPost);

export default router;
