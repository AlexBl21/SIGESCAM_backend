import categoriaEntidad from "../models/Categoria.js";
import { NotFoundError, BadRequestError, Conflict } from "../errors/Errores.js";

// Crear categoría
export async function registrar(nombre, descripcion) {
    if (!nombre || !descripcion) {
        throw new BadRequestError("Los campos nombre y descripción no pueden estar vacíos.");
    }

    const existente = await categoriaEntidad.findByPk(nombre);
    if (existente) {
        throw new Conflict("Ya existe una categoría con ese nombre.");
    }

    return await categoriaEntidad.create({ nombre, descripcion });
}

// Obtener todas las categorías
export async function listar() {
    return await categoriaEntidad.findAll();
}

// Actualizar una categoría
export async function actualizar(nombreOriginal, nuevoNombre, nuevaDescripcion) {
    const categoria = await categoriaEntidad.findByPk(nombreOriginal);
    if (!categoria) {
        throw new NotFoundError("Categoría no encontrada.");
    }

    if (!nuevoNombre || !nuevaDescripcion) {
        throw new BadRequestError("Nombre y descripción no pueden estar vacíos.");
    }

    // Si cambia el nombre, verifica que el nuevo no exista
    if (nombreOriginal !== nuevoNombre) {
        const existente = await categoriaEntidad.findByPk(nuevoNombre);
        if (existente) {
            throw new Conflict("El nuevo nombre ya está en uso.");
        }
    }

    categoria.nombre = nuevoNombre;
    categoria.descripcion = nuevaDescripcion;
    await categoria.save(); // ← Esto guarda el cambio en la BD
    return categoria;

}

// Eliminar categoría
export async function eliminar(nombre) {
    const categoria = await categoriaEntidad.findByPk(nombre);
    if (!categoria) {
        throw new NotFoundError("Categoría no encontrada.");
    }

    await categoria.destroy();
}

export async function existeCategoria(nombre) {
    return await categoriaEntidad.findOne({
        where: { nombre: nombre }
    });
}
