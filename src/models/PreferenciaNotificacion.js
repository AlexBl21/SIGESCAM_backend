import db from "../db/db.js";
import { DataTypes } from "sequelize";
import TipoNotificacion from "./TipoNotificacion.js";
import Usuario from "./Usuario.js";

const PreferenciaNotificacion = db.define("preferencia_notificacion", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relacion con tipo Notificacion
TipoNotificacion.hasMany(PreferenciaNotificacion, {
    foreignKey: "id_tipo_notificacion"
});
PreferenciaNotificacion.belongsTo(TipoNotificacion, {
    foreignKey: "id_tipo_notificacion"
});

//Relacion con Usuario
Usuario.hasMany(PreferenciaNotificacion, {
    foreignKey: "id_usuario"
});
PreferenciaNotificacion.belongsTo(Usuario, {
    foreignKey: "id_usuario"
});

export default PreferenciaNotificacion;