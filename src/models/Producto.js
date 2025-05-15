import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Categoria from "./Categoria.js";

const Producto = db.define("producto", {
    id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(70), allownull: false },
    precio_compra: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    precio_venta: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
    timestamps: false,
    freezeTableName: true
});

//relacion con Categoria
Categoria.hasMany(Producto, {
    foreignKey: "id_categoria"
});
Producto.belongsTo(Categoria, {
    foreignKey: "id_categoria"
});

export default Producto;