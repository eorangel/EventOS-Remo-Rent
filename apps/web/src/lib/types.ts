export type RolUsuario =
  | 'ADMIN'
  | 'COMERCIAL'
  | 'OPERATIVO'
  | 'COMPRAS'
  | 'FINANZAS'
  | 'ADMIN_PROVEEDOR'
  | 'OPERADOR_PROVEEDOR';

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
  proveedorId?: string | null;
  proveedorNombre?: string | null;
};

export type EstadoOrdenCobro =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'PAGADO'
  | 'VENCIDO'
  | 'CANCELADO';

export type ClienteProveedor = {
  id: string;
  proveedorId: string;
  nombre: string;
  empresa?: string | null;
  email?: string | null;
  telefono?: string | null;
  notas?: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    eventos: number;
    seguimientos: number;
    cobros: number;
    cotizaciones?: number;
  };
};

export type EstadoEventoProveedor =
  | 'COTIZACION'
  | 'CONFIRMADO'
  | 'EN_EJECUCION'
  | 'COMPLETADO'
  | 'CANCELADO';

export type TipoSeguimientoCliente =
  | 'LLAMADA'
  | 'REUNION'
  | 'WHATSAPP'
  | 'CORREO'
  | 'VISITA'
  | 'NOTA'
  | 'RECORDATORIO';

export type EstadoSeguimientoCliente = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';

export type EventoClienteProveedor = {
  id: string;
  proveedorId: string;
  clienteProveedorId: string;
  titulo: string;
  descripcion?: string | null;
  fechaEvento: string;
  fechaFin?: string | null;
  fechaEntrega?: string | null;
  fechaRecogida?: string | null;
  lugar?: string | null;
  estado: EstadoEventoProveedor;
  montoEstimado?: number | null;
  notas?: string | null;
  createdAt: string;
  updatedAt: string;
  clienteProveedor?: ClienteProveedor;
};

export type SeguimientoCliente = {
  id: string;
  proveedorId: string;
  clienteProveedorId: string;
  tipo: TipoSeguimientoCliente;
  titulo: string;
  descripcion?: string | null;
  fechaProgramada: string;
  completadoEn?: string | null;
  estado: EstadoSeguimientoCliente;
  createdAt: string;
  updatedAt: string;
  clienteProveedor?: ClienteProveedor;
};

export type CalendarioItemTipo =
  | 'EVENTO'
  | 'ENTREGA'
  | 'RECOGER'
  | 'SEGUIMIENTO'
  | 'COBRO'
  | 'PAGO_PENDIENTE';

export type CalendarioItem = {
  id: string;
  tipo: CalendarioItemTipo;
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

export type CalendarioPortal = {
  desde: string;
  hasta: string;
  items: CalendarioItem[];
};

export type AgendaItem = Omit<CalendarioItem, 'tipo'>;

export type AgendaSeccion = {
  entregas: AgendaItem[];
  recogidas: AgendaItem[];
  eventos: AgendaItem[];
  cobros: AgendaItem[];
  seguimientos: AgendaItem[];
  pagosPendientes: AgendaItem[];
};

export type AgendaPortal = {
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
  secciones: AgendaSeccion;
};

export type HistorialTimelineItem = {
  tipo: 'EVENTO' | 'SEGUIMIENTO' | 'COBRO' | 'COTIZACION';
  id: string;
  fecha: string;
  titulo: string;
  subtitulo?: string;
  estado: string;
  meta?: Record<string, unknown>;
};

export type ClienteHistorial = {
  eventos: EventoClienteProveedor[];
  seguimientos: SeguimientoCliente[];
  cobros: OrdenCobro[];
  cotizaciones?: CotizacionProveedor[];
  timeline: HistorialTimelineItem[];
};

export type CotizacionProveedorItem = {
  id?: string;
  productoProveedorId?: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoProveedor?: { id: string; nombre: string; categoria?: string | null } | null;
};

export type CotizacionProveedor = {
  id: string;
  proveedorId: string;
  clienteProveedorId: string;
  folio: string;
  titulo?: string | null;
  estado: EstadoCotizacion;
  fechaEvento?: string | null;
  lugarEntrega?: string | null;
  costoEnvio: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  ivaPorcentaje: number;
  ivaIncluido: boolean;
  subtotal: number;
  montoIva: number;
  total: number;
  notas?: string | null;
  validoHasta?: string | null;
  createdAt: string;
  updatedAt: string;
  clienteProveedor?: ClienteProveedor;
  items?: CotizacionProveedorItem[];
  /** Presente al crear cotización — orden de cobro generada automáticamente */
  ordenCobroId?: string;
};

export type CotizacionPdfResponse = {
  folio: string;
  titulo: string;
  html: string;
};

export type HorarioDia = {
  dia: string;
  abre?: string;
  cierra?: string;
  cerrado?: boolean;
};

export type RedesSocialesEmpresa = {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  tiktok?: string;
  linkedin?: string;
  sitioWeb?: string;
};

export type PerfilEmpresaData = {
  logoUrl: string | null;
  regimenFiscal: string | null;
  codigoPostal: string | null;
  horario: { dias: HorarioDia[] };
  redesSociales: RedesSocialesEmpresa;
  politicasRenta: string | null;
  condicionesCancelacion: string | null;
  ivaIncluido: boolean;
  moneda: string;
  updatedAt: string | null;
};

export type PerfilEmpresaResponse = {
  proveedor: {
    id: string;
    nombre: string;
    razonSocial?: string | null;
    rfc?: string | null;
    email?: string | null;
    telefono?: string | null;
    contacto?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    entidadFederativa?: string | null;
    sitioWeb?: string | null;
  };
  perfil: PerfilEmpresaData;
  completitudPerfilEmpresa: number;
};

export type OrdenCobro = {
  id: string;
  proveedorId: string;
  clienteProveedorId: string;
  folio: string;
  concepto: string;
  monto: number;
  estado: EstadoOrdenCobro;
  metodoPago: MetodoPago;
  referencia?: string | null;
  fechaVencimiento?: string | null;
  pagadoEn?: string | null;
  notas?: string | null;
  tokenPago?: string;
  linkPago?: string | null;
  mpPreferenceId?: string | null;
  mpPaymentId?: string | null;
  linkPagoGeneradoEn?: string | null;
  linkPublico?: string;
  createdAt: string;
  updatedAt: string;
  clienteProveedor?: ClienteProveedor;
};

export type ConfigPasarelaProveedor = {
  pasarela: 'MERCADO_PAGO';
  activo: boolean;
  tokenConfigured: boolean;
  usaTokenPlataforma: boolean;
  publicKey: string | null;
  webhookUrl: string;
};

export type OrdenPagoPublica = {
  folio: string;
  concepto: string;
  monto: number;
  estado: EstadoOrdenCobro;
  proveedorNombre: string;
  clienteNombre: string;
  linkPago: string | null;
  tokenPago: string;
  pagadoEn?: string | null;
};

export type PortalDashboardFinanciero = {
  mes: string;
  mesLabel: string;
  ingresosMes: number;
  ingresosMesAnterior: number;
  variacionIngresos: number | null;
  saldoPendiente: number;
  eventosMes: number;
  eventosActivos: number;
  cotizacionesActivas?: number;
  clientesActivos: number;
  cobrosPagadosMes: number;
  cobrosPendientes: number;
  cobrosCreadosMes: number;
  tasaCobranza: number;
  ingresosSemanales: { semana: string; monto: number }[];
};

export type PortalDashboard = {
  proveedor: {
    id: string;
    nombre: string;
    estadoVerificacion: EstadoVerificacionProveedor;
    completitudPerfil: number;
  };
  resumen: {
    clientesActivos: number;
    totalClientes: number;
    productosCatalogo: number;
    cobrosPendientes: number;
    cobrosPagados: number;
    cotizacionesActivas?: number;
  };
  financiero?: PortalDashboardFinanciero;
  cobrosRecientes: OrdenCobro[];
};

export type PortalReporteOperacion = {
  id: string;
  tipo: 'evento' | 'cotizacion';
  titulo: string;
  fecha: string;
  estado: string;
  clienteId: string;
  clienteNombre: string;
  lugar?: string | null;
  montoEstimado?: number | null;
  enlace?: string;
};

export type PortalReportes = {
  generadoEn: string;
  resumen: {
    totalVentas: number;
    totalPipeline?: number;
    totalOperaciones?: number;
    totalEventos: number;
    cotizacionesActivas?: number;
    productosRentados: number;
    clientesConActividad: number;
  };
  topClientes: {
    clienteId: string;
    nombre: string;
    totalCobrado: number;
    totalCotizado?: number;
    cobrosPagados: number;
    cotizaciones?: number;
    eventos: number;
  }[];
  productosMasRentados: {
    productoId: string | null;
    nombre: string;
    cantidadRentada: number;
    ingresosEstimados: number;
  }[];
  ventasPorMes: {
    mes: string;
    mesLabel: string;
    monto: number;
    cobros: number;
  }[];
  pipelinePorMes?: {
    mes: string;
    mesLabel: string;
    monto: number;
    cobros: number;
  }[];
  operaciones?: {
    resumen: {
      total: number;
      eventosRegistrados: number;
      cotizacionesActivas: number;
      cotizacionesBorrador: number;
      cotizacionesEnviadas: number;
      cotizacionesAprobadas: number;
      confirmados: number;
      enEjecucion: number;
      completados: number;
      proximos: number;
    };
    porMes: { mes: string; mesLabel: string; cantidad: number }[];
    recientes: PortalReporteOperacion[];
  };
  eventos: {
    resumen: {
      total: number;
      confirmados: number;
      enEjecucion: number;
      completados: number;
      proximos: number;
    };
    porMes: { mes: string; mesLabel: string; cantidad: number }[];
    recientes: PortalReporteOperacion[];
  };
};

export type UsuarioProveedor = {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
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
  alcaldia?: string | null;
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

/** Respuesta de /portal/productos/disponibilidad — cantidadDisponible es la disponible en fecha */
export type ProductoProveedorInventario = ProductoProveedor & {
  cantidadTotal: number;
  cantidadReservada: number;
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

export type FilaImportacionProducto = {
  fila: number;
  nombre: string;
  categoria?: string;
  cantidadDisponible: number;
  precioReferencia: number;
  unidadMedida: UnidadMedidaProducto;
  descripcion?: string;
  fotoUrl?: string;
  errores: string[];
  valido: boolean;
};

export type ResultadoImportacionProductos = {
  vistaPrevia: boolean;
  totalFilas: number;
  validas: number;
  invalidas: number;
  creados?: number;
  actualizados?: number;
  filas: FilaImportacionProducto[];
};

export type FilaImportacionCliente = {
  fila: number;
  nombre: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  notas?: string;
  errores: string[];
  valido: boolean;
};

export type ResultadoImportacionClientes = {
  vistaPrevia: boolean;
  totalFilas: number;
  validas: number;
  invalidas: number;
  creados?: number;
  actualizados?: number;
  filas: FilaImportacionCliente[];
};

export type MetricasCapturaProveedores = {
  totalProveedores: number;
  verificados: number;
  productosCatalogo: number;
  productosConFotos: number;
  zonasCobertura: number;
  serviciosRegistrados: number;
  completitudPromedio: number;
  proveedoresConUsuario: number;
  clientesPortal: number;
  cobrosPortal: number;
  cobrosPagadosPortal: number;
  adopcionPortal: number;
  porEntidad: { entidad: string; cantidad: number }[];
  topCategorias: { categoria: string; cantidad: number }[];
};

export type ResumenOperacionProveedores = {
  resumen: {
    totalProveedores: number;
    activos: number;
    verificados: number;
    unidadesInventario: number;
    productosCatalogados: number;
    categoriasUnicas: number;
    entidadesConPresencia: number;
    alcaldiasConPresencia: number;
    eventosOperados: number;
    cotizacionesEmitidas: number;
    cobrosGenerados: number;
    cobrosPagados: number;
    montoCobrado: number;
  };
  porEntidad: {
    entidad: string;
    proveedores: number;
    unidades: number;
    productos: number;
  }[];
  porAlcaldia: {
    alcaldia: string;
    proveedores: number;
    unidades: number;
    productos: number;
  }[];
  inventarioPorCategoria: {
    categoria: string;
    unidades: number;
    productos: number;
    proveedores: number;
  }[];
  ubicaciones: {
    id: string;
    nombre: string;
    lat: number;
    lng: number;
    ciudad: string | null;
    entidad: string | null;
    alcaldia: string | null;
    productos: number;
    unidades: number;
    eventos: number;
    estadoVerificacion: string;
    activo: boolean;
    radioCoberturaKm: number | null;
    precision: 'exacta' | 'estimada';
  }[];
  operacionPorProveedor: {
    id: string;
    nombre: string;
    ciudad: string | null;
    entidad: string | null;
    alcaldia: string | null;
    activo: boolean;
    estadoVerificacion: string;
    tipo: TipoProveedor;
    productos: number;
    unidades: number;
    clientes: number;
    eventos: number;
    cotizaciones: number;
    cobros: number;
    cobrosPagados: number;
    montoCobrado: number;
    radioCoberturaKm: number | null;
  }[];
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

export type OrigenEventoCrm = 'PLATAFORMA' | 'PROVEEDOR';

export type EventoCrm = {
  id: string;
  origen: OrigenEventoCrm;
  titulo: string;
  fechaEvento: string;
  fechaFin?: string | null;
  lugar?: string | null;
  estado: string;
  clienteId: string;
  clienteNombre: string;
  proveedorId?: string | null;
  proveedorNombre?: string | null;
  montoEstimado?: number | null;
  creadoPor?: string | null;
  creadoEn: string;
  enlace: string;
};

export type EventosCrmResumen = {
  total: number;
  plataforma: number;
  proveedor: number;
  completados: number;
  proximos: number;
  registradosMes: number;
  porMes: { mes: string; mesLabel: string; plataforma: number; proveedor: number }[];
};

export type EventoCrmProveedorDetalle = {
  id: string;
  origen: 'PROVEEDOR';
  titulo: string;
  descripcion?: string | null;
  fechaEvento: string;
  fechaFin?: string | null;
  fechaEntrega?: string | null;
  fechaRecogida?: string | null;
  lugar?: string | null;
  estado: EstadoEventoProveedor;
  montoEstimado?: number | null;
  notas?: string | null;
  creadoEn: string;
  proveedor: {
    id: string;
    nombre: string;
    ciudad?: string | null;
    entidadFederativa?: string | null;
  };
  cliente: {
    id: string;
    nombre: string;
    email?: string | null;
    telefono?: string | null;
    empresa?: string | null;
  };
};

export type EstadoSuscripcion =
  | 'PRUEBA'
  | 'ACTIVA'
  | 'SUSPENDIDA'
  | 'CANCELADA'
  | 'VENCIDA';

export type EstadoPagoSuscripcion = 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';

export type PlanSuscripcion = {
  id: string;
  nombre: string;
  codigo: string;
  precioMensual: number;
  moneda: string;
  descripcion?: string | null;
};

export type PagoSuscripcion = {
  id: string;
  monto: number;
  moneda: string;
  estado: EstadoPagoSuscripcion;
  metodoPago: MetodoPago;
  referencia?: string | null;
  periodoInicio: string;
  periodoFin: string;
  pagadoEn: string;
};

export type SuscripcionListItem = {
  id: string;
  empresa: string;
  proveedorId: string;
  plan: string;
  planId: string;
  precioMensual: number;
  moneda: string;
  estado: EstadoSuscripcion;
  fechaAlta: string;
  proximoCobro?: string | null;
  metodoPago?: MetodoPago | null;
  ultimoPago?: PagoSuscripcion | null;
  totalPagos: number;
};

export type SuscripcionDetalle = {
  id: string;
  empresa: string;
  empresaRazonSocial?: string | null;
  proveedorId: string;
  proveedorActivo: boolean;
  plan: string;
  planId: string;
  planCodigo: string;
  precioMensual: number;
  moneda: string;
  estado: EstadoSuscripcion;
  fechaAlta: string;
  proximoCobro?: string | null;
  metodoPago?: MetodoPago | null;
  referenciaPago?: string | null;
  canceladaEn?: string | null;
  pagos: PagoSuscripcion[];
};

export type SuscripcionesResumen = {
  total: number;
  activas: number;
  prueba: number;
  suspendidas: number;
  canceladas: number;
  mrr: number;
  planes: PlanSuscripcion[];
};

export type DashboardResumen = {
  generadoEn: string;
  metricas: {
    empresasRegistradas: number;
    empresasActivas: number;
    empresasVerificadas: number;
    usuariosActivos: number;
    usuariosPlataforma: number;
    usuariosProveedor: number;
    eventosCreados: number;
    eventosPlataforma: number;
    eventosProveedor: number;
    cobrosGenerados: number;
    montoCobrosGenerados: number;
    cobrosPagados: number;
    montoCobrosPagados: number;
    usoSistema: number;
    mrr: number;
    churn: number;
    conversionPruebaPago: number;
    tasaCobranza: number;
  };
  tendencias: {
    porMes: {
      mes: string;
      mesLabel: string;
      empresasNuevas: number;
      cobrosGenerados: number;
      cobrosPagados: number;
      montoPagado: number;
      usoSistema: number;
    }[];
  };
  recientes: {
    empresas: {
      id: string;
      nombre: string;
      ciudad: string | null;
      estadoVerificacion: string;
      activo: boolean;
      createdAt: string;
    }[];
  };
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
