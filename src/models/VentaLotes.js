import db from "../db/db.js";
import { DataTypes } from "sequelize";
import Compra from "./Compra.js";
import DetalleVenta from "./DetalleVenta.js";

const VentaLotes = db.define("venta_lotes", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cantidad_usada: { type: DataTypes.INTEGER, allowNull: false },
    precio_compra: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    timestamps: false,
    freezeTableName: true
});

//relacion con compra
Compra.hasMany(VentaLotes, {
    foreignKey: "id_compra",
})
VentaLotes.belongsTo(Compra, {
    foreignKey: "id_compra"
})

//relacion con detalle de Venta
DetalleVenta.hasMany(VentaLotes, {
    foreignKey: "id_detalle_venta"
});
VentaLotes.belongsTo(DetalleVenta, {
    foreignKey: "id_detalle_venta"
});

export default VentaLotes;