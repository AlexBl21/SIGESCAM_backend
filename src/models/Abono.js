import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Usuario from "./Usuario.js";

const Abono = db.define("abono", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    monto_abono: { type: DataTypes.DECIMAL(10, 2), allowNull: false}, 
    fecha_abono: { type: DataTypes.DATE, allowNull: false}, 
});

//relación con Usuario
Usuario.hasMany(Abono, {
    foreignKey: "dni_usuario"
});

Abono.belongsTo(Usuario, {
    foreignKey: "dni_usuario"
});

export default Abono;
