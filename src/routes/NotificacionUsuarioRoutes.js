import { Router } from "express";
const router = Router();
import NotificacionUsuarioController from "../controllers/NotificacionUsuarioController.js";

router.get("/paraGestoras/:dni", NotificacionUsuarioController.listarParaGestora );
router.patch("/:id", NotificacionUsuarioController.cambiarEstado);
router.get("/paraAdministradora/:dni", NotificacionUsuarioController.listarParaAdministradora );
export default router;