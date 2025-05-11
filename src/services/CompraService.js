import e from "express";
import Compra from "../models/Compra.js";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import { Op } from "sequelize";

export async function registrarCompra(dni_usuario, id_producto, cantidad_agregar, precio) {
    // Validar que los parámetros no sean nulos o inválidos
    if (!dni_usuario || !id_producto || !cantidad_agregar || !precio) {
        throw new Error("Todos los campos son obligatorios.");
    }

    if (cantidad_agregar <= 0) {
        throw new Error("La cantidad debe ser mayor a cero.");
    }

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ where: { dni: dni_usuario } });
    if (!usuario) {
        throw new Error("El usuario no existe.");
    }

    // Verificar si el producto existe
    const producto = await Producto.findByPk(id_producto);
    if (!producto) {
        throw new Error("El producto no existe.");
    }

    // Registrar la compra
    const fecha_compra = new Date();
    const compra = await Compra.create({
        dni_usuario,
        id_producto,
        cantidad_agregar,
        precio,
        fecha_compra
    });

    return compra;
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

    return compras;
}


export async function filtrarComprasPorFecha(fechaInicio, fechaFin) {
    const fechaInicioObj = new Date(fechaInicio + 'T00:00:00');
    const fechaFinObj = new Date(fechaFin + 'T23:59:59');

    fechaInicioObj.setMinutes(fechaInicioObj.getMinutes() - fechaInicioObj.getTimezoneOffset());
    fechaFinObj.setMinutes(fechaFinObj.getMinutes() - fechaFinObj.getTimezoneOffset());

    return await Compra.findAll({
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
}


export async function filtrarComprasPorProducto(nombreProducto) {
    return await Compra.findAll({
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
}