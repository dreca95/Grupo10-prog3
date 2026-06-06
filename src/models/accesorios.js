
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Accesorio = sequelize.define('ACCESORIOS', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
  precio: { type: DataTypes.FLOAT }
}, {
  freezeTableName: true,
  timestamps: false
});

export default Accesorio;