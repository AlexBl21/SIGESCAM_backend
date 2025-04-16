import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Usuario from "./Usuario.js";
import Deudor from "./Deudor.js";

const Abono = db.define("abono", {
    id_abono: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    monto_abono: { type: DataTypes.DECIMAL(10, 2), allowNull: false}, 
    fecha_abono: { type: DataTypes.DATE, allowNull: false}, 
}, {
    timestamps: false, 
    freezeTableName: true
});

//relación con Usuario
Usuario.hasMany(Abono, {
    foreignKey: "dni_usuario"
});

Abono.belongsTo(Usuario, {
    foreignKey: "dni_usuario"
});

//relación Deudor
Deudor.hasMany(Abono, {
    foreignKey: "dni_deudor",
    as: "abonos"
});

Abono.belongsTo(Deudor, {
    foreignKey: "dni_deudor",
});

export default Abono;
