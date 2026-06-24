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

// Clave secreta para firmar (debe ser Uint8Array)
const secret = new TextEncoder().encode(jwtSecreto);


export async function generarJWT(payload) {
    const token = jwt.sign({ ...payload, sid: SERVER_SESSION_ID }, secret, {
        expiresIn: "5m",
        algorithm: "HS256"
    });
    return token;
}


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


export function guardarToken(res, token) {
    res.cookie("adminToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 5 * 60 * 1000
    });
}


export function borrarToken(res) {
    res.clearCookie("adminToken", { httpOnly: true, secure: true });
}

export function obtenerToken(req) {
    return req.cookies.adminToken ?? null;
}
