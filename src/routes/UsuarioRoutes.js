import usuarioController from "../controllers/UsuarioController.js";
import { Router } from "express";
import { editarCorreo, obtenerUsuarioPorDNI } from "../controllers/UsuarioController.js";

const router = Router();

router.post("/", usuarioController.registrar);
router.get("/", usuarioController.listar);
router.put("/:dni", usuarioController.editar);
router.patch("/:dni", usuarioController.cambioDeEstado);
router.get("/:dni", usuarioController.buscarPorId);
router.put("/:dni", editarCorreo);
router.get("/:dni", obtenerUsuarioPorDNI);

export default router;