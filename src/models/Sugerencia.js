import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Usuario from "./Usuario.js";

const Sugerencia = db.define("sugerencia", {
    id_sugerencia: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    nombre_producto: { type: DataTypes.STRING(60), allownull: false}, 
    descripcion: { type: DataTypes.STRING(100), allownull: false}, 
    fecha_registro: { type: DataTypes.DATE, allowNull: false},
    estado: { type: DataTypes.STRING(15), allowNull: false},
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relaion con Usuario
Usuario.hasMany(Sugerencia, {
    foreignKey: "dni_usuario_registro"
});
Sugerencia.belongsTo(Usuario, {
    foreignKey: "dni_usuario_registro"
});

export default Sugerencia;