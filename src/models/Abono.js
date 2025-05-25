import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Venta from "./Venta.js";

const Abono = db.define("abono", {
    id_abono: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    monto_abono: { type: DataTypes.DECIMAL(10, 2), allowNull: false}, 
    fecha_abono: { type: DataTypes.DATE, allowNull: false}, 
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relacion con venta, abono a qué venta 
Venta.hasMany(Abono, {
    foreignKey: "id_venta"
});
Abono.belongsTo(Venta, {
    foreignKey: "id_venta"
})

export default Abono;
