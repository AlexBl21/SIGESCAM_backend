import ProductoController from "../controllers/ProductoController.js";
import { Router } from "express";

const router = Router();

// Rutas para la entidad Producto
router.post("/", ProductoController.registrar);
router.get("/", ProductoController.listar);
router.put("/:id_producto", ProductoController.editar);
router.patch("/:id_producto", ProductoController.activarDesactivar);
router.delete("/:id_producto", ProductoController.eliminar);
router.delete("/nombre/:nombre", ProductoController.eliminarPorNombre);
router.get("/:id_producto", ProductoController.buscarPorId);
router.get("/nombre/:nombre", ProductoController.buscarPorNombre);

export default router;