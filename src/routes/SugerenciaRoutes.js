import { Router } from "express";
import SugerenciaController from "../controllers/SugerenciaController.js";

const router = Router();

router.post("/", SugerenciaController.registrar);
router.get("/", SugerenciaController.listarNoClasificadas);
router.get("/aceptadas", SugerenciaController.listarAceptadas);
router.get("/rechazadas", SugerenciaController.listarRechazadas);
router.patch("/aceptadas/:id_sugerencia", SugerenciaController.cambiarEstado);
router.patch("/:id_sugerencia", SugerenciaController.cambiarClasificacion);
export default router;