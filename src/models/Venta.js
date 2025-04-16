import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Usuario from "./Usuario.js";
import Deudor from "./Deudor.js";

const Venta = db.define("venta", {
    id_venta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, 
    fecha_venta: { type: DataTypes.DATE, allowNull: false}, 
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false}, 
    es_fiado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
}, {
    timestamps: false,
    freezeTableName: true
});

//relacion con Usuario
Usuario.hasMany(Venta, {
    foreignKey: "dni_usuario", 
    as: "ventas"
});

Venta.belongsTo(Usuario, {
    foreignKey: "dni_usuario"
});

//Relacion con deudor
Deudor.hasMany(Venta, {
    foreignKey: "dni_deudor", 
});

Venta.belongsTo(Deudor, {
    foreignKey: "dni_deudor"
});

export default Venta;