import Venta from "../models/Venta.js"
//Aqui cuando se registre una venta modificar que no recorra todos los productos, sino solo los de la venta cuando ya se cree
import Producto from "../models/Producto.js"
import DetalleVenta from "../models/DetalleVenta.js";
import Deudor from "../models/Deudor.js";
import { NotFoundError, InternalServerError, BadRequestError } from "../errors/Errores.js";
import { where } from "sequelize";
import NotificacionUsuarioService from "./NotificacionUsuarioService.js";
import UsuarioService from "./UsuarioService.js";
import NotificacionService from "./NotificacionService.js";
import { Op, fn, col, literal } from 'sequelize';
import PreferenciaNotificacionService from "./PreferenciaNotificacionService.js";
import sequelize from "../db/db.js";
import Abono from "../models/Abono.js";


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

    if (producto.cantidad <= 0) {
        throw new BadRequestError("Este producto no cuenta con unidades disponibles");
    }

    if (producto.cantidad <= 0) {
        throw new BadRequestError("Este producto no cuenta con unidades disponibles");
    }

    if (cantidad > producto.cantidad) {
        throw new BadRequestError("Cantidad solicitada supera el stock disponible");
    }

    return {
        idProducto: producto.id_producto,
        nombreProducto: producto.nombre,
        cantidad,
        precioVenta: producto.precio_venta,
        total: producto.precio_venta * cantidad,
    };
}

async function registrarVenta({ productos, dni_usuario, deudor, es_fiado, fecha }) {
    if (!productos || productos.length === 0) {
        throw new BadRequestError("La venta debe contener al menos un producto");
    }

    return await sequelize.transaction(async (t) => {
        let deudorDB = null;

        if (es_fiado) {
            if (!deudor?.dni || !deudor?.nombre || !deudor?.telefono) {
                throw new BadRequestError("Se debe completar todos los datos del deudor.");
            }
            deudorDB = await Deudor.findOne({
                where: { dni_deudor: deudor.dni },
                transaction: t
            });
            console.log("Deudor encontrado:", deudorDB);
            if (!deudorDB) {
                deudorDB = await Deudor.create({
                    dni_deudor: deudor.dni,
                    nombre: deudor.nombre,
                    telefono: deudor.telefono,
                    monto_total: 0,
                    monto_pendiente: 0,
                    pagado: false
                }, { transaction: t });
            }
        }


        const total = productos.reduce((sum, p) => sum + (p.precioVenta * p.cantidad), 0);
        console.log("Total de la venta:", total);
        const nuevaVenta = await Venta.create({
            fecha_venta: fecha ? new Date(fecha) : new Date(),
            total,
            es_fiado,
            dni_usuario,
            dni_deudor: es_fiado ? deudorDB.dni_deudor : null
        }, { transaction: t });


        if (es_fiado) {
            deudorDB.monto_total = Number(deudorDB.monto_total) + Number(total);
            deudorDB.monto_pendiente = Number(deudorDB.monto_pendiente) + Number(total);
            await deudorDB.save({ transaction: t });
        }

        for (const producto of productos) {
            const detalle = await DetalleVenta.create({
                cantidad: producto.cantidad,
                precio: producto.precioVenta,
                id_venta: nuevaVenta.id_venta,
                id_producto: producto.idProducto
            }, { transaction: t });

            const productoDB = await Producto.findByPk(producto.idProducto);
            productoDB.cantidad -= producto.cantidad;
            await productoDB.save({ transaction: t });
        }

        await verificarStock();

        return nuevaVenta;
    });
}

async function obtenerVentasDelDia() {
    const hoy = new Date();

    const inicioDelDiaUTC = new Date(Date.UTC(
        hoy.getUTCFullYear(),
        hoy.getUTCMonth(),
        hoy.getUTCDate(),
        0, 0, 0, 0
    ));

    const finDelDiaUTC = new Date(Date.UTC(
        hoy.getUTCFullYear(),
        hoy.getUTCMonth(),
        hoy.getUTCDate(),
        23, 59, 59, 999
    ));

    const cantidadVentas = await Venta.count({
        where: {
            fecha_venta: {
                [Op.between]: [inicioDelDiaUTC, finDelDiaUTC]
            }
        }
    });

    return cantidadVentas;
}

async function obtenerTop3ProductosMasVendidosDeLaSemana() {
    const hoy = new Date();


    const diaSemana = hoy.getUTCDay();
    const diffALunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const inicioSemanaUTC = new Date(Date.UTC(
        hoy.getUTCFullYear(),
        hoy.getUTCMonth(),
        hoy.getUTCDate() - diffALunes,
        0, 0, 0, 0
    ));

    const finSemanaUTC = new Date(Date.UTC(
        inicioSemanaUTC.getUTCFullYear(),
        inicioSemanaUTC.getUTCMonth(),
        inicioSemanaUTC.getUTCDate() + 6,
        23, 59, 59, 999
    ));

    const resultados = await DetalleVenta.findAll({
        attributes: [
            'id_producto',
            [fn('SUM', col('detalle_venta.cantidad')), 'total_vendido']
        ],
        include: [
            {
                model: Venta,
                required: true,
                attributes: [],
                where: {
                    fecha_venta: {
                        [Op.between]: [inicioSemanaUTC, finSemanaUTC]
                    }
                }
            },
            {
                model: Producto,
                required: true,
                attributes: ['nombre']
            }
        ],
        group: ['detalle_venta.id_producto', 'producto.id_producto', 'producto.nombre'],
        order: [[literal('total_vendido'), 'DESC']],
        limit: 3
    });

    return resultados.map(r => ({
        idProducto: r.id_producto,
        nombre: r.producto.nombre,
        totalVendido: Number(r.get('total_vendido'))
    }));
}


//listar ventas fiadas (sin pagar) del deudor
async function ventasFiadas(dni_deudor) {
    try {
        const ventasConDeuda = await Venta.findAll({
            where: {
                dni_deudor: dni_deudor,
                es_fiado: true
            },
            include: [
                {
                    model: Abono,
                    attributes: ['id_abono', 'monto_abono', 'fecha_abono']
                }
            ],
            attributes: ['id_venta', 'total', 'es_fiado', 'fecha_venta']
        });

        if (!ventasConDeuda || ventasConDeuda.length === 0) {
            throw new Error("No se encontraron deudas para el cliente");
        }
        // Procesar cada venta para calcular monto pendiente
        const resultado = ventasConDeuda.map(venta => {
            const totalVenta = parseFloat(venta.total);
            const sumaAbonos = venta.abonos.reduce((acc, abono) => acc + parseFloat(abono.monto_abono), 0);
            const montoPendiente = totalVenta - sumaAbonos;

            return {
                id_venta: venta.id_venta,
                fecha_venta: venta.fecha_venta,
                monto_pendiente: montoPendiente
            };
        });

        return resultado;
    } catch (error) {
        throw {
            message: "Error al obtener ventas fiadas",
            error: error.message
        };
    }
}

//Obtener detalles de cierta venta, solo para fiadas
async function detallesDeUnaVentaFiada(idVenta) {
    if (!idVenta) {
        throw new BadRequestError("El id de la vena no puede ser vacio.");
    }
    try {
        const detalles = await Venta.findOne({
            where: { id_venta: idVenta },
            attributes: ['fecha_venta'],
            include: [
                {
                    model: DetalleVenta,
                    attributes: ['cantidad', 'precio_venta'],
                    include: [
                        {
                            model: Producto,
                            attributes: ['nombre']
                        }
                    ]
                },
                {
                    model: Deudor,
                    attributes: ['dni_deudor', 'nombre', 'telefono']
                },
                {
                    model: Abono,
                    attributes: ['monto_abono']
                }
            ]
        });
        if (!detalles) {
            throw new NotFoundError("No se encontraron detalles de esa venta");
        }
        const total = calcularTotalVenta(detalles.detalle_venta);
        const abonoTotal = calcularTotalAbonos(detalles.abonos);
        const resultadoFinal = {
            fecha: detalles.fecha_venta,
            detallesVenta: detalles.detalle_venta,
            deudor: detalles.deudor,
            totalVenta: total,
            abono: abonoTotal
        }

        return resultadoFinal;

    } catch (error) {
        throw error;

    }
}

function calcularTotalVenta(detalles) {
    let total = 0;
    detalles.forEach((detalle) => {
        total += (detalle.cantidad * detalle.precio_venta);
    });
    return total;
};

function calcularTotalAbonos(abonos) {
    let total = 0;
    abonos.forEach((abono) => {
        total += parseFloat(abono.monto_abono);
    });
    return total;
}

// Obtener historial estadístico de ventas con abono

export default {
    registrarVenta, verificarStock, agregarProductoAVentaTemporal, obtenerVentasDelDia, obtenerTop3ProductosMasVendidosDeLaSemana, ventasFiadas,
    detallesDeUnaVentaFiada
};
