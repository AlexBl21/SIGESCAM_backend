import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Notificacion from "./Notificacion.js";
import Usuario from "./Usuario.js";

const NotificacionUsuario = db.define("notificacion_usuario", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    leida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relacion con notificacion
Notificacion.hasMany(NotificacionUsuario, {
    foreignKey: "id_notificacion"
});
NotificacionUsuario.belongsTo(Notificacion, {
    foreignKey: "id_notificacion"
});

//Relacion con Usuario
Usuario.hasMany(NotificacionUsuario, {
    foreignKey: "id_usuario"
});
NotificacionUsuario.belongsTo(Usuario, {
     foreignKey: "id_usuario"
});

export default NotificacionUsuario;