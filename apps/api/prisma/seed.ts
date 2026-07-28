import { PrismaClient, RolUsuario, TipoProveedor } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  calcPrecioVenta,
  calcSubtotal,
} from '../src/common/utils/pricing';

const prisma = new PrismaClient();

async function main() {
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
      nombre: 'María González',
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
      titulo: 'Boda González-Ruiz',
      descripcion: 'Evento social — 200 invitados',
      fechaEvento: new Date('2026-09-15T18:00:00'),
      fechaMontaje: new Date('2026-09-15T10:00:00'),
      fechaDesmontaje: new Date('2026-09-16T02:00:00'),
      lugar: 'Jardín Las Palmas, CDMX',
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
      nombre: 'Mantelería premium',
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
      ciudad: 'Ciudad de México',
      entidadFederativa: 'Ciudad de México',
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
      ciudad: 'Ciudad de México',
      entidadFederativa: 'Ciudad de México',
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
      ciudad: 'Ciudad de México',
      entidadFederativa: 'Ciudad de México',
      estadoVerificacion: 'VERIFICADO',
      origenCaptura: 'INTERNO',
      eventosSimultaneosMax: 10,
      unidadesMaxEntrega: 2000,
      radioCoberturaKm: 80,
    },
    create: {
      id: 'seed-prov-2',
      nombre: 'Remo&Rent — Almacén Central',
      razonSocial: 'Remo&Rent Operaciones',
      contacto: 'Operaciones',
      ciudad: 'Ciudad de México',
      entidadFederativa: 'Ciudad de México',
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
    update: {},
    create: {
      id: 'seed-prov-3',
      nombre: 'Carpas y Eventos Guadalajara',
      razonSocial: 'Carpas GDL SA de CV',
      contacto: 'Ana Martínez',
      email: 'ventas@carpasgdl.mx',
      telefono: '3331234567',
      ciudad: 'Guadalajara',
      entidadFederativa: 'Jalisco',
      direccion: 'Av. López Mateos 500',
      tipo: TipoProveedor.SUBARRENDO,
      estadoVerificacion: 'EN_REVISION',
      origenCaptura: 'TELEFONO',
      eventosSimultaneosMax: 3,
      unidadesMaxEntrega: 150,
      radioCoberturaKm: 120,
    },
  });

  // Catálogo de productos por proveedor
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
      nombre: 'Iluminación perimetral LED',
      categoria: 'Iluminación',
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
        descripcion: `Producto catalogado — ${item.nombre}`,
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
      { id: 'seed-cob-1', proveedorId: 'seed-prov-1', entidad: 'Ciudad de México', ciudad: 'CDMX' },
      { id: 'seed-cob-2', proveedorId: 'seed-prov-1', entidad: 'Estado de México' },
      { id: 'seed-cob-3', proveedorId: 'seed-prov-2', entidad: 'Ciudad de México' },
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
      { id: 'seed-srv-4', proveedorId: 'seed-prov-3', nombre: 'Iluminación', precioReferencia: 3500 },
    ],
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

  // Subarrendo en cotización (50 sillas extra)
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

  // Vehículos
  await prisma.vehiculo.upsert({
    where: { id: 'seed-veh-1' },
    update: {},
    create: {
      id: 'seed-veh-1',
      nombre: 'Camión 3.5 ton',
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

  // Agenda — actividades del evento demo
  await prisma.actividadAgenda.deleteMany({ where: { eventoId: 'seed-evento-1' } });
  await prisma.actividadAgenda.createMany({
    data: [
      {
        id: 'seed-agenda-1',
        eventoId: 'seed-evento-1',
        tipo: 'MONTAJE',
        titulo: 'Montaje — Boda González-Ruiz',
        fechaInicio: new Date('2026-09-15T10:00:00'),
        fechaFin: new Date('2026-09-15T17:00:00'),
        lugar: 'Jardín Las Palmas, CDMX',
      },
      {
        id: 'seed-agenda-2',
        eventoId: 'seed-evento-1',
        tipo: 'EVENTO',
        titulo: 'Boda González-Ruiz',
        fechaInicio: new Date('2026-09-15T18:00:00'),
        lugar: 'Jardín Las Palmas, CDMX',
      },
      {
        id: 'seed-agenda-3',
        eventoId: 'seed-evento-1',
        tipo: 'DESMONTAJE',
        titulo: 'Desmontaje — Boda González-Ruiz',
        fechaInicio: new Date('2026-09-16T02:00:00'),
        lugar: 'Jardín Las Palmas, CDMX',
      },
    ],
  });

  // Logística
  const logistica = await prisma.logistica.upsert({
    where: { eventoId: 'seed-evento-1' },
    update: {},
    create: {
      id: 'seed-log-1',
      eventoId: 'seed-evento-1',
      vehiculoId: 'seed-veh-1',
      conductor: 'Juan Pérez',
      equipo: 'Carlos Ruiz, Miguel Ángel',
      fechaSalida: new Date('2026-09-15T08:00:00'),
      fechaRegreso: new Date('2026-09-16T04:00:00'),
      ruta: 'Almacén Central → Jardín Las Palmas → Almacén',
      estado: 'PROGRAMADA',
    },
  });

  const checklistItems = [
    'Verificar mobiliario cargado',
    'Confirmar dirección con cliente',
    'Revisar herramientas de montaje',
    'Entregar y firmar acta',
    'Fotografías de evidencia',
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

  // Finanzas — anticipo y pago parcial del evento demo
  await prisma.movimientoFinanciero.deleteMany({ where: { eventoId: 'seed-evento-1' } });
  await prisma.movimientoFinanciero.createMany({
    data: [
      {
        id: 'seed-mov-1',
        eventoId: 'seed-evento-1',
        tipo: 'ANTICIPO',
        concepto: 'Anticipo 50% — Boda González-Ruiz',
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
      titulo: `Cotización ${cotizacion.folio}`,
      folio: 'DOC-COT-2026-001',
      contenido: '<p>Cotización demo generada en seed.</p>',
    },
  });

  console.log('Seed completado:', {
    admin: admin.email,
    comercial: comercial.email,
    productos: productos.length,
    cotizacion: cotizacion.folio,
    vehiculos: 2,
    agenda: 3,
    movimientos: 2,
    documentos: 1,
    proveedoresCatalogo: 3,
    productosCatalogo: catalogoSeed.length,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
