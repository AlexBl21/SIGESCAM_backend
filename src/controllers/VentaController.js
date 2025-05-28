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

async function detallesDeUnaVentaFiada(req, res) {
    try {
        const detalles = await VentaService.detallesDeUnaVentaFiada(req.params.id_venta);
        res.status(200).json(detalles);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener deatlle de la venta", error: error.message });
    }
}

// Obtener historial estadístico de ventas con abono
async function historialEstadisticoVentasConAbono(req, res) {
    try {
        const resultado = await VentaService.obtenerHistorialEstadisticoVentasConAbono();
        res.status(200).json(resultado);
    } catch (error) {
        // Si el error es una validación personalizada, devolver el mensaje específico
        res.status(error.statusCode || 500).json({
            message: error.message || "Error al obtener el historial estadístico de ventas con abono"
        });
    }
}

// Margen de ganancia del mes
async function margenDeGananciaDelMes(req, res) {
    try {
        const { fecha } = req.query;
        const resultado = await VentaService.margenDeGananciaDelMes(fecha);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error al calcular el margen de ganancia del mes"
        });
    }
}

// Historial de margenes de ganancia por año recibido
async function historialMargenesDeGanancia(req, res) {
    try {
        const { anio } = req.query;
        if (!anio || isNaN(anio)) {
            throw new BadRequestError("Debe proporcionar un año válido.");
        }
        const resultado = await VentaService.historialMargenesDeGanancia(Number(anio));
        res.status(200).json(resultado);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error al obtener el historial de márgenes de ganancia"
        });
    }
}

async function mostrarHistorialVentas(req, res) {
    try {
        const historial = await VentaService.obtenerHistorialVentas();
        res.status(200).json(historial);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error al obtener el historial de ventas"
        });
    }
}

async function mostrarVentasPorFecha(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: "Debe proporcionar ambas fechas" });
        }

        const fechaInicioObj = new Date(fechaInicio + ' 00:00:00');
        const fechaFinObj = new Date(fechaFin + ' 23:59:59');

        if (fechaInicioObj > fechaFinObj) {
            return res.status(400).json({ message: "La fecha de inicio no puede ser mayor a la fecha de fin" });
        }

        const resultado = await VentaService.filtrarVentasPorFecha(fechaInicio, fechaFin);
        if (resultado.ventas.length === 0) {
            return res.status(200).json({
                message: "No hay registros de ventas.",
                totalGeneral: 0,
                ventas: []
            });
        }
        return res.status(200).json(resultado);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error al obtener las ventas por fecha"
        });
    }


}

async function mostrarDetallesVenta(req, res) {
    try {
        const detalles = await VentaService.obtenerDetalleVentas(req.params.id_venta);
        res.status(200).json(detalles);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error al obtener los detalles de la venta"
        });
    }
}

const obtenerDetalleVenta = async (req, res, next) => {
    try {
        const { id } = req.params;
        const resultado = await VentaService.obtenerDetalleVentas(id);
        res.json(resultado); // 🔁 Aquí se debe ver el nombre del producto en la respuesta JSON
    } catch (error) {
        next(error);
    }
};

export default {
    agregarProductoAVentaTemporal,
    registrarVenta,
    obtenerVentasDelDia,
    top3ProductosSemana,
    detallesDeUnaVentaFiada,
    historialEstadisticoVentasConAbono,
    margenDeGananciaDelMes,
    historialMargenesDeGanancia,
    mostrarHistorialVentas,
    mostrarVentasPorFecha,
    mostrarDetallesVenta, 
    obtenerDetalleVenta
};
