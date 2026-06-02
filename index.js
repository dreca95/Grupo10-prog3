import ejs from "ejs";
import express from "express";
import homeRouter from "./src/routes/home.routes.js";

const app = express();
const PORT = process.env.PORT;

/* EJS (Embedded JS Templates) es un motor de plantillas:

    -Nos permite generar HTML dinámico del lado del servidor
    -Podemos insertar variables de js al html.
    -Podemos usar lógica en las plantillas.
    */

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(homeRouter);
app.get("/", (req, res) => {
    res.render("index");
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});


