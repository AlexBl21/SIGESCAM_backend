import ventaEntidad from "../models/Venta.js"
//Aqui cuando se registre una venta modificar que no recorra todos los productos, sino solo los de la venta cuando ya se cree
import Producto from "../models/Producto.js"
import { NotFoundError, InternalServerError } from "../errors/Errores.js";
import { where } from "sequelize";
import NotificacionUsuarioService from "./NotificacionUsuarioService.js";
import UsuarioService from "./UsuarioService.js";
import NotificacionService from "./NotificacionService.js";
import { Op } from 'sequelize';
import PreferenciaNotificacionService from "./PreferenciaNotificacionService.js";
async function registrarVenta() {
    
}

async function verificarStock() {
    try {
            const productos = await Producto.findAll({
            where: {
                cantidad: {
                [Op.lt]: 5
                }
            }
            });
        if(productos){
            //creo el mensaje
            let mensaje = mensajeDeProductos(productos);
            //creo notificacion general
            const nuevaNotificacion =await NotificacionService.registrarNotificacionStock(mensaje, "2");
            if (!nuevaNotificacion?.id_notificacion) {
                throw new InternalServerError ('Error al crear notificación de stock general');
            };
            //por cada usuario creo la nfiticacion personal
            const usuarios = await UsuarioService.listar();
            for(const usuario of usuarios){
                    //miro primero su preferencia de notificacion stock
                    const preferencia = await PreferenciaNotificacionService.saberPreferencia(usuario.dni, 2);
                    if(preferencia){
                        const nuevaNotiUsuario= await NotificacionUsuarioService.registrar(usuario.dni , nuevaNotificacion.id_notificacion);
                        if(!nuevaNotiUsuario){
                            throw new InternalServerError("no se pudo crear Notificacion Usuario correctamente");
                        }
                    }
            }
            
        }
    } catch (error) {
        throw error;
    }
}

function mensajeDeProductos(productos) {
    let mensaje = `Productos bajos en stock: `
    for(const producto of productos){
        mensaje += producto.nombre + ", " 
    }
    //eliminar la ultima coma
    if (productos.length > 0) {
        mensaje = mensaje.slice(0, -2);
    }
    return mensaje;
}

export default {registrarVenta, verificarStock};