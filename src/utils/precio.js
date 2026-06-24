// convierte string/$comas a numero, si falla va 0
export function precioANumero(precio) {
    if (typeof precio === "number" && Number.isFinite(precio)) return precio;
    if (precio == null) return 0;

    let s = String(precio).trim().replace(/\$/g, "");
    if (s.includes(",") && s.includes(".")) {
        s = s.replace(/,/g, "");
    } else if (s.includes(",") && !s.includes(".")) {
        s = s.replace(",", ".");
    }

    const num = Number(s);
    return Number.isNaN(num) ? 0 : num;
}

// muestra el precio lindo tipo $ 1.234,56 es-AR
export function formatearPrecio(precio) {
    const num = precioANumero(precio);
    return "$ " + num.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
