import VentaController from "../controllers/VentaController.js";
import { Router } from "express";

const router = Router();

router.post('/agregar-producto', VentaController.agregarProductoAVentaTemporal);
router.post('/registrar-venta', VentaController.registrarVenta);
router.get('/ventas-del-dia', VentaController.obtenerVentasDelDia);
router.get("/top3-semana", VentaController.top3ProductosSemana);
router.get("/ventas-fiadas/detalles/:id_venta", VentaController.detallesDeUnaVentaFiada);
// router.get("/historial-ventas", VentaController.historialEstadisticoVentasConAbono);
router.get("/margen-ganancia-mes", VentaController.margenDeGananciaDelMes);
router.get("/historial-margenes-ganancia", VentaController.historialMargenesDeGanancia);
router.get("/historial-ventas", VentaController.mostrarHistorialVentas);
router.get("/historial-ventas-fechas", VentaController.mostrarVentasPorFecha);
router.get("/detalle-venta/:id_venta", VentaController.mostrarDetallesVenta);

export default router;