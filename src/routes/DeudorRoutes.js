import { Router } from "express";
import DeudorController from "../controllers/DeudorController.js";

const router = Router();
router.get("/:dni", DeudorController.obtenerDeudorPorDNI);
router.get("/", DeudorController.listarDeudores);

export default router;