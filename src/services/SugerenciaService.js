import sugerenciaEntidad from "../models/Sugerencia.js";
import {NotFoundError, BadRequestError, InternalServerError }from "../errors/Errores.js";

async function registrar(nombreProducto, descripcion) {
    if(!nombreProducto || !descripcion){
        throw new BadRequestError("Los campos nombre y descripcion no pueden estar vacios");
    }
    try {
        const sugerencia = await sugerenciaEntidad.create({
            nombre_producto: nombreProducto, 
            descripcion: descripcion, 
            fecha_registro: new Date()
        });
        return sugerencia;
    } catch (error) {
        throw error;
    };
};

async function listarNoClasificadas() {
    try {
        const sugerencias=  await sugerenciaEntidad.findAll({
            where:{
                estado: false,
                clasificada: false
            }
        });
        return sugerencias;
    } catch (error) {
        throw new InternalServerError("Error al obtener las sugerencias" + error.message);
    }
};

async function listarAceptadas() {
    try {
        const sugerencias = await sugerenciaEntidad.findAll({
            where: {
                estado: true,
                clasificada: true
            }
        });
        return sugerencias;
    } catch (error) {
        throw new InternalServerError("Error al obtener las sugerencias" + error.message);
    }
};

//listar rechazadas 
async function listarRechazadas() {
    try {
        const sugerencias = await sugerenciaEntidad.findAll({
            where: {
                estado: false,
                clasificada: true
            }
        });
        return sugerencias;
    } catch (error) {
        throw new InternalServerError("Error al encontrar las sugerencias" + error.message);
    }
}
export default {registrar, listarNoClasificadas, listarAceptadas, listarRechazadas};