import DeudorService from "../services/DeudorService.js";
import sequelize from "../db/db.js"; // Asegúrate de que la ruta sea correcta


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

//registrar abono a una venta fiada
async function registrarAbono(req, res) {
    const { dni_deudor, id_venta, monto_abono, fecha_abono } = req.body;

    try {
        const abono = await DeudorService.registrarAbono(dni_deudor, id_venta, monto_abono, fecha_abono);
        res.status(201).json({ mensaje: "Abono registrado con éxito", abono });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            mensaje: error.message || "Error al registrar el abono"
        });
    }
}

export default { obtenerDeudorPorDNI, listarDeudores, ventasFiadas, buscarPorNombreODNI, eliminarDeudorPorDNI, registrarAbono };


