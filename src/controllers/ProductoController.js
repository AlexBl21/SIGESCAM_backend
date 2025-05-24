import ProductoService from "../services/ProductoService.js";

async function registrar(req, res) {
    try {
        const { nombre, precio_compra, precio_venta, cantidad, nombre_categoria } = req.body;

        if (!nombre || !precio_compra || !precio_venta || !cantidad || !nombre_categoria) {
            return res.status(400).json({ message: "Los datos no pueden estar vacíos" });
        }

        const producto = await ProductoService.registrar(
            nombre,
            precio_compra,
            precio_venta,
            cantidad,
            nombre_categoria
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

// Listar productos resumido
async function listarResumido(req, res) {
    try {
        const productos = await ProductoService.listarResumido();
        res.status(200).json(productos);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

// Listar productos resumido solo activos
async function listarResumidoActivos(req, res) {
    try {
        const productos = await ProductoService.listarResumidoActivos();
        res.status(200).json(productos);
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.status(404).json({ message: error.message });
        }
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

// Editar producto por nombre
async function editarPorNombre(req, res) {
    try {
        const { nombre } = req.params;
        const { nuevoNombre, precio_venta, nombre_categoria } = req.body;

        const producto = await ProductoService.editarPorNombre(
            nombre,
            nuevoNombre,
            precio_venta,
            nombre_categoria
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

// Activar o desactivar producto por nombre
async function activarDesactivarPorNombre(req, res) {
    try {
        const nombre = req.params.nombre;
        const { activo } = req.body;

        const producto = await ProductoService.activarDesactivarPorNombre(
            nombre,
            activo
        );
        res.status(200).json(producto);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

// Eliminar producto
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

// Eliminar producto por nombre
async function eliminarPorNombre(req, res) {
    try {
        const nombre = req.params.nombre;
        const producto = await ProductoService.eliminarPorNombre(nombre);
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

// Buscar por nombre parecido
async function buscarPorNombreParecido(req, res) {
    try {
        const nombre = req.params.nombre;
        const productos = await ProductoService.buscarPorNombreParecido(nombre);
        res.status(200).json(productos);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
}

// Obtener cantidad de productos por nombre
async function obtenerCantidadPorNombre(req, res) {
    try {
        const nombre = req.params.nombre;
        const cantidad = await ProductoService.obtenerCantidadPorNombre(nombre);
        res.status(200).json(cantidad);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

// Filtrar productos por categoria
async function filtrarPorCategoria(req, res) {
    try {
        const id_categoria = req.params.id_categoria; // Obtener el texto de la categoría
        if (typeof id_categoria !== "string" || id_categoria.trim() === "") {
            return res.status(400).json({ message: "El id_categoria debe ser un texto válido" });
        }
        const productos = await ProductoService.filtrarPorCategoria(id_categoria);
        res.status(200).json(productos);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

// Filtrar productos por cantidad, categoria y precio
async function filtrarPorCantidadCategoriaPrecio(req, res) {
    try {
        const { cantidad, nombre_categoria, precio } = req.query;
        const productos = await ProductoService.filtrarPorCantidadCategoriaPrecio(cantidad, nombre_categoria, precio);
        res.status(200).json(productos);
    } catch (error) {
        // Devuelve el mensaje de error personalizado si existe
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

export default {
    registrar,
    listar,
    listarResumido,
    listarResumidoActivos,
    editar,
    editarPorNombre,
    activarDesactivar,
    activarDesactivarPorNombre,
    eliminar,
    eliminarPorNombre,
    buscarPorId,
    buscarPorNombre,
    buscarPorNombreParecido,
    obtenerCantidadPorNombre,
    filtrarPorCategoria,
    filtrarPorCantidadCategoriaPrecio
};