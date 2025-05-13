import Notificacion from "../models/Notificacion.js"
import {NotFoundError, BadRequestError, InternalServerError }from "../errors/Errores.js";
import productoEntidad from "../models/Producto.js";
import sugerenciaEntidad from "../models/Sugerencia.js";
import tipoNotiEntidad from "../models/TipoNotificacion.js";

async function registrarNotificacion(mensaje, idProducto, idTipoNotificacion, idSugerencia) {
    if(!mensaje  || !idTipoNotificacion){
        throw new BadRequestError("Los campos están vacios")
    }
    try{
        if(!idSugerencia){
            const producto = await productoEntidad.findByPk(idProducto);
            if(!producto){
                throw new NotFoundError("No se encontró el producto");
            }
        };
        if(!idProducto){
            const sugerencia = await sugerenciaEntidad.findByPk(idSugerencia);
            if(!sugerencia){
                throw new NotFoundError("No se encontró la sugerencia");
            }
        };
        const tipoNoti = await tipoNotiEntidad.findByPk(idTipoNotificacion);
        if(!tipoNoti){
            throw new NotFoundError("No se encontró el tipo de notificacion");
        }
        
        const notificacion = await Notificacion.create({
            mensaje: mensaje,
            fecha_creacion: new Date(),
            id_producto: idProducto,
            id_tipo: idTipoNotificacion,
            id_sugerencia: idSugerencia
        });
        return notificacion;
    }catch(error){
        throw error;
    }
};

export default {registrarNotificacion}
