import * as CategoriaService from "../services/CategoriaService.js";

export async function registrar(req, res) {
    try {
        const categoria = await CategoriaService.registrar(req.body.nombre, req.body.descripcion);
        res.status(200).json(categoria);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor",
        });
    }
}

export async function listar(req, res) {
    try {
        const categorias = await CategoriaService.listar();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).json({ message: "Error al listar categorías" });
    }
}

export async function actualizar(req, res) {
    try {
        const { nombreOriginal, nuevoNombre, nuevaDescripcion } = req.body;
        const categoriaActualizada = await CategoriaService.actualizar(
            nombreOriginal,
            nuevoNombre,
            nuevaDescripcion
        );
        res.status(200).json(categoriaActualizada);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor",
        });
    }
}


export async function eliminar(req, res) {
    try {
        const nombre = req.params.nombre;
        await CategoriaService.eliminar(nombre);
        res.status(200).json({ message: "Categoría eliminada correctamente." });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor",
        });
    }
}