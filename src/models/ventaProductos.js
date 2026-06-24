import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const VentaProductos = sequelize.define(
  "VENTA_PRODUCTOS",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_accesorio: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    id_alimento: {
      type: DataTypes.INTEGER,
      allowNull: true
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
