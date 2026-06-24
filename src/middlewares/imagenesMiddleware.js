import multer from "multer";
import path from "path";
import { renderErrorProducto } from "../utils/adminProducto.js";

const EXTENSIONES = [".jpg", ".jpeg", ".png"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

function esJpeg(buffer) {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function esPng(buffer) {
    return (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    );
}

function esImagenReal(buffer) {
    return esJpeg(buffer) || esPng(buffer);
}

export function validarImagen(req, res, next) {
    if (!req.file) {
        return next();
    }

    const ext = path.extname(req.file.originalname).toLowerCase();

    if (!EXTENSIONES.includes(ext)) {
        return renderErrorProducto(req, res, "Solo imagenes JPG, JPEG o PNG.");
    }

    if (!req.file.buffer || !esImagenReal(req.file.buffer)) {
        return renderErrorProducto(req, res, "El archivo no es una imagen JPG o PNG valida.");
    }

    next();
}

export function subirImagenProducto(req, res, next) {
    upload.single("imagen")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
                return renderErrorProducto(req, res, "La imagen no debe superar 10 MB.");
            }

            return renderErrorProducto(req, res, err.message || "ERROR AL SUBIR LA IMAGEN.");
        }

        validarImagen(req, res, next);
    });
}
