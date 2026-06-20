import sequelize from "../config/database.js";

export async function baseDeDatosDisponible() {
    try {
        await sequelize.authenticate();
        return true;
    } catch (err) {
        console.error("Base de datos no disponible:", err.message);
        return false;
    }
}
