import { Router } from "express";
import { verificarDniUsuario, enviarCodigoSMSRecuperacion, enviarCodigoAEmail, comprobarCodigo, restablecerContrasena } from "../controllers/RecuperarContrasenaController.js";

const router = Router();

router.post("/verificar", verificarDniUsuario);
router.post("/enviar-sms", enviarCodigoSMSRecuperacion);
router.post("/enviar-email", enviarCodigoAEmail);
router.post("/validar", comprobarCodigo);
router.post('/actualizar', restablecerContrasena);

export default router;
