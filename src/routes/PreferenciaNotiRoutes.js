import { Router } from "express";
const router = Router();

import PreferenciaNotificacionController from "../controllers/PreferenciaNotificacionController.js";

router.patch("/", PreferenciaNotificacionController.cambiarEstado);

export default router;
