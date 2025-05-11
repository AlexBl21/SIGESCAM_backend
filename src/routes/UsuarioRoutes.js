import usuarioController from "../controllers/UsuarioController.js";
import { Router } from "express";
import { editarCorreo } from "../controllers/UsuarioController.js";

const router = Router();

router.post("/", usuarioController.registrar);
router.get("/", usuarioController.listar);
router.put("/:dni", usuarioController.editar);
router.patch("/:dni", usuarioController.cambioDeEstado);
router.get("/:dni", usuarioController.buscarPorId);
router.put("/email/:dni", editarCorreo);
router.get("/:dni", obtenerUsuarioPorDNI);
//Registrar contraseña
router.post("/crear-contrasena/:token", usuarioController.crearContrasena);
export default router;