import dataTypes from "sequelize/lib/data-types";
import db from"../db/db.js";
import { DataTypes } from "sequelize";
import Producto from "./Producto.js";
import TipoNotificacion from "./TipoNotificacion.js";
import Sugerencia from "./Sugerencia.js";

const Notificacion = db.define("notificacion", {
    id_notificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mensaje: {type: DataTypes.STRING(800), allowNull: false},
    fecha_creacion: { type: DataTypes.DATE, allowNull: false}, 
}, {
    timestamps: false, 
    freezeTableName: true
});

//relacion con producto
Producto.hasMany(Notificacion, {
    foreignKey: "id_producto"
});
Notificacion.belongsTo(Producto, {
    foreignKey: "id_producto"
});

//relacion con TipoNotificacion
TipoNotificacion.hasMany(Notificacion, {
    foreignKey: "id_tipo"
});
Notificacion.belongsTo(TipoNotificacion, {
    foreignKey: "id_tipo"
});

//relacion con sugerencia
Sugerencia.hasMany(Notificacion, {
    foreignKey: "id_sugerencia"
});
Notificacion.belongsTo(Sugerencia, {
    foreignKey: "id_sugerencia"
});

export default Notificacion;