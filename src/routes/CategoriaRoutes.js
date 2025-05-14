import { Router } from "express";
import * as CategoriaController from "../controllers/CategoriaController.js";

const router = Router();

router.post("/", CategoriaController.registrar);
router.get("/", CategoriaController.listar);
router.put("/", CategoriaController.actualizar);
router.delete("/:id", CategoriaController.eliminar);

export default router;