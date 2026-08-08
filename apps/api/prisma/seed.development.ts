import { PrismaClient, RolUsuario, TipoProveedor, EstadoOrdenCobro, EstadoEventoProveedor, TipoSeguimientoCliente, EstadoSeguimientoCliente, EstadoCotizacion } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  calcPrecioVenta,
  calcSubtotal,
} from '../src/common/utils/pricing';
import { seedPlans } from './seed.shared';

const prisma = new PrismaClient();

export async function seedDevelopment() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@remorent.mx' },
    update: {},
    create: {
      email: 'admin@remorent.mx',
      passwordHash,
      nombre: 'Administrador',
      rol: RolUsuario.ADMIN,
    },
  });

  const comercial = await prisma.usuario.upsert({
    where: { email: 'comercial@remorent.mx' },
    update: {},
    create: {
      email: 'comercial@remorent.mx',
      passwordHash: await bcrypt.hash('comercial123', 10),
      nombre: 'Ejecutivo Comercial',
      rol: RolUsuario.COMERCIAL,
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: { id: 'seed-cliente-1' },
    update: {},
    create: {
      id: 'seed-cliente-1',
      nombre: 'Mar├¡a Gonz├ílez',
      empresa: 'Eventos MG',
      email: 'maria@eventosmg.mx',
      telefono: '5551234567',
    },
  });

  await prisma.evento.upsert({
    where: { id: 'seed-evento-1' },
    update: {},
    create: {
      id: 'seed-evento-1',
      titulo: 'Boda Gonz├ílez-Ruiz',
      descripcion: 'Evento social ÔÇö 200 invitados',
      fechaEvento: new Date('2026-09-15T18:00:00'),
      fechaMontaje: new Date('2026-09-15T10:00:00'),
      fechaDesmontaje: new Date('2026-09-16T02:00:00'),
      lugar: 'Jard├¡n Las Palmas, CDMX',
      estado: 'COTIZACION',
      clienteId: cliente.id,
      creadoPorId: comercial.id,
    },
  });

  const productos = [
    {
      id: 'seed-prod-1',
      codigo: 'MES-RED-01',
      nombre: 'Mesa redonda 10 personas',
      categoria: 'Mesas',
      cantidadTotal: 40,
      costoUnitario: 150,
      precioRenta: 350,
    },
    {
      id: 'seed-prod-2',
      codigo: 'SIL-Tiffany-01',
      nombre: 'Silla Tiffany',
      categoria: 'Sillas',
      cantidadTotal: 300,
      costoUnitario: 25,
      precioRenta: 65,
    },
    {
      id: 'seed-prod-3',
      codigo: 'MANT-01',
      nombre: 'Manteler├¡a premium',
      categoria: 'Textiles',
      cantidadTotal: 200,
      costoUnitario: 80,
      precioRenta: 180,
    },
    {
      id: 'seed-prod-4',
      codigo: 'CAR-01',
      nombre: 'Carpa 6x6m',
      categoria: 'Carpas',
      cantidadTotal: 8,
      costoUnitario: 1200,
      precioRenta: 2800,
    },
  ];

  for (const p of productos) {
    await prisma.producto.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  await prisma.proveedor.upsert({
    where: { id: 'seed-prov-1' },
    update: {
      razonSocial: 'Mobiliario Express SA de CV',
      rfc: 'MEX010101ABC',
      direccion: 'Av. Insurgentes Sur 1234',
      ciudad: 'Ciudad de M├®xico',
      entidadFederativa: 'Ciudad de M├®xico',
      latitud: 19.391,
      longitud: -99.162,
      alcaldia: 'Benito Ju├írez',
      estadoVerificacion: 'VERIFICADO',
      origenCaptura: 'VISITA',
      eventosSimultaneosMax: 5,
      unidadesMaxEntrega: 500,
      radioCoberturaKm: 50,
      sitioWeb: 'https://mobiliarioexpress.mx',
    },
    create: {
      id: 'seed-prov-1',
      nombre: 'Mobiliario Express CDMX',
      razonSocial: 'Mobiliario Express SA de CV',
      rfc: 'MEX010101ABC',
      contacto: 'Carlos Ruiz',
      email: 'ventas@mobiliarioexpress.mx',
      telefono: '5559876543',
      direccion: 'Av. Insurgentes Sur 1234',
      ciudad: 'Ciudad de M├®xico',
      entidadFederativa: 'Ciudad de M├®xico',
      latitud: 19.391,
      longitud: -99.162,
      alcaldia: 'Benito Ju├írez',
      tipo: TipoProveedor.SUBARRENDO,
      estadoVerificacion: 'VERIFICADO',
      origenCaptura: 'VISITA',
      eventosSimultaneosMax: 5,
      unidadesMaxEntrega: 500,
      radioCoberturaKm: 50,
      sitioWeb: 'https://mobiliarioexpress.mx',
      notas: 'Proveedor de respaldo para sillas y mesas',
    },
  });

  await prisma.proveedor.upsert({
    where: { id: 'seed-prov-2' },
    update: {
      razonSocial: 'Remo&Rent Operaciones',
      ciudad: 'Ciudad de M├®xico',
      entidadFederativa: 'Ciudad de M├®xico',
      latitud: 19.4284,
      longitud: -99.1276,
      alcaldia: 'Cuauht├®moc',
      estadoVerificacion: 'VERIFICADO',
      origenCaptura: 'INTERNO',
      eventosSimultaneosMax: 10,
      unidadesMaxEntrega: 2000,
      radioCoberturaKm: 80,
    },
    create: {
      id: 'seed-prov-2',
      nombre: 'Remo&Rent ÔÇö Almac├®n Central',
      razonSocial: 'Remo&Rent Operaciones',
      contacto: 'Operaciones',
      ciudad: 'Ciudad de M├®xico',
      entidadFederativa: 'Ciudad de M├®xico',
      latitud: 19.4284,
      longitud: -99.1276,
      alcaldia: 'Cuauht├®moc',
      tipo: TipoProveedor.PROPIO,
      estadoVerificacion: 'VERIFICADO',
      origenCaptura: 'INTERNO',
      eventosSimultaneosMax: 10,
      unidadesMaxEntrega: 2000,
      radioCoberturaKm: 80,
    },
  });

  await prisma.proveedor.upsert({
    where: { id: 'seed-prov-3' },
    update: {
      latitud: 20.6597,
      longitud: -103.3496,
    },
    create: {
      id: 'seed-prov-3',
      nombre: 'Carpas y Eventos Guadalajara',
      razonSocial: 'Carpas GDL SA de CV',
      contacto: 'Ana Mart├¡nez',
      email: 'ventas@carpasgdl.mx',
      telefono: '3331234567',
      ciudad: 'Guadalajara',
      entidadFederativa: 'Jalisco',
      direccion: 'Av. L├│pez Mateos 500',
      latitud: 20.6597,
      longitud: -103.3496,
      tipo: TipoProveedor.SUBARRENDO,
      estadoVerificacion: 'EN_REVISION',
      origenCaptura: 'TELEFONO',
      eventosSimultaneosMax: 3,
      unidadesMaxEntrega: 150,
      radioCoberturaKm: 120,
    },
  });

  const proveedorUser = await prisma.usuario.upsert({
    where: { email: 'proveedor@demo.mx' },
    update: { proveedorId: 'seed-prov-1' },
    create: {
      email: 'proveedor@demo.mx',
      passwordHash: await bcrypt.hash('proveedor123', 10),
      nombre: 'Carlos Ruiz',
      rol: RolUsuario.ADMIN_PROVEEDOR,
      proveedorId: 'seed-prov-1',
    },
  });

  const clientePortal1 = await prisma.clienteProveedor.upsert({
    where: { id: 'seed-cp-1' },
    update: {},
    create: {
      id: 'seed-cp-1',
      proveedorId: 'seed-prov-1',
      nombre: 'Laura M├®ndez',
      empresa: 'Eventos LM',
      email: 'laura@eventoslm.mx',
      telefono: '5551112233',
    },
  });

  const clientePortal2 = await prisma.clienteProveedor.upsert({
    where: { id: 'seed-cp-2' },
    update: {},
    create: {
      id: 'seed-cp-2',
      proveedorId: 'seed-prov-1',
      nombre: 'Roberto S├ínchez',
      empresa: 'RS Producciones',
      email: 'roberto@rsprod.mx',
      telefono: '5554445566',
    },
  });

  await prisma.ordenCobro.upsert({
    where: {
      proveedorId_folio: {
        proveedorId: 'seed-prov-1',
        folio: 'COB-20260701-0001',
      },
    },
    update: {
      pagadoEn: new Date('2026-08-02T14:00:00'),
    },
    create: {
      proveedorId: 'seed-prov-1',
      clienteProveedorId: clientePortal1.id,
      folio: 'COB-20260701-0001',
      concepto: 'Renta sillas Tiffany ÔÇö evento 15 jul',
      monto: 12500,
      estado: EstadoOrdenCobro.PAGADO,
      metodoPago: 'TRANSFERENCIA',
      referencia: 'SPEI-998877',
      pagadoEn: new Date('2026-07-05T14:00:00'),
    },
  });

  await prisma.ordenCobro.upsert({
    where: {
      proveedorId_folio: {
        proveedorId: 'seed-prov-1',
        folio: 'COB-20260720-0002',
      },
    },
    update: {},
    create: {
      proveedorId: 'seed-prov-1',
      clienteProveedorId: clientePortal2.id,
      folio: 'COB-20260720-0002',
      concepto: 'Mesas redondas + manteler├¡a',
      monto: 8900,
      estado: EstadoOrdenCobro.PENDIENTE,
      metodoPago: 'TRANSFERENCIA',
      fechaVencimiento: new Date('2026-08-15T23:59:59'),
    },
  });

  await prisma.configPasarelaProveedor.upsert({
    where: { proveedorId: 'seed-prov-1' },
    update: { activo: true },
    create: {
      proveedorId: 'seed-prov-1',
      activo: true,
    },
  });

  await prisma.perfilEmpresaProveedor.upsert({
    where: { proveedorId: 'seed-prov-1' },
    update: {
      logoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=200',
      regimenFiscal: '601 - General de Ley Personas Morales',
      codigoPostal: '03100',
      horario: {
        dias: [
          { dia: 'Lunes', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Martes', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Mi├®rcoles', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Jueves', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Viernes', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'S├íbado', abre: '10:00', cierra: '14:00', cerrado: false },
          { dia: 'Domingo', abre: null, cierra: null, cerrado: true },
        ],
      },
      redesSociales: {
        facebook: 'https://facebook.com/mobiliarioexpress',
        instagram: 'https://instagram.com/mobiliarioexpress',
        whatsapp: '5559876543',
        tiktok: '',
        linkedin: 'https://linkedin.com/company/mobiliarioexpress',
        sitioWeb: 'https://mobiliarioexpress.mx',
      },
      politicasRenta: 'Anticipo del 50% para reservar fecha. Entrega y recolecci├│n incluidas en CDMX y zona metropolitana. Da├▒os por mal uso se cobran al valor de reposici├│n.',
      condicionesCancelacion: 'Cancelaci├│n con m├ís de 15 d├¡as: reembolso del 80% del anticipo. Entre 7 y 15 d├¡as: 50%. Menos de 7 d├¡as: no reembolsable.',
      ivaIncluido: false,
      moneda: 'MXN',
    },
    create: {
      proveedorId: 'seed-prov-1',
      logoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=200',
      regimenFiscal: '601 - General de Ley Personas Morales',
      codigoPostal: '03100',
      horario: {
        dias: [
          { dia: 'Lunes', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Martes', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Mi├®rcoles', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Jueves', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'Viernes', abre: '09:00', cierra: '19:00', cerrado: false },
          { dia: 'S├íbado', abre: '10:00', cierra: '14:00', cerrado: false },
          { dia: 'Domingo', abre: null, cierra: null, cerrado: true },
        ],
      },
      redesSociales: {
        facebook: 'https://facebook.com/mobiliarioexpress',
        instagram: 'https://instagram.com/mobiliarioexpress',
        whatsapp: '5559876543',
        tiktok: '',
        linkedin: 'https://linkedin.com/company/mobiliarioexpress',
        sitioWeb: 'https://mobiliarioexpress.mx',
      },
      politicasRenta: 'Anticipo del 50% para reservar fecha. Entrega y recolecci├│n incluidas en CDMX y zona metropolitana. Da├▒os por mal uso se cobran al valor de reposici├│n.',
      condicionesCancelacion: 'Cancelaci├│n con m├ís de 15 d├¡as: reembolso del 80% del anticipo. Entre 7 y 15 d├¡as: 50%. Menos de 7 d├¡as: no reembolsable.',
      ivaIncluido: false,
      moneda: 'MXN',
    },
  });

  await prisma.eventoClienteProveedor.upsert({
    where: { id: 'seed-ev-prov-1' },
    update: {
      fechaEntrega: new Date('2026-09-20T08:00:00'),
      fechaRecogida: new Date('2026-09-21T10:00:00'),
    },
    create: {
      id: 'seed-ev-prov-1',
      proveedorId: 'seed-prov-1',
      clienteProveedorId: clientePortal1.id,
      titulo: 'Boda M├®ndez ÔÇö 180 invitados',
      descripcion: 'Montaje sillas y mesas en jard├¡n',
      fechaEvento: new Date('2026-09-20T17:00:00'),
      fechaFin: new Date('2026-09-21T01:00:00'),
      fechaEntrega: new Date('2026-09-20T08:00:00'),
      fechaRecogida: new Date('2026-09-21T10:00:00'),
      lugar: 'Jard├¡n Santa Fe, CDMX',
      estado: EstadoEventoProveedor.CONFIRMADO,
      montoEstimado: 18500,
    },
  });

  await prisma.eventoClienteProveedor.upsert({
    where: { id: 'seed-ev-prov-2' },
    update: {
      fechaEntrega: new Date('2026-08-10T07:00:00'),
      fechaRecogida: new Date('2026-08-10T21:00:00'),
    },
    create: {
      id: 'seed-ev-prov-2',
      proveedorId: 'seed-prov-1',
      clienteProveedorId: clientePortal2.id,
      titulo: 'Congreso RS Producciones',
      descripcion: 'Renta mobiliario corporativo',
      fechaEvento: new Date('2026-08-10T09:00:00'),
      fechaFin: new Date('2026-08-10T20:00:00'),
      lugar: 'Centro de Convenciones WTC',
      estado: EstadoEventoProveedor.COMPLETADO,
      montoEstimado: 22000,
    },
  });

  await prisma.seguimientoCliente.upsert({
    where: { id: 'seed-seg-1' },
    update: {},
    create: {
      id: 'seed-seg-1',
      proveedorId: 'seed-prov-1',
      clienteProveedorId: clientePortal1.id,
      tipo: TipoSeguimientoCliente.LLAMADA,
      titulo: 'Confirmar montaje boda',
      descripcion: 'Revisar horario de entrega con el cliente',
      fechaProgramada: new Date('2026-09-18T11:00:00'),
      estado: EstadoSeguimientoCliente.PENDIENTE,
    },
  });

  await prisma.seguimientoCliente.upsert({
    where: { id: 'seed-seg-2' },
    update: {},
    create: {
      id: 'seed-seg-2',
      proveedorId: 'seed-prov-1',
      clienteProveedorId: clientePortal2.id,
      tipo: TipoSeguimientoCliente.WHATSAPP,
      titulo: 'Enviar cotizaci├│n mesas extra',
      fechaProgramada: new Date('2026-08-05T16:30:00'),
      estado: EstadoSeguimientoCliente.COMPLETADO,
      completadoEn: new Date('2026-08-05T17:00:00'),
    },
  });

  // Cat├ílogo de productos por proveedor
  const catalogoSeed = [
    {
      id: 'seed-cat-1',
      proveedorId: 'seed-prov-1',
      nombre: 'Silla Tiffany',
      categoria: 'Sillas',
      cantidadDisponible: 800,
      precioReferencia: 55,
      foto: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    },
    {
      id: 'seed-cat-2',
      proveedorId: 'seed-prov-1',
      nombre: 'Mesa redonda 10 personas',
      categoria: 'Mesas',
      cantidadDisponible: 120,
      precioReferencia: 380,
      foto: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
    },
    {
      id: 'seed-cat-3',
      proveedorId: 'seed-prov-3',
      nombre: 'Carpa 6x6 m',
      categoria: 'Carpas',
      cantidadDisponible: 25,
      precioReferencia: 3200,
      foto: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
    },
    {
      id: 'seed-cat-4',
      proveedorId: 'seed-prov-3',
      nombre: 'Iluminaci├│n perimetral LED',
      categoria: 'Iluminaci├│n',
      cantidadDisponible: 40,
      precioReferencia: 850,
      foto: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
    },
  ];

  for (const item of catalogoSeed) {
    await prisma.productoProveedor.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        proveedorId: item.proveedorId,
        nombre: item.nombre,
        categoria: item.categoria,
        cantidadDisponible: item.cantidadDisponible,
        precioReferencia: item.precioReferencia,
        descripcion: `Producto catalogado ÔÇö ${item.nombre}`,
        fotos: {
          create: [{ url: item.foto, esPrincipal: true, orden: 0 }],
        },
      },
    });
  }

  await prisma.coberturaProveedor.deleteMany({
    where: { proveedorId: { in: ['seed-prov-1', 'seed-prov-2', 'seed-prov-3'] } },
  });
  await prisma.coberturaProveedor.createMany({
    data: [
      { id: 'seed-cob-1', proveedorId: 'seed-prov-1', entidad: 'Ciudad de M├®xico', ciudad: 'CDMX' },
      { id: 'seed-cob-2', proveedorId: 'seed-prov-1', entidad: 'Estado de M├®xico' },
      { id: 'seed-cob-3', proveedorId: 'seed-prov-2', entidad: 'Ciudad de M├®xico' },
      { id: 'seed-cob-4', proveedorId: 'seed-prov-3', entidad: 'Jalisco', ciudad: 'Guadalajara' },
      { id: 'seed-cob-5', proveedorId: 'seed-prov-3', entidad: 'Nayarit' },
    ],
  });

  await prisma.servicioProveedor.deleteMany({
    where: { proveedorId: { in: ['seed-prov-1', 'seed-prov-2', 'seed-prov-3'] } },
  });
  await prisma.servicioProveedor.createMany({
    data: [
      { id: 'seed-srv-1', proveedorId: 'seed-prov-1', nombre: 'Montaje', precioReferencia: 2500 },
      { id: 'seed-srv-2', proveedorId: 'seed-prov-1', nombre: 'Flete local', precioReferencia: 1200 },
      { id: 'seed-srv-3', proveedorId: 'seed-prov-3', nombre: 'Montaje de carpa', precioReferencia: 1800 },
      { id: 'seed-srv-4', proveedorId: 'seed-prov-3', nombre: 'Iluminaci├│n', precioReferencia: 3500 },
    ],
  });

  await prisma.cotizacionProveedorItem.deleteMany({
    where: { cotizacion: { id: 'seed-cot-prov-1' } },
  });
  await prisma.cotizacionProveedor.upsert({
    where: { id: 'seed-cot-prov-1' },
    update: {},
    create: {
      id: 'seed-cot-prov-1',
      proveedorId: 'seed-prov-1',
      clienteProveedorId: 'seed-cp-1',
      folio: 'COT-20260920-0001',
      titulo: 'Boda M├®ndez ÔÇö mobiliario completo',
      estado: EstadoCotizacion.ENVIADA,
      fechaEvento: new Date('2026-09-20T17:00:00'),
      lugarEntrega: 'Jard├¡n Santa Fe, CDMX',
      costoEnvio: 1200,
      descuentoPorcentaje: 5,
      descuentoMonto: 1040,
      ivaPorcentaje: 16,
      ivaIncluido: false,
      subtotal: 19900,
      montoIva: 3017.6,
      total: 22077.6,
      validoHasta: new Date('2026-08-20T23:59:59'),
      notas: 'Incluye montaje y desmontaje el mismo d├¡a.',
      items: {
        create: [
          {
            id: 'seed-cot-item-1',
            productoProveedorId: 'seed-cat-1',
            descripcion: 'Silla Tiffany',
            cantidad: 180,
            precioUnitario: 55,
            subtotal: 9900,
          },
          {
            id: 'seed-cot-item-2',
            productoProveedorId: 'seed-cat-2',
            descripcion: 'Mesa redonda 10 personas',
            cantidad: 18,
            precioUnitario: 380,
            subtotal: 6840,
          },
        ],
      },
    },
  });

  const margen = 30;
  const cotizacion = await prisma.cotizacion.upsert({
    where: { folio: 'COT-2026-001' },
    update: {},
    create: {
      id: 'seed-cot-1',
      folio: 'COT-2026-001',
      eventoId: 'seed-evento-1',
      estado: 'BORRADOR',
      margenGlobal: margen,
      validoHasta: new Date('2026-08-15T23:59:59'),
    },
  });

  const items = [
    {
      productoId: 'seed-prod-1',
      descripcion: 'Mesa redonda 10 personas',
      cantidad: 20,
      costoUnitario: 150,
    },
    {
      productoId: 'seed-prod-2',
      descripcion: 'Silla Tiffany',
      cantidad: 200,
      costoUnitario: 25,
    },
    {
      productoId: 'seed-prod-4',
      descripcion: 'Carpa 6x6m',
      cantidad: 2,
      costoUnitario: 1200,
    },
  ];

  for (const item of items) {
    const precioUnitario = calcPrecioVenta(item.costoUnitario, margen);
    const subtotal = calcSubtotal(precioUnitario, item.cantidad);

    await prisma.cotizacionItem.upsert({
      where: { id: `seed-item-${item.productoId}` },
      update: {},
      create: {
        id: `seed-item-${item.productoId}`,
        cotizacionId: cotizacion.id,
        productoId: item.productoId,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        costoUnitario: item.costoUnitario,
        margenPorcentaje: margen,
        precioUnitario,
        subtotal,
        esSubarrendo: false,
      },
    });
  }

  const allItems = await prisma.cotizacionItem.findMany({
    where: { cotizacionId: cotizacion.id },
  });

  let subtotalCosto = 0;
  let subtotalVenta = 0;
  for (const item of allItems) {
    subtotalCosto += Number(item.costoUnitario) * item.cantidad;
    subtotalVenta += Number(item.subtotal);
  }

  await prisma.cotizacion.update({
    where: { id: cotizacion.id },
    data: {
      subtotalCosto,
      subtotalVenta,
      total: subtotalVenta,
      utilidad: subtotalVenta - subtotalCosto,
    },
  });

  // Subarrendo en cotizaci├│n (50 sillas extra)
  await prisma.cotizacionItem.upsert({
    where: { id: 'seed-item-sub-1' },
    update: {},
    create: {
      id: 'seed-item-sub-1',
      cotizacionId: cotizacion.id,
      proveedorId: 'seed-prov-1',
      descripcion: 'Sillas Tiffany adicionales (subarrendo)',
      cantidad: 50,
      costoUnitario: 30,
      margenPorcentaje: margen,
      precioUnitario: calcPrecioVenta(30, margen),
      subtotal: calcSubtotal(calcPrecioVenta(30, margen), 50),
      esSubarrendo: true,
    },
  });

  // Veh├¡culos
  await prisma.vehiculo.upsert({
    where: { id: 'seed-veh-1' },
    update: {},
    create: {
      id: 'seed-veh-1',
      nombre: 'Cami├│n 3.5 ton',
      placa: 'REM-001-CDMX',
      capacidad: '3.5 toneladas',
    },
  });

  await prisma.vehiculo.upsert({
    where: { id: 'seed-veh-2' },
    update: {},
    create: {
      id: 'seed-veh-2',
      nombre: 'Camioneta Nissan NP300',
      placa: 'REM-002-CDMX',
      capacidad: '1 tonelada',
    },
  });

  // Agenda ÔÇö actividades del evento demo
  await prisma.actividadAgenda.deleteMany({ where: { eventoId: 'seed-evento-1' } });
  await prisma.actividadAgenda.createMany({
    data: [
      {
        id: 'seed-agenda-1',
        eventoId: 'seed-evento-1',
        tipo: 'MONTAJE',
        titulo: 'Montaje ÔÇö Boda Gonz├ílez-Ruiz',
        fechaInicio: new Date('2026-09-15T10:00:00'),
        fechaFin: new Date('2026-09-15T17:00:00'),
        lugar: 'Jard├¡n Las Palmas, CDMX',
      },
      {
        id: 'seed-agenda-2',
        eventoId: 'seed-evento-1',
        tipo: 'EVENTO',
        titulo: 'Boda Gonz├ílez-Ruiz',
        fechaInicio: new Date('2026-09-15T18:00:00'),
        lugar: 'Jard├¡n Las Palmas, CDMX',
      },
      {
        id: 'seed-agenda-3',
        eventoId: 'seed-evento-1',
        tipo: 'DESMONTAJE',
        titulo: 'Desmontaje ÔÇö Boda Gonz├ílez-Ruiz',
        fechaInicio: new Date('2026-09-16T02:00:00'),
        lugar: 'Jard├¡n Las Palmas, CDMX',
      },
    ],
  });

  // Log├¡stica
  const logistica = await prisma.logistica.upsert({
    where: { eventoId: 'seed-evento-1' },
    update: {},
    create: {
      id: 'seed-log-1',
      eventoId: 'seed-evento-1',
      vehiculoId: 'seed-veh-1',
      conductor: 'Juan P├®rez',
      equipo: 'Carlos Ruiz, Miguel ├üngel',
      fechaSalida: new Date('2026-09-15T08:00:00'),
      fechaRegreso: new Date('2026-09-16T04:00:00'),
      ruta: 'Almac├®n Central ÔåÆ Jard├¡n Las Palmas ÔåÆ Almac├®n',
      estado: 'PROGRAMADA',
    },
  });

  const checklistItems = [
    'Verificar mobiliario cargado',
    'Confirmar direcci├│n con cliente',
    'Revisar herramientas de montaje',
    'Entregar y firmar acta',
    'Fotograf├¡as de evidencia',
  ];
  await prisma.logisticaChecklistItem.deleteMany({ where: { logisticaId: logistica.id } });
  for (let i = 0; i < checklistItems.length; i++) {
    await prisma.logisticaChecklistItem.create({
      data: {
        id: `seed-check-${i + 1}`,
        logisticaId: logistica.id,
        descripcion: checklistItems[i],
        orden: i,
        completado: i === 0,
      },
    });
  }

  // Subarrendo
  await prisma.subarrendo.upsert({
    where: { id: 'seed-sub-1' },
    update: {},
    create: {
      id: 'seed-sub-1',
      eventoId: 'seed-evento-1',
      proveedorId: 'seed-prov-1',
      cotizacionItemId: 'seed-item-sub-1',
      descripcion: 'Sillas Tiffany adicionales (subarrendo)',
      cantidad: 50,
      costo: 1500,
      estado: 'SOLICITADO',
      fechaEntrega: new Date('2026-09-14T12:00:00'),
    },
  });

  // Finanzas ÔÇö anticipo y pago parcial del evento demo
  await prisma.movimientoFinanciero.deleteMany({ where: { eventoId: 'seed-evento-1' } });
  await prisma.movimientoFinanciero.createMany({
    data: [
      {
        id: 'seed-mov-1',
        eventoId: 'seed-evento-1',
        tipo: 'ANTICIPO',
        concepto: 'Anticipo 50% ÔÇö Boda Gonz├ílez-Ruiz',
        monto: 45000,
        metodoPago: 'TRANSFERENCIA',
        estado: 'CONFIRMADO',
        referencia: 'SPEI-20260701-001',
        fecha: new Date('2026-07-01T12:00:00'),
      },
      {
        id: 'seed-mov-2',
        eventoId: 'seed-evento-1',
        tipo: 'GASTO',
        concepto: 'Flete subarrendo sillas',
        monto: 800,
        metodoPago: 'EFECTIVO',
        estado: 'CONFIRMADO',
        fecha: new Date('2026-07-10T10:00:00'),
      },
    ],
  });

  // Documento demo
  await prisma.documento.deleteMany({ where: { eventoId: 'seed-evento-1' } });
  await prisma.documento.create({
    data: {
      id: 'seed-doc-1',
      eventoId: 'seed-evento-1',
      cotizacionId: cotizacion.id,
      tipo: 'COTIZACION',
      titulo: `Cotizaci├│n ${cotizacion.folio}`,
      folio: 'DOC-COT-2026-001',
      contenido: '<p>Cotizaci├│n demo generada en seed.</p>',
    },
  });

  console.log('Seed completado:', {
    admin: admin.email,
    comercial: comercial.email,
    proveedorPortal: proveedorUser.email,
    productos: productos.length,
    cotizacion: cotizacion.folio,
    vehiculos: 2,
    agenda: 3,
    movimientos: 2,
    documentos: 1,
    proveedoresCatalogo: 3,
    productosCatalogo: catalogoSeed.length,
  });

  // Planes SaaS
  await seedPlans(prisma);

  // Suscripciones demo
  await prisma.pagoSuscripcion.deleteMany({
    where: { suscripcion: { proveedorId: { in: ['seed-prov-1', 'seed-prov-2', 'seed-prov-3'] } } },
  });
  await prisma.suscripcion.deleteMany({
    where: { proveedorId: { in: ['seed-prov-1', 'seed-prov-2', 'seed-prov-3'] } },
  });

  const suscripcionProv1 = await prisma.suscripcion.create({
    data: {
      id: 'seed-susc-1',
      proveedorId: 'seed-prov-1',
      planId: 'seed-plan-pro',
      estado: 'ACTIVA',
      fechaAlta: new Date('2026-06-01T00:00:00'),
      proximoCobro: new Date('2026-09-01T00:00:00'),
      metodoPago: 'TARJETA',
      referenciaPago: 'Visa ┬À┬À┬À┬À 4242',
    },
  });

  await prisma.pagoSuscripcion.createMany({
    data: [
      {
        id: 'seed-pago-susc-1',
        suscripcionId: suscripcionProv1.id,
        monto: 2490,
        estado: 'PAGADO',
        metodoPago: 'TARJETA',
        referencia: 'MP-20260701-001',
        periodoInicio: new Date('2026-07-01T00:00:00'),
        periodoFin: new Date('2026-08-01T00:00:00'),
        pagadoEn: new Date('2026-07-01T10:30:00'),
      },
      {
        id: 'seed-pago-susc-2',
        suscripcionId: suscripcionProv1.id,
        monto: 2490,
        estado: 'PAGADO',
        metodoPago: 'TARJETA',
        referencia: 'MP-20260801-001',
        periodoInicio: new Date('2026-08-01T00:00:00'),
        periodoFin: new Date('2026-09-01T00:00:00'),
        pagadoEn: new Date('2026-08-01T09:15:00'),
      },
    ],
  });

  const suscripcionProv2 = await prisma.suscripcion.create({
    data: {
      id: 'seed-susc-2',
      proveedorId: 'seed-prov-2',
      planId: 'seed-plan-basico',
      estado: 'PRUEBA',
      fechaAlta: new Date('2026-07-15T00:00:00'),
      proximoCobro: new Date('2026-08-15T00:00:00'),
      metodoPago: null,
    },
  });

  await prisma.pagoSuscripcion.create({
    data: {
      id: 'seed-pago-susc-3',
      suscripcionId: suscripcionProv2.id,
      monto: 0,
      estado: 'PAGADO',
      metodoPago: 'OTRO',
      referencia: 'Periodo de prueba',
      periodoInicio: new Date('2026-07-15T00:00:00'),
      periodoFin: new Date('2026-08-15T00:00:00'),
      pagadoEn: new Date('2026-07-15T00:00:00'),
    },
  });

  await prisma.suscripcion.create({
    data: {
      id: 'seed-susc-3',
      proveedorId: 'seed-prov-3',
      planId: 'seed-plan-basico',
      estado: 'SUSPENDIDA',
      fechaAlta: new Date('2026-05-01T00:00:00'),
      proximoCobro: new Date('2026-08-01T00:00:00'),
      metodoPago: 'TRANSFERENCIA',
      referenciaPago: 'SPEI ┬À Banorte',
    },
  });
}

