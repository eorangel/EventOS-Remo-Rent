import { formatMoney } from './labels';

export type WhatsAppMensajeCotizacion = {
  tipo: 'cotizacion';
  clienteNombre: string;
  proveedorNombre: string;
  folio: string;
  total: number;
  fechaEvento?: string | null;
  lugarEntrega?: string | null;
  titulo?: string | null;
};

export type WhatsAppMensajeContrato = {
  tipo: 'contrato';
  clienteNombre: string;
  proveedorNombre: string;
  contratoNombre: string;
  fechaEvento?: string | null;
  montoTotal?: string | null;
};

export type WhatsAppMensajeCobro = {
  tipo: 'cobro';
  clienteNombre: string;
  proveedorNombre: string;
  folio: string;
  concepto: string;
  monto: number;
  estado: 'PENDIENTE' | 'ANTICIPO' | 'VENCIDO';
  fechaVencimiento?: string | null;
  linkPago?: string | null;
};

export type WhatsAppMensajeSeguimiento = {
  tipo: 'seguimiento';
  clienteNombre: string;
  proveedorNombre: string;
};

export type WhatsAppMensajeInput =
  | WhatsAppMensajeCotizacion
  | WhatsAppMensajeContrato
  | WhatsAppMensajeCobro
  | WhatsAppMensajeSeguimiento;

export function getPublicAppUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || 'https://app.remoconecta.com';
}

export function normalizePhoneMx(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `521${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return digits;
  if (digits.length === 13 && digits.startsWith('521')) return digits;
  return null;
}

export function buildWhatsAppUrl(telefono: string, mensaje: string) {
  const normalized = normalizePhoneMx(telefono);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(mensaje)}`;
}

function formatFechaEvento(fecha?: string | null) {
  if (!fecha) return null;
  const day = fecha.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return fecha;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(`${day}T12:00:00`));
}

function formatFechaCorta(fecha?: string | null) {
  if (!fecha) return null;
  const day = fecha.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return fecha;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${day}T12:00:00`));
}

export function buildWhatsAppMensaje(input: WhatsAppMensajeInput): string {
  const saludo = input.clienteNombre.trim()
    ? `Hola ${input.clienteNombre.trim()}`
    : 'Hola';

  if (input.tipo === 'cotizacion') {
    const lineas = [
      `${saludo},`,
      '',
      `Te comparto la cotización *${input.folio}* de *${input.proveedorNombre}*:`,
      '',
    ];

    if (input.titulo?.trim()) lineas.push(`• Evento: ${input.titulo.trim()}`);
    const fecha = formatFechaEvento(input.fechaEvento);
    if (fecha) lineas.push(`• Fecha: ${fecha}`);
    if (input.lugarEntrega?.trim()) lineas.push(`• Lugar: ${input.lugarEntrega.trim()}`);
    lineas.push(`• Total: ${formatMoney(input.total)}`);
    lineas.push(
      '',
      'Revisa el detalle y confírmame si deseas apartar la fecha.',
      'Te envío el PDF en el siguiente mensaje.',
      '',
      `— ${input.proveedorNombre}`,
    );
    return lineas.join('\n');
  }

  if (input.tipo === 'contrato') {
    const lineas = [
      `${saludo},`,
      '',
      `Te comparto el contrato *${input.contratoNombre}* de *${input.proveedorNombre}* para tu evento.`,
      '',
    ];
    if (input.fechaEvento?.trim()) lineas.push(`• Fecha del evento: ${input.fechaEvento.trim()}`);
    if (input.montoTotal?.trim()) lineas.push(`• Monto acordado: ${input.montoTotal.trim()}`);
    lineas.push(
      '',
      'Por favor revísalo, fírmalo de conformidad y envíanoslo de regreso.',
      'Te adjunto el PDF en el siguiente mensaje.',
      '',
      `— ${input.proveedorNombre}`,
    );
    return lineas.join('\n');
  }

  if (input.tipo === 'cobro') {
    const esAnticipo = input.estado === 'ANTICIPO';
    const esVencido = input.estado === 'VENCIDO';
    const intro = esAnticipo
      ? 'Te recordamos el *saldo pendiente* de tu evento:'
      : esVencido
        ? 'Te recordamos un pago *vencido*:'
        : 'Te compartimos los datos para tu pago:';

    const lineas = [
      `${saludo},`,
      '',
      intro,
      '',
      `• Referencia: ${input.folio}`,
      `• Concepto: ${input.concepto}`,
      `• Monto: ${formatMoney(input.monto)}`,
    ];

    const vence = formatFechaCorta(input.fechaVencimiento);
    if (vence) lineas.push(`• Vence: ${vence}`);

    if (input.linkPago?.trim()) {
      lineas.push('', `Puedes pagar en línea aquí: ${input.linkPago.trim()}`);
    } else {
      lineas.push('', 'Contáctanos para confirmar la forma de pago (transferencia SPEI u otra acordada).');
    }

    lineas.push('', `— ${input.proveedorNombre}`);
    return lineas.join('\n');
  }

  return [
    `${saludo},`,
    '',
    `Te escribe *${input.proveedorNombre}* para dar seguimiento a tu evento.`,
    '',
    '¿Tienes alguna duda o comentario? Con gusto te apoyamos.',
    '',
    `— ${input.proveedorNombre}`,
  ].join('\n');
}

export function resolveWhatsAppPhone(
  telefono?: string | null,
  promptLabel = 'Teléfono del cliente (10 dígitos)',
): string | null {
  const trimmed = telefono?.trim();
  if (trimmed && normalizePhoneMx(trimmed)) return trimmed;

  const ingresado = window.prompt(
    trimmed
      ? `El teléfono "${trimmed}" no es válido. ${promptLabel}:`
      : `Indica el ${promptLabel.toLowerCase()}:`,
  );
  if (!ingresado?.trim()) return null;
  if (!normalizePhoneMx(ingresado)) {
    window.alert('Verifica el número: deben ser 10 dígitos (México) o incluir código +52.');
    return null;
  }
  return ingresado.trim();
}

export function openWhatsAppShare(input: {
  telefono?: string | null;
  mensaje: string;
  promptLabel?: string;
}) {
  const telefono = resolveWhatsAppPhone(input.telefono, input.promptLabel);
  if (!telefono) return false;

  const url = buildWhatsAppUrl(telefono, input.mensaje);
  if (!url) {
    window.alert('No se pudo generar el enlace de WhatsApp. Verifica el teléfono.');
    return false;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
