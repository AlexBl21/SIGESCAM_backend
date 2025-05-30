import Deudor from "../models/Deudor.js";
import { BadRequestError, NotFoundError } from "../errors/Errores.js";
import { Sequelize, Op } from "sequelize";
import Venta from "../models/Venta.js";
import Abono from "../models/Abono.js";
import sequelize from "../db/db.js"; // Asegúrate de importar tu instancia de sequelize

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
            where: { monto_pendiente: {
                    [Op.gt]: 0
                } },
            include: [
                {
                    model: Venta,
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

//reistrar abono a la deuda de un deudor
async function registrarAbono(dni_deudor, id_venta, monto_abono, fecha_abono) {
    // Validaciones iniciales
    if (!dni_deudor || !id_venta || !monto_abono || !fecha_abono) {
        throw new BadRequestError("Faltan datos para registrar el abono");
    }
    if (isNaN(monto_abono) || parseFloat(monto_abono) <= 0) {
        throw new BadRequestError("El monto del abono debe ser mayor a 0");
    }

    const t = await sequelize.transaction();
    try {
        // Buscar deudor
        const deudor = await Deudor.findByPk(dni_deudor, { transaction: t });
        if (!deudor) {
            throw new NotFoundError("Deudor no encontrado");
        }

        // Buscar venta
        const venta = await Venta.findByPk(id_venta, { transaction: t });
        if (!venta) {
            throw new NotFoundError("Venta no encontrada");
        }

        // Validar que la venta sea fiada
        if (!venta.es_fiado) {
            throw new BadRequestError("La venta no es fiada");
        }

        // Calcular deuda pendiente de la venta
        const totalAbonos = await Abono.sum('monto_abono', { where: { id_venta }, transaction: t }) || 0;
        const totalVenta = parseFloat(venta.total);
        const deudaVenta = totalVenta - totalAbonos;

        if (parseFloat(monto_abono) > deudaVenta) {
            throw new BadRequestError("El monto del abono excede la deuda pendiente de la venta");
        }

        // Registrar abono
        const abono = await Abono.create({
            id_venta,
            monto_abono,
            fecha_abono
        }, { transaction: t });

        // Calcular nueva deuda de la venta tras el abono
        const nuevaDeudaVenta = deudaVenta - parseFloat(monto_abono);

        let nuevoMontoPendiente = parseFloat(deudor.monto_pendiente) - parseFloat(monto_abono);
        let nuevoMontoTotal = parseFloat(deudor.monto_total);

        // Si la deuda de la venta queda saldada, restar el total de la venta al monto_total y monto_pendiente del deudor
        if (nuevaDeudaVenta <= 0) {
            nuevoMontoTotal -= totalVenta;
            await Venta.update(
            { es_fiado: false },
            { where: { id_venta }, transaction: t }
            );
        }

        // Asegurar que los montos no sean negativos
        if (nuevoMontoPendiente < 0) nuevoMontoPendiente = 0;
        if (nuevoMontoTotal < 0) nuevoMontoTotal = 0;

        await Deudor.update(
            { monto_pendiente: nuevoMontoPendiente, monto_total: nuevoMontoTotal },
            { where: { dni_deudor }, transaction: t }
        );

        await t.commit();
        return abono;
    } catch (error) {
        await t.rollback();
        throw new BadRequestError(error.message || "Error al registrar el abono");
    }
}

export default { listarDeudores, eliminarPorDNI, buscarPorDNI, buscarPorNombreODNI, obtenerVentasFiadas, registrarAbono };