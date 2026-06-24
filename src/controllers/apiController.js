import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";
import Venta from "../models/ventas.js";
import Administrador from "../models/administradores.js";
import bcrypt from "bcrypt";
import puppeteer from "puppeteer";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { precioANumero } from "../utils/precio.js";
import { crearTokenTicket, invalidarTicketToken } from "../utils/ticketTokens.js";
import { agregarDetalleVenta, obtenerVentaConDetalle } from "../services/ventasService.js";
import {armarPaginado,LIMITE_POR_DEFECTO_CATALOGO,normalizarBusqueda,parsearConsultaPaginacion} from "../utils/paginacion.js";

const MAX_CANTIDAD_ITEM = 100;
//trae productos paginados del catalogo publico, filtra x nombre en base a query escrita por usr
async function paginarProductos({ Model, req, res, errorTag }) {
  const { page, limit, offset } = parsearConsultaPaginacion(req.query, LIMITE_POR_DEFECTO_CATALOGO);
  const q = normalizarBusqueda(req.query.q);

  const where = { estado: true };
  if (q) {
    where.nombre = { [Op.iLike]: `%${q}%` };
  }

  try {
    const result = await Model.findAndCountAll({
      where,
      order: [["nombre", "ASC"]],
      limit,
      offset,
      raw: true
    });

    return res.json({
      ok: true,
      items: result.rows,
      paginado: armarPaginado({ page, limit, total: result.count }),
      q
    });
  } catch (e) {
    return res.status(500).json({
      error: `error al obtener ${errorTag}`,
      details: e.message
    });
  }
}

// endpoint activos paginados
const getAccesorios = async (req, res) => {
 
  return paginarProductos({
    Model: Accesorio,
    req,
    res,
    errorTag: "accesorios"
  });
};


const getAlimentos = async (req, res) => {

  return paginarProductos({
    Model: Alimento,
    req,
    res,
    errorTag: "alimentos"
  });
};

// formatea un numero a pesos argentinos
function money(n) {
  const safe = precioANumero(n);
  return safe.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

//  convierte fecha a string en horario argentina
function formatDateTime(value) {
 
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

  // obtienedatetime formateado x tipo (day, month, etc)
  const get = (t) => parts.find((p) => p.type === t)?.value || "00";
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get(
    "minute"
  )}:${get("second")}`;
}


// valida items del carrito, busca productos en db y arma el detalle limpio
async function resolverItemsVenta(items, transaction) {
  const normalizados = items.map((it) => ({
    id: Number(it.id) || 0,
    tipo: String(it.tipo ?? "").trim().toLowerCase(),
    cantidad: Number(it.cantidad) || 0
  }));

  if (
    normalizados.some(
      (it) =>
        !Number.isInteger(it.id) ||
        it.id <= 0 ||
        (it.tipo !== "accesorio" && it.tipo !== "alimento") ||
        !Number.isInteger(it.cantidad) ||
        it.cantidad <= 0 ||
        it.cantidad > MAX_CANTIDAD_ITEM
    )
  ) {
    return { error: `items inválidos (máximo ${MAX_CANTIDAD_ITEM} por producto)` };
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

// crea la venta en db con transaccion, cabecera + detalle + token del ticket
const crearVenta = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const resuelto = await resolverItemsVenta(req.ventaItems, t);
    if (resuelto.error) {
      await t.rollback();
      return res.status(400).json({ error: resuelto.error });
    }

    const clean = resuelto.clean;

    //Calcular totales para la cabecera (tabla VENTAS)
    const cantidadTotal = clean.reduce((a, it) => a + it.cantidad, 0);
    const total = clean.reduce((a, it) => a + it.precio * it.cantidad, 0);
    const descripcion = clean
      .map((it) => `${it.nombre} x${it.cantidad}`)
      .join(", ");

    //Insert cabecera (tabla VENTAS)
    const venta = await Venta.create(
      {
        cliente: req.ventaCliente,
        descripcion,
        precio: total,
        cantidad: cantidadTotal,
        fecha: new Date()
      },
      { transaction: t }
    );

    //Insert detalle (tabla VENTA_PRODUCTOS) vía relaciones Sequelize
    await agregarDetalleVenta(venta, clean, t);

    //Confirmar todo junto: si falla algo antes, no queda nada guardado
    await t.commit();

    //Gestión de ticket
    const token = crearTokenTicket(venta.id);

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


// devuelve una venta con su detalle si existe
const getVenta = async (req, res) => {
  try {
    const venta = await obtenerVentaConDetalle(req.ventaId);
    if (!venta) return res.status(404).json({ error: "venta no encontrada" });

    return res.json({ ok: true, venta });
  } catch (e) {
    return res.status(500).json({ error: "error al obtener venta", details: e.message });
  }
};

// genera el pdf del ticket con puppeteer y lo manda como descarga
const descargarTicketPdf = async (req, res) => {
  try {
    const id = req.ventaId;
    const venta = await Venta.findByPk(id);
    if (!venta) return res.status(404).json({ error: "venta no encontrada" });

  const html = `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        /* PDF Ticket - Mascotero (Puppeteer) */
        :root{
          --bg: #0b1220;
          --surface: #111a2f;
          --surface2: #0f172a;
          --card: #ffffff;
          --text: #0f172a;
          --muted: #475569;
          --border: rgba(15, 23, 42, .14);
          --accent: #7c3aed;
          --accent2: #22c55e;
          --warn: #f59e0b;
          --shadow: 0 18px 45px rgba(2,6,23,.22);
        }

        *{ box-sizing: border-box; }

        body{
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text);
          padding: 34px 38px;
          background: #ffffff; /* el resto de la hoja queda blanco */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Solo la cabecera tiene color, el resto queda blanco */
        .top{
          padding: 18px 20px 16px;
          background:
            radial-gradient(900px 260px at 0% 0%, rgba(124,58,237,.14), transparent 60%),
            radial-gradient(900px 260px at 100% 0%, rgba(34,197,94,.10), transparent 60%),
            linear-gradient(135deg, rgba(124,58,237,.10), rgba(59,130,246,.08));
          border-bottom: 1px solid rgba(2,6,23,.08);
        }

        .page{
          width: 100%;
        }

        .card{
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .brandRow{
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .brand{
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        h1{
          margin: 0;
          font-size: 28px;
          letter-spacing: .6px;
          line-height: 1.1;
        }

        .subtitle{
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }

        .badges{
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badge{
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(2,6,23,.10);
          background: rgba(255,255,255,.7);
          color: rgba(2,6,23,.78);
          white-space: nowrap;
        }

        .badge strong{ color: rgba(2,6,23,.92); }

        .content{
          padding: 18px 20px 8px;
        }

        .row{
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 12px;
          padding: 10px 12px;
          border-bottom: 1px dashed rgba(2,6,23,.12);
          align-items: start;
        }

        .row:last-child{ border-bottom: 0; }

        .k{
          color: rgba(2,6,23,.70);
          font-weight: 700;
          letter-spacing: .2px;
        }

        .v{
          text-align: right;
          color: rgba(2,6,23,.92);
          word-break: break-word;
        }

        .totalRow{
          margin-top: 12px;
          border-top: 1px solid rgba(2,6,23,.10);
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .totalLabel{
          font-size: 13px;
          color: rgba(2,6,23,.70);
          font-weight: 700;
        }

        .totalValue{
          font-size: 18px;
          font-weight: 900;
          color: #111827;
        }

        .footer{
          padding: 14px 20px 18px;
          border-top: 1px solid rgba(2,6,23,.08);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 14px;
        }

        .note{
          margin: 0;
          font-size: 12px;
          color: rgba(2,6,23,.62);
          max-width: 520px;
          line-height: 1.35;
        }

        .meta{
          text-align: right;
          font-size: 11px;
          color: rgba(2,6,23,.55);
        }

        @page { margin: 18mm; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="card">
          <div class="top">
            <div class="brandRow">
              <div class="brand">
                <h1>MASCOTERO</h1>
                <p class="subtitle">Ticket de compra</p>
              </div>

              <div class="badges">
                <span class="badge">Venta: <strong>#${venta.id}</strong></span>
                <span class="badge">Fecha: <strong>${formatDateTime(venta.fecha)}</strong></span>
              </div>
            </div>
          </div>

          <div class="content">
            <div class="row">
              <div class="k">Cliente</div>
              <div class="v">${venta.cliente}</div>
            </div>

            <div class="row">
              <div class="k">Productos</div>
              <div class="v">${venta.descripcion}</div>
            </div>

            <div class="row">
              <div class="k">Cantidad total</div>
              <div class="v">${venta.cantidad}</div>
            </div>

            <div class="totalRow">
              <div class="totalLabel">Total</div>
              <div class="totalValue">${money(venta.precio)}</div>
            </div>
          </div>

          <div class="footer">
            <p class="note">
              Conservá este comprobante. Este PDF fue generado automáticamente por Mascotero.
            </p>
            <div class="meta">
              Generado: ${formatDateTime(new Date())}
            </div>
          </div>
        </div>
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

    invalidarTicketToken(id);

    return res.send(pdfBuffer);
  } catch (e) {
    console.error("descargarTicketPdf", e);
    return res.status(500).json({ error: "No se pudo generar el ticket." });
  }
};


// crea un admin nuevo con pass hasheada 
const crearAdministrador = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);
    const admin = await Administrador.create({
      email,
      password: hash
    });

    return res.status(201).json({
      ok: true,
      administrador: {
        id: admin.id,
        email: admin.email
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
