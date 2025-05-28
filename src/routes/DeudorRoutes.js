import { Router } from "express";
import DeudorController from "../controllers/DeudorController.js";

const router = Router();
router.get('/', DeudorController.listarDeudores);
router.get('/ventas-fiadas/:dni_deudor', DeudorController.ventasFiadas);
router.get('/:dni', DeudorController.obtenerDeudorPorDNI);
router.get('/buscar', DeudorController.buscarPorNombreODNI);
router.delete('/:dni', DeudorController.eliminarDeudorPorDNI);
router.post('/ventas-fiadas/:id_venta/abono', DeudorController.registrarAbono);


export default router;