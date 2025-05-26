import Deudor from "../models/Deudor.js";

async function buscarPorDNI(dni) {
    const deudor = await Deudor.findByPk(dni);
    return deudor || null;
}

export default { buscarPorDNI };