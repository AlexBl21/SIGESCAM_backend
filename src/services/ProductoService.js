import productoEntidad from "../models/Producto.js";
import { NotFoundError, BadRequestError, Conflict, InternalServerError } from "../errors/Errores.js";
import categoriaEntidad from "../models/Categoria.js";
import { existeCategoria } from "./CategoriaService.js";
import { Op } from "sequelize";
import NotificacionService from "./NotificacionService.js";
import NotificacionUsuarioService from "./NotificacionUsuarioService.js";
import UsuarioService from "./UsuarioService.js";
import PreferenciaNotificacionService from "./PreferenciaNotificacionService.js";

//Registrar un Producto - USANDO EN EL FRONT
export async function registrar(nombre, precio_compra, precio_venta, cantidad, nombre_categoria) {
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
                const preferencia = await PreferenciaNotificacionService.saberPreferencia(gestora.dni, 1);
                if(preferencia){
                    const nuevaNotiUsuario = await NotificacionUsuarioService.registrar(gestora.dni, nuevaNotificacion.id_notificacion);
                    if (!nuevaNotiUsuario) {
                        throw new InternalServerError("No se pudo crear Notificación Usuario correctamente");
                    }
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
    try {
        const productos = await productoEntidad.findAll({
            attributes: ['nombre', 'cantidad', 'precio_venta'],
            where: { activo: true },
            include: [{
                model: categoriaEntidad,
                attributes: ['nombre'] // Incluye solo el nombre de la categoría
            }]
        });

        if (!productos || productos.length === 0) {
            throw new NotFoundError("No hay productos activos para mostrar");
        }

        return productos.map(producto => ({
            nombre: producto.nombre,
            categoria: producto.categorium?.nombre || "No tiene categoria", // Muestra el nombre de la categoría o null si no existe
            cantidad: producto.cantidad,
            precio_venta: producto.precio_venta
        }));
    } catch (error) {
        // Puedes personalizar el mensaje para el modal del front
        if (error instanceof NotFoundError) {
            throw new NotFoundError("No se encontraron productos activos. Intente agregar productos o revise los filtros.");
        }
        throw new InternalServerError("Ocurrió un error al listar los productos activos. Intente nuevamente.");
    }
}

// Editar producto
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
    // Validaciones de datos
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
        throw new BadRequestError("El nombre actual del producto no puede estar vacío");
    }
    if (!nuevoNombre || typeof nuevoNombre !== "string" || nuevoNombre.trim() === "") {
        throw new BadRequestError("El nuevo nombre del producto no puede estar vacío");
    }
    if (nuevoNombre.length > 100) {
        throw new BadRequestError("El nuevo nombre del producto es demasiado largo");
    }
    if (isNaN(precio_venta)) {
        throw new BadRequestError("El precio de venta debe ser un número");
    }
    if (Number(precio_venta) < 0) {
        throw new BadRequestError("El precio de venta no puede ser negativo");
    }
    if (!nombre_categoria || typeof nombre_categoria !== "string" || nombre_categoria.trim() === "") {
        throw new BadRequestError("El nombre de la categoría no puede estar vacío");
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

        // Verifico si se actualizó algún producto
        if (producto[0] === 0) {
            throw new NotFoundError("No se encontró el producto para actualizar");
        }

        return producto;
    } catch (error) {
        // El mensaje del error será mostrado en el modal del front
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
    // Validaciones de datos
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
        throw new BadRequestError("El nombre del producto no puede estar vacío");
    }
    if (nombre.length > 100) {
        throw new BadRequestError("El nombre del producto es demasiado largo");
    }
    // Fuerza el valor a booleano si viene como string "true"/"false"
    if (typeof activo === "string") {
        if (activo === "true") activo = true;
        else if (activo === "false") activo = false;
    }
    if (typeof activo !== "boolean") {
        throw new BadRequestError("El estado 'activo' debe ser un valor booleano");
    }

    try {
        // Verifico si existe el producto
        const productoExistente = await productoEntidad.findOne({ where: { nombre: nombre } });
        if (!productoExistente) {
            throw new NotFoundError("El producto no existe");
        }

        // Verifico si el estado ya es el mismo
        if (productoExistente.activo === activo) {
            throw new Conflict(`El producto ya está ${activo ? "activo" : "inactivo"}`);
        }

        // Actualizo el estado del producto
        const producto = await productoEntidad.update(
            { activo: activo },
            { where: { nombre: nombre } }
        );

        // Verifico si se actualizó algún producto
        if (producto[0] === 0) {
            throw new NotFoundError("No se encontró el producto para actualizar");
        }

        return producto;
    } catch (error) {
        // El mensaje del error será mostrado en el modal del front
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

// Buscar producto por nombre parecido solo activos - USANDO EN EL FRONT
async function buscarPorNombreParecido(nombre) {
    // Validaciones de datos
    if (nombre === undefined || nombre === null) {
        throw new BadRequestError("El nombre del producto no puede ser nulo");
    }
    if (typeof nombre !== "string") {
        throw new BadRequestError("El nombre del producto debe ser una cadena de texto");
    }
    if (nombre.trim() === "") {
        throw new BadRequestError("El nombre del producto no puede estar vacío");
    }
    if (nombre.length > 100) {
        throw new BadRequestError("El nombre del producto es demasiado largo");
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

        if (!productos || productos.length === 0) {
            throw new NotFoundError("No se encontraron productos activos que coincidan con el nombre ingresado");
        }

        return productos.map(producto => ({
            nombre: producto.nombre,
            categoria: producto.categorium?.nombre || "No tiene categoria", // Muestra el nombre de la categoría o null si no existe
            cantidad: producto.cantidad,
            precio_venta: producto.precio_venta
        }));
    } catch (error) {
        // El mensaje del error será mostrado en el modal del front
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
async function filtrarPorCantidadCategoriaPrecio(cantidad, nombre_categoria, precio) {
    // Validaciones de datos
    if (
        (cantidad === undefined || cantidad === null) &&
        (nombre_categoria === undefined || nombre_categoria === null || nombre_categoria === "") &&
        (precio === undefined || precio === null)
    ) {
        throw new BadRequestError("Debe ingresar al menos un filtro para buscar productos");
    }

    if (cantidad !== undefined && cantidad !== null) {
        if (isNaN(cantidad)) {
            throw new BadRequestError("La cantidad debe ser un número");
        }
        if (Number(cantidad) < 0) {
            throw new BadRequestError("La cantidad no puede ser negativa");
        }
    }

    if (nombre_categoria !== undefined && nombre_categoria !== null) {
        if (typeof nombre_categoria !== "string" || nombre_categoria.trim() === "") {
            throw new BadRequestError("El nombre de la categoría no puede estar vacío");
        }
        if (nombre_categoria.length > 100) {
            throw new BadRequestError("El nombre de la categoría es demasiado largo");
        }
    }

    if (precio !== undefined && precio !== null) {
        if (isNaN(precio)) {
            throw new BadRequestError("El precio debe ser un número");
        }
        if (Number(precio) < 0) {
            throw new BadRequestError("El precio no puede ser negativo");
        }
    }

    try {
        const whereClauses = []; // Lista de condiciones WHERE

        // Solo productos activos
        whereClauses.push({ activo: true });

        if (cantidad !== null && cantidad !== undefined) {
            whereClauses.push({ cantidad: { [Op.lte]: Number(cantidad) } }); // Productos con cantidad menor o igual
        }

        if (nombre_categoria !== null && nombre_categoria !== undefined && nombre_categoria.trim() !== "") {
            // Busco la categoría por su nombre
            const categoriaExistente = await categoriaEntidad.findOne({
                where: { nombre: nombre_categoria }
            });
            if (!categoriaExistente) {
                throw new NotFoundError("La categoría no existe");
            }
            whereClauses.push({ id_categoria: categoriaExistente.id_categoria }); // Productos de una categoría específica
        }

        if (precio !== null && precio !== undefined && !isNaN(precio)) {
            whereClauses.push({ precio_venta: { [Op.lte]: Number(precio) } }); // Productos con precio menor o igual
        }

        const productos = await productoEntidad.findAll({
            attributes: ['nombre', 'cantidad', 'precio_venta'],
            where: { [Op.and]: whereClauses }, // Combino todas las condiciones con AND
            include: [{
                model: categoriaEntidad,
                attributes: ['nombre']
            }]
        });

        if (!productos || productos.length === 0) {
            throw new NotFoundError("No se encontraron productos que coincidan con los filtros ingresados");
        }

        return productos.map(producto => ({
            nombre: producto.nombre,
            categoria: producto.categorium?.nombre || "No tiene categoria", // Muestra el nombre de la categoría o null si no existe
            cantidad: producto.cantidad,
            precio_venta: producto.precio_venta
        }));
    } catch (error) {
        // El mensaje del error será mostrado en el modal del front
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