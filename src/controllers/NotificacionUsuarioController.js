import NotificacionUsuarioService from "../services/NotificacionUsuarioService.js";

async function listarParaGestora(req, res) {
    try {
        const listado = await NotificacionUsuarioService.listarParaGestoras(req.params.dni);
        res.status(200).json(listado);
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message });
    }
}

export default {listarParaGestora};