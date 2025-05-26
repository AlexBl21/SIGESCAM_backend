import VentaController from "../controllers/VentaController.js";
import { Router } from "express";

const router = Router();

router.post('/agregar-producto', VentaController.agregarProductoAVentaTemporal);
router.post('/registrar-venta', VentaController.registrarVenta);
router.get('/ventas-del-dia', VentaController.obtenerVentasDelDia);
router.get('/historial-ventas-con-abono', VentaController.obtenerHistorialVentasConAbono);

router.get("/top3-semana", VentaController.top3ProductosSemana);
router.get("/ventas-fiadas/:dni_deudor", VentaController.ventasFiadas);
router.get("/ventas-fiadas/detalles/:id_venta", VentaController.detallesDeUnaVentaFiada);
export default router;