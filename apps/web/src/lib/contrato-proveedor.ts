export { abrirPdfHtml } from './cotizacion-proveedor';

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

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const ARCHIVOS_CONTRATO_ACEPTADOS = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function seccionesSugeridas(tipo: import('./types').TipoServicioContrato) {
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
        'La vigencia del presente contrato comprende desde la firma del mismo hasta la conclusión del evento.',
      orden: 1,
    },
    {
      id: 'precio',
      titulo: 'Precio y forma de pago',
      contenido: 'El monto total acordado es de {{monto_total}}.',
      orden: 2,
    },
    {
      id: 'firmas',
      titulo: 'Firmas',
      contenido: 'Leído y conforme, las partes firman el presente contrato en {{fecha_contrato}}.',
      orden: 3,
    },
  ];

  if (tipo === 'RENTA_MOBILIARIO') {
    base[0].contenido =
      'El presente contrato tiene por objeto la renta de mobiliario para el evento de {{cliente_nombre}}, programado el {{fecha_evento}} en {{lugar_evento}}.';
  }
  if (tipo === 'BANQUETE') {
    base[0].contenido =
      'El presente contrato tiene por objeto la prestación del servicio de banquete {{servicio_nombre}} para {{cliente_nombre}}.';
  }

  return base;
}
