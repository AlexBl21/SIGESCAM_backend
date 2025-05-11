import { Router } from "express";
import { verHistorialCompras, comprasPorFecha, comprasPorProducto, } from "../controllers/CompraController.js";

const router = Router();

router.get("/historial", verHistorialCompras);
router.get("/historial/fecha", comprasPorFecha);
router.get("/historial/producto", comprasPorProducto);
export default router;
