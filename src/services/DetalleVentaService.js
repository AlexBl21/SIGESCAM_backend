import DetalleVenta from "../models/DetalleVenta.js";
import { BadRequestError, NotFoundError } from "../errors/Errores.js";
import Venta from "../models/Venta.js";
import Producto from "../models/Producto.js";
import Deudor from "../models/Deudor.js";

//no usar para ventas normales porque esas no tienen deudor asociado
async function detallesDeUnaVentaFiada(idVenta) {
    if(!idVenta){
        throw new BadRequestError("El id de la vena no puede ser vacio.");
    }
    try {
        const detalles = await DetalleVenta.findAll({
            where: { id_venta: idVenta },
            attributes: ['cantidad', 'precio_venta'],
            include: [
            {
            model: Venta,
                attributes: ['fecha_venta'],
                include: [
                {
                    model: Deudor,
                    attributes: ['dni_deudor', 'nombre', 'telefono']
                }
                ]
          
            },
            {
              model: Producto,
              attributes: [ 'nombre']    
            }
      ]
    });
    if(!detalles){
        throw new NotFoundError("No se encontraron detalles de esa venta");
    }
    // Procesar cada detalle
        const resultado = detalles.map(detalle => {
            const totalVenta = parseFloat(detalle.cantidad * detalle.precio_venta);
            return {
                fecha: detalle.ventum.fecha_venta,
                nombre_deudor: detalle.ventum.deudor.nombre,
                dni_deudor: detalle.ventum.deudor.dni_deudor,
                telefono_deudor: detalle.ventum.deudor.telefono,
                precio_venta: detalle.precio_venta,
                nombre_producto: detalle.producto.nombre
            };
        });
        const infoGeneral = {

        }
    return detalles;
        
    } catch (error) {
        throw error;
        
    }
}

export default {detallesDeUnaVentaFiada};