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

export default { obtenerDeudorPorDNI };
