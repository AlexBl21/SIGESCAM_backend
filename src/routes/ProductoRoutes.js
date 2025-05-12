import ProductoController from "../controllers/ProductoController.js";
import { Router } from "express";

const router = Router();

// Rutas para la entidad Producto
router.post("/", ProductoController.registrar);
router.get("/", ProductoController.listar);
router.get("/resumido", ProductoController.listarResumido);
router.get("/resumido/activos", ProductoController.listarResumidoActivos);
router.put("/:id_producto", ProductoController.editar);
router.patch("/:id_producto", ProductoController.activarDesactivar);
router.patch("/nombre/:nombre", ProductoController.activarDesactivarPorNombre);
router.delete("/:id_producto", ProductoController.eliminar);
router.delete("/nombre/:nombre", ProductoController.eliminarPorNombre);
router.get("/id/:id_producto", ProductoController.buscarPorId);
router.get("/nombre/:nombre", ProductoController.buscarPorNombre);
router.get("/categoria/:id_categoria", ProductoController.filtrarPorCategoria);

export default router;