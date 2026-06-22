import multer from "multer";
import path from "path";
import { renderErrorProducto } from "../utils/adminProducto.js";
import { Extensiones } from "../services/imagenProductoService.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (Extensiones.includes(ext)) {
            cb(null, true);
            return;
        }

        cb(new Error("Solo imagenes JPG, JPEG o PNG."));
    }
});

export function subirImagenProducto(req, res, next) {
    upload.single("imagen")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return renderErrorProducto(req, res, "La imagen no debe superar 10 MB.");
                }
            
            }

            return renderErrorProducto(req, res, err.message || "ERROR AL SUBIR LA IMAGEN.");
        }

        next();
    });
}
