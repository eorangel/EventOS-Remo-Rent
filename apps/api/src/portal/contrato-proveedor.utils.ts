import { TipoServicioContrato } from '@prisma/client';

export type SeccionContrato = {
  id: string;
  titulo: string;
  contenido: string;
  orden: number;
};

export type VariablesContrato = {
  cliente_nombre?: string;
  cliente_empresa?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  fecha_evento?: string;
  lugar_evento?: string;
  monto_total?: string;
  servicio_nombre?: string;
  proveedor_nombre?: string;
  proveedor_rfc?: string;
  fecha_contrato?: string;
};

export const VARIABLES_CONTRATO_AYUDA: Array<{ key: keyof VariablesContrato; label: string }> = [
  { key: 'cliente_nombre', label: 'Nombre del cliente' },
  { key: 'cliente_empresa', label: 'Empresa del cliente' },
  { key: 'cliente_email', label: 'Email del cliente' },
  { key: 'cliente_telefono', label: 'Teléfono del cliente' },
  { key: 'fecha_evento', label: 'Fecha del evento' },
  { key: 'lugar_evento', label: 'Lugar del evento' },
  { key: 'monto_total', label: 'Monto total' },
  { key: 'servicio_nombre', label: 'Nombre del servicio' },
  { key: 'proveedor_nombre', label: 'Nombre del proveedor' },
  { key: 'proveedor_rfc', label: 'RFC del proveedor' },
  { key: 'fecha_contrato', label: 'Fecha del contrato' },
];

const TIPO_SERVICIO_LABELS: Record<string, string> = {
  GENERAL: 'Contrato general',
  RENTA_MOBILIARIO: 'Renta de mobiliario',
  SERVICIO: 'Servicio',
  BANQUETE: 'Banquete',
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function formatFechaLarga(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(date);
}

export function aplicarVariables(texto: string, variables: VariablesContrato) {
  return texto.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, key: string) => {
    const normalized = key.toLowerCase() as keyof VariablesContrato;
    const value = variables[normalized];
    return value?.trim() ? value : `[${key}]`;
  });
}

export function seccionesPorDefecto(tipo: TipoServicioContrato): SeccionContrato[] {
  const base: SeccionContrato[] = [
    {
      id: 'objeto',
      titulo: 'Objeto del contrato',
      contenido:
        'El presente contrato tiene por objeto la prestación del servicio de {{servicio_nombre}} a favor de {{cliente_nombre}}, para el evento programado el {{fecha_evento}} en {{lugar_evento}}.',
      orden: 0,
    },
    {
      id: 'vigencia',
      titulo: 'Vigencia y entrega',
      contenido:
        'La vigencia del presente contrato comprende desde la firma del mismo hasta la conclusión del evento. El proveedor se compromete a entregar el servicio en la fecha, hora y lugar acordados.',
      orden: 1,
    },
    {
      id: 'precio',
      titulo: 'Precio y forma de pago',
      contenido:
        'El monto total acordado es de {{monto_total}}. El cliente se obliga a cubrir los pagos según el calendario acordado entre las partes.',
      orden: 2,
    },
    {
      id: 'responsabilidades',
      titulo: 'Responsabilidades',
      contenido:
        'El cliente garantizará el acceso al lugar del evento en las condiciones acordadas. El proveedor {{proveedor_nombre}} responderá por la correcta prestación del servicio contratado.',
      orden: 3,
    },
    {
      id: 'cancelacion',
      titulo: 'Cancelación',
      contenido:
        'En caso de cancelación, aplicarán las políticas y condiciones previamente informadas por el proveedor. Cualquier penalización se calculará conforme a lo pactado entre las partes.',
      orden: 4,
    },
    {
      id: 'firmas',
      titulo: 'Firmas',
      contenido:
        'Leído y conforme, las partes firman el presente contrato en {{fecha_contrato}}.',
      orden: 5,
    },
  ];

  if (tipo === 'RENTA_MOBILIARIO') {
    base[0].contenido =
      'El presente contrato tiene por objeto la renta de mobiliario y equipo para el evento de {{cliente_nombre}}, programado el {{fecha_evento}} en {{lugar_evento}}.';
    base[3].contenido =
      'El cliente será responsable del uso adecuado del mobiliario rentado y de cualquier daño causado durante el evento, salvo desgaste normal. El proveedor {{proveedor_nombre}} entregará y recogerá el equipo en los horarios acordados.';
  }

  if (tipo === 'BANQUETE') {
    base[0].contenido =
      'El presente contrato tiene por objeto la prestación del servicio de banquete {{servicio_nombre}} para {{cliente_nombre}}, con fecha de evento {{fecha_evento}} en {{lugar_evento}}.';
    base[3].contenido =
      'El proveedor {{proveedor_nombre}} garantizará la calidad del servicio de alimentos y bebidas conforme al menú acordado. El cliente informará oportunamente el número final de asistentes y restricciones alimentarias relevantes.';
  }

  if (tipo === 'SERVICIO') {
    base[0].contenido =
      'El presente contrato formaliza la contratación del servicio {{servicio_nombre}} a favor de {{cliente_nombre}} para el evento del {{fecha_evento}} en {{lugar_evento}}.';
  }

  return base;
}

export function buildContratoProveedorHtml(input: {
  nombre: string;
  tipoServicio: TipoServicioContrato;
  secciones: SeccionContrato[];
  variables: VariablesContrato;
  proveedor: {
    nombre: string;
    razonSocial?: string | null;
    rfc?: string | null;
    contacto?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
  };
  perfil?: {
    logoUrl?: string | null;
    politicasRenta?: string | null;
    condicionesCancelacion?: string | null;
  } | null;
}) {
  const emitidaEl = formatFechaLarga(new Date());
  const vars: VariablesContrato = {
    ...input.variables,
    proveedor_nombre: input.variables.proveedor_nombre ?? input.proveedor.nombre,
    proveedor_rfc: input.variables.proveedor_rfc ?? input.proveedor.rfc ?? undefined,
    fecha_contrato: input.variables.fecha_contrato ?? emitidaEl,
  };

  const logo = input.perfil?.logoUrl
    ? `<img src="${escapeAttr(input.perfil.logoUrl)}" alt="Logo" class="logo"/>`
    : '';

  const contactoProveedor = [
    input.proveedor.email,
    input.proveedor.telefono,
    input.proveedor.direccion,
  ]
    .filter(Boolean)
    .map((v) => escapeHtml(String(v)))
    .join(' · ');

  const seccionesHtml = [...input.secciones]
    .sort((a, b) => a.orden - b.orden)
    .map((sec, idx) => {
      const titulo = aplicarVariables(sec.titulo, vars);
      const contenido = aplicarVariables(sec.contenido, vars)
        .split('\n')
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join('');
      return `<section class="clausula">
        <h2>${idx + 1}. ${escapeHtml(titulo)}</h2>
        ${contenido}
      </section>`;
    })
    .join('');

  const politicas = input.perfil?.politicasRenta
    ? `<section class="anexo"><h2>Anexo — Políticas de renta</h2><p>${escapeHtml(input.perfil.politicasRenta).replace(/\n/g, '<br/>')}</p></section>`
    : '';

  const cancelacion = input.perfil?.condicionesCancelacion
    ? `<section class="anexo"><h2>Anexo — Condiciones de cancelación</h2><p>${escapeHtml(input.perfil.condicionesCancelacion).replace(/\n/g, '<br/>')}</p></section>`
    : '';

  const body = `
    <header class="doc-header">
      <div class="doc-brand">
        ${logo}
        <h1 class="proveedor-nombre">${escapeHtml(input.proveedor.nombre)}</h1>
        ${input.proveedor.razonSocial ? `<p class="proveedor-meta">${escapeHtml(input.proveedor.razonSocial)}</p>` : ''}
        ${input.proveedor.rfc ? `<p class="proveedor-meta">RFC: ${escapeHtml(input.proveedor.rfc)}</p>` : ''}
        ${contactoProveedor ? `<p class="proveedor-meta">${contactoProveedor}</p>` : ''}
      </div>
      <div class="doc-meta">
        <p class="doc-tipo">Contrato de servicios</p>
        <p class="doc-subtipo">${escapeHtml(TIPO_SERVICIO_LABELS[input.tipoServicio] ?? input.tipoServicio)}</p>
        <p class="doc-fecha">Generado el ${emitidaEl}</p>
      </div>
    </header>

    <section class="contrato-titulo">
      <h1>${escapeHtml(aplicarVariables(input.nombre, vars))}</h1>
    </section>

    <section class="partes">
      <div class="parte">
        <h3>Proveedor</h3>
        <p><strong>${escapeHtml(vars.proveedor_nombre ?? input.proveedor.nombre)}</strong></p>
        ${vars.proveedor_rfc ? `<p>RFC: ${escapeHtml(vars.proveedor_rfc)}</p>` : ''}
      </div>
      <div class="parte">
        <h3>Cliente</h3>
        <p><strong>${escapeHtml(vars.cliente_nombre ?? '[cliente_nombre]')}</strong></p>
        ${vars.cliente_empresa ? `<p>${escapeHtml(vars.cliente_empresa)}</p>` : ''}
        ${vars.cliente_email ? `<p>${escapeHtml(vars.cliente_email)}</p>` : ''}
        ${vars.cliente_telefono ? `<p>${escapeHtml(vars.cliente_telefono)}</p>` : ''}
      </div>
    </section>

    ${seccionesHtml}
    ${politicas}
    ${cancelacion}

    <section class="firmas-bloque">
      <div class="firma">
        <div class="firma-linea"></div>
        <p>${escapeHtml(vars.proveedor_nombre ?? input.proveedor.nombre)}</p>
        <p class="firma-rol">Proveedor</p>
      </div>
      <div class="firma">
        <div class="firma-linea"></div>
        <p>${escapeHtml(vars.cliente_nombre ?? '[cliente_nombre]')}</p>
        <p class="firma-rol">Cliente</p>
      </div>
    </section>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>${escapeAttr(aplicarVariables(input.nombre, vars))}</title>
  <style>
    @page { margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 820px; margin: 0 auto; color: #0f172a; line-height: 1.55; font-size: 11pt; }
    .doc-header { display: flex; justify-content: space-between; gap: 2rem; border-bottom: 2px solid #0d9488; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .logo { max-height: 56px; max-width: 160px; object-fit: contain; margin-bottom: 0.5rem; display: block; }
    .proveedor-nombre { font-size: 1.25rem; margin: 0; color: #0f766e; }
    .proveedor-meta, .doc-meta p { margin: 0.15rem 0; color: #64748b; font-size: 0.85rem; }
    .doc-meta { text-align: right; min-width: 180px; }
    .doc-tipo { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
    .doc-subtipo { color: #0d9488; font-weight: 600; }
    .contrato-titulo h1 { font-size: 1.35rem; margin: 0 0 1.25rem; text-align: center; }
    .partes { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .parte { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; background: #f8fafc; }
    .parte h3 { margin: 0 0 0.35rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
    .parte p { margin: 0.15rem 0; font-size: 0.9rem; }
    .clausula { margin-bottom: 1.1rem; page-break-inside: avoid; }
    .clausula h2 { font-size: 0.95rem; margin: 0 0 0.35rem; color: #0f766e; }
    .clausula p { margin: 0.25rem 0; text-align: justify; }
    .anexo { margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px dashed #cbd5e1; page-break-inside: avoid; }
    .anexo h2 { font-size: 0.9rem; margin: 0 0 0.35rem; color: #475569; }
    .firmas-bloque { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2.5rem; page-break-inside: avoid; }
    .firma { text-align: center; }
    .firma-linea { border-top: 1px solid #334155; margin: 2.5rem 1rem 0.35rem; }
    .firma p { margin: 0.1rem 0; font-size: 0.85rem; }
    .firma-rol { color: #64748b; font-size: 0.75rem !important; }
    @media print {
      body { max-width: none; }
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

export function buildContratoArchivoHtml(input: {
  nombre: string;
  archivoNombre: string;
  archivoMime: string;
  archivoContenido: string;
}) {
  if (input.archivoMime === 'application/pdf') {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>${escapeAttr(input.nombre)}</title>
  <style>
    html, body { margin: 0; height: 100%; }
    iframe, embed { width: 100%; height: 100vh; border: 0; }
  </style>
</head>
<body>
  <embed src="data:application/pdf;base64,${input.archivoContenido}" type="application/pdf"/>
</body>
</html>`;
  }

  const downloadName = escapeAttr(input.archivoNombre);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>${escapeAttr(input.nombre)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 3rem auto; padding: 0 1rem; color: #334155; }
    .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
    a { color: #0d9488; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(input.nombre)}</h1>
    <p>Este contrato fue cargado como archivo (<strong>${escapeHtml(input.archivoNombre)}</strong>).</p>
    <p>Descarga el archivo original para revisarlo o imprimirlo.</p>
    <p><a download="${downloadName}" href="data:${escapeAttr(input.archivoMime)};base64,${input.archivoContenido}">Descargar ${escapeHtml(input.archivoNombre)}</a></p>
  </div>
</body>
</html>`;
}

export function extractBodyHtml(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1].trim() : html;
}

export function wrapContratoEmailHtml(input: {
  mensaje?: string | null;
  proveedorNombre: string;
  clienteNombre?: string | null;
  contractHtml: string;
}) {
  const body = extractBodyHtml(input.contractHtml);
  const saludo = input.clienteNombre
    ? `<p style="margin:0 0 12px;color:#334155;">Hola <strong>${escapeHtml(input.clienteNombre)}</strong>,</p>`
    : '';

  const intro = input.mensaje?.trim()
    ? `<p style="margin:0 0 16px;color:#334155;line-height:1.6;white-space:pre-wrap;">${escapeHtml(input.mensaje.trim())}</p>`
    : `<p style="margin:0 0 16px;color:#334155;line-height:1.6;">Adjuntamos el contrato de servicios de <strong>${escapeHtml(input.proveedorNombre)}</strong> para tu revisión y firma.</p>`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Segoe UI,system-ui,sans-serif;">
  <div style="max-width:820px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
    ${saludo}
    ${intro}
    <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:8px;">
      ${body}
    </div>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">Enviado por ${escapeHtml(input.proveedorNombre)} vía EventOS — Remo&amp;Rent</p>
  </div>
</body>
</html>`;
}
