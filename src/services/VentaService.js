import Venta from "../models/Venta.js"
//Aqui cuando se registre una venta modificar que no recorra todos los productos, sino solo los de la venta cuando ya se cree
import Producto from "../models/Producto.js"
import VentaLote from "../models/VentaLotes.js"
import DetalleVenta from "../models/DetalleVenta.js";
import Compra from "../models/Compra.js";
import Deudor from "../models/Deudor.js";
import { NotFoundError, InternalServerError, BadRequestError } from "../errors/Errores.js";
import { where } from "sequelize";
import NotificacionUsuarioService from "./NotificacionUsuarioService.js";
import UsuarioService from "./UsuarioService.js";
import NotificacionService from "./NotificacionService.js";
import { Op } from 'sequelize';
import PreferenciaNotificacionService from "./PreferenciaNotificacionService.js";

async function verificarStock() {
    try {
        const productos = await Producto.findAll({
            where: {
                cantidad: {
                    [Op.lt]: 5
                }
            }
        });
        if (productos) {
            //creo el mensaje
            let mensaje = mensajeDeProductos(productos);
            //creo notificacion general
            const nuevaNotificacion = await NotificacionService.registrarNotificacionStock(mensaje, "2");
            if (!nuevaNotificacion?.id_notificacion) {
                throw new InternalServerError('Error al crear notificación de stock general');
            };
            //por cada usuario creo la nfiticacion personal
            const usuarios = await UsuarioService.listar();
            for (const usuario of usuarios) {
                //miro primero su preferencia de notificacion stock
                const preferencia = await PreferenciaNotificacionService.saberPreferencia(usuario.dni, 2);
                if (preferencia) {
                    const nuevaNotiUsuario = await NotificacionUsuarioService.registrar(usuario.dni, nuevaNotificacion.id_notificacion);
                    if (!nuevaNotiUsuario) {
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
    for (const producto of productos) {
        mensaje += producto.nombre + ", "
    }
    //eliminar la ultima coma
    if (productos.length > 0) {
        mensaje = mensaje.slice(0, -2);
    }
    return mensaje;
}

async function agregarProductoAVentaTemporal({ nombreProducto, cantidad }) {
    const producto = await Producto.findOne({
        where: {
            nombre: nombreProducto,
            activo: true
        }
    });

    if (!producto) {
        throw new NotFoundError("Producto no encontrado o inactivo");
    }

    const lotes = await Compra.findAll({
        where: {
            id_producto: producto.id_producto,
            cantidad_disponible: { [sequelize.Op.gt]: 0 }
        },
        order: [['fecha_compra', 'ASC']]
    });

    if (!lotes.length) {
        throw new BadRequestError("Este producto no cuenta con unidades disponibles");
    }

    let cantidadRestante = cantidad;
    let costoTotal = 0;
    const detalleLotes = [];

    for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        const disponible = lote.cantidad_disponible;
        const aUsar = Math.min(disponible, cantidadRestante);

        costoTotal += aUsar * lote.precio;
        detalleLotes.push({
            id_compra: lote.id_compra,
            cantidad: aUsar,
            precio_compra: lote.precio
        });

        cantidadRestante -= aUsar;
    }

    if (cantidadRestante > 0) {
        throw new BadRequestError("Cantidad solicitada supera el stock disponible");
    }

    return {
        idProducto: producto.id_producto,
        nombreProducto: producto.nombre,
        cantidad,
        precioVenta: producto.precio_venta,
        total: producto.precio_venta * cantidad,
        costoTotal,
        detalleLotes
    };
}

async function registrarVenta({ productos, dni_usuario, deudor, es_fiado, fecha }) {

    if (!productos || productos.length === 0) {
        throw new BadRequestError("La venta debe contener al menos un producto");
    }

    return await sequelize.transaction(async (t) => {

        const total = productos.reduce((sum, p) => sum + (p.precioVenta * p.cantidad), 0);
        const nuevaVenta = await Venta.create({
            fecha_venta: fecha ? new Date(fecha) : new Date(),
            total,
            es_fiado,
            dni_usuario,
            dni_deudor: es_fiado ? deudor.dni : null
        }, { transaction: t });

        for (const producto of productos) {
            const detalle = await DetalleVenta.create({
                cantidad: producto.cantidad,
                precio_venta: producto.precioVenta,
                costo_total: producto.costoTotal,
                ganancia: (producto.precioVenta * producto.cantidad) - producto.costoTotal,
                id_venta: nuevaVenta.id_venta,
                id_producto: producto.idProducto
            }, { transaction: t });


            for (const lote of producto.detalleLotes) {
                await VentaLote.create({
                    id_detalle_venta: detalle.id_detalle_venta,
                    id_compra: lote.id_compra,
                    cantidad_usada: lote.cantidad,
                    precio_compra: lote.precio_compra
                }, { transaction: t });

                const compra = await Compra.findByPk(lote.id_compra);
                compra.cantidad_disponible -= lote.cantidad;
                await compra.save({ transaction: t });
            }
        }

        if (es_fiado && deudor?.dni && deudor?.nombre && deudor?.telefono) {
            const existente = await Deudor.findByPk(deudor.dni);

            if (existente) {
                existente.monto_total += total;
                existente.monto_pendiente += total;
                await existente.save({ transaction: t });
            } else {
                await Deudor.create({
                    dni_deudor: deudor.dni,
                    nombre: deudor.nombre,
                    telefono: deudor.telefono,
                    monto_total: total,
                    monto_pendiente: total,
                    pagado: false
                }, { transaction: t });
            }
        }
        await verificarStock();

        return nuevaVenta;
    });
}

async function obtenerVentasDelDia() {
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.setHours(0, 0, 0, 0));
    const finDelDia = new Date(hoy.setHours(23, 59, 59, 999));

    const cantidadVentas = await Venta.count({
        where: {
            fecha_venta: {
                [Op.between]: [inicioDelDia, finDelDia]
            }
        }
    });

    return cantidadVentas;
}



export default { registrarVenta, verificarStock, agregarProductoAVentaTemporal, obtenerVentasDelDia };