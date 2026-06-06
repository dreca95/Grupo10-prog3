import ejs from "ejs"; // Motor de plantillas EJS para renderizar vistas dinámicas
import express from "express"; // Framework Express para crear el servidor web
import homeRouter from "./src/routes/home.routes.js"; // Rutas definidas para la sección principal (home)
import sequelize from './src/config/database.js'; // Carga las variables de entorno desde el archivo .env
import Accesorio from "./src/models/accesorios.js";
import dotenv from "dotenv";

dotenv.config();

const app = express(); // Instancia de la aplicación Express
const PORT = process.env.PORT; // Obtiene el puerto desde las variables de entorno (.env)


// Configuración
app.set("view engine", "ejs"); // Configura EJS como motor de vistas de la aplicación
app.use(express.static("public")); // Habilita el uso de archivos estáticos (css, imágenes, js) desde "public"
app.use(homeRouter); // Registra y activa las rutas importadas desde home.routes.js

// Define la ruta raíz ("/")
app.get("/", (req, res) => {
    // Renderiza la vista index.ejs cuando se accede a la página principal
    res.render("index");
});


// INSERT
(async () => {
    try {
        await sequelize.authenticate();
        //console.log("Conectado a PostgreSQL");

        // INSERT de prueba
        // const nuevo = await Accesorio.create({
        //     nombre: "correa",
        //     precio: 7000
        // });
        //console.log("Insert realizado:", nuevo.toJSON());

        // SELECT de prueba
        const total = await Accesorio.count();
        console.log("Total de ACCESORIOS: ", total);
        //const todos = await Accesorio.findAll();
        //console.log("Registros:", todos.map(a => a.toJSON()));

    } catch (error) {
        console.error("Error:", error);
    }
})();


// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} - ${new Date().toLocaleTimeString()}`);
});

sequelize.authenticate()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('Error de conexión:', err));
