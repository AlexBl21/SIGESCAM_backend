import ProductoService from "../services/ProductoService.js";

async function registrar(req, res) {
    try {
        const producto = await ProductoService.registrar(
            req.body.nombre,
            req.body.precio_compra,
            req.body.precio_venta,
            req.body.cantidad,
            req.body.id_categoria
        );
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

async function listar(req, res) {
    try {
        const productos = await ProductoService.listar();
        res.status(200).json(productos);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

async function editar(req, res) {
    try {
        const id_producto = parseInt(req.params.id_producto, 10); // Convertir a entero
        if (isNaN(id_producto)) {
            return res.status(400).json({ message: "El id_producto debe ser un número válido" });
        }
        const producto = await ProductoService.editar(
            id_producto,
            req.body.nombre,
            req.body.precio_compra,
            req.body.precio_venta,
            req.body.cantidad,
            req.body.id_categoria
        );
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

async function activarDesactivar(req, res) {
    try {
        const { id_producto } = req.params;
        const producto = await ProductoService.activarDesactivar(
            id_producto,
            req.body.activo
        );
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

async function eliminar(req, res) {
    try {
        const id_producto = parseInt(req.params.id_producto, 10); // Convertir a entero
        if (isNaN(id_producto)) {
            return res.status(400).json({ message: "El id_producto debe ser un número válido" });
        }
        const producto = await ProductoService.eliminar(id_producto);
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

// Buscar por id
async function buscarPorId(req, res) {
    try {
        const id_producto = parseInt(req.params.id_producto, 10); // Convertir a entero
        if (isNaN(id_producto)) {
            return res.status(400).json({ message: "El id_producto debe ser un número válido" });
        }
        const producto = await ProductoService.buscarPorId(id_producto);
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

// Buscar por nombre
async function buscarPorNombre(req, res) {
    try {
        const nombre = req.params.nombre;
        const producto = await ProductoService.buscarPorNombre(nombre);
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

export default {
    registrar,
    listar,
    editar,
    activarDesactivar,
    eliminar,
    buscarPorId,
    buscarPorNombre
};