import {NotFoundError, BadRequestError, InternalServerError }from "../errors/Errores.js";
import notiUsuarioEntidad from "../models/NotificacionUsuario.js";
import usuarioEntidad from "../models/Usuario.js"
import notificacionEntidad from "../models/Notificacion.js";
import NotificacionUsuario from "../models/NotificacionUsuario.js";
import Rol from "../models/Rol.js";
import TipoNotificacion from "../models/TipoNotificacion.js";
async function registrar(idUsuario, idNotificacion) {
    if(!idUsuario || !idNotificacion){
        throw new BadRequestError("los campos no pueden ser vacios");
    }
    try {
        const usuario = await usuarioEntidad.findByPk(idUsuario);
        if(!usuario){
            throw new NotFoundError("No se encontró el usuario");
        }
        const notificacion = await notificacionEntidad.findByPk(idNotificacion);
        if(!notificacion){
            throw new NotFoundError("No se encontró la notificacion");
        };
        const notiUsuario = await NotificacionUsuario.create({
            id_notificacion: idNotificacion,
            id_usuario: idUsuario
        });
        return notiUsuario;
    } catch (error) {
        throw error;
    }
}

async function listarParaGestoras(dni) {
    try {
        const notificaciones = await NotificacionUsuario.findAll({
        include: [
            {
                model: usuarioEntidad,
                where: {
                    dni: dni,
                },
                include: [
                    {
                        model: Rol,
                        where: {
                            id: 'Gestor de ventas' 
                        }
                    }
                ]
            },
            {
                model: notificacionEntidad,
                include: [
                    {
                        model: TipoNotificacion,
                    }
                ]
            }
        ]
    })
    if(!notificaciones){
        throw new NotFoundError("No se encontraron notificaiones");
    }
    return notificaciones.map((notificacionUser) => {
            return {
                id: notificacionUser.id,
                descripcion: notificacionUser.notificacion.mensaje,
                leida: notificacionUser.leida,
                usuario_dni: notificacionUser.id_usuario,
                id_notificacion: notificacionUser.notificacion.id_notificacion
            }
        });
    } catch (error) {
        throw error;
    }
    
};

async function cambiarEstado(id) {
    if(!id){
        throw new BadRequestError("el id es vacío");
    }
    try {
        const nofiUsuario = await notiUsuarioEntidad.findByPk(id);
        if(!nofiUsuario){
            throw new NotFoundError("No se encontró la notificacion del usuario");
        }
        nofiUsuario.leida = true;
        await nofiUsuario.save({field:['leida'] });
        return nofiUsuario;
    } catch (error) {
        throw error;
    }
};

async function listarParaAdministradora(dni) {
    try {
        const notificaciones = await NotificacionUsuario.findAll({
        include: [
            {
                model: usuarioEntidad,
                where: {
                    dni: dni,
                },
                include: [
                    {
                        model: Rol,
                        where: {
                            id: 'Administrador' 
                        }
                    }
                ]
            },
            {
                model: notificacionEntidad,
                include: [
                    {
                        model: TipoNotificacion,
                        where: {
                            nombre: 'stock' 
                        }
                    }
                ]
            }
        ]
    })
    if(!notificaciones){
        throw new NotFoundError("No se encontraron notificaiones");
    }
    return notificaciones.map((notificacionUser) => {
            return {
                id: notificacionUser.id,
                descripcion: notificacionUser.notificacion.mensaje,
                leida: notificacionUser.leida,
                usuario_dni: notificacionUser.id_usuario,
                id_notificacion: notificacionUser.notificacion.id_notificacion
            }
        });
    } catch (error) {
        throw error;
    }
    
}

export default {registrar, listarParaGestoras, cambiarEstado, listarParaAdministradora}