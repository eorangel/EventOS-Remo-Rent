export type RolUsuario =
  | 'ADMIN'
  | 'COMERCIAL'
  | 'OPERATIVO'
  | 'COMPRAS'
  | 'FINANZAS';

export type EstadoEvento =
  | 'BORRADOR'
  | 'COTIZACION'
  | 'CONFIRMADO'
  | 'EN_LOGISTICA'
  | 'EN_EJECUCION'
  | 'COMPLETADO'
  | 'CANCELADO';

export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
};

export type Cliente = {
  id: string;
  nombre: string;
  empresa?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { eventos: number };
  eventos?: Evento[];
};

export type TipoProveedor = 'PROPIO' | 'SUBARRENDO';

export type EstadoVerificacionProveedor = 'BORRADOR' | 'EN_REVISION' | 'VERIFICADO';
export type OrigenCapturaProveedor = 'INTERNO' | 'TELEFONO' | 'VISITA' | 'WEB';
export type UnidadMedidaProducto = 'PIEZA' | 'METRO' | 'METRO2' | 'PAQUETE' | 'SERVICIO';

export type Proveedor = {
  id: string;
  nombre: string;
  razonSocial?: string | null;
  rfc?: string | null;
  contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  sitioWeb?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  entidadFederativa?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  tipo: TipoProveedor;
  estadoVerificacion?: EstadoVerificacionProveedor;
  origenCaptura?: OrigenCapturaProveedor;
  eventosSimultaneosMax?: number | null;
  unidadesMaxEntrega?: number | null;
  radioCoberturaKm?: number | null;
  notas?: string | null;
  activo: boolean;
  _count?: {
    items?: number;
    productos?: number;
    coberturas?: number;
    servicios?: number;
    subarrendos?: number;
  };
  completitudPerfil?: number;
};

export type FotoProductoProveedor = {
  id: string;
  url: string;
  esPrincipal: boolean;
  orden: number;
};

export type ProductoProveedor = {
  id: string;
  proveedorId: string;
  nombre: string;
  categoria?: string | null;
  descripcion?: string | null;
  cantidadDisponible: number;
  precioReferencia: number;
  unidadMedida: UnidadMedidaProducto;
  activo: boolean;
  fotos?: FotoProductoProveedor[];
  proveedor?: Pick<Proveedor, 'id' | 'nombre' | 'ciudad' | 'entidadFederativa'>;
};

export type CoberturaProveedor = {
  id: string;
  proveedorId: string;
  entidad: string;
  ciudad?: string | null;
  notas?: string | null;
};

export type ServicioProveedor = {
  id: string;
  proveedorId: string;
  nombre: string;
  descripcion?: string | null;
  precioReferencia?: number | null;
  activo: boolean;
};

export type ProveedorExpediente = Proveedor & {
  productos: ProductoProveedor[];
  coberturas: CoberturaProveedor[];
  servicios: ServicioProveedor[];
  completitudPerfil: number;
};

export type MetricasCapturaProveedores = {
  totalProveedores: number;
  verificados: number;
  productosCatalogo: number;
  productosConFotos: number;
  zonasCobertura: number;
  serviciosRegistrados: number;
  completitudPromedio: number;
  porEntidad: { entidad: string; cantidad: number }[];
  topCategorias: { categoria: string; cantidad: number }[];
};

export type EstadoCotizacion = 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA';

export type Producto = {
  id: string;
  codigo: string;
  nombre: string;
  categoria?: string | null;
  descripcion?: string | null;
  cantidadTotal: number;
  costoUnitario: number;
  precioRenta: number;
  activo: boolean;
  cantidadDisponible?: number;
  cantidadReservada?: number;
  requiereSubarrendo?: boolean;
};

export type CotizacionItem = {
  id: string;
  descripcion: string;
  cantidad: number;
  costoUnitario: number;
  margenPorcentaje: number;
  precioUnitario: number;
  subtotal: number;
  esSubarrendo: boolean;
  productoId?: string | null;
  proveedorId?: string | null;
  producto?: Producto | null;
  proveedor?: Proveedor | null;
};

export type Cotizacion = {
  id: string;
  folio: string;
  eventoId: string;
  estado: EstadoCotizacion;
  margenGlobal: number;
  subtotalCosto: number;
  subtotalVenta: number;
  total: number;
  utilidad: number;
  notas?: string | null;
  validoHasta?: string | null;
  createdAt: string;
  updatedAt: string;
  evento?: Evento & { cliente?: Pick<Cliente, 'id' | 'nombre' | 'empresa'> };
  items?: CotizacionItem[];
  _count?: { items: number };
};

export type EstadoSubarrendo =
  | 'IDENTIFICADO'
  | 'SOLICITADO'
  | 'CONFIRMADO'
  | 'RECIBIDO'
  | 'DEVUELTO';

export type TipoActividad =
  | 'MONTAJE'
  | 'EVENTO'
  | 'DESMONTAJE'
  | 'ENTREGA'
  | 'RECOLECCION';

export type EstadoLogistica = 'PENDIENTE' | 'PROGRAMADA' | 'EN_RUTA' | 'COMPLETADA';

export type Vehiculo = {
  id: string;
  nombre: string;
  placa: string;
  capacidad?: string | null;
  activo: boolean;
};

export type ActividadAgenda = {
  id: string;
  eventoId: string;
  tipo: TipoActividad;
  titulo: string;
  fechaInicio: string;
  fechaFin?: string | null;
  lugar?: string | null;
  completada: boolean;
  notas?: string | null;
  evento?: Pick<Evento, 'id' | 'titulo'> & { cliente?: Pick<Cliente, 'id' | 'nombre'> };
};

export type LogisticaChecklistItem = {
  id: string;
  descripcion: string;
  completado: boolean;
  orden: number;
};

export type Logistica = {
  id: string;
  eventoId: string;
  vehiculoId?: string | null;
  conductor?: string | null;
  equipo?: string | null;
  fechaSalida?: string | null;
  fechaRegreso?: string | null;
  ruta?: string | null;
  estado: EstadoLogistica;
  notas?: string | null;
  vehiculo?: Vehiculo | null;
  checklist?: LogisticaChecklistItem[];
  evento?: Pick<Evento, 'id' | 'titulo' | 'lugar'> & { cliente?: Pick<Cliente, 'id' | 'nombre'> };
};

export type Subarrendo = {
  id: string;
  eventoId: string;
  proveedorId: string;
  descripcion: string;
  cantidad: number;
  costo: number;
  estado: EstadoSubarrendo;
  fechaEntrega?: string | null;
  notas?: string | null;
  proveedor?: Proveedor;
  evento?: Pick<Evento, 'id' | 'titulo'> & { cliente?: Pick<Cliente, 'id' | 'nombre'> };
};

export type Evento = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  fechaEvento: string;
  fechaMontaje?: string | null;
  fechaDesmontaje?: string | null;
  lugar?: string | null;
  estado: EstadoEvento;
  notas?: string | null;
  clienteId: string;
  creadoPorId: string;
  createdAt: string;
  updatedAt: string;
  cliente?: Cliente;
  creadoPor?: Pick<Usuario, 'id' | 'nombre' | 'email'>;
  cotizaciones?: Cotizacion[];
};

export type DashboardResumen = {
  kpis: {
    totalClientes: number;
    totalEventos: number;
    eventosActivos: number;
    eventosMes: number;
    ingresosMes: number;
    cobranzaPendiente: number;
    utilidadEstimada: number;
    ocupacionInventario: number;
  };
  eventosPorEstado: { estado: EstadoEvento; cantidad: number }[];
  proximosEventos: Evento[];
  rentabilidadEventos: {
    eventoId: string;
    titulo: string;
    cotizado: number;
    pagado: number;
    utilidadCotizada: number;
  }[];
  ocupacionPorProducto: {
    productoId: string;
    nombre: string;
    reservado: number;
    total: number;
    porcentaje: number;
  }[];
  cotizacionesAprobadas: number;
};

export type TipoMovimientoFinanciero = 'ANTICIPO' | 'PAGO' | 'REEMBOLSO' | 'GASTO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE' | 'OTRO';
export type EstadoMovimientoFinanciero = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';
export type TipoDocumento = 'COTIZACION' | 'CONTRATO' | 'RECIBO' | 'ACTA_ENTREGA' | 'OTRO';

export type MovimientoFinanciero = {
  id: string;
  eventoId: string;
  tipo: TipoMovimientoFinanciero;
  concepto: string;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoMovimientoFinanciero;
  referencia?: string | null;
  fecha: string;
  notas?: string | null;
  evento?: Pick<Evento, 'id' | 'titulo'> & { cliente?: Pick<Cliente, 'id' | 'nombre'> };
};

export type ResumenFinancieroEvento = {
  evento: { id: string; titulo: string; cliente?: Pick<Cliente, 'id' | 'nombre'> };
  cotizacionRef: { id: string; folio: string; estado: EstadoCotizacion; total: number } | null;
  totalCotizado: number;
  totalPagado: number;
  saldoPendiente: number;
  totalGastos: number;
  costoEstimado: number;
  costoReal: number;
  utilidadCotizada: number;
  utilidadReal: number;
  margenReal: number;
};

export type ResumenFinancieroGlobal = {
  totalCotizado: number;
  totalCobrado: number;
  totalPendiente: number;
  ingresosMes: number;
};

export type Documento = {
  id: string;
  eventoId: string;
  cotizacionId?: string | null;
  tipo: TipoDocumento;
  titulo: string;
  folio?: string | null;
  contenido?: string | null;
  generadoEn: string;
  evento?: Pick<Evento, 'id' | 'titulo'> & { cliente?: Pick<Cliente, 'id' | 'nombre' | 'empresa'> };
  cotizacion?: Pick<Cotizacion, 'id' | 'folio' | 'total'> | null;
};
