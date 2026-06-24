import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const jwtSecreto = process.env.JWT_SECRETO?.trim();

if (!jwtSecreto) {
    console.error("ERROR: JWT_SECRETO no está definido. Agregalo en el archivo .env");
    process.exit(1);
}

// Cambia en cada reinicio del servidor: invalida tokens emitidos antes.
const SERVER_SESSION_ID = crypto.randomBytes(16).toString("hex");

// Clave secreta para firmar 
const secret = new TextEncoder().encode(jwtSecreto);


// arma el jwt con el payload y sid del server, dura 5 min
export async function generarJWT(payload) {
    const token = jwt.sign({ ...payload, sid: SERVER_SESSION_ID }, secret, {
        expiresIn: "5m",
        algorithm: "HS256"
    });
    return token;
}


// chequea q el token sea valido y de esta sesion del server
export async function verificarJWT(token) {
    try {
        const payload = jwt.verify(token, secret);
        if (payload.sid !== SERVER_SESSION_ID) {
            console.log("Token invalido: sesion de servidor anterior");
            return null;
        }
        return payload;
    } catch (e) {
        console.log("Firma invalida o Token Expirado");
        return null;
    }
}


//guarda el token del admin en cookie httpOnly
export function guardarToken(res, token) {
    res.cookie("adminToken", token, {
        httpOnly: true,
        maxAge: 5 * 60 * 1000
    });
}


//limpia la cookie del admin al logout
export function borrarToken(res) {
    res.clearCookie("adminToken", { httpOnly: true});
}

//saca el adminToken de las cookies del request
export function obtenerToken(req) {
    return req.cookies.adminToken ?? null;
}
