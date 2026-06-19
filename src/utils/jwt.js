import jwt from "jsonwebtoken";

// Clave secreta para firmar (debe ser Uint8Array)
const secret = new TextEncoder().encode(
    (process.env.JWT_SECRETO).trim()
);


export async function generarJWT(payload) {
    const token = jwt.sign(payload, secret, {
        expiresIn: "5m",
        algorithm: "HS256"
    });
    return token;
}


export async function verificarJWT(token) {
    try {
        const payload = jwt.verify(token, secret);
        return payload;
    } catch (e) {
        console.log("Firma invalida o Token Expirado");
        return null;
    }
}


export function guardarToken(res, token) {
    res.cookie("adminToken", token, {
        httpOnly: true,
        maxAge: 5 * 60 * 1000
    });
}


export function borrarToken(res) {
    res.clearCookie("adminToken");
}

export function obtenerToken(req) {
    return req.cookies.adminToken ?? null;
}
