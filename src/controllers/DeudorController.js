import DeudorService from "../services/DeudorService.js";
import pool from "../db/db.js";

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

const registrarAbono = async (req, res) => {
    const { id_venta } = req.params;
    const { monto_abono, fecha_abono } = req.body;

    try {
        const [rows] = await pool.query(
            `SELECT v.id_venta, v.total, v.dni_deudor, d.monto_pendiente
             FROM venta v
             JOIN deudor d ON v.dni_deudor = d.dni_deudor
             WHERE v.id_venta = ? AND v.es_fiado = TRUE`,
            [id_venta]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "Venta fiada no encontrada" });
        }

        const venta = rows[0];

        if (isNaN(monto_abono) || monto_abono <= 0) {
            return res.status(400).json({ mensaje: "El monto del abono no es válido" });
        }

        const nuevaDeuda = venta.monto_pendiente - monto_abono;

        if (nuevaDeuda < 0) {
            return res.status(400).json({ mensaje: "El abono excede la deuda pendiente" });
        }

        await pool.query(
            "INSERT INTO abono (monto_abono, fecha_abono, id_venta) VALUES (?, ?, ?)",
            [monto_abono, fecha_abono, id_venta]
        );

        await pool.query(
            "UPDATE deudor SET monto_pendiente = ?, pagado = ? WHERE dni_deudor = ?",
            [nuevaDeuda, nuevaDeuda === 0, venta.dni_deudor]
        );

        res.status(200).json({
            mensaje: "Abono registrado correctamente",
            nuevaDeuda
        });

    } catch (error) {
        console.error("Error al registrar abono:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

export default { obtenerDeudorPorDNI, listarDeudores, ventasFiadas, buscarPorNombreODNI, eliminarDeudorPorDNI, registrarAbono };


