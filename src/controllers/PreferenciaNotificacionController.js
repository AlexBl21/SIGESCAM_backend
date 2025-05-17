import PreferenciaNotificacionService from "../services/PreferenciaNotificacionService.js";

async function cambiarEstado(req, res) {
    try {
        const preferencia = await PreferenciaNotificacionService.cambiarPreferencia(
            req.body.id_usuario, 
            req.body.id_tipo_notificacion, 
            req.body.activa
        );
        res.status(200).json(preferencia);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
};

export default {cambiarEstado};