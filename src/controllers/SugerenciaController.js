import SugerenciaService from "../services/SugerenciaService.js";

async function registrar(req, res) {
    try {
        const sugerencia = await SugerenciaService.registrar(req.body.nombre_producto, req.body.descripcion);
        res.status(200).json(sugerencia);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor",
          });
    }
}

async function listarNoClasificadas(req, res) {
    try {
        const sugerencias = await SugerenciaService.listarNoClasificadas();
        res.status(200).json(sugerencias);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message });
    }
}

async function listarAceptadas(req, res) {
    try {
        const sugerencias = await SugerenciaService.listarAceptadas();
        res.status(200).json(sugerencias);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message });
    }
}

async function listarRechazadas(req, res) {
    try {
        const sugerencias = await SugerenciaService.listarRechazadas();
        res.status(200).json(sugerencias);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message })
    }
};

async function cambiarEstado(req, res) {
    try {
        const {id_sugerencia} = req.params;
        const sugerencia = await SugerenciaService.cambiarEstado(id_sugerencia, req.body.estado);
        res.status(200).json(sugerencia);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message })
    }
};

async function cambiarClasificacion(req, res) {
    try {
        const {id_sugerencia} = req.params;
        const sugerencia = await SugerenciaService.cambiarClasificacion(id_sugerencia, req.body.clasificada);
        res.status(200).json(sugerencia);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message })
    }
}
export default{registrar, listarNoClasificadas, listarAceptadas, listarRechazadas, cambiarEstado, cambiarClasificacion};