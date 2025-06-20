
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
import Compra from "../models/Compra.js";


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

    
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
    const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);

    const inicioUTC = new Date(Date.UTC(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        0, 0, 0, 0
    ));
    const finUTC = new Date(Date.UTC(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        23, 59, 59, 999
    ));

    const cantidadVentas = await Venta.count({
        where: {
            fecha_venta: {
                [Op.between]: [inicioUTC, finUTC]
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
                    attributes: ['cantidad', 'precio'],
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
        const detallesFormateados = detalles.detalle_venta.map(det => ({
            nombre_producto: det.producto?.nombre ?? 'Nombre no disponible',
            cantidad: det.cantidad,
            precio_unitario: det.precio,
            subtotal: det.cantidad * det.precio
        }));
        const total = calcularTotalVenta(detalles.detalle_venta);
        const abonoTotal = calcularTotalAbonos(detalles.abonos);
        const resultadoFinal = {
            fecha: detalles.fecha_venta,
            detallesVenta: detallesFormateados, // ya formateado con el nombre del producto
            deudor: detalles.deudor,
            totalVenta: total,
            abono: abonoTotal
        };


        return resultadoFinal;

    } catch (error) {
        throw error;

    }
}

function calcularTotalVenta(detalles) {
    let total = 0;
    detalles.forEach((detalle) => {
        total += (detalle.cantidad * detalle.precio);
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

// Obtener historial estadístico de ventas con abono, agrupando y calculando ganancia por producto
async function obtenerHistorialEstadisticoVentasConAbono() {
    // Traer todos los detalles de venta junto con la venta, producto y abonos
    const detalles = await DetalleVenta.findAll({
        include: [
            {
                model: Venta,
                attributes: ['es_fiado', 'id_venta'],
                include: [
                    {
                        model: Abono,
                        attributes: ['monto_abono', 'id_venta']
                    }
                ]
            },
            {
                model: Producto,
                attributes: ['nombre']
            }
        ],
        attributes: ['id_producto', 'cantidad', 'precio']
    });

    if (!Array.isArray(detalles)) {
        throw new InternalServerError("La consulta de detalles de venta no devolvió un arreglo.");
    }
    if (detalles.length === 0) {
        throw new NotFoundError("No se encontraron detalles de ventas con abono.");
    }

    // Agrupar por producto y precio de compra/venta
    const agrupados = {};

    for (const detalle of detalles) {
        if (!detalle || typeof detalle !== 'object') continue;
        if (!detalle.producto) continue;
        if (!detalle.ventum) continue;
        if (typeof detalle.id_producto === 'undefined' || typeof detalle.precio === 'undefined') continue;
        if (typeof detalle.cantidad !== 'number' || detalle.cantidad < 0) continue;

        // Obtener el precio de compra más reciente del producto mediante consulta
        let precioCompra = 0;
        try {
            const compraProducto = await sequelize.models.CompraProducto.findOne({
                where: { id_producto: detalle.id_producto },
                order: [['fecha_compra', 'DESC']]
            });
            if (compraProducto) {
                precioCompra = parseFloat(compraProducto.precio_compra) || 0;
            }
        } catch (e) {
            precioCompra = 0;
        }

        const key = `${detalle.id_producto}_${detalle.precio}_${precioCompra}`;
        if (!agrupados[key]) {
            agrupados[key] = {
                nombre: detalle.producto.nombre,
                cantidad: 0,
                precioVenta: detalle.precio,
                precioCompra: precioCompra,
                es_fiado: detalle.ventum.es_fiado,
                abonos: [],
                ganancia: 0
            };
        }
        agrupados[key].cantidad += detalle.cantidad;

        // Guardar abonos si es fiado
        if (detalle.ventum.es_fiado && Array.isArray(detalle.ventum.abonos)) {
            agrupados[key].abonos = agrupados[key].abonos.concat(detalle.ventum.abonos.map(a => parseFloat(a.monto_abono || 0)));
        }
    }

    // Calcular ganancia por producto
    let totalGanancia = 0;
    const productos = Object.values(agrupados).map(p => {
        let ganancia = 0;
        if (p.es_fiado) {
            // Si es fiado, la ganancia se calcula con la suma de abonos en vez del precio de venta
            const totalAbonos = p.abonos.reduce((sum, ab) => sum + ab, 0);
            ganancia = (totalAbonos - (p.precioCompra * p.cantidad));
        } else {
            ganancia = ((p.precioVenta - p.precioCompra) * p.cantidad);
        }
        totalGanancia += ganancia;
        return {
            nombre: p.nombre,
            cantidad: p.cantidad,
            precio: p.precioVenta,
            ganancia
        };
    });

    return {
        productos,
        totalGanancia
    };
}

// Margen de ganancia del mes

async function margenDeGananciaDelMes(fecha) {
    if (!fecha) {
        throw new BadRequestError("Debe proporcionar una fecha.");
    }
    const dateObj = new Date(fecha);
    if (isNaN(dateObj)) {
        throw new BadRequestError("Fecha inválida.");
    }
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth();

    // Rango de fechas del mes
    const inicioMes = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const finMes = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    // Entradas: ventas NO fiadas, pagadas, en el mes
    const entradas = await Venta.sum('total', {
        where: {
            es_fiado: false,
            fecha_venta: {
                [Op.between]: [inicioMes, finMes]
            }
        }
    }) || 0;

    // Salidas: suma del costo total de compras realizadas en el mes (precio unitario * cantidad)
    const salidasResult = await Compra.findAll({
        where: {
            fecha_compra: {
                [Op.between]: [inicioMes, finMes]
            }
        },
        attributes: [
            [sequelize.literal('SUM(precio * cantidad_agregar)'), 'total_salidas']
        ],
        raw: true
    });
    const salidas = salidasResult[0]?.total_salidas ? parseFloat(salidasResult[0].total_salidas) : 0;

    // Margen de negocio
    const margenNegocio = entradas - salidas;

    return {
        entradas,
        salidas,
        margenNegocio
    };
}

// Historial de margenes por año recibido
async function historialMargenesDeGanancia(anio) {
    if (!anio || isNaN(anio)) {
        throw new BadRequestError("Debe proporcionar un año válido.");
    }
    // Buscar ventas del año especificado
    const primeraVenta = await Venta.findOne({
        where: sequelize.where(sequelize.fn('YEAR', col('fecha_venta')), anio),
        order: [['fecha_venta', 'ASC']],
        attributes: ['fecha_venta'],
        raw: true
    });
    const ultimaVenta = await Venta.findOne({
        where: sequelize.where(sequelize.fn('YEAR', col('fecha_venta')), anio),
        order: [['fecha_venta', 'DESC']],
        attributes: ['fecha_venta'],
        raw: true
    });

    if (!primeraVenta || !primeraVenta.fecha_venta) {
        throw new NotFoundError("No hay ventas registradas para calcular historial de márgenes en el año indicado.");
    }

    const inicio = new Date(primeraVenta.fecha_venta);
    const fin = new Date(ultimaVenta.fecha_venta);

    // Generar lista de meses entre inicio y fin, solo para el año solicitado
    const meses = [];
    let actual = new Date(Date.UTC(anio, inicio.getUTCMonth(), 1));
    const finMes = new Date(Date.UTC(anio, fin.getUTCMonth(), 1));
    while (actual <= finMes) {
        meses.push(new Date(actual));
        actual.setUTCMonth(actual.getUTCMonth() + 1);
    }

    // Invertir el orden de los meses para que vayan del último al primero
    meses.reverse();

    const historial = [];
    let sumaMargenes = 0;

    for (const mes of meses) {
        const year = mes.getUTCFullYear();
        const month = mes.getUTCMonth();
        // Solo el nombre del mes, sin el año
        const nombreMes = mes.toLocaleString('es-ES', { month: 'long' });

        // Rango de fechas del mes
        const inicioMes = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        const finMes = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

        // Entradas: ventas NO fiadas, pagadas, en el mes
        const entradas = await Venta.sum('total', {
            where: {
                es_fiado: false,
                fecha_venta: {
                    [Op.between]: [inicioMes, finMes]
                }
            }
        }) || 0;

        // Salidas: suma del costo total de compras realizadas en el mes (precio unitario * cantidad)
        const salidasResult = await Compra.findAll({
            where: {
                fecha_compra: {
                    [Op.between]: [inicioMes, finMes]
                }
            },
            attributes: [
                [sequelize.literal('SUM(precio * cantidad_agregar)'), 'total_salidas']
            ],
            raw: true
        });
        const salidas = salidasResult[0]?.total_salidas ? parseFloat(salidasResult[0].total_salidas) : 0;

        const margenNegocio = entradas - salidas;
        sumaMargenes += margenNegocio;

        historial.push({
            mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
            margenNegocio
        });
    }

    const promedioMensual = historial.length > 0 ? (sumaMargenes / historial.length) : 0;

    return {
        historial,
        promedioMensual
    };
}

async function obtenerHistorialVentas() {
    try {
        const ventas = await Venta.findAll({
            attributes: ['id_venta', 'fecha_venta', 'total', 'es_fiado'],
            include: [
                {
                    model: Abono,
                    attributes: ['monto_abono']
                }
            ],
            order: [['fecha_venta', 'DESC']]
        });
        if (!ventas || ventas.length === 0) {
            throw new NotFoundError("No se hay ventas registradas.");
        }

        const ventasConAbonos = ventas.map(venta => {
            const abonos = venta.abonos || [];
            const totalAbonos = abonos.reduce((sum, abono) => sum + parseFloat(abono.monto_abono || 0), 0);
            return {
                ...venta.toJSON(),
                es_fiado: venta.es_fiado,
                totalAbonos
            };
        });

        const totalGeneral = ventasConAbonos.reduce((sum, v) => {
            if (v.es_fiado) {
                return sum + parseFloat(v.totalAbonos || 0);
            } else {
                return sum + parseFloat(v.total || 0);
            }
        }, 0);
        return {
            totalGeneral,
            ventas: ventasConAbonos
        };
    } catch (error) {
        throw new InternalServerError("Error al obtener el historial de ventas.");
    }
}


async function filtrarVentasPorFecha(fechaInicio, fechaFin) {
    const fechaInicioObj = new Date(fechaInicio + 'T00:00:00');
    const fechaFinObj = new Date(fechaFin + 'T23:59:59');

    fechaInicioObj.setMinutes(fechaInicioObj.getMinutes() - fechaInicioObj.getTimezoneOffset());
    fechaFinObj.setMinutes(fechaFinObj.getMinutes() - fechaFinObj.getTimezoneOffset());
    try {
        const ventas = await Venta.findAll({
            where: {
                fecha_venta: {
                    [Op.between]: [fechaInicioObj, fechaFinObj]
                }
            }, include: [
                {
                    model: Abono,
                    attributes: ['monto_abono']
                }
            ],
            order: [['fecha_venta', 'DESC']]
        });
        if (!ventas || ventas.length === 0) {
            throw new NotFoundError("No se hay ventas registradas.");
        }

        const ventasConAbonos = ventas.map(venta => {
            const abonos = venta.abonos || [];
            const totalAbonos = abonos.reduce((sum, abono) => sum + parseFloat(abono.monto_abono || 0), 0);
            return {
                ...venta.toJSON(),
                es_fiado: venta.es_fiado,
                totalAbonos
            };
        });

        const totalGeneral = ventasConAbonos.reduce((sum, v) => {
            if (v.es_fiado) {
                return sum + parseFloat(v.totalAbonos || 0);
            } else {
                return sum + parseFloat(v.total || 0);
            }
        }, 0);
        return {
            totalGeneral,
            ventas: ventasConAbonos
        };
    } catch (error) {
        throw new InternalServerError("Error al obtener el historial de ventas.");
    }
}

async function obtenerDetalleVentas(idVenta) {
    if (!idVenta) {
        throw new BadRequestError("El id de la venta no puede ser vacío.");
    }

    const venta = await Venta.findOne({
        where: { id_venta: idVenta },
        include: [
            {
                model: DetalleVenta,
                include: [
                    {
                        model: Producto,
                        attributes: ['id_producto', 'nombre', 'precio_venta']
                    }
                ]
            }
        ]
    });

    if (!venta) {
        throw new NotFoundError("Venta no encontrada.");
    }
    return calcularTotales(venta);

}

function calcularTotales(ventas) {
    let totalGeneral = 0;
    const ventasArray = Array.isArray(ventas) ? ventas : [ventas];
    const ventasConTotales = ventasArray.map(venta => {
        totalGeneral += Number(venta.total);
        return {
            ...venta.toJSON()
        };
    });

    return {
        totalGeneral,
        ventas: ventasConTotales
    };
}


export default {
    registrarVenta,
    verificarStock,
    agregarProductoAVentaTemporal,
    obtenerVentasDelDia,
    obtenerTop3ProductosMasVendidosDeLaSemana,
    detallesDeUnaVentaFiada,
    obtenerHistorialEstadisticoVentasConAbono,
    margenDeGananciaDelMes,
    historialMargenesDeGanancia,
    obtenerHistorialVentas,
    filtrarVentasPorFecha,
    obtenerDetalleVentas
};
