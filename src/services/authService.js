import sequelize from "../config/database.js";

// prueba conexion a la db con authenticate
export async function baseDeDatosDisponible() {
    try {
        await sequelize.authenticate();
        return true;
    } catch (err) {
        console.error("Base de datos no disponible:", err.message);
        return false;
    }
}
