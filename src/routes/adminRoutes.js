import express from "express";
import homeController from "../controllers/homeController.js";

const router = express.Router();
router.post("/login", homeController.loginPost);

export default router;
