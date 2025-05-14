import categoriaEntidad from "../models/Categoria.js";
import { NotFoundError, BadRequestError, Conflict } from "../errors/Errores.js";
import productoEntidad from "../models/Producto.js";


// Crear categoría
export async function registrar(nombre, descripcion) {
    if (!nombre || !descripcion) {
        throw new BadRequestError("Los campos nombre y descripción no pueden estar vacíos.");
    }

    // Verifica que no exista otra con ese nombre (opcional, puedes quitar si el nombre no es único)
    const existente = await categoriaEntidad.findOne({ where: { nombre } });
    if (existente) {
        throw new Conflict("Ya existe una categoría con ese nombre.");
    }

    return await categoriaEntidad.create({ nombre, descripcion });
}

// Obtener todas las categorías
export async function listar() {
    return await categoriaEntidad.findAll();
}

// Actualizar categoría por ID
export async function actualizar(id_categoria, nuevoNombre, nuevaDescripcion) {
    const categoria = await categoriaEntidad.findByPk(id_categoria);
    if (!categoria) {
        throw new NotFoundError("Categoría no encontrada.");
    }

    if (!nuevoNombre || !nuevaDescripcion) {
        throw new BadRequestError("Nombre y descripción no pueden estar vacíos.");
    }

    // Verificar que el nuevo nombre no esté repetido
    const conflicto = await categoriaEntidad.findOne({
        where: {
            nombre: nuevoNombre,
            id_categoria: { [Symbol.for("ne")]: id_categoria }
        }
    });
    if (conflicto) {
        throw new Conflict("El nuevo nombre ya está en uso.");
    }

    categoria.nombre = nuevoNombre;
    categoria.descripcion = nuevaDescripcion;
    await categoria.save();
    return categoria;
}

// Eliminar categoría por ID
export async function eliminar(id_categoria) {
    const categoria = await categoriaEntidad.findByPk(id_categoria);

    if (!categoria) {
        throw new NotFoundError("Categoría no encontrada.");
    }

    // Buscar si existen productos asociados
    const productosAsociados = await productoEntidad.findOne({
        where: { id_categoria: id_categoria }
    });

    if (productosAsociados) {
        throw new Conflict("Esta categoría posee productos asociados a ella, imposible eliminar.");
    }

    // Si no hay productos, elimina la categoría
    await categoria.destroy();
}


// Comprobación de existencia por ID
export async function existeCategoria(id_categoria) {
    return await categoriaEntidad.findByPk(id_categoria);
}
