import usuarioController from "../controllers/UsuarioController.js";
import { Router } from "express";
import { editarCorreo, subirImagenPerfil, upload } from "../controllers/UsuarioController.js";

const router = Router();

router.post("/", usuarioController.registrar);
router.get("/", usuarioController.listar);
router.put("/:dni", usuarioController.editar);
router.patch("/:dni", usuarioController.cambioDeEstado);
router.get("/:dni", usuarioController.buscarPorId);
router.put("/email/:dni", editarCorreo);
//Registrar contraseña
router.post("/crear-contrasena/:token", usuarioController.crearContrasena);
//Validar email
router.post("/validar-email", usuarioController.validarEmail);
router.post("/:dni/foto", upload.single("imagen"), subirImagenPerfil);
export default router;