export type BriefingAgendaItem = {
  id: string;
  titulo: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  estado: string;
  lugar?: string | null;
  subtipo?: string;
  monto?: number;
  enlace?: string;
  vencido?: boolean;
};

export type BriefingAgendaData = {
  fecha: string;
  esHoy: boolean;
  resumen: {
    entregas: number;
    recogidas: number;
    eventos: number;
    cobros: number;
    seguimientos: number;
    pagosPendientes: number;
  };
  secciones: {
    entregas: BriefingAgendaItem[];
    recogidas: BriefingAgendaItem[];
    eventos: BriefingAgendaItem[];
    cobros: BriefingAgendaItem[];
    seguimientos: BriefingAgendaItem[];
    pagosPendientes: BriefingAgendaItem[];
  };
};

export type BriefingContent = {
  fecha: string;
  fechaLabel: string;
  empresaNombre: string;
  destinatarioNombre: string;
  resumen: BriefingAgendaData['resumen'];
  cobrosVencidos: BriefingAgendaItem[];
  secciones: BriefingAgendaData['secciones'];
  texto: string;
  html: string;
  subject: string;
  vacio: boolean;
};

const MAX_COBROS_VENCIDOS = 3;

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

function formatFechaLarga(fecha: string) {
  const day = fecha.slice(0, 10);
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(new Date(`${day}T12:00:00`));
}

function formatHora(fechaISO: string) {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  }).format(new Date(fechaISO));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function lineaItem(item: BriefingAgendaItem, incluirMonto = false) {
  const hora = formatHora(item.fecha);
  const lugar = item.lugar?.trim() ? ` · ${item.lugar.trim()}` : '';
  const monto = incluirMonto && item.monto != null ? ` · ${formatMoney(item.monto)}` : '';
  return `• ${hora} — ${item.titulo} — ${item.clienteNombre}${lugar}${monto}`;
}

function seccionTexto(titulo: string, items: BriefingAgendaItem[], incluirMonto = false) {
  if (!items.length) return '';
  return [`${titulo} (${items.length})`, ...items.map((i) => lineaItem(i, incluirMonto)), ''].join('\n');
}

function seccionHtml(
  titulo: string,
  items: BriefingAgendaItem[],
  appBase: string,
  incluirMonto = false,
) {
  if (!items.length) return '';
  const rows = items
    .map((item) => {
      const hora = formatHora(item.fecha);
      const lugar = item.lugar?.trim() ? ` · ${escapeHtml(item.lugar.trim())}` : '';
      const monto = incluirMonto && item.monto != null ? ` · ${formatMoney(item.monto)}` : '';
      const href = item.enlace ? `${appBase}${item.enlace}` : `${appBase}/proveedor/calendario`;
      return `<li><a href="${href}" style="color:#0f766e;text-decoration:none"><strong>${hora}</strong> — ${escapeHtml(item.titulo)} — ${escapeHtml(item.clienteNombre)}${lugar}${monto}</a></li>`;
    })
    .join('');
  return `<h3 style="margin:20px 0 8px;font-size:15px;color:#0f172a">${escapeHtml(titulo)} (${items.length})</h3><ul style="margin:0 0 4px;padding-left:20px;color:#334155;line-height:1.6">${rows}</ul>`;
}

export function buildBriefingContent(input: {
  agenda: BriefingAgendaData;
  empresaNombre: string;
  destinatarioNombre: string;
  appBaseUrl: string;
}): BriefingContent {
  const { agenda, empresaNombre, destinatarioNombre, appBaseUrl } = input;
  const appBase = appBaseUrl.replace(/\/$/, '');
  const fechaLabel = formatFechaLarga(agenda.fecha);

  const idsCobrosHoy = new Set(agenda.secciones.cobros.map((c) => c.id));
  const cobrosVencidos = agenda.secciones.pagosPendientes
    .filter((c) => c.vencido && !idsCobrosHoy.has(c.id))
    .slice(0, MAX_COBROS_VENCIDOS);

  const saludo = destinatarioNombre.trim()
    ? `Buenos días, ${destinatarioNombre.trim()}`
    : 'Buenos días';

  const bloquesTexto = [
    seccionTexto('📦 ENTREGAS', agenda.secciones.entregas),
    seccionTexto('🔄 RECOGIDAS', agenda.secciones.recogidas),
    seccionTexto('🎉 EVENTOS', agenda.secciones.eventos),
    seccionTexto('💰 COBROS QUE VENCEN HOY', agenda.secciones.cobros, true),
    seccionTexto('📞 SEGUIMIENTOS', agenda.secciones.seguimientos),
    seccionTexto('⚠️ COBROS VENCIDOS', cobrosVencidos, true),
  ].filter(Boolean);

  const vacio = bloquesTexto.length === 0;

  const texto = [
    `${saludo},`,
    '',
    `Resumen de hoy — ${fechaLabel}`,
    empresaNombre,
    '',
    vacio
      ? 'No tienes entregas, eventos, cobros ni seguimientos programados para hoy. ¡Buen día!'
      : bloquesTexto.join('\n').trimEnd(),
    '',
    `Ver calendario: ${appBase}/proveedor/calendario`,
    '',
    '— RemoConecta',
  ].join('\n');

  const bloquesHtml = [
    seccionHtml('Entregas', agenda.secciones.entregas, appBase),
    seccionHtml('Recogidas', agenda.secciones.recogidas, appBase),
    seccionHtml('Eventos', agenda.secciones.eventos, appBase),
    seccionHtml('Cobros que vencen hoy', agenda.secciones.cobros, appBase, true),
    seccionHtml('Seguimientos', agenda.secciones.seguimientos, appBase),
    seccionHtml('Cobros vencidos', cobrosVencidos, appBase, true),
  ].filter(Boolean);

  const html = `<!DOCTYPE html>
<html lang="es">
<body style="font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:28px">
    <p style="margin:0 0 8px;color:#64748b;font-size:14px">Resumen matutino</p>
    <h1 style="margin:0 0 4px;font-size:22px;color:#0f172a">${escapeHtml(fechaLabel)}</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:14px">${escapeHtml(empresaNombre)}</p>
    <p style="margin:0 0 16px;color:#334155;line-height:1.5">${escapeHtml(saludo)}, aquí tienes tu agenda del día:</p>
    ${
      vacio
        ? '<p style="color:#64748b">No hay actividades programadas para hoy.</p>'
        : bloquesHtml.join('')
    }
    <p style="margin-top:28px">
      <a href="${appBase}/proveedor/calendario" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Abrir calendario</a>
    </p>
    <p style="margin-top:24px;font-size:12px;color:#94a3b8">RemoConecta · Briefing automático</p>
  </div>
</body>
</html>`;

  const subject = vacio
    ? `Briefing ${agenda.fecha} — Sin actividades · ${empresaNombre}`
    : `Briefing ${agenda.fecha} — ${agenda.resumen.entregas + agenda.resumen.recogidas + agenda.resumen.eventos} actividades · ${empresaNombre}`;

  return {
    fecha: agenda.fecha,
    fechaLabel,
    empresaNombre,
    destinatarioNombre,
    resumen: agenda.resumen,
    cobrosVencidos,
    secciones: agenda.secciones,
    texto,
    html,
    subject,
    vacio,
  };
}

export function hoyEnMexico(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function horaActualMexico(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}
