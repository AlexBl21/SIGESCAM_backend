import DeudorService from "../services/DeudorService.js";

async function obtenerDeudorPorDNI(req, res) {
    const { dni } = req.params;

    try {
        const deudor = await DeudorService.buscarPorDNI(dni);
        res.status(200).json(deudor);
    } catch (error) {
        res.status(500).json({ mensaje: "Error del servidor" });
    }
}

async function listarDeudores(req, res) {
    try {
        const deudores = await DeudorService.listarDeudores();
        res.status(200).json(deudores);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener deudores", error: error.message });
    }
};

async function ventasFiadas(req, res) {
    try {
        const ventas = await DeudorService.obtenerVentasFiadas(req.params.dni_deudor);
        res.status(200).json(ventas);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener ventas fiadas", error: error.message });
    }
    ;
}

async function buscarPorNombreODNI(req, res) {
    const { termino } = req.query;

    try {
        const resultados = await DeudorService.buscarPorNombreODNI(termino);
        res.status(200).json(resultados);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            mensaje: "Error al buscar deudores",
            error: error.message,
        });
    }
}

async function eliminarDeudorPorDNI(req, res) {
    const { dni } = req.params;

    try {
        const deudor = await DeudorService.buscarPorDNI(dni);
        if (!deudor) {
            return res.status(404).json({ mensaje: "Deudor no encontrado" });
        }

        if (parseFloat(deudor.monto_pendiente) > 0) {
            return res.status(400).json({ mensaje: "El deudor aún tiene deuda pendiente" });
        }

        await DeudorService.eliminarPorDNI(dni);
        return res.status(200).json({ mensaje: "Deudor eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar deudor:", error.message);
        res.status(500).json({ mensaje: "Error al eliminar deudor", error: error.message });
    }

}


export default { obtenerDeudorPorDNI, listarDeudores, ventasFiadas, buscarPorNombreODNI, eliminarDeudorPorDNI };


