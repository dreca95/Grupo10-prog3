import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Administrador = sequelize.define('ADMINISTRADORES', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, field: "usuario" },
  password: { type: DataTypes.STRING, allowNull: false }
}, {
  freezeTableName: true,
  timestamps: false
});

export default Administrador;
