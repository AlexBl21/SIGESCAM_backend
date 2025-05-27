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


export default { obtenerDeudorPorDNI, listarDeudores, buscarPorNombreODNI };
