import DetalleVentaController from "../controllers/DetalleVentaController.js";
import VentaService from "../services/VentaService.js";
import { Router } from "express";

const router = Router();

router.get("/:id_venta", VentaService.detallesDeUnaVentaFiada);

export default router;