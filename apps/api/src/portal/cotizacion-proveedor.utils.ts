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
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    fotoUrl?: string | null;
  }>;
}) {
  const logo = input.perfil?.logoUrl
    ? `<img src="${input.perfil.logoUrl}" alt="Logo" style="height:56px;object-fit:contain"/>`
    : '';
  const contactoProveedor = [
    input.proveedor.email,
    input.proveedor.telefono,
    input.proveedor.sitioWeb,
  ]
    .filter(Boolean)
    .join(' · ');
  const filas = input.items
    .map(
      (i) => `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.75rem">
            ${
              i.fotoUrl
                ? `<img src="${escapeAttr(i.fotoUrl)}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0"/>`
                : ''
            }
            <span>${escapeHtml(i.descripcion)}</span>
          </div>
        </td>
        <td style="text-align:center">${i.cantidad}</td>
        <td style="text-align:right">${formatMoneyMx(i.precioUnitario, input.moneda)}</td>
        <td style="text-align:right">${formatMoneyMx(i.subtotal, input.moneda)}</td>
      </tr>`,
    )
    .join('');

  const body = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:2rem">
      <div>${logo}<h1 style="margin:0.5rem 0 0">${escapeHtml(input.proveedor.nombre)}</h1></div>
      <div style="text-align:right">
        <p style="font-size:1.25rem;font-weight:700;margin:0">COTIZACIÓN</p>
        <p class="meta">${escapeHtml(input.folio)}</p>
        ${input.fechaEvento ? `<p class="meta">Evento: ${formatFechaLarga(input.fechaEvento)}</p>` : ''}
        ${input.validoHasta ? `<p class="meta">Válida hasta: ${formatFechaLarga(input.validoHasta)}</p>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
      <div>
        <p style="font-weight:600;margin-bottom:0.25rem">Contacto</p>
        ${input.proveedor.contacto ? `<p style="margin:0;font-size:0.875rem">${escapeHtml(input.proveedor.contacto)}</p>` : ''}
        ${contactoProveedor ? `<p style="margin:0;font-size:0.875rem">${escapeHtml(contactoProveedor)}</p>` : ''}
      </div>
      <div>
        <p style="font-weight:600;margin-bottom:0.25rem">Cliente</p>
        <p style="margin:0">${escapeHtml(input.cliente.nombre)}</p>
        ${input.cliente.empresa ? `<p style="margin:0;font-size:0.875rem">${escapeHtml(input.cliente.empresa)}</p>` : ''}
        <p style="margin:0;font-size:0.875rem">${[input.cliente.email, input.cliente.telefono].filter(Boolean).join(' · ')}</p>
      </div>
    </div>
    ${input.lugarEntrega ? `<p><strong>Entrega:</strong> ${escapeHtml(input.lugarEntrega)}</p>` : ''}
    ${input.titulo ? `<p><strong>Concepto:</strong> ${escapeHtml(input.titulo)}</p>` : ''}
    <table>
      <thead><tr><th>Producto / servicio</th><th>Cant.</th><th>P. unitario</th><th>Subtotal</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div style="max-width:320px;margin-left:auto;font-size:0.9rem">
      <div style="display:flex;justify-content:space-between;padding:0.25rem 0"><span>Subtotal productos</span><span>${formatMoneyMx(input.subtotal, input.moneda)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.25rem 0"><span>Envío</span><span>${formatMoneyMx(input.costoEnvio, input.moneda)}</span></div>
      ${input.descuentoMonto > 0 ? `<div style="display:flex;justify-content:space-between;padding:0.25rem 0;color:#059669"><span>Descuento (${input.descuentoPorcentaje}%)</span><span>-${formatMoneyMx(input.descuentoMonto, input.moneda)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:0.25rem 0"><span>IVA (${input.ivaPorcentaje}%${input.ivaIncluido ? ' incl.' : ''})</span><span>${formatMoneyMx(input.montoIva, input.moneda)}</span></div>
      <div class="total" style="border-top:2px solid #e2e8f0;padding-top:0.5rem;margin-top:0.5rem">Total: ${formatMoneyMx(input.total, input.moneda)}</div>
    </div>
    ${input.notas ? `<p style="margin-top:2rem;font-size:0.875rem"><strong>Notas:</strong> ${escapeHtml(input.notas)}</p>` : ''}
    ${input.perfil?.politicasRenta ? `<p style="margin-top:1.5rem;font-size:0.75rem;color:#64748b"><strong>Políticas de renta:</strong> ${escapeHtml(input.perfil.politicasRenta)}</p>` : ''}
    ${input.perfil?.condicionesCancelacion ? `<p style="font-size:0.75rem;color:#64748b"><strong>Cancelación:</strong> ${escapeHtml(input.perfil.condicionesCancelacion)}</p>` : ''}
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Cotización ${escapeHtml(input.folio)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; color: #1e293b; line-height: 1.5; }
    .meta { color: #64748b; font-size: 0.875rem; margin: 0.15rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f8fafc; }
    @media print { body { margin: 1rem; } }
  </style>
</head>
<body>${body}
<div style="margin-top:3rem;font-size:0.75rem;color:#94a3b8">Generado desde el portal de proveedor — EventOS</div>
</body></html>`;
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
