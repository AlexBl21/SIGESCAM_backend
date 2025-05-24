import { obtenerHistorialCompras, filtrarComprasPorFecha, filtrarComprasPorProducto, registrar, eliminar } from "../services/CompraService.js";

export async function verHistorialCompras(req, res) {
  try {
    const resultado = await obtenerHistorialCompras();
    if (resultado.compras.length === 0) {
      return res.status(200).json({
        message: "No hay registros de compras.",
        totalGeneral: 0,
        compras: []
      });
    }

    res.status(200).json(resultado);
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

    const resultado = await filtrarComprasPorFecha(fechaInicio, fechaFin);
    if (resultado.compras.length === 0) {
      return res.status(200).json({
        message: "No hay registros de compras.",
        totalGeneral: 0,
        compras: []
      });
    }
    res.status(200).json(resultado);
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
    const resultado = await filtrarComprasPorProducto(nombre);
    if (resultado.compras.length === 0) {
      return res.status(200).json({
        message: "No hay registros de compras.",
        totalGeneral: 0,
        compras: []
      });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar por producto" });
  }
}

export async function registrarCompra(req, res) {
  try {
    const { dni_usuario, nombre_producto, precio_compra, precio_venta, cantidad_agregar, nombre_categoria, fecha_compra } = req.body;

    // Ya no es necesario validar aquí, el service lo hace y retorna errores claros
    const compra = await registrar(
      dni_usuario,
      nombre_producto,
      precio_compra,
      precio_venta,
      cantidad_agregar,
      nombre_categoria,
      fecha_compra
    );
    res.status(201).json(compra);
  } catch (error) {
    // Si el error es de validación personalizada, devolver 400
    if (error.name === "BadRequestError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Error al registrar la compra",
      error: error.message,
      stack: error.stack
    });
  }
}

export async function eliminarCompra(req, res) {
  try {
    const { id_compra } = req.params;

    if (!id_compra) {
      return res.status(400).json({ message: "Debe proporcionar el ID de la compra" });
    }

    const resultado = await eliminar(id_compra);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la compra",
      error: error.message,
      stack: error.stack
    });
  }
}