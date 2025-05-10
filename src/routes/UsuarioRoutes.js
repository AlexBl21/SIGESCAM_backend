import usuarioController from "../controllers/UsuarioController.js";
import { Router } from "express";

const router = Router();

router.post("/", usuarioController.registrar);
router.get("/", usuarioController.listar);
router.put("/:dni", usuarioController.editar);
router.patch("/:dni", usuarioController.cambioDeEstado);
router.get("/:dni", usuarioController.buscarPorId);
export default router;