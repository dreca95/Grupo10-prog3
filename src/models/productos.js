import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Producto = sequelize.define('Producto', {
  nombre: DataTypes.STRING,
  precio: DataTypes.FLOAT,
  activo: DataTypes.BOOLEAN
});

export default Producto;