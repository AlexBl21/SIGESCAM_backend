import db from "../db/db.js";
import { DataTypes } from "sequelize";

const Categoria = db.define("categoria", {
  id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false },
  descripcion: { type: DataTypes.STRING(100), allowNull: false }
}, {
  timestamps: false,
  freezeTableName: true
});

export default Categoria;
