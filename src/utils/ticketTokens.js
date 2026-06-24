import crypto from "crypto";

const ticketTokens = new Map();

// genera token random x venta, vence en 5 min
export function crearTokenTicket(ventaId) {
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000;
    ticketTokens.set(String(ventaId), { token, expiresAt });
    return token;
}

// valida q el token coincida y no este vencido
export function validarTokenTicket(ventaId, token) {
    const entry = ticketTokens.get(String(ventaId));
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
        ticketTokens.delete(String(ventaId));
        return false;
    }
    return entry.token === token;
}

// saca el token del map cuando ya no sirve
export function invalidarTicketToken(ventaId) {
    ticketTokens.delete(String(ventaId));
}
