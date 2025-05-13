import { Router } from "express";
import { verHistorialCompras, comprasPorFecha, comprasPorProducto, registrarCompra, eliminarCompra } from "../controllers/CompraController.js";

const router = Router();

router.get("/historial", verHistorialCompras);
router.get("/historial/fecha", comprasPorFecha);
router.get("/historial/producto", comprasPorProducto);
router.post("/registrar", registrarCompra);
router.delete("/eliminar/:id_compra", eliminarCompra);
export default router;
