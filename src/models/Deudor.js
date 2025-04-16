import db from "../db/db.js";
import { DataTypes } from "sequelize";

const Deudor = db.define("deudor", {
    dni_deudor: { type: DataTypes.STRING(20), primaryKey: true},
    nombre: { type: DataTypes.STRING(100), allowNull: false},
    telefono: { type: DataTypes.STRING(20)},
    monto_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false}, 
    monto_pendiente: { type: DataTypes.DECIMAL(10, 2), allowNull: false}, 
    pagado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
    timestamps: false, 
    freezeTableName: true
});

export default Deudor;