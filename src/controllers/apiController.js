import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import Venta from "../models/ventas.js";
import puppeteer from "puppeteer";
import crypto from "crypto";

const normalizeProducto = (p) => {
  const raw = p?.toJSON ? p.toJSON() : p;
  // A veces Postgres devuelve DECIMAL como string
  const precio =
    typeof raw.precio === "string"
      ? Number(raw.precio.replace(",", "."))
      : Number(raw.precio);

  return {
    ...raw,
    precio: Number.isFinite(precio) ? precio : 0
  };
};

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
  const rows = await Accesorio.findAll({
    where: { estado: true },
    order: [["nombre", "ASC"]],
    raw: true
  });
  // con raw:true evitamos getters raros; y además parseamos si viene con $
  res.json(rows.map((r) => ({ ...r, precio: parseMoneyToNumber(r.precio) })));
};

const getAlimentos = async (req, res) => {
  const rows = await Alimento.findAll({
    where: { estado: true },
    order: [["nombre", "ASC"]],
    raw: true
  });
  res.json(rows.map((r) => ({ ...r, precio: parseMoneyToNumber(r.precio) })));
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
  const num = typeof n === "string" ? Number(n.replace(",", ".")) : Number(n);
  const safe = Number.isFinite(num) ? num : 0;
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

// POST /api/ventas
// body: { cliente: string, items: [{nombre, precio, cantidad}] }
const crearVenta = async (req, res) => {
  try {
    const { cliente, items } = req.body || {};

    if (!cliente || typeof cliente !== "string" || !cliente.trim()) {
      return res.status(400).json({ error: "cliente requerido" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items requerido" });
    }

    const clean = items
      .map((it) => ({
        nombre: String(it.nombre ?? "").trim(),
        precio: Number(it.precio) || 0,
        cantidad: Number(it.cantidad) || 0
      }))
      .filter((it) => it.nombre && it.precio >= 0 && it.cantidad > 0);

    if (clean.length === 0) {
      return res.status(400).json({ error: "items inválidos" });
    }

    const cantidadTotal = clean.reduce((acc, it) => acc + it.cantidad, 0);
    const total = clean.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

    const descripcion = clean.map((it) => `${it.nombre} x${it.cantidad}`).join(", ");

    const venta = await Venta.create({
      cliente: cliente.trim(),
      descripcion,
      precio: total,
      cantidad: cantidadTotal,
        // Guardar en UTC (recomendado). Luego se muestra en BA con formatDateTime()
        fecha: new Date()
    });

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
    return res.status(500).json({ error: "error al crear venta", details: e.message });
  }
};

// GET /api/ventas/:id
const getVenta = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "id inválido" });

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

export default {
  getAccesorios,
  getAlimentos,
  crearVenta,
  getVenta,
  descargarTicketPdf
};
