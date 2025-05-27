import Deudor from "../models/Deudor.js";
import { BadRequestError, NotFoundError } from "../errors/Errores.js";
import { Sequelize, Op } from "sequelize";
import Venta from "../models/Venta.js";
import Abono from "../models/Abono.js";

async function buscarPorDNI(dni) {
    const deudor = await Deudor.findByPk(dni);
    return deudor || null;
}

async function eliminarPorDNI(dni) {
    await Deudor.destroy({ where: { dni_deudor: dni } });
}

async function listarDeudores() {
    try {
        const deudores = await Deudor.findAll({
            include: [
                {
                    model: Venta,
                    where: { es_fiado: true },
                    attributes: ['total'],
                    include: [
                        {
                            model: Abono,
                            attributes: ['monto_abono']
                        }
                    ]
                }
            ]
        });

        if (!deudores || deudores.length === 0) {
            throw new NotFoundError("No se encontraron deudores");
        }
        const resultado = deudores
            .map(deudor => {
                let deudaTotal = 0;

                deudor.venta.forEach(ventaa => {
                    const totalVenta = parseFloat(ventaa.total);
                    const sumaAbonos = abonoTotal(ventaa.abonos);
                   // console.log(sumaAbonos);
                    const montoPendiente = totalVenta - sumaAbonos;
                    deudaTotal += montoPendiente;
                });

                return {
                    dni_deudor: deudor.dni_deudor,
                    nombre: deudor.nombre,
                    deuda_total: deudaTotal.toFixed(2)
                };
            })
        return resultado;
    } catch (error) {
        throw error;
    }
};

async function buscarPorNombreODNI(termino) {
    const deudores = await Deudor.findAll({
        where: {
            [Op.or]: [
                { nombre: { [Op.like]: `%${termino}%` } },
                { dni_deudor: { [Op.like]: `%${termino}%` } }
            ]
        }
    });

    if (!deudores || deudores.length === 0) {
        throw new NotFoundError("No se encontraron deudores");
    }

    return deudores;
};


async function obtenerVentasFiadas(dni) {
    if (!dni) {
        throw new BadRequestError("El dni está vacio")
    }
    try {
        const ventasFiadas = await Deudor.findOne({
            where: { dni_deudor: dni },
            attributes: ['dni_deudor', 'nombre', 'telefono'],
            include: [
                {
                    model: Venta,
                    where: { es_fiado: true },
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
        if (!ventasFiadas) {
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

function abonoTotal(abonos) {
    let total = 0;
    abonos.forEach((abono) => {
        total += parseFloat(abono.monto_abono);
    });
    return total;
}

export default { listarDeudores, eliminarPorDNI, buscarPorDNI, buscarPorNombreODNI, obtenerVentasFiadas };