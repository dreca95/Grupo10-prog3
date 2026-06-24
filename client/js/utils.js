/**
 * Utils globales para precios en el frontend.
 */


// "$5,000.00" -> 5000
function convertirTextoMoneyANumero(textoMoney) {
    if (typeof textoMoney === "number" && Number.isFinite(textoMoney)) return textoMoney;
    if (textoMoney == null) return 0;

    let s = String(textoMoney).trim();
    s = s.replace(/\$/g, "").trim();// quita $
    s = s.replace(/,/g, "");// quita separador de miles US

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}

// 5000 o "$5,000.00" -> "$ 5.000,00"
function formatearNumeroAPrecio(valor) {
    const n = typeof valor === "number" && Number.isFinite(valor) ? valor : convertirTextoMoneyANumero(valor);

    return ( "$ " + n.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    );
}

// fecha/hora en formato dd/mm/yyyy hh:mm:ss zona AR
function formatearFechaHoraAR(value) {
    const d = new Date(value);
    const parts = new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).formatToParts(d);

    // saca un pedazo del formatToParts por tipo (day, month, etc)
    const get = (t) => parts.find((p) => p.type === t)?.value || "00";
    return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

// lee un query param de la url para paginado
function obtenerQueryParam(name, url = window.location.href) {
    const u = new URL(url);
    return u.searchParams.get(name);
}

// nombre del cliente guardado en localStorage
function obtenerNombreCliente() {
    return String(localStorage.getItem("cliente_nombre") || "").trim();
}

// true si hay nombre y no es un string gigante
function tieneNombreCliente() {
    const nombre = obtenerNombreCliente();
    return nombre.length > 0 && nombre.length <= 100;
}

// redirige al home si no pusieron nombre de cliente
function requerirNombreCliente() {
    if (!tieneNombreCliente()) {
        window.location.replace("/");
        return false;
    }
    return true;
}

window.__utils = {
    convertirTextoMoneyANumero,
    formatearNumeroAPrecio,
    formatearFechaHoraAR,
    obtenerQueryParam,
    obtenerNombreCliente,
    tieneNombreCliente,
    requerirNombreCliente
};
