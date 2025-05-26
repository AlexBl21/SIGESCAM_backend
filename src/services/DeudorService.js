import Deudor from "../models/Deudor.js";
import { NotFoundError } from "../errors/Errores.js";
import Deudor from "../models/Deudor.js";
import Venta from "../models/Venta.js";
import Abono from "../models/Abono.js";
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
        if(!deudores){
            throw new NotFoundError("No se encontraron deudores")
        }
        return deudores;
    } catch (error) {
        throw error;
    }
};


export default {listarDeudores, buscarPorDNI};