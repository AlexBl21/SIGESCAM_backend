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
            fecha_registro: new Date(),
            estado: "pendiente"
        });
        return sugerencia;
    } catch (error) {
        throw error;
    };
};

async function listar() {
    try {
        const sugerencias = await sugerenciaEntidad.findAll();
        if(!sugerencias){
            throw new NotFoundError("No se encontraron sugerencias");
        }
        return sugerencias;
    } catch (error) {
        throw error;
    }
};

//cambiar estado de una sugerencia
async function cambiarEstado(id, estado) {
    try {
        const sugerencia = await sugerenciaEntidad.findByPk(id);
        if(!sugerencia){
            throw new NotFoundError("No se encontró la sugerencia");
        }
        sugerencia.estado = estado;
        await sugerencia.save({field: ['estado']});
        return sugerencia;
    } catch (error) {
        throw error;
    };
}

export default {registrar, listar, cambiarEstado};