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

async function listar(req, res) {
    try {
        const sugerencias = await SugerenciaService.listar();
        res.status(200).json(sugerencias);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message });
    }
}


async function cambiarEstado(req, res) {
    try {
        const {id_sugerencia} = req.params;
        const sugerencia = await SugerenciaService.cambiarEstado(id_sugerencia, req.body.estado);
        res.status(200).json(sugerencia);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: "Error al obtener sugerencias", error: error.message })
    }
};

export default{registrar, listar, cambiarEstado};