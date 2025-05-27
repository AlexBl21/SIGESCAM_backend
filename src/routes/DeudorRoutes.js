import { Router } from "express";
import DeudorController from "../controllers/DeudorController.js";

const router = Router();
router.get("/:dni", DeudorController.obtenerDeudorPorDNI);
router.get("/", DeudorController.listarDeudores);
router.get("/ventas-fiadas/:dni_deudor", DeudorController.ventasFiadas);
router.get("/buscar", DeudorController.buscarPorNombreODNI);

export default router;