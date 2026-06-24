import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import Venta from "../models/ventas.js";
import VentaProductos from "../models/ventaProductos.js";
import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";
import puppeteer from "puppeteer";
import crypto from "crypto";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { precioANumero } from "../utils/precio.js";


function parseMoneyToNumber(v) {
  if (typeof v === "number") return v;
  if (!v) return 0;
  // ejemplo: "$10,000.00" o "$9,800.00" o "10000.00"
  let s = String(v).trim().replace(/\$/g, "");
  // si tiene coma y punto: asumimos formato US (10,000.00)
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/,/g, "");
  } else if (s.includes(",") && !s.includes(".")) {
    // formato ES (10000,50)
    s = s.replace(/,/g, ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

const getAccesorios = async (req, res) => {

  try {
    const rows = await Accesorio.findAll({
      where: { estado: true },
      order: [["nombre", "ASC"]],
      raw: true
    });

    return res.json(rows);
  }
  catch (e) {
    return res.status(500).json({ error: "error al obtener accesorios", details: e.message });
  }
};

const getAlimentos = async (req, res) => {
  try {
    const rows = await Alimento.findAll({
      where: { estado: true },
      order: [["nombre", "ASC"]],
      raw: true
    });
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "error al obtener alimentos", details: e.message });
  }
};

// Token en memoria para que NO se pueda descargar PDF sin haber comprado.
const ticketTokens = new Map(); // ventaId -> { token, expiresAt }

function createTicketToken(ventaId) {
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos
  ticketTokens.set(String(ventaId), { token, expiresAt });
  return token;
}

function validateTicketToken(ventaId, token) {
  const entry = ticketTokens.get(String(ventaId));
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    ticketTokens.delete(String(ventaId));
    return false;
  }
  return entry.token === token;
}

function money(n) {
  const safe = parseMoneyToNumber(n);
  return safe.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function formatDateTime(value) {
  // Fuerza zona horaria Argentina para evitar desfases (DB suele guardar en UTC)
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
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get(
    "minute"
  )}:${get("second")}`;
}

async function resolverItemsVenta(items, transaction) {
  const normalizados = items
    .map((it) => ({
      id: Number(it.id) || 0,
      tipo: String(it.tipo ?? "").trim().toLowerCase(),
      cantidad: Number(it.cantidad) || 0
    }))
    .filter(
      (it) =>
        it.id > 0 &&
        (it.tipo === "accesorio" || it.tipo === "alimento") &&
        it.cantidad > 0
    );

  if (!normalizados.length) {
    return { error: "items inválidos" };
  }

  const idsAcc = [
    ...new Set(normalizados.filter((it) => it.tipo === "accesorio").map((it) => it.id))
  ];
  const idsAli = [
    ...new Set(normalizados.filter((it) => it.tipo === "alimento").map((it) => it.id))
  ];

  const [accesorios, alimentos] = await Promise.all([
    idsAcc.length
      ? Accesorio.findAll({
          where: { id: { [Op.in]: idsAcc }, estado: true },
          transaction,
          raw: true
        })
      : [],
    idsAli.length
      ? Alimento.findAll({
          where: { id: { [Op.in]: idsAli }, estado: true },
          transaction,
          raw: true
        })
      : []
  ]);

  const mapAcc = Object.fromEntries(accesorios.map((a) => [a.id, a]));
  const mapAli = Object.fromEntries(alimentos.map((a) => [a.id, a]));

  const clean = [];
  for (const it of normalizados) {
    const prod = it.tipo === "accesorio" ? mapAcc[it.id] : mapAli[it.id];
    if (!prod) {
      return { error: `producto no disponible (${it.tipo} #${it.id})` };
    }

    const precio = precioANumero(prod.precio);
    if (precio <= 0) {
      return { error: `precio inválido para ${prod.nombre}` };
    }

    clean.push({
      id: it.id,
      tipo: it.tipo,
      nombre: prod.nombre,
      precio,
      cantidad: it.cantidad
    });
  }

  return { clean };
}

// POST /api/ventas (guarda cabecera en VENTAS + detalle en VENTA_PRODUCTOS)
const crearVenta = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // Validación básica del request
    const { cliente, items } = req.body || {};
    if (!cliente || typeof cliente !== "string" || !cliente.trim()) {
      await t.rollback();
      return res.status(400).json({ error: "cliente requerido" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "items requerido" });
    }

    const resuelto = await resolverItemsVenta(items, t);
    if (resuelto.error) {
      await t.rollback();
      return res.status(400).json({ error: resuelto.error });
    }

    const clean = resuelto.clean;

    // Calcular totales para la cabecera (tabla VENTAS)
    const cantidadTotal = clean.reduce((a, it) => a + it.cantidad, 0);
    const total = clean.reduce((a, it) => a + it.precio * it.cantidad, 0);
    const descripcion = clean
      .map((it) => `${it.nombre} x${it.cantidad}`)
      .join(", ");

    // Insert cabecera (tabla VENTAS)
    const venta = await Venta.create(
      {
        cliente: cliente.trim(),
        descripcion,
        precio: total,
        cantidad: cantidadTotal,
        fecha: new Date()
      },
      { transaction: t }
    );

    // Insert detalle (tabla VENTA_PRODUCTOS)
    const detalle = clean.map((it) => ({
      id_venta: venta.id,
      id_accesorio: it.tipo === "accesorio" ? it.id : null,
      id_alimento: it.tipo === "alimento" ? it.id : null,
      cantidad: it.cantidad,
      precio_unitario: it.precio,
      precio_total: it.precio * it.cantidad
    }));

    await VentaProductos.bulkCreate(detalle, { transaction: t });

    // Confirmar todo junto: si falla algo antes, no queda nada guardado
    await t.commit();

    // Gestión de ticket
    const token = createTicketToken(venta.id);

    return res.json({
      ok: true,
      ventaId: venta.id,
      token,
      venta: {
        id: venta.id,
        cliente: venta.cliente,
        descripcion: venta.descripcion,
        precio: venta.precio,
        cantidad: venta.cantidad,
        fecha: venta.fecha
      }
    });
  } catch (e) {
    await t.rollback();
    return res.status(500).json({
      error: "error al crear venta",
      details: e.message
    });
  }
};


// GET /api/ventas/:id?token=...
const getVenta = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const token = String(req.query.token || "");

    if (!id) return res.status(400).json({ error: "id inválido" });
    if (!token || !validateTicketToken(id, token)) {
      return res.status(403).json({ error: "token inválido o expirado" });
    }

    const venta = await Venta.findByPk(id);
    if (!venta) return res.status(404).json({ error: "venta no encontrada" });

    return res.json({ ok: true, venta });
  } catch (e) {
    return res.status(500).json({ error: "error al obtener venta", details: e.message });
  }
};

// GET /api/ventas/:id/ticket.pdf?token=...
const descargarTicketPdf = async (req, res) => {
  const id = Number(req.params.id);
  const token = String(req.query.token || "");

  if (!id) return res.status(400).send("id inválido");
  if (!token || !validateTicketToken(id, token)) {
    return res.status(403).send("token inválido o expirado");
  }

  const venta = await Venta.findByPk(id);
  if (!venta) return res.status(404).send("venta no encontrada");

  const html = `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
        h1 { margin: 0 0 6px 0; }
        .muted { color: #666; font-size: 12px; margin-bottom: 18px; }
        .box { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .total { font-weight: bold; font-size: 16px; border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px; }
      </style>
    </head>
    <body>
      <h1>MASCOTERO</h1>
      <div class="muted">Ticket de compra</div>

      <div class="box">
        <div class="row"><div><strong>Cliente</strong></div><div>${venta.cliente}</div></div>
        <div class="row"><div><strong>Fecha</strong></div><div>${formatDateTime(venta.fecha)}</div></div>
        <div class="row"><div><strong>Productos</strong></div><div style="text-align:right; max-width: 320px;">${venta.descripcion}</div></div>
        <div class="row"><div><strong>Cantidad total</strong></div><div>${venta.cantidad}</div></div>
        <div class="row total"><div>Total</div><div>${money(venta.precio)}</div></div>
      </div>
    </body>
  </html>`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="ticket-${venta.id}.pdf"`
  );

  // invalidar token al usarlo (1 solo uso)
  ticketTokens.delete(String(id));

  return res.send(pdfBuffer);
};


const crearAdministrador = async (req, res) => {
  try {
    const { usuario, password } = req.body || {};

    if (!usuario || typeof usuario !== "string" || !usuario.trim()) {
      return res.status(400).json({ error: "usuario requerido" });
    }
    if (!password || typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ error: "password requerido" });
    }

    const usuarioTrimeado = usuario.trim();
    const existe = await Administrador.findOne({ where: { usuario: usuarioTrimeado } });
    if (existe) {
      return res.status(409).json({ error: "el usuario ya existe" });
    } //409 codnflict: recurso duplicado

    const hash = await bcrypt.hash(password, 10);
    const admin = await Administrador.create({
      usuario: usuarioTrimeado,
      password: hash
    });

    return res.status(201).json({
      ok: true,
      administrador: {
        id: admin.id,
        usuario: admin.usuario
      }
    });
  } catch (e) {
    return res.status(500).json({ error: "error al crear user", details: e.message });
  }
};

export default {
  getAccesorios,
  getAlimentos,
  crearVenta,
  getVenta,
  descargarTicketPdf,
  crearAdministrador
};
