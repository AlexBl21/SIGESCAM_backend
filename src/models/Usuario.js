import { DataTypes } from "sequelize";
import db from "../db/db.js";
import Rol from "./Rol.js";

const Usuario = db.define("usuario", {
    dni: { type: DataTypes.STRING(20), primaryKey: true},
    nombre: { type: DataTypes.STRING(100), allownull: false}, 
    email: { type: DataTypes.STRING(100), allowNull: false},
    contrasena: {type: DataTypes.STRING(250)}, 
    telefono: {type: DataTypes.STRING(20)},
    estado: {type: DataTypes.BOOLEAN, defaultValue: true}
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relacion con Rol
Rol.hasMany(Usuario,{
    foreignKey: "id_rol"
});
Usuario.belongsTo(Rol, {
    foreignKey: "id_rol"
});

export default Usuario;