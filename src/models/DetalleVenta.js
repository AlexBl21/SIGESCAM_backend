import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Venta from "./Venta.js";
import Producto from "./Producto.js";

const DetalleVenta = db.define("detalle_venta",{
    id_detalle_venta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    cantidad: { type: DataTypes.INTEGER, allowNull: false}, 
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false}, 
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relacion con Venta
Venta.hasMany(DetalleVenta, {
    foreignKey: "id_venta"
});

DetalleVenta.belongsTo(Venta, {
    foreignKey: "id_venta"
}); 

//Relacion con Producto
Producto.hasMany(DetalleVenta, {
    foreignKey: "id_producto"
});

DetalleVenta.belongsTo(Producto, {
    foreignKey: "id_producto"
});

export default DetalleVenta;