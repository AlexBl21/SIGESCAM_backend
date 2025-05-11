// models/CodigoRecuperacion.js
import { DataTypes } from "sequelize";
import db from "../db/db.js";
import Usuario from "./Usuario.js";

const CodigoRecuperacion = db.define("codigo_recuperacion", {
    dni_usuario: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        references: {
            model: Usuario,
            key: "dni"
        }
    },
    codigo: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    expiracion: {
        type: DataTypes.DATE,
        allowNull: false
    },
    intentos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: false,
    freezeTableName: true
});


Usuario.hasOne(CodigoRecuperacion, {
    foreignKey: "dni_usuario"
});
CodigoRecuperacion.belongsTo(Usuario, {
    foreignKey: "dni_usuario"
});

export default CodigoRecuperacion;
