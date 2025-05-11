import { obtenerHistorialCompras,filtrarComprasPorFecha,filtrarComprasPorProducto } from "../services/CompraService.js";

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