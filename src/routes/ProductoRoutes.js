import ProductoController from "../controllers/ProductoController.js";
import { Router } from "express";

const router = Router();

// Rutas para la entidad Producto
router.post("/", ProductoController.registrar);
router.get("/", ProductoController.listar);
router.get("/resumido", ProductoController.listarResumido);
router.get("/resumido/activos", ProductoController.listarResumidoActivos);
router.put("/:id_producto", ProductoController.editar);
router.put("/nombre/:nombre", ProductoController.editarPorNombre);
router.patch("/:id_producto", ProductoController.activarDesactivar);
router.patch("/nombre/:nombre", ProductoController.activarDesactivarPorNombre);
router.delete("/:id_producto", ProductoController.eliminar);
router.delete("/nombre/:nombre", ProductoController.eliminarPorNombre);
router.get("/id/:id_producto", ProductoController.buscarPorId);
router.get("/nombre/:nombre", ProductoController.buscarPorNombre);
router.get("/nombre_parecido/:nombre", ProductoController.buscarPorNombreParecido);
router.get("/cantidad/:nombre", ProductoController.obtenerCantidadPorNombre);
router.get("/categoria/:id_categoria", ProductoController.filtrarPorCategoria);
router.get("/cantidad_categoria_precio", ProductoController.filtrarPorCantidadCategoriaPrecio);

export default router;