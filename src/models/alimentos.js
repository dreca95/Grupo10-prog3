
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Alimento = sequelize.define(
  "ALIMENTOS",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
    precio: { type: DataTypes.DECIMAL },
    descripcion: { type: DataTypes.STRING },
    imagen: { type: DataTypes.STRING },
    estado: { type: DataTypes.BOOLEAN, defaultValue: true }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

export default Alimento;
