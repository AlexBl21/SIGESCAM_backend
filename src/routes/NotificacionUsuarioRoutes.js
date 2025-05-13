import { Router } from "express";
const router = Router();
import NotificacionUsuarioController from "../controllers/NotificacionUsuarioController.js";
router.get("/:dni", NotificacionUsuarioController.listarParaGestora );
export default router;