import { Router } from "express";
const router = Router();
import NotificacionUsuarioController from "../controllers/NotificacionUsuarioController.js";

router.get("/paraGestoras/:dni", NotificacionUsuarioController.listarParaGestora );
router.patch("/:id", NotificacionUsuarioController.cambiarEstado);
export default router;