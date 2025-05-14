import productoEntidad from "../models/Producto.js";
import { NotFoundError, BadRequestError, Conflict, InternalServerError } from "../errors/Errores.js";
import categoriaEntidad from "../models/Categoria.js";
import { existeCategoria } from "./CategoriaService.js";
import { Op } from "sequelize";
import NotificacionService from "./NotificacionService.js";
import NotificacionUsuarioService from "./NotificacionUsuarioService.js";
import UsuarioService from "./UsuarioService.js";

//Registrar un Producto - USANDO EN EL FRONT
async function registrar(nombre, precio_compra, precio_venta, cantidad, nombre_categoria) {
    if (!nombre || !precio_compra || !precio_venta || !cantidad || !nombre_categoria) {
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }

    try {
        // Busco si existe el producto
        const productoExistente = await existeProducto(nombre);
        if (productoExistente) {
            throw new Conflict("El producto ya existe");
        }

        // Busco la categoría por su nombre
        const categoriaExistente = await categoriaEntidad.findOne({
            where: { nombre: nombre_categoria }
        });
        if (!categoriaExistente) {
            throw new NotFoundError("La categoría no existe");
        }

        // Creo el producto con los datos que necesito
        const producto = await productoEntidad.create({
            nombre: nombre,
            precio_compra: precio_compra,
            precio_venta: precio_venta,
            cantidad: cantidad,
            id_categoria: categoriaExistente.id_categoria,
            activo: true // Representado como 1 en la base de datos
        });
        if (!producto?.id_producto) {
            throw new Error('Error al crear producto');
        }

        const nuevaNotificacion = await NotificacionService.registrarNotificacion(`Se ha agregado un nuevo producto: ${nombre}`, producto.id_producto, "1", null);
        if (!nuevaNotificacion?.id_notificacion) {
            throw new Error('Error al crear notificación principal');
        }
        const gestoras = await UsuarioService.listarGestoras();
        for (const gestora of gestoras) {
            try {
                const nuevaNotiUsuario = await NotificacionUsuarioService.registrar(gestora.dni, nuevaNotificacion.id_notificacion);
                if (!nuevaNotiUsuario) {
                    throw new InternalServerError("No se pudo crear Notificación Usuario correctamente");
                }
            } catch (error) {
                throw error;
            }
        }
        return producto;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

//mirar si el producto ya existe - USANDO EN EL FRONT
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

// Listar productos resumido
async function listarResumido() {
    const productos = await productoEntidad.findAll({
        attributes: ['nombre', 'cantidad', 'precio_venta', 'id_categoria'],
        include: [{
            model: categoriaEntidad,
            as: 'categorium', // Set the alias explicitly
            attributes: ['nombre']
        }]
    });
    return productos.map(producto => ({
        nombre: producto.nombre,
        id_categoria: producto.id_categoria,
        cantidad: producto.cantidad,
        precio_venta: producto.precio_venta
    }));
}

// Listar productos resumido solo activos - USANDO EN EL FRONT
async function listarResumidoActivos() {
    const productos = await productoEntidad.findAll({
        attributes: ['nombre', 'cantidad', 'precio_venta'],
        where: { activo: true },
        include: [{
            model: categoriaEntidad,
            attributes: ['nombre'] // Incluye solo el nombre de la categoría
        }]
    });
    return productos.map(producto => ({
        nombre: producto.nombre,
        categoria: producto.categorium?.nombre || "No tiene categoria", // Muestra el nombre de la categoría o null si no existe
        cantidad: producto.cantidad,
        precio_venta: producto.precio_venta
    }));
}

// editar producto
async function editar(id_producto, nombre, precio_venta, cantidad, id_categoria) {
    if (!id_producto || !nombre || !precio_venta || !cantidad || !id_categoria) {
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

// Editar producto por nombre - USANDO EN EL FRONT
async function editarPorNombre(nombre, nuevoNombre, precio_venta, nombre_categoria) {
    if (!nombre || !nuevoNombre || !precio_venta || !nombre_categoria) {
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }

    try {
        // Verifico si el nuevo nombre ya pertenece a otro producto
        const productoExistente = await existeProducto(nuevoNombre);
        if (productoExistente && productoExistente.nombre !== nombre) {
            throw new Conflict("El nuevo nombre ya pertenece a otro producto");
        }

        // Busco la categoría por su nombre
        const categoriaExistente = await categoriaEntidad.findOne({
            where: { nombre: nombre_categoria }
        });
        if (!categoriaExistente) {
            throw new NotFoundError("La categoría no existe");
        }

        // Actualizo el producto con los nuevos datos
        const producto = await productoEntidad.update({
            nombre: nuevoNombre,
            precio_venta: precio_venta,
            id_categoria: categoriaExistente.id_categoria,
            activo: true // Representado como 1 en la base de datos
        }, {
            where: { nombre: nombre }
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

// Activar o desactivar un producto por nombre - USANDO EN EL FRONT
async function activarDesactivarPorNombre(nombre, activo) {
    if (!nombre || activo === undefined) {
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }

    try {
        // Actualizo el estado del producto
        const producto = await productoEntidad.update({
            activo: activo
        }, {
            where: { nombre: nombre }
        });
        return producto;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Eliminar producto por id
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

// Elimnar producto por nombre - USANDO EN EL FRONT
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

// Buscar producto por nombre - USANDO EN EL FRONT
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

// Buscar producto por nombre parecido solo activos - USANDO EN EL FRONT
async function buscarPorNombreParecido(nombre) {
    if (!nombre) {
        throw new BadRequestError("El nombre del producto no puede estar vacío");
    }

    try {
        const productos = await productoEntidad.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${nombre}%` // Busca nombres que contengan la cadena proporcionada (sensible a mayúsculas)
                },
                activo: true // Solo productos activos
            },
            include: [{
                model: categoriaEntidad,
                attributes: ['nombre']
            }]
        });

        return productos.map(producto => ({
            nombre: producto.nombre,
            categoria: producto.categorium?.nombre || "No tiene categoria", // Muestra el nombre de la categoría o null si no existe
            cantidad: producto.cantidad,
            precio_venta: producto.precio_venta
        }));
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Obtener cantidad de un producto por su nombre - USANDO EN EL FRONT
async function obtenerCantidadPorNombre(nombre) {
    if (!nombre) {
        throw new BadRequestError("El nombre del producto no puede estar vacío");
    }

    const producto = await productoEntidad.findOne({
        where: { nombre: nombre }
    });
    if (!producto) {
        throw new NotFoundError("El producto no existe");
    }
    return producto.cantidad;
}

// editar cantidad - USANDO EN EL FRONT
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

// Filtrar productos por categoria
async function filtrarPorCategoria(id_categoria) {
    if (!id_categoria) {
        throw new BadRequestError("El id de la categoría no puede estar vacío");
    }

    try {
        const productos = await productoEntidad.findAll({
            where: { id_categoria: id_categoria }
        });
        return productos;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Filtrado de productos activos por cantidad, categoria y precio con múltiples filtros - USANDO EN EL FRONT
async function filtrarPorCantidadCategoriaPrecio(cantidad, id_categoria, precio) {
    try {
        const whereClauses = []; // Lista de condiciones WHERE

        // Solo productos activos
        whereClauses.push({ activo: true });

        if (cantidad !== null && cantidad !== undefined) {
            whereClauses.push({ cantidad: { [Op.lte]: cantidad } }); // Productos con cantidad menor o igual
        }

        if (id_categoria !== null && id_categoria !== undefined) {
            whereClauses.push({ id_categoria: id_categoria }); // Productos de una categoría específica
        }

        if (precio !== null && precio !== undefined && !isNaN(precio)) {
            whereClauses.push({ precio_venta: { [Op.lte]: Number(precio) } }); // Productos con precio menor o igual
        }

        const productos = await productoEntidad.findAll({
            attributes: ['nombre', 'cantidad', 'precio_venta', 'id_categoria'],
            where: { [Op.and]: whereClauses }, // Combino todas las condiciones con AND
            include: [{
                model: categoriaEntidad,
                attributes: ['nombre']
            }]
        });

        return productos.map(producto => ({
            nombre: producto.nombre,
            id_categoria: producto.id_categoria,
            cantidad: producto.cantidad,
            precio_venta: producto.precio_venta
        }));
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default {
    registrar,
    existeProducto,
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
    editarCantidad,
    filtrarPorCategoria,
    filtrarPorCantidadCategoriaPrecio
};