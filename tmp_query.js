import sequelize from "./src/config/database.js";

try {
  const [rows] = await sequelize.query('select id,nombre,precio from "ALIMENTOS" limit 5');
  console.log(rows);
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
