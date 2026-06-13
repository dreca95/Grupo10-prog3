import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Administrador = sequelize.define('ADMINISTRADORES', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
}, {
  freezeTableName: true,
  timestamps: false
});

export default Administrador;

/* 
const hash = await bcrypt.hash("1234", 10);

const admin = await Administrador.create({
  usuario: "admin",
  password: hash
});

console.log("Administrador insertado:", admin.toJSON()); */