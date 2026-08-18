import { roundMoney } from '../common/utils/pricing';

export type CotizacionItemCalc = {
  cantidad: number;
  precioUnitario: number;
};

export type CotizacionTotales = {
  subtotal: number;
  descuentoMonto: number;
  montoIva: number;
  total: number;
};

const SECCION_PLATILLO_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  SOPA: 'Sopa',
  PLATO_FUERTE: 'Plato fuerte',
  GUARNICION: 'Guarnición',
  POSTRE: 'Postre',
  BEBIDA: 'Bebida',
  OTRO: 'Otro',
};

const MODALIDAD_MENU_LABELS: Record<string, string> = {
  POR_PERSONA: 'Por persona',
  POR_EVENTO: 'Por evento',
};

const TIPO_ITEM_LABELS: Record<string, string> = {
  producto: 'Producto',
  servicio: 'Servicio',
  menu: 'Menú',
  manual: 'Concepto',
};

const TIPO_ITEM_BADGE: Record<string, string> = {
  producto: 'badge-producto',
  servicio: 'badge-servicio',
  menu: 'badge-menu',
  manual: 'badge-manual',
};

export function calcTotalesCotizacionProveedor(
  items: CotizacionItemCalc[],
  costoEnvio: number,
  descuentoPorcentaje: number,
  ivaPorcentaje: number,
  ivaIncluido: boolean,
): CotizacionTotales {
  const subtotalProductos = roundMoney(
    items.reduce((acc, i) => acc + roundMoney(i.cantidad * i.precioUnitario), 0),
  );
  const subtotal = roundMoney(subtotalProductos + costoEnvio);
  const descuentoMonto = roundMoney(subtotal * (descuentoPorcentaje / 100));
  const base = roundMoney(subtotal - descuentoMonto);

  if (ivaIncluido) {
    const montoIva = roundMoney(base - base / (1 + ivaPorcentaje / 100));
    return {
      subtotal: subtotalProductos,
      descuentoMonto,
      montoIva,
      total: base,
    };
  }

  const montoIva = roundMoney(base * (ivaPorcentaje / 100));
  return {
    subtotal: subtotalProductos,
    descuentoMonto,
    montoIva,
    total: roundMoney(base + montoIva),
  };
}

export function formatMoneyMx(value: number, moneda = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda,
  }).format(value);
}

export function formatFechaLarga(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(date);
}

export type CotizacionPdfItem = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  fotoUrl?: string | null;
  tipo?: 'producto' | 'servicio' | 'menu' | 'manual';
  modalidadMenu?: 'POR_PERSONA' | 'POR_EVENTO' | null;
  platillos?: Array<{
    seccion: string;
    nombre: string;
    descripcion?: string | null;
  }>;
};

function renderPlatillosHtml(
  platillos: CotizacionPdfItem['platillos'],
): string {
  if (!platillos?.length) return '';

  const porSeccion = new Map<string, typeof platillos>();
  for (const p of platillos) {
    const key = p.seccion || 'OTRO';
    const list = porSeccion.get(key) ?? [];
    list.push(p);
    porSeccion.set(key, list);
  }

  const orden = [
    'ENTRADA',
    'SOPA',
    'PLATO_FUERTE',
    'GUARNICION',
    'POSTRE',
    'BEBIDA',
    'OTRO',
  ];

  const bloques = orden
    .filter((sec) => porSeccion.has(sec))
    .map((sec) => {
      const items = porSeccion.get(sec)!;
      const lis = items
        .map(
          (p) =>
            `<li>${escapeHtml(p.nombre)}${
              p.descripcion ? `<span class="platillo-desc"> — ${escapeHtml(p.descripcion)}</span>` : ''
            }</li>`,
        )
        .join('');
      return `<div class="platillo-seccion"><span class="platillo-seccion-titulo">${escapeHtml(SECCION_PLATILLO_LABELS[sec] ?? sec)}</span><ul>${lis}</ul></div>`;
    })
    .join('');

  return `<div class="platillos">${bloques}</div>`;
}

function renderItemRow(item: CotizacionPdfItem, moneda: string): string {
  const tipo = item.tipo ?? 'manual';
  const badgeClass = TIPO_ITEM_BADGE[tipo] ?? 'badge-manual';
  const badgeLabel = TIPO_ITEM_LABELS[tipo] ?? 'Concepto';

  const modalidad =
    item.modalidadMenu && tipo === 'menu'
      ? `<span class="item-meta">${escapeHtml(MODALIDAD_MENU_LABELS[item.modalidadMenu] ?? item.modalidadMenu)}</span>`
      : '';

  const cantidadSuffix =
    tipo === 'menu' && item.modalidadMenu === 'POR_PERSONA'
      ? `<span class="qty-note">personas</span>`
      : '';

  const foto = item.fotoUrl
    ? `<img src="${escapeAttr(item.fotoUrl)}" alt="" class="item-foto"/>`
    : `<span class="item-foto-placeholder"></span>`;

  return `<tr>
    <td class="cell-desc">
      <div class="item-row">
        ${foto}
        <div class="item-body">
          <span class="badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
          ${modalidad}
          <div class="item-title">${escapeHtml(item.descripcion)}</div>
          ${renderPlatillosHtml(item.platillos)}
        </div>
      </div>
    </td>
    <td class="cell-qty">
      <span class="qty-value">${item.cantidad}</span>
      ${cantidadSuffix}
    </td>
    <td class="cell-num">${formatMoneyMx(item.precioUnitario, moneda)}</td>
    <td class="cell-num cell-subtotal">${formatMoneyMx(item.subtotal, moneda)}</td>
  </tr>`;
}

export function buildCotizacionProveedorHtml(input: {
  folio: string;
  titulo?: string | null;
  fechaEvento?: Date | null;
  lugarEntrega?: string | null;
  validoHasta?: Date | null;
  notas?: string | null;
  moneda: string;
  ivaIncluido: boolean;
  ivaPorcentaje: number;
  costoEnvio: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  subtotal: number;
  montoIva: number;
  total: number;
  proveedor: {
    nombre: string;
    contacto?: string | null;
    email?: string | null;
    telefono?: string | null;
    sitioWeb?: string | null;
  };
  perfil?: {
    logoUrl?: string | null;
    politicasRenta?: string | null;
    condicionesCancelacion?: string | null;
  } | null;
  cliente: {
    nombre: string;
    empresa?: string | null;
    email?: string | null;
    telefono?: string | null;
  };
  items: CotizacionPdfItem[];
}) {
  const emitidaEl = formatFechaLarga(new Date());
  const logo = input.perfil?.logoUrl
    ? `<img src="${escapeAttr(input.perfil.logoUrl)}" alt="Logo" class="logo"/>`
    : '';

  const contactoProveedor = [
    input.proveedor.email,
    input.proveedor.telefono,
    input.proveedor.sitioWeb,
  ]
    .filter(Boolean)
    .map((v) => escapeHtml(String(v)))
    .join(' · ');

  const clienteContacto = [input.cliente.email, input.cliente.telefono]
    .filter(Boolean)
    .map((v) => escapeHtml(String(v)))
    .join(' · ');

  const filas = input.items.map((i) => renderItemRow(i, input.moneda)).join('');

  const body = `
    <header class="doc-header">
      <div class="doc-brand">
        ${logo}
        <h1 class="proveedor-nombre">${escapeHtml(input.proveedor.nombre)}</h1>
        ${input.proveedor.contacto ? `<p class="proveedor-contacto">${escapeHtml(input.proveedor.contacto)}</p>` : ''}
        ${contactoProveedor ? `<p class="proveedor-contacto">${contactoProveedor}</p>` : ''}
      </div>
      <div class="doc-meta">
        <p class="doc-title">COTIZACIÓN</p>
        <p class="doc-folio">${escapeHtml(input.folio)}</p>
        <p class="doc-fecha">Emitida: ${emitidaEl}</p>
        ${input.fechaEvento ? `<p class="doc-fecha">Evento: ${formatFechaLarga(input.fechaEvento)}</p>` : ''}
        ${input.validoHasta ? `<p class="doc-fecha">Válida hasta: ${formatFechaLarga(input.validoHasta)}</p>` : ''}
      </div>
    </header>

    <section class="info-grid">
      <div class="info-box">
        <p class="info-label">Cliente</p>
        <p class="info-value">${escapeHtml(input.cliente.nombre)}</p>
        ${input.cliente.empresa ? `<p class="info-sub">${escapeHtml(input.cliente.empresa)}</p>` : ''}
        ${clienteContacto ? `<p class="info-sub">${clienteContacto}</p>` : ''}
      </div>
      <div class="info-box">
        <p class="info-label">Detalle del evento</p>
        ${input.titulo ? `<p class="info-value">${escapeHtml(input.titulo)}</p>` : '<p class="info-sub">—</p>'}
        ${input.lugarEntrega ? `<p class="info-sub"><strong>Entrega:</strong> ${escapeHtml(input.lugarEntrega)}</p>` : ''}
      </div>
    </section>

    <table class="items">
      <colgroup>
        <col class="col-desc"/>
        <col class="col-qty"/>
        <col class="col-price"/>
        <col class="col-sub"/>
      </colgroup>
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Cant.</th>
          <th>P. unitario</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>

    <div class="totals-wrap">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal conceptos</span><span>${formatMoneyMx(input.subtotal, input.moneda)}</span></div>
        <div class="totals-row"><span>Envío</span><span>${formatMoneyMx(input.costoEnvio, input.moneda)}</span></div>
        ${
          input.descuentoMonto > 0
            ? `<div class="totals-row descuento"><span>Descuento (${input.descuentoPorcentaje}%)</span><span>-${formatMoneyMx(input.descuentoMonto, input.moneda)}</span></div>`
            : ''
        }
        <div class="totals-row"><span>IVA (${input.ivaPorcentaje}%${input.ivaIncluido ? ' incl.' : ''})</span><span>${formatMoneyMx(input.montoIva, input.moneda)}</span></div>
        <div class="totals-row total"><span>Total</span><span>${formatMoneyMx(input.total, input.moneda)}</span></div>
      </div>
    </div>

    ${
      input.notas
        ? `<section class="notas"><p class="notas-titulo">Notas</p><p class="notas-texto">${escapeHtml(input.notas)}</p></section>`
        : ''
    }
    ${
      input.perfil?.politicasRenta
        ? `<section class="legal"><p><strong>Políticas de renta:</strong> ${escapeHtml(input.perfil.politicasRenta)}</p></section>`
        : ''
    }
    ${
      input.perfil?.condicionesCancelacion
        ? `<section class="legal"><p><strong>Condiciones de cancelación:</strong> ${escapeHtml(input.perfil.condicionesCancelacion)}</p></section>`
        : ''
    }
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Cotización ${escapeHtml(input.folio)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      max-width: 210mm;
      margin: 0 auto;
      padding: 14mm 16mm;
      color: #0f172a;
      font-size: 10.5pt;
      line-height: 1.45;
      background: #fff;
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #0d9488;
      margin-bottom: 20px;
    }
    .logo { height: 52px; max-width: 180px; object-fit: contain; display: block; margin-bottom: 8px; }
    .proveedor-nombre { font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .proveedor-contacto { font-size: 9pt; color: #64748b; margin-top: 2px; }
    .doc-meta { text-align: right; min-width: 200px; }
    .doc-title { font-size: 18pt; font-weight: 800; letter-spacing: 0.06em; color: #0d9488; margin-bottom: 4px; }
    .doc-folio { font-size: 11pt; font-weight: 600; color: #334155; margin-bottom: 6px; }
    .doc-fecha { font-size: 9pt; color: #64748b; margin-top: 2px; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .info-label {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 6px;
    }
    .info-value { font-weight: 600; color: #0f172a; }
    .info-sub { font-size: 9pt; color: #475569; margin-top: 4px; }
    table.items {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin: 0 0 20px;
      font-size: 9.5pt;
    }
    col.col-desc { width: 46%; }
    col.col-qty { width: 12%; }
    col.col-price { width: 21%; }
    col.col-sub { width: 21%; }
    table.items th {
      background: #f1f5f9;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.05em;
      color: #475569;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    table.items th:nth-child(2) { text-align: center; }
    table.items th:nth-child(3),
    table.items th:nth-child(4) { text-align: right; }
    table.items td {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .cell-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .cell-subtotal { font-weight: 600; color: #0f172a; }
    .cell-qty { text-align: center; vertical-align: middle; }
    .qty-value { font-weight: 600; font-variant-numeric: tabular-nums; display: block; }
    .qty-note { font-size: 7.5pt; color: #64748b; display: block; margin-top: 2px; }
    .item-row { display: flex; align-items: flex-start; gap: 10px; }
    .item-foto {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .item-foto-placeholder { width: 44px; flex-shrink: 0; }
    .item-body { min-width: 0; flex: 1; }
    .badge {
      display: inline-block;
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 6px;
      margin-bottom: 4px;
    }
    .badge-producto { background: #ccfbf1; color: #0f766e; }
    .badge-servicio { background: #ede9fe; color: #6d28d9; }
    .badge-menu { background: #fef3c7; color: #b45309; }
    .badge-manual { background: #f1f5f9; color: #475569; }
    .item-meta { font-size: 8pt; color: #64748b; }
    .item-title { font-weight: 600; color: #0f172a; margin-top: 2px; word-break: break-word; }
    .platillos { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
    .platillo-seccion { margin-bottom: 6px; }
    .platillo-seccion-titulo {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #94a3b8;
    }
    .platillos ul { margin: 2px 0 0 14px; padding: 0; }
    .platillos li { font-size: 8.5pt; color: #475569; margin-bottom: 1px; }
    .platillo-desc { color: #94a3b8; }
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .totals-box {
      width: 100%;
      max-width: 300px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 9px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 9.5pt;
    }
    .totals-row span:last-child { font-variant-numeric: tabular-nums; white-space: nowrap; }
    .totals-row.descuento { color: #059669; }
    .totals-row.total {
      background: #f0fdfa;
      font-weight: 700;
      font-size: 11pt;
      color: #0f172a;
      border-bottom: none;
    }
    .notas { margin-top: 20px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fffbeb; }
    .notas-titulo { font-weight: 700; font-size: 9pt; text-transform: uppercase; color: #92400e; margin-bottom: 6px; }
    .notas-texto { font-size: 9.5pt; color: #78350f; white-space: pre-wrap; }
    .legal { margin-top: 16px; font-size: 8pt; color: #64748b; line-height: 1.5; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 7.5pt; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 8mm 10mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr { page-break-inside: avoid; }
      .info-box, .totals-box, .notas { break-inside: avoid; }
    }
    @media (max-width: 640px) {
      body { padding: 12px; }
      .doc-header { flex-direction: column; }
      .doc-meta { text-align: left; }
      .info-grid { grid-template-columns: 1fr; }
      col.col-desc { width: 40%; }
    }
  </style>
</head>
<body>
  ${body}
  <div class="footer">Documento generado desde el portal de proveedor — EventOS</div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string) {
  return escapeHtml(value);
}

export function pickFotoProductoUrl(
  fotos: Array<{ url: string; esPrincipal: boolean; orden: number }> | undefined | null,
): string | undefined {
  if (!fotos?.length) return undefined;
  const principal = fotos.find((f) => f.esPrincipal);
  return principal?.url ?? fotos[0]?.url;
}

export function mapCotizacionItemParaPdf(item: {
  descripcion: string;
  cantidad: number;
  precioUnitario: unknown;
  subtotal: unknown;
  productoProveedorId?: string | null;
  servicioProveedorId?: string | null;
  menuBanqueteProveedorId?: string | null;
  modalidadPrecioMenu?: 'POR_PERSONA' | 'POR_EVENTO' | null;
  productoProveedor?: { fotos?: Array<{ url: string; esPrincipal: boolean; orden: number }> } | null;
  menuBanquete?: {
    platillos?: Array<{ seccion: string; nombre: string; descripcion?: string | null }>;
  } | null;
}): CotizacionPdfItem {
  let tipo: CotizacionPdfItem['tipo'] = 'manual';
  if (item.productoProveedorId) tipo = 'producto';
  else if (item.servicioProveedorId) tipo = 'servicio';
  else if (item.menuBanqueteProveedorId) tipo = 'menu';

  return {
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precioUnitario: Number(item.precioUnitario),
    subtotal: Number(item.subtotal),
    fotoUrl: pickFotoProductoUrl(item.productoProveedor?.fotos),
    tipo,
    modalidadMenu: item.modalidadPrecioMenu ?? null,
    platillos: item.menuBanquete?.platillos?.map((p) => ({
      seccion: p.seccion,
      nombre: p.nombre,
      descripcion: p.descripcion,
    })),
  };
}
