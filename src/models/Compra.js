import dataTypes from "sequelize/lib/data-types";
import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Producto from "./Producto.js";
import Usuario from "./Usuario.js";

const Compra = db.define("compra", {
    id_compra: { type: dataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    cantidad_agregar: {type: DataTypes.INTEGER, allowNull: false}, 
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false},
    fecha_compra: { type: DataTypes.DATE, allowNull: false},
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relacion con Producto
Producto.hasMany(Compra, {
    foreignKey: "id_producto"
});
Compra.belongsTo(Producto, {
    foreignKey: "id_producto"
});

//relacion con Usuario
Usuario.hasMany(Compra, {
    foreignKey: "dni_usuario"
});
Compra.belongsTo(Usuario, {
    foreignKey: "dni_usuario"
});

export default Compra;