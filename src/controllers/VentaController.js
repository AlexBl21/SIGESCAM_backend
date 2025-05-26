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

async function ventasFiadas(req, res) {
    try {
        const ventas = await VentaService.ventasFiadas(req.params.dni_deudor);
        res.status(200).json(ventas);
    } catch (error) {
         res.status(error.statusCode || 500).json({ message: "Error al obtener ventas fiadas", error: error.message });
    }
;}

async function detallesDeUnaVentaFiada(req, res){
    try {
        const detalles = await VentaService.detallesDeUnaVentaFiada(req.params.id_venta);
        res.status(200).json(detalles);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener deatlle de la venta", error: error.message });
    }
}
export default {
    agregarProductoAVentaTemporal,
    registrarVenta,
    obtenerVentasDelDia,
    obtenerHistorialVentasConAbono
    obtenerVentasDelDia,
    top3ProductosSemana,
    ventasFiadas, 
    detallesDeUnaVentaFiada
};

