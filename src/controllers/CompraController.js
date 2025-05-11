import { obtenerHistorialCompras, filtrarComprasPorFecha, filtrarComprasPorProducto, registrar } from "../services/CompraService.js";

export async function verHistorialCompras(req, res) {
  try {
    const compras = await obtenerHistorialCompras();
    res.status(200).json(compras);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el historial de compras" });
  }
}


export async function comprasPorFecha(req, res) {
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

    const compras = await filtrarComprasPorFecha(fechaInicio, fechaFin);
    res.status(200).json(compras);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar por fecha" });
  }
}

export async function comprasPorProducto(req, res) {
  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({ message: "Debe proporcionar un nombre de producto" });
    }
    const compras = await filtrarComprasPorProducto(nombre);
    res.status(200).json(compras);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar por producto" });
  }
}

export async function registrarCompra(req, res) {
  try {
    const { dni_usuario, nombre_producto, precio_compra, precio_venta, cantidad_agregar, id_categoria, fecha_compra } = req.body;

    if (!dni_usuario || !nombre_producto || !precio_compra || !precio_venta || !cantidad_agregar || !id_categoria || !fecha_compra) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (cantidad_agregar <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a cero" });
    }

    const compra = await registrar(dni_usuario, nombre_producto, precio_compra, precio_venta, cantidad_agregar, id_categoria, fecha_compra);
    res.status(201).json(compra);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al registrar la compra", 
      error: error.message, 
      stack: error.stack 
    });
  }
}