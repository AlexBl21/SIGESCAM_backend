import { DataTypes } from "sequelize";
import db from "../db/db.js";

const Usuario = db.define("usuario", {
    dni: { type: DataTypes.STRING(20), primaryKey: true},
    nombre: { type: DataTypes.STRING(100), allownull: false}, 
    email: { type: DataTypes.STRING(100), allowNull: false},
    contrasena: {type: DataTypes.STRING(250), allowNull: false}, 
    foto: {type: DataTypes.STRING(255)}
}, {
    timestamps: false, 
    freezeTableName: true
});

export default Usuario;