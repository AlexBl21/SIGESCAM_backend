import DeudorService from "../services/DeudorService.js";

async function listarDeudores(req, res) {
    try {
        const deudores = await DeudorService.listarDeudores();
        res.status(200).json(deudores);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener deudores", error: error.message });
    }
};

export default {listarDeudores};