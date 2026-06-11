
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Producto = sequelize.define('Producto', {
  id: DataTypes.INTEGER,
  nombre: DataTypes.STRING,  
  activo: DataTypes.BOOLEAN
});



export default Producto;