import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const VentaProductos = sequelize.define(
    "VENTA_PRODUCTOS",
    {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

        id_venta: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "VENTAS", key: "id" }
        },

        id_accesorio: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: "ACCESORIOS", key: "id" }
        },

        id_alimento: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: "ALIMENTOS", key: "id" }
        },

        cantidad: { type: DataTypes.INTEGER, allowNull: false },

        precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

        precio_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
    },
    {
        tableName: "VENTA_PRODUCTOS",
        freezeTableName: true,
        timestamps: false
    }
);

export default VentaProductos;
