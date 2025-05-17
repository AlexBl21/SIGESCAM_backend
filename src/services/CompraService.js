import e from "express";
import Compra from "../models/Compra.js";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import { BadRequestError, NotFoundError } from "../errors/Errores.js";
import { editarCantidad, registrar as registrarProducto } from "./ProductoService.js";
import { Op } from "sequelize";

export async function registrar(dni_usuario, nombre_producto, precio_compra, precio_venta, cantidad_agregar, nombre_categoria, fecha_compra) {
    const transaction = await Compra.sequelize.transaction(); // Iniciar una transacción

    try {
        // Validar campos obligatorios
        if (dni_usuario === undefined || dni_usuario === null || isNaN(dni_usuario)) {
            throw new BadRequestError("El DNI del usuario es obligatorio y debe ser un número.");
        }
        if (!nombre_producto || typeof nombre_producto !== "string" || nombre_producto.trim() === "") {
            throw new BadRequestError("El nombre del producto es obligatorio.");
        }
        if (precio_compra === undefined || precio_compra === null || isNaN(precio_compra)) {
            throw new BadRequestError("El precio de compra es obligatorio y debe ser un número.");
        }
        if (precio_venta === undefined || precio_venta === null || isNaN(precio_venta)) {
            throw new BadRequestError("El precio de venta es obligatorio y debe ser un número.");
        }
        if (cantidad_agregar === undefined || cantidad_agregar === null || isNaN(cantidad_agregar)) {
            throw new BadRequestError("La cantidad es obligatoria y debe ser un número.");
        }
        if (!nombre_categoria || typeof nombre_categoria !== "string" || nombre_categoria.trim() === "") {
            throw new BadRequestError("El nombre de la categoría es obligatorio.");
        }
        if (!fecha_compra || isNaN(Date.parse(fecha_compra))) {
            throw new BadRequestError("La fecha de compra es obligatoria y debe ser válida.");
        }

        // Validaciones numéricas
        if (cantidad_agregar <= 0) {
            throw new BadRequestError("La cantidad debe ser mayor a cero.");
        }
        if (precio_compra < 0) {
            throw new BadRequestError("El precio de compra no puede ser negativo.");
        }
        if (precio_venta < 0) {
            throw new BadRequestError("El precio de venta no puede ser negativo.");
        }

        // Verificar si el usuario existe
        const usuario = await Usuario.findOne({ where: { dni: dni_usuario }, transaction });
        if (!usuario) {
            throw new BadRequestError("El usuario no existe.");
        }

        // Buscar el producto por nombre
        let producto = await Producto.findOne({ where: { nombre: nombre_producto }, transaction });

        if (producto) {
            // Si el producto está desactivado, activarlo y establecer la cantidad inicial
            if (!producto.activo) {
                await producto.update({ activo: true, cantidad: cantidad_agregar }, { transaction });
            } else {
                // Si el producto está activo, actualizar la cantidad utilizando editarCantidad
                await editarCantidad(producto.id_producto, producto.cantidad + cantidad_agregar, transaction);
            }

            // Actualizar el precio de compra y venta al último agregado
            await producto.update({ precio_compra, precio_venta }, { transaction });
        } else {
            // Si el producto no existe, registrarlo utilizando el método registrar de ProductoService
            producto = await registrarProducto(
                nombre_producto,
                precio_compra,
                precio_venta,
                cantidad_agregar,
                nombre_categoria
            );
        }

        // Registrar la compra
        const compra = await Compra.create({
            cantidad_agregar,
            precio: precio_compra,
            fecha_compra: new Date(fecha_compra),
            dni_usuario,
            id_producto: producto.id_producto // Usar el ID del producto creado o actualizado
        }, { transaction });

        await transaction.commit(); // Confirmar la transacción
        return compra;
    } catch (error) {
        await transaction.rollback(); // Revertir los cambios si ocurre un error
        // Retornar el mensaje de error personalizado para mostrar en el modal del front
        throw new BadRequestError(error.message || "Error al registrar la compra.");
    }
}

export async function eliminar(id_compra) {
    const transaction = await Compra.sequelize.transaction(); // Iniciar una transacción

    try {
        // Buscar la compra por ID
        const compra = await Compra.findByPk(id_compra, { transaction });

        if (!compra) {
            throw new NotFoundError("La compra no existe.");
        }

        // Buscar el producto asociado a la compra
        const producto = await Producto.findByPk(compra.id_producto, { transaction });

        if (!producto) {
            throw new NotFoundError("El producto asociado a la compra no existe.");
        }

        // Restar la cantidad agregada en la compra a la cantidad del producto
        const nuevaCantidad = producto.cantidad - compra.cantidad_agregar;

        if (nuevaCantidad < 0) {
            throw new BadRequestError("La cantidad del producto no puede ser negativa.");
        }

        if (nuevaCantidad === 0) {
            // Si la cantidad queda en cero, eliminar el producto
            await producto.destroy({ transaction });
        } else {
            // Si no, actualizar la cantidad del producto
            await producto.update({ cantidad: nuevaCantidad }, { transaction });
        }

        // Eliminar la compra
        await compra.destroy({ transaction });

        await transaction.commit(); // Confirmar la transacción
        return { message: "Compra eliminada correctamente." };
    } catch (error) {
        await transaction.rollback(); // Revertir los cambios si ocurre un error
        throw error;
    }
}

export async function obtenerHistorialCompras() {
    const compras = await Compra.findAll({
        include: [
            {
                model: Usuario,
                attributes: ['dni', 'nombre']
            },
            {
                model: Producto,
                attributes: ['nombre']
            }
        ],
        order: [['fecha_compra', 'DESC']]
    });

    return calcularTotales(compras);
}


export async function filtrarComprasPorFecha(fechaInicio, fechaFin) {
    const fechaInicioObj = new Date(fechaInicio + 'T00:00:00');
    const fechaFinObj = new Date(fechaFin + 'T23:59:59');

    fechaInicioObj.setMinutes(fechaInicioObj.getMinutes() - fechaInicioObj.getTimezoneOffset());
    fechaFinObj.setMinutes(fechaFinObj.getMinutes() - fechaFinObj.getTimezoneOffset());

    const compras = await Compra.findAll({
        where: {
            fecha_compra: {
                [Op.between]: [fechaInicioObj, fechaFinObj]
            }
        },
        include: [
            {
                model: Usuario,
                attributes: ['dni', 'nombre']
            },
            {
                model: Producto,
                attributes: ['nombre']
            }
        ],
        order: [['fecha_compra', 'DESC']]
    });

    return calcularTotales(compras);
}


export async function filtrarComprasPorProducto(nombreProducto) {
    const compras = await Compra.findAll({
        include: [
            {
                model: Producto,
                attributes: ['nombre'],
                where: {
                    nombre: {
                        [Op.like]: `%${nombreProducto}%`
                    }
                }
            },
            {
                model: Usuario,
                attributes: ['dni', 'nombre']
            }
        ]
    });

    return calcularTotales(compras);
}

function calcularTotales(compras) {
    let totalGeneral = 0;

    const comprasConTotales = compras.map(compra => {
        const total_compra = compra.precio * compra.cantidad_agregar;
        totalGeneral += total_compra;

        return {
            ...compra.toJSON(),
            total_compra
        };
    });

    return {
        totalGeneral,
        compras: comprasConTotales
    };
}
