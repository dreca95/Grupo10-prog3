/**
 * Utils globales para precios en el frontend.
 */


// "$5,000.00" -> 5000
function ConvertirTextoMoneyANumero(textoMoney) {
    if (typeof textoMoney === "number" && Number.isFinite(textoMoney)) return textoMoney;
    if (textoMoney == null) return 0;

    let s = String(textoMoney).trim();
    s = s.replace(/\$/g, "").trim(); // quita $
    s = s.replace(/,/g, ""); // quita separador de miles US

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}

// 5000 o "$5,000.00" -> "$ 5.000,00"
function FormatearNumeroAPrecio(valor) {
    const n = typeof valor === "number" && Number.isFinite(valor) ? valor : ConvertirTextoMoneyANumero(valor);

    return ( "$ " + n.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    );
}

// "$ 5.000,00" o "5000,25" -> 5000.25
function ConvertirTextoPrecioANumero(textoPrecio) {
    if (typeof textoPrecio === "number" && Number.isFinite(textoPrecio)) return textoPrecio;
    if (textoPrecio == null) return 0;

    let s = String(textoPrecio).trim();
    s = s.replace(/\$/g, "").trim();
    s = s.replace(/\./g, ""); // miles AR
    s = s.replace(/,/g, "."); // decimal AR
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}

function FormatearFechaHoraAR(value) {
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

    const get = (t) => parts.find((p) => p.type === t)?.value || "00";
    return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function ObtenerQueryParam(name, url = window.location.href) {
    const u = new URL(url);
    return u.searchParams.get(name);
}

window.__utils = {
    ConvertirTextoMoneyANumero,
    FormatearNumeroAPrecio,
    ConvertirTextoPrecioANumero,
    FormatearFechaHoraAR,
    ObtenerQueryParam
};
