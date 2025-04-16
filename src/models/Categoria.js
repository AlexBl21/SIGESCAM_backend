import db from "../db/db.js";
import { DataTypes } from "sequelize";

const Categoria = db.define("categoria", {
    nombre: { type: DataTypes.STRING(50), primaryKey: true}, 
    descripcion: { type: DataTypes.STRING(100), allowNull: false}
}, {
    timestamps: false, 
    freezeTableName: true
});

export default Categoria;