import DetalleVentaService from "../services/DetalleVentaService.js";

async function detallesDeUnaVentaFiada(req, res){
    try {
        const detalles = await DetalleVentaService.detallesDeUnaVentaFiada(req.params.id_venta);
        res.status(200).json(detalles);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener deatlle de la venta", error: error.message });
    }
}

export default {detallesDeUnaVentaFiada};