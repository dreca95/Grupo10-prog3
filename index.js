import ejs from "ejs"; // Motor de plantillas EJS para renderizar vistas dinámicas
import express from "express"; // Framework Express para crear el servidor web
import homeRouter from "./src/routes/homeRoutes.js"; // Rutas definidas para la sección principal (home)
import adminRouter from "./src/routes/adminRoutes.js"; // Rutas definidas para la administración
import sequelize from './src/config/database.js'; // Carga las variables de entorno desde el archivo .env
import dotenv from "dotenv";
import apiRouter from "./src/routes/apiRoutes.js";
import cookieParser from "cookie-parser";


dotenv.config();
const app = express(); // Instancia de la aplicación Express
const PORT = process.env.PORT; // Obtiene el puerto desde las variables de entorno (.env)

app.use(express.json()); // Habilita el uso de datos JSON en las solicitudes
app.use(express.urlencoded({ extended: true })); // Habilita el uso de datos URL en las solicitudes
app.use(cookieParser());
app.use("/api", apiRouter); // Activa las rutas importadas desde apiRoutes.js

// Configuración
app.set("view engine", "ejs"); // Configura EJS como motor de vistas de la aplicación
app.set("views", "./views"); // Base de vistas
app.use(express.static("public")); // Habilita el uso de archivos estáticos (css, imágenes, js) desde "public"

// Frontend estático (proyecto separado)
app.use("/client", express.static("client"));

app.use(homeRouter); // (sin rutas cliente EJS)
app.use(adminRouter); // Registra y activa las rutas importadas desde adminRoutes.js

// Home final: frontend estático
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./client" });
});


// CONEXIÓN A RAILWAY-BD
(async () => {
    try {

        //console.log("Conectado a PostgreSQL");

        // INSERT de prueba
        // const nuevo = await Accesorio.create({
        //     nombre: "correa",
        //     precio: 7000
        // });
        //console.log("Insert realizado:", nuevo.toJSON());

        // SELECT de prueba
        // const total = await Accesorio.count();
        // console.log("Total de ACCESORIOS: ", total);
        //const todos = await Accesorio.findAll();
        //console.log("Registros:", todos.map(a => a.toJSON()));

    } catch (error) {
        console.error("Error:", error);
    }
})();


app.use((err, req, res, next) => {
    if (!req.originalUrl.startsWith("/api")) {
        return next(err);
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "JSON inválido" });
    }
    return res.status(500).json({ error: "error interno", details: err.message });
});

// Inicia el servidor
app.listen(PORT || 3000, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} - ${new Date().toLocaleTimeString()}`);
});

sequelize.authenticate()
    .then(() => console.log('✅ Conectado a PostgreSQL'))
    .catch(err => console.error('Error de conexión:', err));
