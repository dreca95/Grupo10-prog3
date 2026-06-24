import { Op } from "sequelize";
import { normalizarBusqueda } from "../utils/paginacion.js";
import { modeloPorTipo, obtenerProductoPorId } from "./productoService.js";
import { precioANumero } from "../utils/precio.js";
import { copiarImagenProducto, eliminarImagenLocal, guardarImagenLocal } from "./imagenProductoService.js";

export async function listarProductosBackoffice({ Model, page, limit, offset, q }) {
    const busqueda = normalizarBusqueda(q);
    const where = {};

    if (busqueda) {
        where.nombre = { [Op.iLike]: `%${busqueda}%` };
    }

    const [result, totalInventario] = await Promise.all([
        Model.findAndCountAll({
            attributes: ["id", "nombre", "precio", "descripcion", "estado", "imagen"],
            where,
            order: [["nombre", "ASC"]],
            limit,
            offset,
            raw: true
        }),
        Model.count()
    ]);

    return {
        items: result.rows,
        total: result.count,
        totalInventario
    };
}

export async function obtenerProductoBackoffice(tipo, id) {
    const producto = await obtenerProductoPorId(tipo, id);

    if (!producto || producto.estado === false) {
        return null;
    }

    const data = producto.toJSON();
    data.precio = precioANumero(data.precio);
    data.tipo = tipo;

    return data;
}

export async function crearProducto({ tipo, nombre, descripcion, precio, file }) {
    const model = modeloPorTipo(tipo);
    const creado = await model.create({
        nombre,
        precio,
        descripcion,
        estado: true
    });

    if (file) {
        const imagen = guardarImagenLocal(tipo, creado.id, file);
        await creado.update({ imagen });
    }

    const data = creado.toJSON();
    data.tipo = tipo;
    return data;
}

export async function editarProducto({
    tipoOriginal,
    id,
    tipoNuevo,
    nombre,
    descripcion,
    precio,
    file
}) {
    const modelOriginal = modeloPorTipo(tipoOriginal);
    const existente = await modelOriginal.findByPk(id);

    if (!existente || existente.estado === false) {
        return null;
    }

    if (tipoOriginal !== tipoNuevo) {
        const modelNuevo = modeloPorTipo(tipoNuevo);
        const nuevo = await modelNuevo.create({
            nombre,
            precio,
            descripcion,
            estado: existente.estado
        });

        let imagen = null;

        if (file) {
            imagen = guardarImagenLocal(tipoNuevo, nuevo.id, file);
        } else if (existente.imagen) {
            imagen = copiarImagenProducto(tipoOriginal, id, tipoNuevo, nuevo.id);
        }

        if (imagen) {
            await nuevo.update({ imagen });
        }

        eliminarImagenLocal(tipoOriginal, id);
        await modelOriginal.destroy({ where: { id } });

        const data = nuevo.toJSON();
        data.tipo = tipoNuevo;
        return data;
    }

    let imagen = existente.imagen;

    if (file) {
        imagen = guardarImagenLocal(tipoNuevo, id, file);
    }

    await modelOriginal.update(
        { nombre, precio, descripcion, imagen },
        { where: { id } }
    );

    const actualizado = await modelOriginal.findByPk(id);
    const data = actualizado.toJSON();
    data.tipo = tipoNuevo;
    return data;
}

export async function darBajaProducto(tipo, id) {
    const producto = await obtenerProductoPorId(tipo, id);

    if (!producto || producto.estado === false) {
        return null;
    }

    await producto.update({ estado: false });

    const data = producto.toJSON();
    data.tipo = tipo;
    data.estado = false;
    return data;
}

export async function activarProducto(tipo, id) {
    const producto = await obtenerProductoPorId(tipo, id);

    if (!producto || producto.estado !== false) {
        return null;
    }

    await producto.update({ estado: true });

    const data = producto.toJSON();
    data.tipo = tipo;
    data.estado = true;
    return data;
}
