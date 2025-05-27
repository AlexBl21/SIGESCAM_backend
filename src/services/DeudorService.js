import Deudor from "../models/Deudor.js";
import { NotFoundError } from "../errors/Errores.js";
import { Sequelize, Op } from "sequelize";

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
}


export default { listarDeudores, buscarPorDNI, buscarPorNombreODNI };