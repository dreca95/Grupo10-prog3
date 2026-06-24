import ejs from "ejs"; // Motor de plantillas EJS para renderizar vistas din?micas
import express from "express"; // Framework Express para crear el servidor web
//import homeRouter from "./src/routes/homeRoutes.js"; // Rutas definidas para la secci?n principal (home)
import adminRouter from "./src/routes/adminRoutes.js"; // Rutas definidas para la administraci?n
import sequelize from './src/config/database.js'; // Carga las variables de entorno desde el archivo .env
import dotenv from "dotenv";
import apiRouter from "./src/routes/apiRoutes.js";
import cookieParser from "cookie-parser";
import "./src/models/associations.js";


dotenv.config();
const app = express(); // Instancia de la aplicaci?n Express
const PORT = process.env.PORT; // Obtiene el puerto desde las variables de entorno (.env)

app.use(express.json()); // Habilita el uso de datos JSON en las solicitudes
app.use(express.urlencoded({ extended: true })); // Habilita el uso de datos URL en las solicitudes
app.use(cookieParser());
app.use("/api", apiRouter); // Activa las rutas importadas desde apiRoutes.js

// Configuraci?n
app.set("view engine", "ejs"); // Configura EJS como motor de vistas de la aplicaci?n
app.set("views", "./views"); // Base de vistas
app.use(express.static("public")); // Habilita el uso de archivos est?ticos (css, im?genes, js) desde "public"

// Frontend est?tico (proyecto separado)
app.use("/client", express.static("client"));

//app.use(homeRouter); // (sin rutas cliente EJS)
app.use(adminRouter); // Registra y activa las rutas importadas desde adminRoutes.js

// Home final: frontend est?tico
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./client" });
});

app.use((err, req, res, next) => {
    if (!req.originalUrl.startsWith("/api")) {
        return next(err);
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "JSON inv?lido" });
    }
    return res.status(500).json({ error: "error interno", details: err.message });
});

// Inicia el servidor
app.listen(PORT || 3000, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} - ${new Date().toLocaleTimeString()}`);
});

sequelize.authenticate()
    .then(() => console.log('? Conectado a PostgreSQL'))
    .catch(err => console.error('Error de conexi?n:', err));
