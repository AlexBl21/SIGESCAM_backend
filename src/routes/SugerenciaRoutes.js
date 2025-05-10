import { Router } from "express";
import SugerenciaController from "../controllers/SugerenciaController.js";

const router = Router();

router.post("/", SugerenciaController.registrar);
router.get("/", SugerenciaController.listarNoClasificadas);
router.get("/aceptadas", SugerenciaController.listarAceptadas);
router.get("/rechazadas", SugerenciaController.listarRechazadas);
export default router;