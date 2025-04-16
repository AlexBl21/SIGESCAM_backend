import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Rol from "./Rol.js";
import Usuario from "./Usuario.js";

const UsuarioRol = db.define("usuario_rol", {
    id: { type: DataTypes.STRING(20), primaryKey: true}
},{
    timestamps: false,
    freezeTableName: true
});

//relacion con Rol
Rol.hasMany(UsuarioRol, {
    foreignKey: "id_rol" 
});

UsuarioRol.belongsTo(Rol, {
    foreignKey: "id_rol"
});

//relacion con Usuario
Usuario.hasMany(UsuarioRol, {
    foreignKey: "id_usuario"
});

UsuarioRol.belongsTo(Usuario, {
    foreignKey: "id_usuario"
});

export default UsuarioRol;
