
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Accesorio = sequelize.define('ACCESORIOS', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
  precio: { type: DataTypes.FLOAT },
  descripcion: { type: DataTypes.STRING },
  estado: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  freezeTableName: true,
  timestamps: false
});

export default Accesorio;