import VentaController from "../controllers/VentaController.js";
import { Router } from "express";

const router = Router();

router.post('/agregar-producto', VentaController.agregarProductoAVentaTemporal);
router.post('/registrar-venta', VentaController.registrarVenta);
router.get('/ventas-del-dia', VentaController.obtenerVentasDelDia);
router.get('/historial-ventas-con-abono', VentaController.obtenerHistorialVentasConAbono);

export default router;