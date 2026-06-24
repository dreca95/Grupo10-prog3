import fs from "fs";
import path from "path";

const carpeta = "public/img/productos";
const extensiones = [".jpg", ".jpeg", ".png"];

function nombreImagen(tipo, id) {
    return `${tipo}-${id}`;
}

function imagenRuta(tipo, id, ext) {
    return `/img/productos/${nombreImagen(tipo, id)}${ext}`;
}

export function guardarImagenLocal(tipo, id, file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = nombreImagen(tipo, id);

    fs.mkdirSync(carpeta, { recursive: true });

    fs.writeFileSync(path.join(carpeta, `${base}${ext}`), file.buffer);

    return imagenRuta(tipo, id, ext);
}

export function eliminarImagenLocal(tipo, id) {
    const base = nombreImagen(tipo, id);

    for (let ext of extensiones) {
        try {
            fs.unlinkSync(path.join(carpeta, `${base}${ext}`));
        } catch (error) {
           console.log(`No se pudo eliminar la imagen ${base}${ext}`);
        }
    }
}

export function copiarImagenProducto(tipoOrigen, idOrigen, tipoDestino, idDestino) {
    const baseOrigen = nombreImagen(tipoOrigen, idOrigen);
    const baseDestino = nombreImagen(tipoDestino, idDestino);

    for (const ext of extensiones) {
        const origen = path.join(carpeta, `${baseOrigen}${ext}`);
        if (!fs.existsSync(origen)) continue;

        fs.copyFileSync(origen, path.join(carpeta, `${baseDestino}${ext}`));
        return imagenRuta(tipoDestino, idDestino, ext);
    }

    return null;
}
