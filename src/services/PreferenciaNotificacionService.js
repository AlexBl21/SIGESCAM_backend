import UsuarioService from "./UsuarioService.js";
import TipoNotificacion from "../models/TipoNotificacion.js";
import { NotFoundError, BadRequestError, Conflict, InternalServerError } from "../errors/Errores.js";
import PreferenciaNotificacion from "../models/PreferenciaNotificacion.js";

async function registrar(dni, idTipoNoti) {
    if(!dni || !idTipoNoti){
        throw new BadRequestError("Los datos no pueden estar vacíos");
    }
    try {
        const dniUser = await UsuarioService.buscarPorId(dni);
        if(!dniUser){
            throw new NotFoundError("El usuario no se encontró");
        }
        const tipoNoti = await TipoNotificacion.findByPk(idTipoNoti);
        if(!tipoNoti){
            throw new NotFoundError("Tipo de notificacion no encontrada")
        }
        const preferencia = await PreferenciaNotificacion.create({
            id_tipo_notificacion: idTipoNoti,
            id_usuario: dni
        });
        return preferencia;
    } catch (error) {
        throw error;
    }
};

async function saberPreferencia(dni, tipoNoti) {
    if(!dni || !tipoNoti){
        throw new BadRequestError("dni o tipo noti vacíos");
    }
    try{
        const preferencia = await PreferenciaNotificacion.findOne({
            where: {
                id_tipo_notificacion: tipoNoti,
                id_usuario: dni
            }
        })
        if(!preferencia){
            throw new NotFoundError("No se encontró la referencia")
        }
        return preferencia ? preferencia.activa : null;
    }catch(error){
        throw error;
    }
};

async function cambiarPreferencia(dni, tipoNoti, estado) {
    try {
        const preferencia = await PreferenciaNotificacion.findOne({
            where: {
                id_tipo_notificacion: tipoNoti,
                id_usuario: dni
            }
        });
        if(!preferencia){
            throw new NotFoundError("no se encntró a preferencia");
        }

        preferencia.activa = estado;
        await preferencia.save({ fields: ['activa'] });
        return preferencia;
    } catch (error) {
        throw error;
    }
}
export default {registrar, saberPreferencia, cambiarPreferencia};