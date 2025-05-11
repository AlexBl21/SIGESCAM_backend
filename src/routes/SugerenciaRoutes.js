import { Router } from "express";
import SugerenciaController from "../controllers/SugerenciaController.js";

const router = Router();

router.post("/", SugerenciaController.registrar);
router.get("/", SugerenciaController.listar);
router.patch("/:id_sugerencia", SugerenciaController.cambiarEstado);
export default router;