export { abrirPdfHtml } from './cotizacion-proveedor';

import type { TipoServicioContrato } from './types';

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

export type PdfVarsInput = {
  clienteNombre: string;
  clienteEmpresa: string;
  clienteEmail: string;
  clienteTelefono: string;
  fechaEvento: string;
  lugarEvento: string;
  montoTotal: string;
  servicioNombre: string;
};

export const TIPO_SERVICIO_CONTRATO_PREVIEW: Record<TipoServicioContrato, string> = {
  GENERAL: 'Contrato general',
  RENTA_MOBILIARIO: 'Renta de mobiliario',
  SERVICIO: 'Servicio',
  BANQUETE: 'Banquete',
};

export function pdfVarsToVariables(
  pdfVars: PdfVarsInput,
  proveedor?: { nombre?: string; rfc?: string | null },
): VariablesContrato {
  return {
    cliente_nombre: pdfVars.clienteNombre || undefined,
    cliente_empresa: pdfVars.clienteEmpresa || undefined,
    cliente_email: pdfVars.clienteEmail || undefined,
    cliente_telefono: pdfVars.clienteTelefono || undefined,
    fecha_evento: pdfVars.fechaEvento || undefined,
    lugar_evento: pdfVars.lugarEvento || undefined,
    monto_total: pdfVars.montoTotal || undefined,
    servicio_nombre: pdfVars.servicioNombre || undefined,
    proveedor_nombre: proveedor?.nombre,
    proveedor_rfc: proveedor?.rfc ?? undefined,
    fecha_contrato: new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date()),
  };
}

export type TextoVariablePart =
  | { kind: 'text'; text: string }
  | { kind: 'var'; key: string; value: string | null };

export function splitVariablesText(texto: string, variables: VariablesContrato): TextoVariablePart[] {
  const parts: TextoVariablePart[] = [];
  const regex = /\{\{\s*([a-z_]+)\s*\}\}/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'text', text: texto.slice(lastIndex, match.index) });
    }
    const key = match[1].toLowerCase();
    const value = variables[key as keyof VariablesContrato]?.trim() || null;
    parts.push({ kind: 'var', key, value });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < texto.length) {
    parts.push({ kind: 'text', text: texto.slice(lastIndex) });
  }

  return parts.length ? parts : [{ kind: 'text', text: texto }];
}

export const VARIABLES_CONTRATO_AYUDA = [
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
] as const;

export function nuevaSeccionContrato(orden: number) {
  return {
    id: `sec-${Date.now()}-${orden}`,
    titulo: 'Nueva cláusula',
    contenido: '',
    orden,
  };
}

export function seccionesSugeridas(tipo: TipoServicioContrato) {
  const base = [
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
