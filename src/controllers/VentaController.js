import VentaService from '../services/VentaService.js';
import { BadRequestError, InternalServerError } from '../errors/Errores.js';

const agregarProductoAVentaTemporal = async (req, res, next) => {
    try {
        const { nombreProducto, cantidad } = req.body;

        if (!nombreProducto || !cantidad) {
            throw new BadRequestError("Nombre del producto y cantidad son requeridos");
        }

        const producto = await VentaService.agregarProductoAVentaTemporal({ nombreProducto, cantidad });
        res.status(200).json(producto);
    } catch (error) {
        next(error);
    }
};

const registrarVenta = async (req, res, next) => {
    try {
        const { productos, dni_usuario, deudor, es_fiado, fecha } = req.body;

        const venta = await VentaService.registrarVenta({ productos, dni_usuario, deudor, es_fiado, fecha });
        res.status(201).json(venta);
    } catch (error) {
        next(error);
    }
};

export const obtenerVentasDelDia = async (req, res, next) => {
    try {
        const cantidadVentas = await VentaService.obtenerVentasDelDia();
        res.json({ ventasHoy: cantidadVentas });
    } catch (error) {
        next(error);
    }
};

// Obtener historial estadístico de ventas con dinero recibido
export const obtenerHistorialVentasConAbono = async (req, res, next) => {
    try {
        const resultado = await VentaService.obtenerHistorialVentasConAbono();
        if (resultado.mensaje) {
            // Si el service retorna un mensaje de error, responder con 400 y el mensaje
            return res.status(400).json({ mensaje: resultado.mensaje });
        }
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

export default {
    agregarProductoAVentaTemporal,
    registrarVenta,
    obtenerVentasDelDia,
    obtenerHistorialVentasConAbono
};
