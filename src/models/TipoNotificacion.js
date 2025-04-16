import dataTypes from "sequelize/lib/data-types";
import db from "../db/db.js";
import { DataTypes } from "sequelize";

const TipoNotificacion = db.define("tipo_notificacion", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(20), allownull: false}, 
    descripcion: { type: DataTypes.STRING(100), allownull: false}, 
    activo: { type: dataTypes.BOOLEAN, allowNull: false, defaultValue: true}
}, {
    timestamps: false,
    freezeTableName: true
});

export default TipoNotificacion;