import { Router } from "express";
import { verHistorialCompras, comprasPorFecha, comprasPorProducto, registrarCompra } from "../controllers/CompraController.js";

const router = Router();

router.get("/historial", verHistorialCompras);
router.get("/historial/fecha", comprasPorFecha);
router.get("/historial/producto", comprasPorProducto);
router.post("/registrar", registrarCompra);
export default router;
