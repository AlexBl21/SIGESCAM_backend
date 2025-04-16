import {DataTypes} from "sequelize";
import db from "../db/db.js";

const Rol = db.define("rol", {
    id: { type: DataTypes.STRING(50), primaryKey: true},
    descripcion: { type: DataTypes.STRING(100), allowNull: false}
}, {
    timestamps: false, 
    freezeTableName: true //no guardar nombre tablas en plural
});

export default Rol;