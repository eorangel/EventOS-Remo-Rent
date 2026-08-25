import type {
  EstadoCotizacion,
  EstadoEvento,
  EstadoLogistica,
  EstadoMovimientoFinanciero,
  EstadoOrdenCobro,
  EstadoSeguimientoCliente,
  EstadoEventoProveedor,
  TipoSeguimientoCliente,
  EstadoSubarrendo,
  MetodoPago,
  EstadoSuscripcion,
  EstadoPagoSuscripcion,
  RolUsuario,
  TipoActividad,
  TipoDocumento,
  TipoMovimientoFinanciero,
  TipoProveedor,
  EstadoVerificacionProveedor,
  OrigenCapturaProveedor,
  UnidadMedidaProducto,
  TipoServicioContrato,
  ModoPlantillaContrato,
  EstadoPlantillaContrato,
} from './types';

export const ESTADO_EVENTO_LABELS: Record<EstadoEvento, string> = {
  BORRADOR: 'Borrador',
  COTIZACION: 'Cotización',
  CONFIRMADO: 'Confirmado',
  EN_LOGISTICA: 'En logística',
  EN_EJECUCION: 'En ejecución',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export const ESTADO_EVENTO_COLORS: Record<EstadoEvento, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  COTIZACION: 'bg-amber-100 text-amber-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EN_LOGISTICA: 'bg-purple-100 text-purple-800',
  EN_EJECUCION: 'bg-brand-100 text-brand-800',
  COMPLETADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export const ROL_LABELS: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  COMERCIAL: 'Ejecutivo Comercial',
  OPERATIVO: 'Coordinador Operativo',
  COMPRAS: 'Compras',
  FINANZAS: 'Finanzas',
  ADMIN_PROVEEDOR: 'Admin proveedor',
  OPERADOR_PROVEEDOR: 'Operador proveedor',
};

export const ESTADO_ORDEN_COBRO_LABELS: Record<EstadoOrdenCobro, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado',
};

export const ESTADO_ORDEN_COBRO_COLORS: Record<EstadoOrdenCobro, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  PENDIENTE: 'bg-amber-100 text-amber-800',
  PAGADO: 'bg-emerald-100 text-emerald-800',
  VENCIDO: 'bg-red-100 text-red-800',
  CANCELADO: 'bg-slate-100 text-slate-500',
};

export const ESTADO_EVENTO_PROVEEDOR_LABELS: Record<EstadoEventoProveedor, string> = {
  COTIZACION: 'Cotización',
  CONFIRMADO: 'Confirmado',
  EN_EJECUCION: 'En ejecución',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export const ESTADO_EVENTO_PROVEEDOR_COLORS: Record<EstadoEventoProveedor, string> = {
  COTIZACION: 'bg-amber-100 text-amber-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EN_EJECUCION: 'bg-purple-100 text-purple-800',
  COMPLETADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-slate-100 text-slate-500',
};

export const TIPO_SEGUIMIENTO_LABELS: Record<TipoSeguimientoCliente, string> = {
  LLAMADA: 'Llamada',
  REUNION: 'Reunión',
  WHATSAPP: 'WhatsApp',
  CORREO: 'Correo',
  VISITA: 'Visita',
  NOTA: 'Nota',
  RECORDATORIO: 'Recordatorio',
};

export const ESTADO_SEGUIMIENTO_LABELS: Record<EstadoSeguimientoCliente, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export const CALENDARIO_TIPO_LABELS = {
  EVENTO: 'Evento',
  ENTREGA: 'Entrega',
  RECOGER: 'Recoger',
  SEGUIMIENTO: 'Seguimiento',
  COBRO: 'Cobro',
  PAGO_PENDIENTE: 'Pago pendiente',
} as const;

export const CALENDARIO_TIPO_COLORS = {
  EVENTO: 'bg-blue-500',
  ENTREGA: 'bg-emerald-500',
  RECOGER: 'bg-orange-500',
  SEGUIMIENTO: 'bg-violet-500',
  COBRO: 'bg-amber-500',
  PAGO_PENDIENTE: 'bg-rose-500',
} as const;

export const AGENDA_SECCION_LABELS = {
  entregas: 'Entregas',
  recogidas: 'Recoger',
  eventos: 'Eventos',
  cobros: 'Cobros',
  seguimientos: 'Seguimiento',
  pagosPendientes: 'Pagos pendientes',
} as const;

export const AGENDA_SECCION_COLORS = {
  entregas: 'border-emerald-200 bg-emerald-50',
  recogidas: 'border-orange-200 bg-orange-50',
  eventos: 'border-blue-200 bg-blue-50',
  cobros: 'border-amber-200 bg-amber-50',
  seguimientos: 'border-violet-200 bg-violet-50',
  pagosPendientes: 'border-rose-200 bg-rose-50',
} as const;

export function formatFecha(iso: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function formatFechaCorta(iso: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(new Date(iso));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

export const ESTADO_COTIZACION_LABELS: Record<EstadoCotizacion, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

export const ESTADO_COTIZACION_COLORS: Record<EstadoCotizacion, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  ENVIADA: 'bg-blue-100 text-blue-800',
  APROBADA: 'bg-emerald-100 text-emerald-800',
  RECHAZADA: 'bg-red-100 text-red-800',
};

export const TIPO_SERVICIO_CONTRATO_LABELS: Record<TipoServicioContrato, string> = {
  GENERAL: 'General',
  RENTA_MOBILIARIO: 'Renta de mobiliario',
  SERVICIO: 'Servicio',
  BANQUETE: 'Banquete',
};

export const MODO_PLANTILLA_CONTRATO_LABELS: Record<ModoPlantillaContrato, string> = {
  EDITOR: 'Editor interactivo',
  ARCHIVO: 'Archivo cargado',
};

export const ESTADO_PLANTILLA_CONTRATO_LABELS: Record<EstadoPlantillaContrato, string> = {
  BORRADOR: 'Borrador',
  ACTIVA: 'Activa',
  ARCHIVADA: 'Archivada',
};

export const ESTADO_PLANTILLA_CONTRATO_COLORS: Record<EstadoPlantillaContrato, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  ACTIVA: 'bg-emerald-100 text-emerald-800',
  ARCHIVADA: 'bg-amber-100 text-amber-800',
};

export const TIPO_PROVEEDOR_LABELS: Record<TipoProveedor, string> = {
  PROPIO: 'Propio',
  SUBARRENDO: 'Red / Subarrendo',
};

export const ESTADO_VERIFICACION_LABELS: Record<EstadoVerificacionProveedor, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  VERIFICADO: 'Verificado',
};

export const ESTADO_VERIFICACION_COLORS: Record<EstadoVerificacionProveedor, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  EN_REVISION: 'bg-amber-100 text-amber-800',
  VERIFICADO: 'bg-emerald-100 text-emerald-800',
};

export const ORIGEN_CAPTURA_LABELS: Record<OrigenCapturaProveedor, string> = {
  INTERNO: 'Captura interna',
  TELEFONO: 'Teléfono',
  VISITA: 'Visita',
  WEB: 'Web',
};

export const UNIDAD_MEDIDA_LABELS: Record<UnidadMedidaProducto, string> = {
  PIEZA: 'Pieza',
  METRO: 'Metro',
  METRO2: 'm²',
  PAQUETE: 'Paquete',
  SERVICIO: 'Servicio',
};

export const CATEGORIAS_CATALOGO = [
  'Sillas',
  'Mesas',
  'Carpas',
  'Iluminación',
  'Audio',
  'Textiles',
  'Vajilla',
  'Decoración',
  'Escenarios',
  'Otros',
];

export const ENTIDADES_FEDERATIVAS = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

export const ALCALDIAS_CDMX = [
  'Álvaro Obregón',
  'Azcapotzalco',
  'Benito Juárez',
  'Coyoacán',
  'Cuajimalpa de Morelos',
  'Cuauhtémoc',
  'Gustavo A. Madero',
  'Iztacalco',
  'Iztapalapa',
  'La Magdalena Contreras',
  'Miguel Hidalgo',
  'Milpa Alta',
  'Tláhuac',
  'Tlalpan',
  'Venustiano Carranza',
  'Xochimilco',
];

export const CDMX_ENTIDAD = 'Ciudad de México';

export function esCiudadDeMexico(entidad?: string | null) {
  return entidad === CDMX_ENTIDAD;
}

export const TIPO_ACTIVIDAD_LABELS: Record<TipoActividad, string> = {
  MONTAJE: 'Montaje',
  EVENTO: 'Evento',
  DESMONTAJE: 'Desmontaje',
  ENTREGA: 'Entrega',
  RECOLECCION: 'Recolección',
};

export const TIPO_ACTIVIDAD_COLORS: Record<TipoActividad, string> = {
  MONTAJE: 'bg-blue-100 text-blue-800',
  EVENTO: 'bg-brand-100 text-brand-800',
  DESMONTAJE: 'bg-purple-100 text-purple-800',
  ENTREGA: 'bg-emerald-100 text-emerald-800',
  RECOLECCION: 'bg-amber-100 text-amber-800',
};

export const ESTADO_LOGISTICA_LABELS: Record<EstadoLogistica, string> = {
  PENDIENTE: 'Pendiente',
  PROGRAMADA: 'Programada',
  EN_RUTA: 'En ruta',
  COMPLETADA: 'Completada',
};

export const ESTADO_LOGISTICA_COLORS: Record<EstadoLogistica, string> = {
  PENDIENTE: 'bg-slate-100 text-slate-700',
  PROGRAMADA: 'bg-blue-100 text-blue-800',
  EN_RUTA: 'bg-amber-100 text-amber-800',
  COMPLETADA: 'bg-emerald-100 text-emerald-800',
};

export const ESTADO_SUBARRENDO_LABELS: Record<EstadoSubarrendo, string> = {
  IDENTIFICADO: 'Identificado',
  SOLICITADO: 'Solicitado',
  CONFIRMADO: 'Confirmado',
  RECIBIDO: 'Recibido',
  DEVUELTO: 'Devuelto',
};

export const ESTADO_SUBARRENDO_COLORS: Record<EstadoSubarrendo, string> = {
  IDENTIFICADO: 'bg-slate-100 text-slate-700',
  SOLICITADO: 'bg-amber-100 text-amber-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  RECIBIDO: 'bg-emerald-100 text-emerald-800',
  DEVUELTO: 'bg-purple-100 text-purple-800',
};

export const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimientoFinanciero, string> = {
  ANTICIPO: 'Anticipo',
  PAGO: 'Pago',
  REEMBOLSO: 'Reembolso',
  GASTO: 'Gasto',
};

export const TIPO_MOVIMIENTO_COLORS: Record<TipoMovimientoFinanciero, string> = {
  ANTICIPO: 'bg-blue-100 text-blue-800',
  PAGO: 'bg-emerald-100 text-emerald-800',
  REEMBOLSO: 'bg-amber-100 text-amber-800',
  GASTO: 'bg-red-100 text-red-800',
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  CHEQUE: 'Cheque',
  OTRO: 'Otro',
};

export const ESTADO_SUSCRIPCION_LABELS: Record<EstadoSuscripcion, string> = {
  PRUEBA: 'Prueba',
  ACTIVA: 'Activa',
  SUSPENDIDA: 'Suspendida',
  CANCELADA: 'Cancelada',
  VENCIDA: 'Vencida',
};

export const ESTADO_SUSCRIPCION_COLORS: Record<EstadoSuscripcion, string> = {
  PRUEBA: 'bg-sky-100 text-sky-800',
  ACTIVA: 'bg-emerald-100 text-emerald-800',
  SUSPENDIDA: 'bg-amber-100 text-amber-800',
  CANCELADA: 'bg-slate-100 text-slate-500',
  VENCIDA: 'bg-red-100 text-red-800',
};

export const ESTADO_PAGO_SUSCRIPCION_LABELS: Record<EstadoPagoSuscripcion, string> = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  FALLIDO: 'Fallido',
  REEMBOLSADO: 'Reembolsado',
};

export const ESTADO_PAGO_SUSCRIPCION_COLORS: Record<EstadoPagoSuscripcion, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  PAGADO: 'bg-emerald-100 text-emerald-800',
  FALLIDO: 'bg-red-100 text-red-800',
  REEMBOLSADO: 'bg-slate-100 text-slate-600',
};

export const ESTADO_MOVIMIENTO_LABELS: Record<EstadoMovimientoFinanciero, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
};

export const ESTADO_MOVIMIENTO_COLORS: Record<EstadoMovimientoFinanciero, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  CONFIRMADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  COTIZACION: 'Cotización',
  CONTRATO: 'Contrato',
  RECIBO: 'Recibo',
  ACTA_ENTREGA: 'Acta de entrega',
  OTRO: 'Otro',
};

export const TIPO_DOCUMENTO_COLORS: Record<TipoDocumento, string> = {
  COTIZACION: 'bg-amber-100 text-amber-800',
  CONTRATO: 'bg-blue-100 text-blue-800',
  RECIBO: 'bg-emerald-100 text-emerald-800',
  ACTA_ENTREGA: 'bg-purple-100 text-purple-800',
  OTRO: 'bg-slate-100 text-slate-700',
};

export const SECCION_PLATILLO_LABELS: Record<
  import('./types').SeccionPlatilloMenu,
  string
> = {
  ENTRADA: 'Entrada',
  SOPA: 'Sopa',
  PLATO_FUERTE: 'Plato fuerte',
  GUARNICION: 'Guarnición',
  POSTRE: 'Postre',
  BEBIDA: 'Bebida',
  OTRO: 'Otro',
};

export const SECCIONES_PLATILLO_ORDEN: import('./types').SeccionPlatilloMenu[] = [
  'ENTRADA',
  'SOPA',
  'PLATO_FUERTE',
  'GUARNICION',
  'POSTRE',
  'BEBIDA',
  'OTRO',
];

export const MODALIDAD_PRECIO_MENU_LABELS: Record<
  import('./types').ModalidadPrecioMenu,
  string
> = {
  POR_PERSONA: 'Por persona',
  POR_EVENTO: 'Por evento',
};
