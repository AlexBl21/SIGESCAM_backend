import productoEntidad from "../models/Producto.js";
import { NotFoundError, BadRequestError, Conflict, InternalServerError } from "../errors/Errores.js";
import categoriaEntidad from "../models/Categoria.js";
import { existeCategoria } from "./CategoriaService.js";

//Registrar un Producto
async function registrar(nombre, precio_compra, precio_venta, cantidad, id_categoria) {
    if (!nombre || !precio_compra || !precio_venta || !cantidad || !id_categoria) {
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }

    try {
        // Busco si existe el producto
        const productoExistente = await existeProducto(nombre);
        if (productoExistente) {
            throw new Conflict("El producto ya existe");
        }

        // Busco si existe la categoría
        const categoriaExistente = await existeCategoria(id_categoria);
        if (!categoriaExistente) {
            throw new NotFoundError("La categoría no existe");
        }

        // Creo el producto con los datos que necesito
        const producto = await productoEntidad.create({
            nombre: nombre,
            precio_compra: precio_compra,
            precio_venta: precio_venta,
            cantidad: cantidad,
            id_categoria: id_categoria,
            activo: true // Representado como 1 en la base de datos
        });
        return producto;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

//mirar si el producto ya existe
async function existeProducto(nombre) {
    return await productoEntidad.findOne({
        where: { nombre: nombre }
    });
}

//Listar productos
async function listar() {
    const productos = await productoEntidad.findAll({
        include: [{
            model: categoriaEntidad
        }]
    });
    return productos;
}

// editar producto
async function editar(id_producto, nombre, precio_compra, precio_venta, cantidad, id_categoria) {
    if (!id_producto || !nombre || !precio_compra || !precio_venta || !cantidad || !id_categoria) {
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }

    try {
        // Busco si existe la categoría
        const categoriaExistente = await existeCategoria(id_categoria);
        if (!categoriaExistente) {
            throw new NotFoundError("La categoría no existe");
        }

        // Actualizo el producto con los nuevos datos
        const producto = await productoEntidad.update({
            nombre: nombre,
            precio_compra: precio_compra,
            precio_venta: precio_venta,
            cantidad: cantidad,
            id_categoria: id_categoria,
            activo: true // Representado como 1 en la base de datos
        }, {
            where: { id_producto: id_producto }
        });
        return producto;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Activar o desactivar un producto
async function activarDesactivar(id_producto, activo) {
    if (!id_producto || activo === undefined) {
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }

    try {
        // Actualizo el estado del producto
        const producto = await productoEntidad.update({
            activo: activo
        }, {
            where: { id_producto: id_producto }
        });
        return producto;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Eliminar producto
async function eliminar(id_producto) {
    if (!id_producto) {
        throw new BadRequestError("El id del producto no puede estar vacío");
    }

    try {
        // Busco si existe el producto
        const producto = await buscarPorId(id_producto);
        if (!producto) {
            throw new NotFoundError("El producto no existe");
        }

        // Elimino el producto
        await productoEntidad.destroy({
            where: { id_producto: id_producto }
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Elimnar producto por nombre
async function eliminarPorNombre(nombre) {
    if (!nombre) {
        throw new BadRequestError("El nombre del producto no puede estar vacío");
    }

    try {
        // Busco si existe el producto
        const producto = await buscarPorNombre(nombre);
        if (!producto) {
            throw new NotFoundError("El producto no existe");
        }

        // Elimino el producto
        await productoEntidad.destroy({
            where: { nombre: nombre }
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Buscar producto por id
async function buscarPorId(id_producto) {
    if (!id_producto) {
        throw new BadRequestError("El id del producto no puede estar vacío");
    }

    const producto = await productoEntidad.findByPk(id_producto);
    if (!producto) {
        throw new NotFoundError("El producto no existe");
    }
    return producto;
}

// Buscar producto por nombre
async function buscarPorNombre(nombre) {
    if (!nombre) {
        throw new BadRequestError("El nombre del producto no puede estar vacío");
    }

    const producto = await productoEntidad.findOne({
        where: { nombre: nombre }
    });
    if (!producto) {
        throw new NotFoundError("El producto no existe");
    }
    return producto;
}

// editar cantidad
export async function editarCantidad(id_producto, cantidad) {
    if (!id_producto || !cantidad) {
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }

    try {
        // Actualizo la cantidad del producto
        const producto = await productoEntidad.update({
            cantidad: cantidad
        }, {
            where: { id_producto: id_producto }
        });
        return producto;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default {
    registrar,
    existeProducto,
    listar,
    editar,
    activarDesactivar,
    eliminar,
    eliminarPorNombre,
    buscarPorId,
    buscarPorNombre,
    editarCantidad
};