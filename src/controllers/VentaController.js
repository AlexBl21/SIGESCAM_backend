import VentaService from '../services/VentaService.js';
import { BadRequestError, InternalServerError } from '../errors/Errores.js';

const agregarProductoAVentaTemporal = async (req, res) => {
    try {
        const { nombreProducto, cantidad } = req.body;

        if (!nombreProducto || !cantidad) {
            throw new BadRequestError("Nombre del producto y cantidad son requeridos");
        }

        const producto = await VentaService.agregarProductoAVentaTemporal({ nombreProducto, cantidad });
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
};

const registrarVenta = async (req, res) => {
    try {
        const { productos, dni_usuario, deudor, es_fiado, fecha } = req.body;

        const venta = await VentaService.registrarVenta({ productos, dni_usuario, deudor, es_fiado, fecha });
        res.status(201).json(venta);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
};

export const obtenerVentasDelDia = async (req, res) => {
    try {
        const cantidadVentas = await VentaService.obtenerVentasDelDia();
        res.json({ ventasHoy: cantidadVentas });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
};

async function top3ProductosSemana(req, res) {
    try {
        const top3 = await VentaService.obtenerTop3ProductosMasVendidosDeLaSemana();
        res.json(top3);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

export default {
    agregarProductoAVentaTemporal,
    registrarVenta,
    obtenerVentasDelDia,
    top3ProductosSemana
};
