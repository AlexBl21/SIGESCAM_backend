import Deudor from "../models/Deudor.js";
import { BadRequestError, NotFoundError } from "../errors/Errores.js";
import { Sequelize, Op } from "sequelize";
import Venta from "../models/Venta.js";
import Abono from "../models/Abono.js";

async function buscarPorDNI(dni) {
    const deudor = await Deudor.findByPk(dni);
    return deudor || null;
}

async function listarDeudores() {
    try {
        const deudores = await Deudor.findAll({
            where: {
                monto_pendiente: {
                    [Op.gt]: 0
                }
            }
        });
        if (!deudores) {
            throw new NotFoundError("No se encontraron deudores")
        }
        return deudores;
    } catch (error) {
        throw error;
    }
};


async function obtenerVentasFiadas(dni) {
    if (!dni){
        throw new BadRequestError("El dni está vacio")
    }
    try {
        const ventasFiadas = await Deudor.findOne({
        where: {dni_deudor: dni},
        attributes: ['dni_deudor', 'nombre', 'telefono'],
        include: [
            {
                model: Venta,
                where:{es_fiado: true },
                attributes: ['id_venta', 'total', 'es_fiado', 'fecha_venta'],
                include: [
                {
                    model: Abono,
                    attributes: ['id_abono', 'monto_abono', 'fecha_abono']
                }
                ]
            }
            ]
        });
        if(!ventasFiadas){
            throw new NotFoundError("No se encontraron ventas fiadas para este deudor")
        }
        // Procesar cada venta para calcular monto pendiente
        const ventas = ventasFiadas.venta.map(venta => {
            const totalVenta = parseFloat(venta.total);
            const sumaAbonos = venta.abonos.reduce((acc, abono) => acc + parseFloat(abono.monto_abono), 0);
            const montoPendiente = totalVenta - sumaAbonos;

            return {
                id_venta: venta.id_venta,
                fecha_venta: venta.fecha_venta,
                monto_pendiente: montoPendiente
            };
        });

        const resultadoFinal = {
            dni_deudor: ventasFiadas.dni_deudor,
            nombre: ventasFiadas.nombre, 
            telefono: ventasFiadas.telefono,
            ventas: ventas
        }
        return resultadoFinal;
    } catch (error) {
        throw error;
    }
    
}

async function abonoTotal(abonos) {
    let total = 0;
    abonos.forEach((abono) => {
        total += parseFloat(abonos.monto_abono);
    });
    return total;
}

export default { listarDeudores, buscarPorDNI, obtenerVentasFiadas};