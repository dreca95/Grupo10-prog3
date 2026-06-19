import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Venta = sequelize.define(
  "Venta",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    precio: { type: DataTypes.DECIMAL, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    cliente: { type: DataTypes.STRING, allowNull: false }
  },
  {
    tableName: "VENTAS",
    timestamps: false
  }
);

export default Venta;
