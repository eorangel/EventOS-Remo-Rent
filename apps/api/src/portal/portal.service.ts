import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoOrdenCobro,
  EstadoSeguimientoCliente,
  EstadoEventoProveedor,
  Prisma,
  EstadoCotizacion,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calcSubtotal, roundMoney, toNumber } from '../common/utils/pricing';
import { AuthUser, requireProveedorUser } from '../common/utils/user-context';
import { CatalogoProveedorService } from '../proveedores/catalogo-proveedor.service';
import { CatalogoBanqueteService } from '../proveedores/catalogo-banquete.service';
import {
  parseFechaEventoDia,
  rangoConsultaUTC,
  fechaEventoEnRango,
} from '../common/utils/fecha-evento';
import {
  CreateClienteProveedorDto,
  CreateEventoClienteDto,
  CreateOrdenCobroDto,
  CreateSeguimientoDto,
  UpdateClienteProveedorDto,
  UpdateEventoClienteDto,
  UpdateOrdenCobroDto,
  UpdateSeguimientoDto,
} from './dto/portal.dto';
import { UpdatePerfilEmpresaDto } from './dto/empresa.dto';
import {
  CreateCotizacionProveedorDto,
  UpdateCotizacionProveedorDto,
} from './dto/cotizacion-proveedor.dto';
import {
  buildCotizacionProveedorHtml,
  calcTotalesCotizacionProveedor,
  mapCotizacionItemParaPdf,
} from './cotizacion-proveedor.utils';
import {
  buildPlantillaClientesExcel,
  parseClientesExcel,
  type FilaClienteExcel,
} from './excel-clientes.parser';

const DIAS_DEFAULT = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const ESTADOS_COTIZACION_OPERATIVA: EstadoCotizacion[] = [
  EstadoCotizacion.BORRADOR,
  EstadoCotizacion.ENVIADA,
  EstadoCotizacion.APROBADA,
];

const COTIZACION_ITEMS_INCLUDE = {
  productoProveedor: { select: { id: true, nombre: true, categoria: true } },
  menuBanquete: { select: { id: true, nombre: true } },
  servicioProveedor: { select: { id: true, nombre: true } },
} as const;

function mapCotizacionItemCreate(item: {
  productoProveedorId?: string;
  menuBanqueteProveedorId?: string;
  servicioProveedorId?: string;
  modalidadPrecioMenu?: 'POR_PERSONA' | 'POR_EVENTO';
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}) {
  return {
    productoProveedorId: item.productoProveedorId ?? null,
    menuBanqueteProveedorId: item.menuBanqueteProveedorId ?? null,
    servicioProveedorId: item.servicioProveedorId ?? null,
    modalidadPrecioMenu: item.modalidadPrecioMenu ?? null,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    subtotal: item.subtotal,
  };
}

@Injectable()
export class PortalService {
  constructor(
    private prisma: PrismaService,
    private catalogoService: CatalogoProveedorService,
    private banqueteService: CatalogoBanqueteService,
  ) {}

  async getDashboard(user: AuthUser) {
    const proveedorId = requireProveedorUser(user);
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: proveedorId },
      include: {
        productos: { include: { fotos: true } },
        coberturas: true,
        servicios: true,
      },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const inicioSemanas = new Date(now);
    inicioSemanas.setDate(inicioSemanas.getDate() - 41);
    inicioSemanas.setHours(0, 0, 0, 0);

    const [
      clientes,
      cobrosPendientes,
      cobrosPagados,
      totalClientes,
      ingresosMesAgg,
      ingresosMesAnteriorAgg,
      saldoPendienteAgg,
      totalCobradoAgg,
      totalEmitidoAgg,
      eventosMes,
      eventosActivos,
      cotizacionesMes,
      cotizacionesProximas,
      cotizacionesActivas,
      cobrosPagadosMes,
      cobrosCreadosMes,
      cobrosPagadosRecientes,
    ] = await Promise.all([
      this.prisma.clienteProveedor.count({ where: { proveedorId, activo: true } }),
      this.prisma.ordenCobro.count({
        where: { proveedorId, estado: { in: ['PENDIENTE', 'BORRADOR', 'VENCIDO'] } },
      }),
      this.prisma.ordenCobro.count({ where: { proveedorId, estado: 'PAGADO' } }),
      this.prisma.clienteProveedor.count({ where: { proveedorId } }),
      this.prisma.ordenCobro.aggregate({
        where: {
          proveedorId,
          estado: EstadoOrdenCobro.PAGADO,
          pagadoEn: { gte: inicioMes, lte: finMes },
        },
        _sum: { monto: true },
      }),
      this.prisma.ordenCobro.aggregate({
        where: {
          proveedorId,
          estado: EstadoOrdenCobro.PAGADO,
          pagadoEn: { gte: inicioMesAnterior, lte: finMesAnterior },
        },
        _sum: { monto: true },
      }),
      this.prisma.ordenCobro.aggregate({
        where: {
          proveedorId,
          estado: { in: [EstadoOrdenCobro.PENDIENTE, EstadoOrdenCobro.VENCIDO, EstadoOrdenCobro.BORRADOR] },
        },
        _sum: { monto: true },
      }),
      this.prisma.ordenCobro.aggregate({
        where: { proveedorId, estado: EstadoOrdenCobro.PAGADO },
        _sum: { monto: true },
      }),
      this.prisma.ordenCobro.aggregate({
        where: { proveedorId, estado: { not: EstadoOrdenCobro.CANCELADO } },
        _sum: { monto: true },
      }),
      this.prisma.eventoClienteProveedor.count({
        where: {
          proveedorId,
          estado: { not: EstadoEventoProveedor.CANCELADO },
          fechaEvento: { gte: inicioMes, lte: finMes },
        },
      }),
      this.prisma.eventoClienteProveedor.count({
        where: {
          proveedorId,
          estado: { in: [EstadoEventoProveedor.CONFIRMADO, EstadoEventoProveedor.EN_EJECUCION] },
        },
      }),
      this.prisma.cotizacionProveedor.count({
        where: {
          proveedorId,
          estado: { in: ESTADOS_COTIZACION_OPERATIVA },
          fechaEvento: { gte: inicioMes, lte: finMes },
        },
      }),
      this.prisma.cotizacionProveedor.count({
        where: {
          proveedorId,
          estado: { in: [EstadoCotizacion.ENVIADA, EstadoCotizacion.APROBADA] },
          fechaEvento: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
        },
      }),
      this.prisma.cotizacionProveedor.count({
        where: {
          proveedorId,
          estado: { in: ESTADOS_COTIZACION_OPERATIVA },
        },
      }),
      this.prisma.ordenCobro.count({
        where: {
          proveedorId,
          estado: EstadoOrdenCobro.PAGADO,
          pagadoEn: { gte: inicioMes, lte: finMes },
        },
      }),
      this.prisma.ordenCobro.count({
        where: {
          proveedorId,
          createdAt: { gte: inicioMes, lte: finMes },
          estado: { not: EstadoOrdenCobro.CANCELADO },
        },
      }),
      this.prisma.ordenCobro.findMany({
        where: {
          proveedorId,
          estado: EstadoOrdenCobro.PAGADO,
          pagadoEn: { gte: inicioSemanas, lte: finMes },
        },
        select: { monto: true, pagadoEn: true },
      }),
    ]);

    const cobrosRecientes = await this.prisma.ordenCobro.findMany({
      where: { proveedorId },
      include: { clienteProveedor: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const completitud = this.calcCompletitud(proveedor);

    const ingresosMes = toNumber(ingresosMesAgg._sum.monto ?? 0);
    const ingresosMesAnterior = toNumber(ingresosMesAnteriorAgg._sum.monto ?? 0);
    const saldoPendiente = toNumber(saldoPendienteAgg._sum.monto ?? 0);
    const totalCobrado = toNumber(totalCobradoAgg._sum.monto ?? 0);
    const totalEmitido = toNumber(totalEmitidoAgg._sum.monto ?? 0);
    const variacionIngresos =
      ingresosMesAnterior > 0
        ? Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100)
        : ingresosMes > 0
          ? 100
          : null;
    const tasaCobranza =
      totalEmitido > 0 ? Math.round((totalCobrado / totalEmitido) * 100) : 0;

    const ingresosSemanales = this.agruparIngresosSemanales(cobrosPagadosRecientes, 6);

    const mesLabel = new Intl.DateTimeFormat('es-MX', {
      month: 'long',
      year: 'numeric',
    }).format(now);

    return {
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        estadoVerificacion: proveedor.estadoVerificacion,
        completitudPerfil: completitud,
      },
      resumen: {
        clientesActivos: clientes,
        totalClientes,
        productosCatalogo: proveedor.productos.length,
        cobrosPendientes,
        cobrosPagados,
        cotizacionesActivas,
      },
      financiero: {
        mes: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        mesLabel,
        ingresosMes,
        ingresosMesAnterior,
        variacionIngresos,
        saldoPendiente,
        eventosMes: eventosMes + cotizacionesMes,
        eventosActivos: eventosActivos + cotizacionesProximas,
        cotizacionesActivas,
        clientesActivos: clientes,
        cobrosPagadosMes,
        cobrosPendientes,
        cobrosCreadosMes,
        tasaCobranza,
        ingresosSemanales,
      },
      cobrosRecientes: cobrosRecientes.map((c) => this.mapOrden(c)),
    };
  }

  async getReportes(user: AuthUser) {
    const proveedorId = requireProveedorUser(user);
    const now = new Date();
    const mesesVentas = 6;
    const inicioVentas = new Date(now.getFullYear(), now.getMonth() - (mesesVentas - 1), 1);
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const ventasBuckets: { mes: string; mesLabel: string; monto: number; cobros: number }[] = [];
    for (let i = mesesVentas - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = new Intl.DateTimeFormat('es-MX', {
        month: 'short',
        year: '2-digit',
      }).format(d);
      ventasBuckets.push({ mes: key, mesLabel, monto: 0, cobros: 0 });
    }

    const [cobrosPagados, cobrosPipeline, itemsCotizacion, eventos, cotizaciones] =
      await Promise.all([
        this.prisma.ordenCobro.findMany({
          where: {
            proveedorId,
            estado: EstadoOrdenCobro.PAGADO,
            pagadoEn: { not: null },
          },
          include: { clienteProveedor: true },
        }),
        this.prisma.ordenCobro.findMany({
          where: {
            proveedorId,
            estado: {
              in: [EstadoOrdenCobro.BORRADOR, EstadoOrdenCobro.PENDIENTE, EstadoOrdenCobro.VENCIDO],
            },
          },
          include: { clienteProveedor: true },
        }),
        this.prisma.cotizacionProveedorItem.findMany({
          where: {
            cotizacion: {
              proveedorId,
              estado: { in: ESTADOS_COTIZACION_OPERATIVA },
            },
          },
          include: { productoProveedor: true },
        }),
        this.prisma.eventoClienteProveedor.findMany({
          where: { proveedorId, estado: { not: EstadoEventoProveedor.CANCELADO } },
          include: { clienteProveedor: true },
          orderBy: { fechaEvento: 'desc' },
        }),
        this.prisma.cotizacionProveedor.findMany({
          where: {
            proveedorId,
            estado: { in: ESTADOS_COTIZACION_OPERATIVA },
          },
          include: { clienteProveedor: true },
          orderBy: { fechaEvento: 'desc' },
        }),
      ]);

    const clientesMap = new Map<
      string,
      {
        clienteId: string;
        nombre: string;
        totalCobrado: number;
        totalCotizado: number;
        cobrosPagados: number;
        cotizaciones: number;
        eventos: number;
      }
    >();

    const upsertCliente = (
      id: string,
      nombre: string,
      patch: Partial<{
        totalCobrado: number;
        totalCotizado: number;
        cobrosPagados: number;
        cotizaciones: number;
        eventos: number;
      }>,
    ) => {
      const row = clientesMap.get(id) ?? {
        clienteId: id,
        nombre,
        totalCobrado: 0,
        totalCotizado: 0,
        cobrosPagados: 0,
        cotizaciones: 0,
        eventos: 0,
      };
      if (patch.totalCobrado) row.totalCobrado += patch.totalCobrado;
      if (patch.totalCotizado) row.totalCotizado += patch.totalCotizado;
      if (patch.cobrosPagados) row.cobrosPagados += patch.cobrosPagados;
      if (patch.cotizaciones) row.cotizaciones += patch.cotizaciones;
      if (patch.eventos) row.eventos += patch.eventos;
      clientesMap.set(id, row);
    };

    for (const cobro of cobrosPagados) {
      if (!cobro.pagadoEn || cobro.pagadoEn < inicioVentas) continue;
      upsertCliente(cobro.clienteProveedorId, cobro.clienteProveedor.nombre, {
        totalCobrado: toNumber(cobro.monto),
        cobrosPagados: 1,
      });
    }

    for (const cot of cotizaciones) {
      upsertCliente(cot.clienteProveedorId, cot.clienteProveedor.nombre, {
        totalCotizado: toNumber(cot.total),
        cotizaciones: 1,
      });
    }

    for (const evento of eventos) {
      upsertCliente(evento.clienteProveedorId, evento.clienteProveedor.nombre, {
        eventos: 1,
      });
    }

    const topClientes = [...clientesMap.values()]
      .sort(
        (a, b) =>
          b.totalCobrado + b.totalCotizado - (a.totalCobrado + a.totalCotizado) ||
          b.cotizaciones - a.cotizaciones,
      )
      .slice(0, 8)
      .map((c) => ({
        ...c,
        totalCobrado: roundMoney(c.totalCobrado),
        totalCotizado: roundMoney(c.totalCotizado),
      }));

    const productosMap = new Map<
      string,
      {
        productoId: string | null;
        nombre: string;
        cantidadRentada: number;
        ingresosEstimados: number;
      }
    >();

    for (const item of itemsCotizacion) {
      const key = item.productoProveedorId ?? `manual:${item.descripcion}`;
      const nombre = item.productoProveedor?.nombre ?? item.descripcion;
      const row = productosMap.get(key) ?? {
        productoId: item.productoProveedorId,
        nombre,
        cantidadRentada: 0,
        ingresosEstimados: 0,
      };
      row.cantidadRentada += item.cantidad;
      row.ingresosEstimados += toNumber(item.subtotal);
      productosMap.set(key, row);
    }

    const productosOrdenados = [...productosMap.values()].sort(
      (a, b) => b.cantidadRentada - a.cantidadRentada,
    );
    const productosMasRentados = productosOrdenados.slice(0, 8).map((p) => ({
      ...p,
      ingresosEstimados: roundMoney(p.ingresosEstimados),
    }));
    const totalUnidadesRentadas = productosOrdenados.reduce((s, p) => s + p.cantidadRentada, 0);

    for (const cobro of cobrosPagados) {
      if (!cobro.pagadoEn || cobro.pagadoEn < inicioVentas) continue;
      const key = `${cobro.pagadoEn.getFullYear()}-${String(cobro.pagadoEn.getMonth() + 1).padStart(2, '0')}`;
      const bucket = ventasBuckets.find((b) => b.mes === key);
      if (bucket) {
        bucket.monto += toNumber(cobro.monto);
        bucket.cobros += 1;
      }
    }

    const ventasPorMes = ventasBuckets.map((b) => ({
      ...b,
      monto: roundMoney(b.monto),
    }));

    const pipelinePorMes = ventasBuckets.map((b) => ({
      mes: b.mes,
      mesLabel: b.mesLabel,
      monto: 0,
      cobros: 0,
    }));

    for (const cobro of cobrosPipeline) {
      const ref = cobro.fechaVencimiento ?? cobro.createdAt;
      if (ref < inicioVentas) continue;
      const key = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}`;
      const bucket = pipelinePorMes.find((b) => b.mes === key);
      if (bucket) {
        bucket.monto += toNumber(cobro.monto);
        bucket.cobros += 1;
      }
    }

    const pipelinePorMesRounded = pipelinePorMes.map((b) => ({
      ...b,
      monto: roundMoney(b.monto),
    }));

    const cotizacionesConFecha = cotizaciones.filter((c) => c.fechaEvento);
    const operacionesPorMesMap = new Map<string, number>();

    for (const e of eventos) {
      const key = `${e.fechaEvento.getFullYear()}-${String(e.fechaEvento.getMonth() + 1).padStart(2, '0')}`;
      operacionesPorMesMap.set(key, (operacionesPorMesMap.get(key) ?? 0) + 1);
    }
    for (const c of cotizacionesConFecha) {
      const fecha = c.fechaEvento!;
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      operacionesPorMesMap.set(key, (operacionesPorMesMap.get(key) ?? 0) + 1);
    }

    const operacionesPorMes = ventasBuckets.map((b) => ({
      mes: b.mes,
      mesLabel: b.mesLabel,
      cantidad: operacionesPorMesMap.get(b.mes) ?? 0,
    }));

    const operacionesResumen = {
      total: eventos.length + cotizaciones.length,
      eventosRegistrados: eventos.length,
      cotizacionesActivas: cotizaciones.length,
      cotizacionesBorrador: cotizaciones.filter((c) => c.estado === EstadoCotizacion.BORRADOR).length,
      cotizacionesEnviadas: cotizaciones.filter((c) => c.estado === EstadoCotizacion.ENVIADA).length,
      cotizacionesAprobadas: cotizaciones.filter((c) => c.estado === EstadoCotizacion.APROBADA).length,
      confirmados: eventos.filter((e) => e.estado === EstadoEventoProveedor.CONFIRMADO).length,
      enEjecucion: eventos.filter((e) => e.estado === EstadoEventoProveedor.EN_EJECUCION).length,
      completados: eventos.filter((e) => e.estado === EstadoEventoProveedor.COMPLETADO).length,
      proximos:
        eventos.filter((e) => e.fechaEvento >= hoy).length +
        cotizacionesConFecha.filter((c) => c.fechaEvento! >= hoy).length,
    };

    const operacionesRecientes = [
      ...eventos.map((e) => ({
        id: e.id,
        tipo: 'evento' as const,
        titulo: e.titulo,
        fecha: e.fechaEvento.toISOString(),
        estado: e.estado,
        clienteId: e.clienteProveedorId,
        clienteNombre: e.clienteProveedor.nombre,
        lugar: e.lugar,
        montoEstimado: e.montoEstimado != null ? toNumber(e.montoEstimado as never) : null,
        enlace: `/proveedor/clientes/${e.clienteProveedorId}`,
      })),
      ...cotizaciones.map((c) => ({
        id: c.id,
        tipo: 'cotizacion' as const,
        titulo: c.titulo ?? c.folio,
        fecha: (c.fechaEvento ?? c.createdAt).toISOString(),
        estado: c.estado,
        clienteId: c.clienteProveedorId,
        clienteNombre: c.clienteProveedor.nombre,
        lugar: c.lugarEntrega,
        montoEstimado: toNumber(c.total),
        enlace: `/proveedor/cotizaciones/${c.id}`,
      })),
    ]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 8);

    const totalVentas = roundMoney(ventasPorMes.reduce((s, v) => s + v.monto, 0));
    const totalPipeline = roundMoney(
      cobrosPipeline.reduce((s, c) => s + toNumber(c.monto), 0),
    );

    return {
      generadoEn: now.toISOString(),
      resumen: {
        totalVentas,
        totalPipeline,
        totalOperaciones: operacionesResumen.total,
        totalEventos: operacionesResumen.total,
        cotizacionesActivas: cotizaciones.length,
        productosRentados: totalUnidadesRentadas,
        clientesConActividad: clientesMap.size,
      },
      topClientes,
      productosMasRentados,
      ventasPorMes,
      pipelinePorMes: pipelinePorMesRounded,
      operaciones: {
        resumen: operacionesResumen,
        porMes: operacionesPorMes,
        recientes: operacionesRecientes,
      },
      eventos: {
        resumen: {
          total: operacionesResumen.total,
          confirmados: operacionesResumen.confirmados,
          enEjecucion: operacionesResumen.enEjecucion,
          completados: operacionesResumen.completados,
          proximos: operacionesResumen.proximos,
        },
        porMes: operacionesPorMes,
        recientes: operacionesRecientes,
      },
    };
  }

  private agruparIngresosSemanales(
    cobros: Array<{ monto: unknown; pagadoEn: Date | null }>,
    semanas: number,
  ) {
    const buckets: { semana: string; monto: number; inicio: Date }[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = semanas - 1; i >= 0; i--) {
      const inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() - i * 7);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      const label = new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'short',
      }).format(inicio);
      buckets.push({ semana: label, monto: 0, inicio });
    }

    for (const cobro of cobros) {
      if (!cobro.pagadoEn) continue;
      const monto = toNumber(cobro.monto as never);
      for (const bucket of buckets) {
        const fin = new Date(bucket.inicio);
        fin.setDate(fin.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
        if (cobro.pagadoEn >= bucket.inicio && cobro.pagadoEn <= fin) {
          bucket.monto += monto;
          break;
        }
      }
    }

    return buckets.map(({ semana, monto }) => ({
      semana,
      monto: roundMoney(monto),
    }));
  }

  async listClientes(user: AuthUser, search?: string) {
    const proveedorId = requireProveedorUser(user);
    const rows = await this.prisma.clienteProveedor.findMany({
      where: {
        proveedorId,
        ...(search
          ? {
              OR: [
                { nombre: { contains: search, mode: 'insensitive' } },
                { empresa: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            eventos: true,
            seguimientos: { where: { estado: 'PENDIENTE' } },
            cobros: true,
            cotizaciones: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
    return rows;
  }

  async getCliente(user: AuthUser, id: string) {
    const proveedorId = requireProveedorUser(user);
    const cliente = await this.prisma.clienteProveedor.findFirst({
      where: { id, proveedorId },
      include: {
        _count: {
          select: {
            eventos: true,
            seguimientos: true,
            cobros: true,
            cotizaciones: true,
          },
        },
      },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async getClienteHistorial(user: AuthUser, id: string) {
    const proveedorId = requireProveedorUser(user);
    await this.ensureCliente(proveedorId, id);

    const [eventos, seguimientos, cobros, cotizaciones] = await Promise.all([
      this.prisma.eventoClienteProveedor.findMany({
        where: { proveedorId, clienteProveedorId: id },
        orderBy: { fechaEvento: 'desc' },
      }),
      this.prisma.seguimientoCliente.findMany({
        where: { proveedorId, clienteProveedorId: id },
        orderBy: { fechaProgramada: 'desc' },
      }),
      this.prisma.ordenCobro.findMany({
        where: { proveedorId, clienteProveedorId: id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cotizacionProveedor.findMany({
        where: { proveedorId, clienteProveedorId: id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const timeline = [
      ...eventos.map((e) => ({
        tipo: 'EVENTO' as const,
        id: e.id,
        fecha: e.fechaEvento,
        titulo: e.titulo,
        subtitulo: e.lugar ?? e.estado,
        estado: e.estado,
        meta: { montoEstimado: e.montoEstimado != null ? toNumber(e.montoEstimado) : null },
      })),
      ...seguimientos.map((s) => ({
        tipo: 'SEGUIMIENTO' as const,
        id: s.id,
        fecha: s.fechaProgramada,
        titulo: s.titulo,
        subtitulo: s.tipo,
        estado: s.estado,
        meta: { completadoEn: s.completadoEn },
      })),
      ...cobros.map((c) => ({
        tipo: 'COBRO' as const,
        id: c.id,
        fecha: c.pagadoEn ?? c.fechaVencimiento ?? c.createdAt,
        titulo: c.concepto,
        subtitulo: c.folio,
        estado: c.estado,
        meta: { monto: toNumber(c.monto) },
      })),
      ...cotizaciones.map((q) => ({
        tipo: 'COTIZACION' as const,
        id: q.id,
        fecha: q.fechaEvento ?? q.createdAt,
        titulo: q.titulo ?? q.folio,
        subtitulo: q.folio,
        estado: q.estado,
        meta: { total: toNumber(q.total) },
      })),
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return {
      eventos: eventos.map((e) => this.mapEvento(e)),
      seguimientos,
      cobros: cobros.map((c) => this.mapOrden({ ...c, clienteProveedor: { nombre: '' } })),
      cotizaciones: cotizaciones.map((q) => this.mapCotizacion(q)),
      timeline,
    };
  }

  async createCliente(user: AuthUser, dto: CreateClienteProveedorDto) {
    const proveedorId = requireProveedorUser(user);
    return this.prisma.clienteProveedor.create({
      data: { proveedorId, ...dto },
    });
  }

  getPlantillaExcelClientes(): Buffer {
    return buildPlantillaClientesExcel();
  }

  previewImportClientesExcel(buffer: Buffer) {
    const filas = parseClientesExcel(buffer);
    return this.buildImportClientesResult(filas, true);
  }

  async importClientesExcel(user: AuthUser, buffer: Buffer) {
    const proveedorId = requireProveedorUser(user);
    const filas = parseClientesExcel(buffer);
    const validas = filas.filter((f) => f.valido);

    if (validas.length === 0) {
      throw new BadRequestException('No hay filas válidas para importar. Revise la vista previa.');
    }

    const existentes = await this.prisma.clienteProveedor.findMany({
      where: { proveedorId },
      select: { id: true, nombre: true, email: true },
    });

    const porEmail = new Map<string, string>();
    const porNombre = new Map<string, string>();
    for (const c of existentes) {
      if (c.email?.trim()) {
        porEmail.set(c.email.trim().toLowerCase(), c.id);
      }
      porNombre.set(c.nombre.trim().toLowerCase(), c.id);
    }

    let creados = 0;
    let actualizados = 0;

    for (const fila of validas) {
      const emailKey = fila.email?.trim().toLowerCase();
      const nombreKey = fila.nombre.trim().toLowerCase();
      const existenteId =
        (emailKey && porEmail.get(emailKey)) || porNombre.get(nombreKey);

      const data = {
        nombre: fila.nombre.trim(),
        empresa: fila.empresa?.trim() || null,
        email: fila.email?.trim() || null,
        telefono: fila.telefono?.trim() || null,
        notas: fila.notas?.trim() || null,
        activo: true,
      };

      if (existenteId) {
        await this.prisma.clienteProveedor.update({
          where: { id: existenteId },
          data,
        });
        actualizados += 1;
      } else {
        const created = await this.prisma.clienteProveedor.create({
          data: { proveedorId, ...data },
        });
        if (created.email) {
          porEmail.set(created.email.trim().toLowerCase(), created.id);
        }
        porNombre.set(created.nombre.trim().toLowerCase(), created.id);
        creados += 1;
      }
    }

    return {
      ...this.buildImportClientesResult(filas, false),
      creados,
      actualizados,
    };
  }

  private buildImportClientesResult(filas: FilaClienteExcel[], vistaPrevia: boolean) {
    const validas = filas.filter((f) => f.valido).length;
    return {
      vistaPrevia,
      totalFilas: filas.length,
      validas,
      invalidas: filas.length - validas,
      filas,
    };
  }

  async updateCliente(user: AuthUser, id: string, dto: UpdateClienteProveedorDto) {
    const proveedorId = requireProveedorUser(user);
    await this.ensureCliente(proveedorId, id);
    return this.prisma.clienteProveedor.update({ where: { id }, data: dto });
  }

  async listCobros(user: AuthUser, estado?: EstadoOrdenCobro) {
    const proveedorId = requireProveedorUser(user);
    const rows = await this.prisma.ordenCobro.findMany({
      where: {
        proveedorId,
        ...(estado ? { estado } : {}),
      },
      include: { clienteProveedor: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapOrden(r));
  }

  async createCobro(user: AuthUser, dto: CreateOrdenCobroDto) {
    const proveedorId = requireProveedorUser(user);
    await this.ensureCliente(proveedorId, dto.clienteProveedorId);

    const folio = await this.nextFolio(proveedorId);
    const orden = await this.prisma.ordenCobro.create({
      data: {
        proveedorId,
        clienteProveedorId: dto.clienteProveedorId,
        folio,
        concepto: dto.concepto,
        monto: dto.monto,
        metodoPago: dto.metodoPago,
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
        notas: dto.notas,
        estado: EstadoOrdenCobro.PENDIENTE,
      },
      include: { clienteProveedor: true },
    });
    return this.mapOrden(orden);
  }

  async updateCobro(user: AuthUser, id: string, dto: UpdateOrdenCobroDto) {
    const proveedorId = requireProveedorUser(user);
    const existing = await this.ensureCobro(proveedorId, id);

    const pagadoEn =
      dto.estado === EstadoOrdenCobro.PAGADO && existing.estado !== EstadoOrdenCobro.PAGADO
        ? new Date()
        : dto.estado && dto.estado !== EstadoOrdenCobro.PAGADO
          ? null
          : existing.pagadoEn;

    const updated = await this.prisma.ordenCobro.update({
      where: { id },
      data: {
        ...dto,
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
        pagadoEn,
      },
      include: { clienteProveedor: true },
    });
    return this.mapOrden(updated);
  }

  async marcarCobroPagado(user: AuthUser, id: string, referencia?: string) {
    return this.updateCobro(user, id, {
      estado: EstadoOrdenCobro.PAGADO,
      referencia,
    });
  }

  async getCalendario(user: AuthUser, desde: string, hasta: string) {
    const proveedorId = requireProveedorUser(user);
    const from = parseFechaEventoDia(desde.slice(0, 10));
    const toEnd = rangoConsultaUTC(hasta.slice(0, 10)).fin;

    const [eventos, cotizaciones, seguimientos, cobros, pagosPendientes] =
      await Promise.all([
        this.prisma.eventoClienteProveedor.findMany({
          where: {
            proveedorId,
            estado: { not: EstadoEventoProveedor.CANCELADO },
            OR: [
              { fechaEvento: { gte: from, lte: toEnd } },
              { fechaEntrega: { gte: from, lte: toEnd } },
              { fechaRecogida: { gte: from, lte: toEnd } },
              { fechaFin: { gte: from, lte: toEnd } },
            ],
          },
          include: { clienteProveedor: true },
        }),
        this.prisma.cotizacionProveedor.findMany({
          where: {
            proveedorId,
            estado: { in: ESTADOS_COTIZACION_OPERATIVA },
            fechaEvento: { gte: from, lte: toEnd },
          },
          include: { clienteProveedor: true },
        }),
        this.prisma.seguimientoCliente.findMany({
          where: {
            proveedorId,
            fechaProgramada: { gte: from, lte: toEnd },
            estado: { not: EstadoSeguimientoCliente.CANCELADO },
          },
          include: { clienteProveedor: true },
        }),
        this.prisma.ordenCobro.findMany({
          where: {
            proveedorId,
            estado: {
              notIn: [EstadoOrdenCobro.PAGADO, EstadoOrdenCobro.CANCELADO],
            },
            OR: [
              { fechaVencimiento: { gte: from, lte: toEnd } },
              { pagadoEn: { gte: from, lte: toEnd } },
            ],
          },
          include: { clienteProveedor: true },
        }),
        this.prisma.ordenCobro.findMany({
          where: {
            proveedorId,
            estado: { in: [EstadoOrdenCobro.PENDIENTE, EstadoOrdenCobro.VENCIDO] },
          },
          include: { clienteProveedor: true },
        }),
      ]);

    const items: Array<{
      id: string;
      tipo:
        | 'EVENTO'
        | 'ENTREGA'
        | 'RECOGER'
        | 'SEGUIMIENTO'
        | 'COBRO'
        | 'PAGO_PENDIENTE';
      titulo: string;
      fecha: string;
      clienteId: string;
      clienteNombre: string;
      estado: string;
      lugar?: string | null;
      subtipo?: string;
      monto?: number;
      enlace?: string;
    }> = [];

    const inRange = (d: Date) => fechaEventoEnRango(d, from, toEnd);

    for (const e of eventos) {
      if (inRange(e.fechaEvento)) {
        items.push({
          id: e.id,
          tipo: 'EVENTO',
          titulo: e.titulo,
          fecha: e.fechaEvento.toISOString(),
          clienteId: e.clienteProveedorId,
          clienteNombre: e.clienteProveedor.nombre,
          estado: e.estado,
          lugar: e.lugar,
          enlace: `/proveedor/clientes/${e.clienteProveedorId}`,
        });
      }
      const entregaFecha = e.fechaEntrega ?? e.fechaEvento;
      if (
        inRange(entregaFecha) &&
        [EstadoEventoProveedor.CONFIRMADO, EstadoEventoProveedor.EN_EJECUCION].includes(
          e.estado as 'CONFIRMADO' | 'EN_EJECUCION',
        )
      ) {
        items.push({
          id: `${e.id}-entrega`,
          tipo: 'ENTREGA',
          titulo: `Entrega: ${e.titulo}`,
          fecha: entregaFecha.toISOString(),
          clienteId: e.clienteProveedorId,
          clienteNombre: e.clienteProveedor.nombre,
          estado: e.estado,
          lugar: e.lugar,
          enlace: `/proveedor/clientes/${e.clienteProveedorId}`,
        });
      }
      const recogidaFecha = e.fechaRecogida ?? e.fechaFin;
      if (recogidaFecha && inRange(recogidaFecha)) {
        items.push({
          id: `${e.id}-recogida`,
          tipo: 'RECOGER',
          titulo: `Recoger: ${e.titulo}`,
          fecha: recogidaFecha.toISOString(),
          clienteId: e.clienteProveedorId,
          clienteNombre: e.clienteProveedor.nombre,
          estado: e.estado,
          lugar: e.lugar,
          enlace: `/proveedor/clientes/${e.clienteProveedorId}`,
        });
      }
    }

    for (const c of cotizaciones) {
      if (!c.fechaEvento || !inRange(c.fechaEvento)) continue;
      items.push({
        id: `${c.id}-entrega-cot`,
        tipo: 'ENTREGA',
        titulo: `Entrega: ${c.titulo ?? c.folio}`,
        fecha: c.fechaEvento.toISOString(),
        clienteId: c.clienteProveedorId,
        clienteNombre: c.clienteProveedor.nombre,
        estado: c.estado,
        lugar: c.lugarEntrega,
        enlace: `/proveedor/cotizaciones/${c.id}`,
      });
    }

    for (const s of seguimientos) {
      items.push({
        id: s.id,
        tipo: 'SEGUIMIENTO',
        titulo: s.titulo,
        fecha: s.fechaProgramada.toISOString(),
        clienteId: s.clienteProveedorId,
        clienteNombre: s.clienteProveedor.nombre,
        estado: s.estado,
        subtipo: s.tipo,
        enlace: `/proveedor/clientes/${s.clienteProveedorId}`,
      });
    }

    for (const c of cobros) {
      const fecha = c.fechaVencimiento ?? c.pagadoEn ?? c.createdAt;
      if (!inRange(fecha)) continue;
      items.push({
        id: c.id,
        tipo: 'COBRO',
        titulo: c.concepto,
        fecha: fecha.toISOString(),
        clienteId: c.clienteProveedorId,
        clienteNombre: c.clienteProveedor.nombre,
        estado: c.estado,
        monto: toNumber(c.monto),
        enlace: '/proveedor/cobros',
      });
    }

    for (const c of pagosPendientes) {
      const fecha = c.fechaVencimiento ?? c.createdAt;
      if (!inRange(fecha)) continue;
      items.push({
        id: `${c.id}-pendiente`,
        tipo: 'PAGO_PENDIENTE',
        titulo: c.concepto,
        fecha: fecha.toISOString(),
        clienteId: c.clienteProveedorId,
        clienteNombre: c.clienteProveedor.nombre,
        estado: c.estado,
        monto: toNumber(c.monto),
        enlace: '/proveedor/cobros',
      });
    }

    items.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return { desde, hasta, items };
  }

  async getAgenda(user: AuthUser, fecha: string) {
    const proveedorId = requireProveedorUser(user);
    const day = fecha.slice(0, 10);
    const { inicio, fin } = rangoConsultaUTC(day);
    const hoyKey = new Date().toISOString().slice(0, 10);
    const esHoy = day === hoyKey;

    const [eventos, cotizaciones, seguimientos, cobrosDelDia, pagosPendientes] =
      await Promise.all([
        this.prisma.eventoClienteProveedor.findMany({
          where: {
            proveedorId,
            estado: { not: EstadoEventoProveedor.CANCELADO },
            OR: [
              { fechaEvento: { gte: inicio, lte: fin } },
              { fechaEntrega: { gte: inicio, lte: fin } },
              { fechaRecogida: { gte: inicio, lte: fin } },
              { fechaFin: { gte: inicio, lte: fin } },
            ],
          },
          include: { clienteProveedor: true },
          orderBy: { fechaEvento: 'asc' },
        }),
        this.prisma.cotizacionProveedor.findMany({
          where: {
            proveedorId,
            estado: { in: [EstadoCotizacion.APROBADA, EstadoCotizacion.ENVIADA] },
            fechaEvento: { gte: inicio, lte: fin },
          },
          include: { clienteProveedor: true },
        }),
        this.prisma.seguimientoCliente.findMany({
          where: {
            proveedorId,
            fechaProgramada: { gte: inicio, lte: fin },
            estado: EstadoSeguimientoCliente.PENDIENTE,
          },
          include: { clienteProveedor: true },
          orderBy: { fechaProgramada: 'asc' },
        }),
        this.prisma.ordenCobro.findMany({
          where: {
            proveedorId,
            fechaVencimiento: { gte: inicio, lte: fin },
            estado: {
              notIn: [EstadoOrdenCobro.PAGADO, EstadoOrdenCobro.CANCELADO],
            },
          },
          include: { clienteProveedor: true },
          orderBy: { fechaVencimiento: 'asc' },
        }),
        this.prisma.ordenCobro.findMany({
          where: {
            proveedorId,
            estado: { in: [EstadoOrdenCobro.PENDIENTE, EstadoOrdenCobro.VENCIDO] },
          },
          include: { clienteProveedor: true },
          orderBy: [{ fechaVencimiento: 'asc' }, { createdAt: 'asc' }],
        }),
      ]);

    const enDia = (d: Date) => fechaEventoEnRango(d, inicio, fin);

    type AgendaItem = {
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

    const entregas: AgendaItem[] = [];
    const recogidas: AgendaItem[] = [];
    const eventosDia: AgendaItem[] = [];

    for (const e of eventos) {
      if (enDia(e.fechaEvento)) {
        eventosDia.push({
          id: e.id,
          titulo: e.titulo,
          fecha: e.fechaEvento.toISOString(),
          clienteId: e.clienteProveedorId,
          clienteNombre: e.clienteProveedor.nombre,
          estado: e.estado,
          lugar: e.lugar,
          enlace: `/proveedor/clientes/${e.clienteProveedorId}`,
        });
      }

      const entregaFecha = e.fechaEntrega ?? null;
      const usarEntregaEvento =
        !entregaFecha &&
        enDia(e.fechaEvento) &&
        [EstadoEventoProveedor.CONFIRMADO, EstadoEventoProveedor.EN_EJECUCION].includes(
          e.estado as 'CONFIRMADO' | 'EN_EJECUCION',
        );
      const fechaEnt = entregaFecha ?? (usarEntregaEvento ? e.fechaEvento : null);

      if (
        fechaEnt &&
        enDia(fechaEnt) &&
        [EstadoEventoProveedor.CONFIRMADO, EstadoEventoProveedor.EN_EJECUCION].includes(
          e.estado as 'CONFIRMADO' | 'EN_EJECUCION',
        )
      ) {
        entregas.push({
          id: `${e.id}-entrega`,
          titulo: e.titulo,
          fecha: fechaEnt.toISOString(),
          clienteId: e.clienteProveedorId,
          clienteNombre: e.clienteProveedor.nombre,
          estado: e.estado,
          lugar: e.lugar,
          enlace: `/proveedor/clientes/${e.clienteProveedorId}`,
        });
      }

      const recogidaFecha = e.fechaRecogida ?? e.fechaFin;
      if (
        recogidaFecha &&
        enDia(recogidaFecha) &&
        e.estado !== EstadoEventoProveedor.COTIZACION
      ) {
        recogidas.push({
          id: `${e.id}-recogida`,
          titulo: e.titulo,
          fecha: recogidaFecha.toISOString(),
          clienteId: e.clienteProveedorId,
          clienteNombre: e.clienteProveedor.nombre,
          estado: e.estado,
          lugar: e.lugar,
          enlace: `/proveedor/clientes/${e.clienteProveedorId}`,
        });
      }
    }

    for (const c of cotizaciones) {
      if (!c.fechaEvento || !enDia(c.fechaEvento)) continue;
      entregas.push({
        id: `${c.id}-entrega-cot`,
        titulo: c.titulo ?? c.folio,
        fecha: c.fechaEvento.toISOString(),
        clienteId: c.clienteProveedorId,
        clienteNombre: c.clienteProveedor.nombre,
        estado: c.estado,
        lugar: c.lugarEntrega,
        enlace: `/proveedor/cotizaciones/${c.id}`,
      });
    }

    const seguimientosDia: AgendaItem[] = seguimientos.map((s) => ({
      id: s.id,
      titulo: s.titulo,
      fecha: s.fechaProgramada.toISOString(),
      clienteId: s.clienteProveedorId,
      clienteNombre: s.clienteProveedor.nombre,
      estado: s.estado,
      subtipo: s.tipo,
      enlace: `/proveedor/clientes/${s.clienteProveedorId}`,
    }));

    const cobros: AgendaItem[] = cobrosDelDia.map((c) => ({
      id: c.id,
      titulo: c.concepto,
      fecha: (c.fechaVencimiento ?? c.createdAt).toISOString(),
      clienteId: c.clienteProveedorId,
      clienteNombre: c.clienteProveedor.nombre,
      estado: c.estado,
      monto: toNumber(c.monto),
      enlace: '/proveedor/cobros',
      vencido: c.estado === EstadoOrdenCobro.VENCIDO,
    }));

    const pagosPend: AgendaItem[] = pagosPendientes.map((c) => {
      const vence = c.fechaVencimiento;
      const vencido =
        c.estado === EstadoOrdenCobro.VENCIDO ||
        (vence != null && vence < inicio && c.estado === EstadoOrdenCobro.PENDIENTE);
      return {
        id: c.id,
        titulo: c.concepto,
        fecha: (vence ?? c.createdAt).toISOString(),
        clienteId: c.clienteProveedorId,
        clienteNombre: c.clienteProveedor.nombre,
        estado: c.estado,
        monto: toNumber(c.monto),
        enlace: '/proveedor/cobros',
        vencido,
      };
    });

    return {
      fecha: day,
      esHoy,
      resumen: {
        entregas: entregas.length,
        recogidas: recogidas.length,
        eventos: eventosDia.length,
        cobros: cobros.length,
        seguimientos: seguimientosDia.length,
        pagosPendientes: pagosPend.length,
      },
      secciones: {
        entregas,
        recogidas,
        eventos: eventosDia,
        cobros,
        seguimientos: seguimientosDia,
        pagosPendientes: pagosPend,
      },
    };
  }

  async listEventos(user: AuthUser, clienteProveedorId?: string) {
    const proveedorId = requireProveedorUser(user);
    const rows = await this.prisma.eventoClienteProveedor.findMany({
      where: {
        proveedorId,
        ...(clienteProveedorId ? { clienteProveedorId } : {}),
      },
      include: { clienteProveedor: true },
      orderBy: { fechaEvento: 'desc' },
    });
    return rows.map((e) => this.mapEvento(e));
  }

  async createEvento(user: AuthUser, dto: CreateEventoClienteDto) {
    const proveedorId = requireProveedorUser(user);
    await this.ensureCliente(proveedorId, dto.clienteProveedorId);
    const row = await this.prisma.eventoClienteProveedor.create({
      data: {
        proveedorId,
        clienteProveedorId: dto.clienteProveedorId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaEvento: parseFechaEventoDia(dto.fechaEvento),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
        fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
        fechaRecogida: dto.fechaRecogida ? new Date(dto.fechaRecogida) : undefined,
        lugar: dto.lugar,
        estado: dto.estado,
        montoEstimado: dto.montoEstimado,
        notas: dto.notas,
      },
      include: { clienteProveedor: true },
    });
    return this.mapEvento(row);
  }

  async updateEvento(user: AuthUser, id: string, dto: UpdateEventoClienteDto) {
    const proveedorId = requireProveedorUser(user);
    await this.ensureEvento(proveedorId, id);
    const row = await this.prisma.eventoClienteProveedor.update({
      where: { id },
      data: {
        ...dto,
        fechaEvento: dto.fechaEvento ? parseFechaEventoDia(dto.fechaEvento) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
        fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
        fechaRecogida: dto.fechaRecogida ? new Date(dto.fechaRecogida) : undefined,
      },
      include: { clienteProveedor: true },
    });
    return this.mapEvento(row);
  }

  async listSeguimientos(user: AuthUser, clienteProveedorId?: string, soloPendientes?: boolean) {
    const proveedorId = requireProveedorUser(user);
    return this.prisma.seguimientoCliente.findMany({
      where: {
        proveedorId,
        ...(clienteProveedorId ? { clienteProveedorId } : {}),
        ...(soloPendientes ? { estado: 'PENDIENTE' } : {}),
      },
      include: { clienteProveedor: true },
      orderBy: { fechaProgramada: 'asc' },
    });
  }

  async createSeguimiento(user: AuthUser, dto: CreateSeguimientoDto) {
    const proveedorId = requireProveedorUser(user);
    await this.ensureCliente(proveedorId, dto.clienteProveedorId);
    return this.prisma.seguimientoCliente.create({
      data: {
        proveedorId,
        clienteProveedorId: dto.clienteProveedorId,
        tipo: dto.tipo,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaProgramada: new Date(dto.fechaProgramada),
      },
      include: { clienteProveedor: true },
    });
  }

  async updateSeguimiento(user: AuthUser, id: string, dto: UpdateSeguimientoDto) {
    const proveedorId = requireProveedorUser(user);
    const existing = await this.ensureSeguimiento(proveedorId, id);
    const completadoEn =
      dto.estado === EstadoSeguimientoCliente.COMPLETADO &&
      existing.estado !== EstadoSeguimientoCliente.COMPLETADO
        ? new Date()
        : dto.estado && dto.estado !== EstadoSeguimientoCliente.COMPLETADO
          ? null
          : existing.completadoEn;

    return this.prisma.seguimientoCliente.update({
      where: { id },
      data: {
        ...dto,
        fechaProgramada: dto.fechaProgramada ? new Date(dto.fechaProgramada) : undefined,
        completadoEn,
      },
      include: { clienteProveedor: true },
    });
  }

  async completarSeguimiento(user: AuthUser, id: string) {
    return this.updateSeguimiento(user, id, { estado: EstadoSeguimientoCliente.COMPLETADO });
  }

  async getPerfilEmpresa(user: AuthUser) {
    const proveedorId = requireProveedorUser(user);
    return this.buildPerfilEmpresaResponse(proveedorId);
  }

  async updatePerfilEmpresa(user: AuthUser, dto: UpdatePerfilEmpresaDto) {
    const proveedorId = requireProveedorUser(user);

    const {
      horario,
      redesSociales,
      logoUrl,
      regimenFiscal,
      codigoPostal,
      politicasRenta,
      condicionesCancelacion,
      ivaIncluido,
      moneda,
      nombre,
      razonSocial,
      rfc,
      email,
      telefono,
      contacto,
      direccion,
      ciudad,
      entidadFederativa,
    } = dto;

    await this.prisma.proveedor.update({
      where: { id: proveedorId },
      data: {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(razonSocial !== undefined ? { razonSocial } : {}),
        ...(rfc !== undefined ? { rfc } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(telefono !== undefined ? { telefono } : {}),
        ...(contacto !== undefined ? { contacto } : {}),
        ...(direccion !== undefined ? { direccion } : {}),
        ...(ciudad !== undefined ? { ciudad } : {}),
        ...(entidadFederativa !== undefined ? { entidadFederativa } : {}),
      },
    });

    await this.prisma.perfilEmpresaProveedor.upsert({
      where: { proveedorId },
      create: {
        proveedorId,
        logoUrl,
        regimenFiscal,
        codigoPostal,
        horario: (horario ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
        redesSociales: (redesSociales ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
        politicasRenta,
        condicionesCancelacion,
        ivaIncluido: ivaIncluido ?? false,
        moneda: moneda ?? 'MXN',
      },
      update: {
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(regimenFiscal !== undefined ? { regimenFiscal } : {}),
        ...(codigoPostal !== undefined ? { codigoPostal } : {}),
        ...(horario !== undefined ? { horario: horario as unknown as Prisma.InputJsonValue } : {}),
        ...(redesSociales !== undefined ? { redesSociales: redesSociales as unknown as Prisma.InputJsonValue } : {}),
        ...(politicasRenta !== undefined ? { politicasRenta } : {}),
        ...(condicionesCancelacion !== undefined ? { condicionesCancelacion } : {}),
        ...(ivaIncluido !== undefined ? { ivaIncluido } : {}),
        ...(moneda !== undefined ? { moneda } : {}),
      },
    });

    return this.buildPerfilEmpresaResponse(proveedorId);
  }

  async buildPerfilEmpresaResponse(proveedorId: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: proveedorId },
      include: { perfilEmpresa: true },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

    const perfil = proveedor.perfilEmpresa;
    const horarioDefault = {
      dias: DIAS_DEFAULT.map((dia) => ({
        dia,
        abre: '09:00',
        cierra: '18:00',
        cerrado: dia === 'Domingo',
      })),
    };

    const horario =
      perfil?.horario && typeof perfil.horario === 'object'
        ? perfil.horario
        : horarioDefault;

    const redesSociales =
      perfil?.redesSociales && typeof perfil.redesSociales === 'object'
        ? perfil.redesSociales
        : {
            facebook: '',
            instagram: '',
            whatsapp: proveedor.telefono ?? '',
            tiktok: '',
            linkedin: '',
            sitioWeb: proveedor.sitioWeb ?? '',
          };

    const completitud = this.calcCompletitudEmpresa(proveedor, perfil);

    return {
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        razonSocial: proveedor.razonSocial,
        rfc: proveedor.rfc,
        email: proveedor.email,
        telefono: proveedor.telefono,
        contacto: proveedor.contacto,
        direccion: proveedor.direccion,
        ciudad: proveedor.ciudad,
        entidadFederativa: proveedor.entidadFederativa,
        sitioWeb: proveedor.sitioWeb,
      },
      perfil: {
        logoUrl: perfil?.logoUrl ?? null,
        regimenFiscal: perfil?.regimenFiscal ?? null,
        codigoPostal: perfil?.codigoPostal ?? null,
        horario,
        redesSociales,
        politicasRenta: perfil?.politicasRenta ?? null,
        condicionesCancelacion: perfil?.condicionesCancelacion ?? null,
        ivaIncluido: perfil?.ivaIncluido ?? false,
        moneda: perfil?.moneda ?? 'MXN',
        updatedAt: perfil?.updatedAt ?? null,
      },
      completitudPerfilEmpresa: completitud,
    };
  }

  private calcCompletitudEmpresa(
    proveedor: {
      nombre: string;
      razonSocial: string | null;
      rfc: string | null;
      email: string | null;
      telefono: string | null;
      direccion: string | null;
      ciudad: string | null;
      entidadFederativa: string | null;
    },
    perfil: {
      logoUrl: string | null;
      regimenFiscal: string | null;
      codigoPostal: string | null;
      politicasRenta: string | null;
      condicionesCancelacion: string | null;
      moneda: string;
      horario: unknown;
      redesSociales: unknown;
    } | null,
  ) {
    const redes = (perfil?.redesSociales ?? {}) as Record<string, string>;
    const checks = [
      !!proveedor.razonSocial,
      !!proveedor.rfc,
      !!proveedor.email,
      !!proveedor.telefono,
      !!proveedor.direccion && !!proveedor.ciudad && !!proveedor.entidadFederativa,
      !!perfil?.logoUrl,
      !!perfil?.regimenFiscal,
      !!perfil?.codigoPostal,
      !!perfil?.politicasRenta,
      !!perfil?.condicionesCancelacion,
      !!perfil?.moneda,
      !!(redes.instagram || redes.facebook || redes.whatsapp),
      !!perfil?.horario,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  private async nextFolio(proveedorId: string) {
    const count = await this.prisma.ordenCobro.count({ where: { proveedorId } });
    return this.buildCobroFolio(count);
  }

  private buildCobroFolio(existingCount: number) {
    const seq = String(existingCount + 1).padStart(4, '0');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `COB-${date}-${seq}`;
  }

  private async createCobroDesdeCotizacion(
    db: Pick<PrismaService, 'ordenCobro'>,
    proveedorId: string,
    input: {
      clienteProveedorId: string;
      folioCotizacion: string;
      titulo: string;
      total: number;
      validoHasta?: Date | null;
    },
  ) {
    const count = await db.ordenCobro.count({ where: { proveedorId } });
    return db.ordenCobro.create({
      data: {
        proveedorId,
        clienteProveedorId: input.clienteProveedorId,
        folio: this.buildCobroFolio(count),
        concepto: input.titulo,
        monto: input.total,
        fechaVencimiento: input.validoHasta ?? undefined,
        notas: `Generado desde cotización ${input.folioCotizacion}`,
        estado: EstadoOrdenCobro.BORRADOR,
      },
    });
  }

  private async ensureCliente(proveedorId: string, id: string) {
    const row = await this.prisma.clienteProveedor.findFirst({
      where: { id, proveedorId },
    });
    if (!row) throw new NotFoundException('Cliente no encontrado');
    return row;
  }

  private async ensureCobro(proveedorId: string, id: string) {
    const row = await this.prisma.ordenCobro.findFirst({
      where: { id, proveedorId },
    });
    if (!row) throw new NotFoundException('Orden de cobro no encontrada');
    return row;
  }

  private async ensureEvento(proveedorId: string, id: string) {
    const row = await this.prisma.eventoClienteProveedor.findFirst({
      where: { id, proveedorId },
    });
    if (!row) throw new NotFoundException('Evento no encontrado');
    return row;
  }

  private async ensureSeguimiento(proveedorId: string, id: string) {
    const row = await this.prisma.seguimientoCliente.findFirst({
      where: { id, proveedorId },
    });
    if (!row) throw new NotFoundException('Seguimiento no encontrado');
    return row;
  }

  private mapEvento<T extends { montoEstimado: unknown }>(row: T) {
    return {
      ...row,
      montoEstimado:
        row.montoEstimado != null ? toNumber(row.montoEstimado as never) : null,
    };
  }

  private mapOrden<T extends { monto: unknown; clienteProveedor: { nombre: string } }>(row: T) {
    return {
      ...row,
      monto: toNumber(row.monto as never),
    };
  }

  private calcCompletitud(proveedor: {
    razonSocial: string | null;
    email: string | null;
    telefono: string | null;
    ciudad: string | null;
    entidadFederativa: string | null;
    direccion: string | null;
    eventosSimultaneosMax: number | null;
    radioCoberturaKm: number | null;
    productos: { fotos: unknown[] }[];
    coberturas: unknown[];
    servicios: unknown[];
  }) {
    const checks = [
      !!proveedor.razonSocial,
      !!proveedor.email,
      !!proveedor.telefono,
      !!proveedor.ciudad && !!proveedor.entidadFederativa,
      !!proveedor.direccion,
      proveedor.productos.length > 0,
      proveedor.productos.some((p) => p.fotos.length > 0),
      proveedor.coberturas.length > 0,
      proveedor.servicios.length > 0,
      proveedor.eventosSimultaneosMax != null || proveedor.radioCoberturaKm != null,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  async listCotizaciones(user: AuthUser, clienteId?: string, estado?: EstadoCotizacion) {
    const proveedorId = requireProveedorUser(user);
    const rows = await this.prisma.cotizacionProveedor.findMany({
      where: {
        proveedorId,
        ...(clienteId ? { clienteProveedorId: clienteId } : {}),
        ...(estado ? { estado } : {}),
      },
      include: {
        clienteProveedor: true,
        items: { include: COTIZACION_ITEMS_INCLUDE },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapCotizacion(r));
  }

  async getCotizacion(user: AuthUser, id: string) {
    const proveedorId = requireProveedorUser(user);
    const row = await this.prisma.cotizacionProveedor.findFirst({
      where: { id, proveedorId },
      include: {
        clienteProveedor: true,
        items: {
          include: COTIZACION_ITEMS_INCLUDE,
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!row) throw new NotFoundException('Cotización no encontrada');
    return this.mapCotizacion(row);
  }

  async createCotizacion(user: AuthUser, dto: CreateCotizacionProveedorDto) {
    const proveedorId = requireProveedorUser(user);
    const hasExistingCliente = Boolean(dto.clienteProveedorId?.trim());
    const hasNewCliente = Boolean(dto.cliente);

    if (hasExistingCliente === hasNewCliente) {
      throw new BadRequestException(
        hasExistingCliente && hasNewCliente
          ? 'Indica un cliente existente o datos de uno nuevo, no ambos'
          : 'Selecciona un cliente o registra uno nuevo',
      );
    }

    if (!dto.items?.length) {
      throw new BadRequestException('Agrega al menos un concepto a la cotización');
    }

    const perfil = await this.prisma.perfilEmpresaProveedor.findUnique({
      where: { proveedorId },
    });
    const ivaIncluido = dto.ivaIncluido ?? perfil?.ivaIncluido ?? false;
    const ivaPorcentaje = dto.ivaPorcentaje ?? 16;
    const costoEnvio = dto.costoEnvio ?? 0;
    const descuentoPorcentaje = dto.descuentoPorcentaje ?? 0;

    const itemsData = await this.resolveCotizacionItems(proveedorId, dto.items);
    const totales = calcTotalesCotizacionProveedor(
      itemsData,
      costoEnvio,
      descuentoPorcentaje,
      ivaPorcentaje,
      ivaIncluido,
    );

    const folio = await this.nextCotizacionFolio(proveedorId);
    const estadoFinal = dto.estado ?? EstadoCotizacion.BORRADOR;
    const fechaEventoParsed = dto.fechaEvento ? parseFechaEventoDia(dto.fechaEvento) : null;
    await this.validarInventarioCotizacion(
      proveedorId,
      itemsData,
      fechaEventoParsed,
      estadoFinal,
    );

    const cotizacionData = {
      proveedorId,
      folio,
      estado: estadoFinal,
      fechaEvento: fechaEventoParsed ?? undefined,
      lugarEntrega: dto.lugarEntrega,
      costoEnvio,
      descuentoPorcentaje,
      descuentoMonto: totales.descuentoMonto,
      ivaPorcentaje,
      ivaIncluido,
      subtotal: totales.subtotal,
      montoIva: totales.montoIva,
      total: totales.total,
      notas: dto.notas,
      validoHasta: dto.validoHasta ? new Date(dto.validoHasta) : undefined,
      items: {
        create: itemsData.map(mapCotizacionItemCreate),
      },
    };

    if (dto.cliente) {
      const created = await this.prisma.$transaction(async (tx) => {
        const nuevoCliente = await tx.clienteProveedor.create({
          data: {
            proveedorId,
            nombre: dto.cliente!.nombre.trim(),
            empresa: dto.cliente!.empresa?.trim() || undefined,
            email: dto.cliente!.email?.trim() || undefined,
            telefono: dto.cliente!.telefono?.trim() || undefined,
            notas: dto.cliente!.notas?.trim() || undefined,
          },
        });
        const titulo =
          dto.titulo?.trim() ||
          `Cotización — ${nuevoCliente.nombre}${dto.fechaEvento ? ` (${dto.fechaEvento.slice(0, 10)})` : ''}`;

        return tx.cotizacionProveedor.create({
          data: {
            ...cotizacionData,
            clienteProveedorId: nuevoCliente.id,
            titulo,
          },
          include: {
            clienteProveedor: true,
            items: { include: COTIZACION_ITEMS_INCLUDE },
          },
        });
      });

      const cobro = await this.createCobroDesdeCotizacion(this.prisma, proveedorId, {
        clienteProveedorId: created.clienteProveedorId,
        folioCotizacion: created.folio,
        titulo: created.titulo ?? created.folio,
        total: totales.total,
        validoHasta: created.validoHasta,
      });

      return { ...this.mapCotizacion(created), ordenCobroId: cobro.id };
    }

    const cliente = await this.ensureCliente(proveedorId, dto.clienteProveedorId!);
    const titulo =
      dto.titulo?.trim() ||
      `Cotización — ${cliente.nombre}${dto.fechaEvento ? ` (${dto.fechaEvento.slice(0, 10)})` : ''}`;

    const created = await this.prisma.cotizacionProveedor.create({
      data: {
        ...cotizacionData,
        clienteProveedorId: dto.clienteProveedorId!,
        titulo,
      },
      include: {
        clienteProveedor: true,
        items: { include: COTIZACION_ITEMS_INCLUDE },
      },
    });

    const cobro = await this.createCobroDesdeCotizacion(this.prisma, proveedorId, {
      clienteProveedorId: created.clienteProveedorId,
      folioCotizacion: created.folio,
      titulo: created.titulo ?? titulo,
      total: totales.total,
      validoHasta: created.validoHasta,
    });

    return { ...this.mapCotizacion(created), ordenCobroId: cobro.id };
  }

  async updateCotizacion(user: AuthUser, id: string, dto: UpdateCotizacionProveedorDto) {
    const proveedorId = requireProveedorUser(user);
    const existing = await this.ensureCotizacion(proveedorId, id);

    const costoEnvio = dto.costoEnvio ?? toNumber(existing.costoEnvio);
    const descuentoPorcentaje =
      dto.descuentoPorcentaje ?? toNumber(existing.descuentoPorcentaje);
    const ivaPorcentaje = dto.ivaPorcentaje ?? toNumber(existing.ivaPorcentaje);
    const ivaIncluido = dto.ivaIncluido ?? existing.ivaIncluido;

    let itemsData: Array<{
      productoProveedorId?: string;
      menuBanqueteProveedorId?: string;
      servicioProveedorId?: string;
      modalidadPrecioMenu?: 'POR_PERSONA' | 'POR_EVENTO';
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;

    if (dto.items) {
      if (!dto.items.length) {
        throw new BadRequestException('La cotización debe tener al menos un concepto');
      }
      itemsData = await this.resolveCotizacionItems(proveedorId, dto.items);
      await this.prisma.cotizacionProveedorItem.deleteMany({
        where: { cotizacionProveedorId: id },
      });
    } else {
      const currentItems = await this.prisma.cotizacionProveedorItem.findMany({
        where: { cotizacionProveedorId: id },
      });
      itemsData = currentItems.map((i) => ({
        productoProveedorId: i.productoProveedorId ?? undefined,
        menuBanqueteProveedorId: i.menuBanqueteProveedorId ?? undefined,
        servicioProveedorId: i.servicioProveedorId ?? undefined,
        modalidadPrecioMenu: i.modalidadPrecioMenu ?? undefined,
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        precioUnitario: toNumber(i.precioUnitario),
        subtotal: toNumber(i.subtotal),
      }));
    }

    const totales = calcTotalesCotizacionProveedor(
      itemsData,
      costoEnvio,
      descuentoPorcentaje,
      ivaPorcentaje,
      ivaIncluido,
    );

    const estadoFinal = dto.estado ?? existing.estado;
    const fechaFinal =
      dto.fechaEvento !== undefined
        ? dto.fechaEvento
          ? parseFechaEventoDia(dto.fechaEvento)
          : null
        : existing.fechaEvento;

    await this.validarInventarioCotizacion(
      proveedorId,
      itemsData,
      fechaFinal,
      estadoFinal,
      id,
    );

    const updated = await this.prisma.cotizacionProveedor.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
        ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
        ...(dto.fechaEvento !== undefined
          ? { fechaEvento: dto.fechaEvento ? parseFechaEventoDia(dto.fechaEvento) : null }
          : {}),
        ...(dto.lugarEntrega !== undefined ? { lugarEntrega: dto.lugarEntrega } : {}),
        ...(dto.costoEnvio !== undefined ? { costoEnvio } : {}),
        ...(dto.descuentoPorcentaje !== undefined ? { descuentoPorcentaje } : {}),
        ...(dto.ivaPorcentaje !== undefined ? { ivaPorcentaje } : {}),
        ...(dto.ivaIncluido !== undefined ? { ivaIncluido } : {}),
        ...(dto.notas !== undefined ? { notas: dto.notas } : {}),
        ...(dto.validoHasta !== undefined
          ? { validoHasta: dto.validoHasta ? new Date(dto.validoHasta) : null }
          : {}),
        descuentoMonto: totales.descuentoMonto,
        subtotal: totales.subtotal,
        montoIva: totales.montoIva,
        total: totales.total,
        ...(dto.items
          ? {
              items: {
                create: itemsData.map(mapCotizacionItemCreate),
              },
            }
          : {}),
      },
      include: {
        clienteProveedor: true,
        items: { include: COTIZACION_ITEMS_INCLUDE },
      },
    });

    return this.mapCotizacion(updated);
  }

  async generarPdfCotizacion(user: AuthUser, id: string) {
    const proveedorId = requireProveedorUser(user);
    const cotizacion = await this.prisma.cotizacionProveedor.findFirst({
      where: { id, proveedorId },
      include: {
        clienteProveedor: true,
        items: {
          orderBy: { id: 'asc' },
          include: {
            productoProveedor: {
              include: { fotos: { orderBy: { orden: 'asc' } } },
            },
            menuBanquete: {
              include: { platillos: { orderBy: { orden: 'asc' } } },
            },
            servicioProveedor: { select: { id: true, nombre: true } },
          },
        },
        proveedor: { include: { perfilEmpresa: true } },
      },
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');

    const moneda = cotizacion.proveedor.perfilEmpresa?.moneda ?? 'MXN';
    const html = buildCotizacionProveedorHtml({
      folio: cotizacion.folio,
      titulo: cotizacion.titulo,
      fechaEvento: cotizacion.fechaEvento,
      lugarEntrega: cotizacion.lugarEntrega,
      validoHasta: cotizacion.validoHasta,
      notas: cotizacion.notas,
      moneda,
      ivaIncluido: cotizacion.ivaIncluido,
      ivaPorcentaje: toNumber(cotizacion.ivaPorcentaje),
      costoEnvio: toNumber(cotizacion.costoEnvio),
      descuentoPorcentaje: toNumber(cotizacion.descuentoPorcentaje),
      descuentoMonto: toNumber(cotizacion.descuentoMonto),
      subtotal: toNumber(cotizacion.subtotal),
      montoIva: toNumber(cotizacion.montoIva),
      total: toNumber(cotizacion.total),
      proveedor: {
        nombre: cotizacion.proveedor.nombre,
        contacto: cotizacion.proveedor.contacto,
        email: cotizacion.proveedor.email,
        telefono: cotizacion.proveedor.telefono,
        sitioWeb: cotizacion.proveedor.sitioWeb,
      },
      perfil: cotizacion.proveedor.perfilEmpresa
        ? {
            logoUrl: cotizacion.proveedor.perfilEmpresa.logoUrl,
            politicasRenta: cotizacion.proveedor.perfilEmpresa.politicasRenta,
            condicionesCancelacion: cotizacion.proveedor.perfilEmpresa.condicionesCancelacion,
          }
        : null,
      cliente: cotizacion.clienteProveedor,
      items: cotizacion.items.map((i) => mapCotizacionItemParaPdf(i)),
    });

    return {
      folio: cotizacion.folio,
      titulo: cotizacion.titulo ?? cotizacion.folio,
      html,
    };
  }

  private async validarInventarioCotizacion(
    proveedorId: string,
    items: Array<{ productoProveedorId?: string; cantidad: number }>,
    fechaEvento: Date | null,
    estado: EstadoCotizacion,
    excludeCotizacionId?: string,
  ) {
    if (!fechaEvento) return;
    if (estado === EstadoCotizacion.RECHAZADA) return;

    const day = fechaEvento.toISOString().slice(0, 10);
    const { inicio, fin } = rangoConsultaUTC(day);
    const fechaInicio = inicio.toISOString();
    const fechaFin = fin.toISOString();

    const porProducto = new Map<string, number>();
    for (const item of items) {
      if (!item.productoProveedorId) continue;
      porProducto.set(
        item.productoProveedorId,
        (porProducto.get(item.productoProveedorId) ?? 0) + item.cantidad,
      );
    }

    for (const [productoId, cantidad] of porProducto) {
      await this.catalogoService.validarDisponibilidad(
        proveedorId,
        productoId,
        cantidad,
        fechaInicio,
        fechaFin,
        excludeCotizacionId,
      );
    }
  }

  private async resolveCotizacionItems(
    proveedorId: string,
    items: Array<{
      productoProveedorId?: string;
      menuBanqueteProveedorId?: string;
      servicioProveedorId?: string;
      modalidadPrecioMenu?: 'POR_PERSONA' | 'POR_EVENTO';
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
    }>,
  ) {
    const productIds = items
      .map((i) => i.productoProveedorId)
      .filter((id): id is string => !!id);
    const menuIds = items
      .map((i) => i.menuBanqueteProveedorId)
      .filter((id): id is string => !!id);
    const servicioIds = items
      .map((i) => i.servicioProveedorId)
      .filter((id): id is string => !!id);

    const [productos, menus, servicios] = await Promise.all([
      productIds.length
        ? this.prisma.productoProveedor.findMany({
            where: { proveedorId, id: { in: productIds } },
          })
        : [],
      menuIds.length
        ? this.prisma.menuBanqueteProveedor.findMany({
            where: { proveedorId, id: { in: menuIds } },
          })
        : [],
      servicioIds.length
        ? this.prisma.servicioProveedor.findMany({
            where: { proveedorId, id: { in: servicioIds } },
          })
        : [],
    ]);

    const productoMap = new Map(productos.map((p) => [p.id, p]));
    const menuMap = new Map(
      menus.map((m) => [
        m.id,
        {
          id: m.id,
          nombre: m.nombre,
          precioPorPersona:
            m.precioPorPersona != null ? toNumber(m.precioPorPersona) : null,
          precioPorEvento: m.precioPorEvento != null ? toNumber(m.precioPorEvento) : null,
          minimoPersonas: m.minimoPersonas,
        },
      ]),
    );
    const servicioMap = new Map(servicios.map((s) => [s.id, s]));

    return items.map((item) => {
      const refs = [
        item.productoProveedorId,
        item.menuBanqueteProveedorId,
        item.servicioProveedorId,
      ].filter(Boolean);
      if (refs.length > 1) {
        throw new BadRequestException(
          'Cada línea debe referenciar un solo concepto del catálogo',
        );
      }

      if (item.menuBanqueteProveedorId) {
        const menu = menuMap.get(item.menuBanqueteProveedorId);
        if (!menu) {
          throw new BadRequestException('Menú de banquete no encontrado');
        }
        if (!item.modalidadPrecioMenu) {
          throw new BadRequestException('Indica si el menú se cotiza por persona o por evento');
        }
        const override = item.precioUnitario;
        return this.banqueteService.resolveMenuLine(
          menu,
          item.modalidadPrecioMenu,
          item.cantidad,
          override,
        );
      }

      if (item.servicioProveedorId) {
        const servicio = servicioMap.get(item.servicioProveedorId);
        if (!servicio) {
          throw new BadRequestException('Servicio no encontrado');
        }
        const descripcion = item.descripcion.trim() || servicio.nombre;
        const precioUnitario = roundMoney(
          item.precioUnitario ??
            (servicio.precioReferencia != null ? toNumber(servicio.precioReferencia) : 0),
        );
        if (precioUnitario < 0) {
          throw new BadRequestException('Precio unitario inválido');
        }
        return {
          servicioProveedorId: servicio.id,
          descripcion,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal: calcSubtotal(precioUnitario, item.cantidad),
        };
      }

      const producto = item.productoProveedorId
        ? productoMap.get(item.productoProveedorId)
        : undefined;
      if (item.productoProveedorId && !producto) {
        throw new BadRequestException('Producto del catálogo no encontrado');
      }
      const descripcion = item.descripcion.trim() || producto?.nombre || 'Concepto';
      const precioUnitario = roundMoney(
        item.precioUnitario ?? (producto ? toNumber(producto.precioReferencia) : 0),
      );
      if (precioUnitario < 0) {
        throw new BadRequestException('Precio unitario inválido');
      }
      return {
        productoProveedorId: item.productoProveedorId,
        descripcion,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal: calcSubtotal(precioUnitario, item.cantidad),
      };
    });
  }

  private async nextCotizacionFolio(proveedorId: string) {
    const count = await this.prisma.cotizacionProveedor.count({ where: { proveedorId } });
    const seq = String(count + 1).padStart(4, '0');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `COT-${date}-${seq}`;
  }

  private async ensureCotizacion(proveedorId: string, id: string) {
    const row = await this.prisma.cotizacionProveedor.findFirst({
      where: { id, proveedorId },
    });
    if (!row) throw new NotFoundException('Cotización no encontrada');
    return row;
  }

  private mapCotizacion<
    T extends {
      costoEnvio: unknown;
      descuentoPorcentaje: unknown;
      descuentoMonto: unknown;
      ivaPorcentaje: unknown;
      subtotal: unknown;
      montoIva: unknown;
      total: unknown;
      items?: Array<{
        precioUnitario: unknown;
        subtotal: unknown;
      }>;
    },
  >(row: T) {
    return {
      ...row,
      costoEnvio: toNumber(row.costoEnvio as never),
      descuentoPorcentaje: toNumber(row.descuentoPorcentaje as never),
      descuentoMonto: toNumber(row.descuentoMonto as never),
      ivaPorcentaje: toNumber(row.ivaPorcentaje as never),
      subtotal: toNumber(row.subtotal as never),
      montoIva: toNumber(row.montoIva as never),
      total: toNumber(row.total as never),
      items: row.items?.map((i) => ({
        ...i,
        precioUnitario: toNumber(i.precioUnitario as never),
        subtotal: toNumber(i.subtotal as never),
      })),
    };
  }
}
