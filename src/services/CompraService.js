import Compra from "../models/Compra.js";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import { Op } from "sequelize";

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
    return await Compra.findAll({
        where: {
            fecha_compra: {
                [Op.between]: [fechaInicio, fechaFin]
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