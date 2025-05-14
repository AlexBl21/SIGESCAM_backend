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

async function cambiarEstado(req, res) {
    try {
        const notificacion = await NotificacionUsuarioService.cambiarEstado(req.params.id);
        res.status(200).json(notificacion);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al cambiar el estado", error: error.message });
    }
};

async function listarParaAdministradora(req, res) {
    try {
        const listado = await NotificacionUsuarioService.listarParaAdministradora(req.params.dni);
        res.status(200).json(listado);
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message });
    }
}
export default {listarParaGestora, cambiarEstado, listarParaAdministradora};