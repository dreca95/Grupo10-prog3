export const TIPOS_PRODUCTO = ["accesorio", "alimento"];

export function esValido(tipo) {
    return TIPOS_PRODUCTO.includes(tipo);
}

export function parsePrecio(precio) {
    const precioNum = Number(precio);
    if (precio === "" || Number.isNaN(precioNum) || precioNum <= 0) {
        return null;
    }
    return precioNum;
}

export function renderErrorProducto(req, res, error) {
    const { tipo, nombre, precio, descripcion } = req.body;
    const id = req.params.id;

    if (id) {
        return res.render("admin/edicion", {
            producto: {
                id,
                nombre: String(nombre ?? "").trim(),
                precio: Number(precio) || 0,
                descripcion: String(descripcion ?? "").trim()
            },
            tipo,
            error
        });
    }

    return res.render("admin/alta", { error });
}
