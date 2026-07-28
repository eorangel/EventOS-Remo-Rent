import { Injectable } from '@nestjs/common';
import {
  EstadoCotizacion,
  EstadoEvento,
  EstadoMovimientoFinanciero,
  TipoMovimientoFinanciero,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getResumen() {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalClientes,
      totalEventos,
      eventosActivos,
      eventosMes,
      eventosPorEstado,
      proximosEventos,
      productos,
      cotizacionesAprobadas,
      movimientosMes,
      eventosConFinanzas,
    ] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.evento.count(),
      this.prisma.evento.count({
        where: {
          estado: {
            in: [
              EstadoEvento.CONFIRMADO,
              EstadoEvento.EN_LOGISTICA,
              EstadoEvento.EN_EJECUCION,
              EstadoEvento.COTIZACION,
            ],
          },
        },
      }),
      this.prisma.evento.count({
        where: {
          fechaEvento: { gte: inicioMes, lte: finMes },
        },
      }),
      this.prisma.evento.groupBy({
        by: ['estado'],
        _count: { estado: true },
      }),
      this.prisma.evento.findMany({
        where: {
          fechaEvento: { gte: now },
          estado: { not: EstadoEvento.CANCELADO },
        },
        take: 5,
        orderBy: { fechaEvento: 'asc' },
        include: {
          cliente: { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.producto.findMany({ where: { activo: true } }),
      this.prisma.cotizacion.findMany({
        where: { estado: EstadoCotizacion.APROBADA },
        include: { evento: { select: { id: true, titulo: true } } },
      }),
      this.prisma.movimientoFinanciero.findMany({
        where: {
          estado: EstadoMovimientoFinanciero.CONFIRMADO,
          tipo: { in: [TipoMovimientoFinanciero.ANTICIPO, TipoMovimientoFinanciero.PAGO] },
          fecha: { gte: inicioMes },
        },
      }),
      this.prisma.evento.findMany({
        where: { estado: { not: EstadoEvento.CANCELADO } },
        include: {
          cotizaciones: { orderBy: { createdAt: 'desc' }, take: 1 },
          movimientos: {
            where: { estado: EstadoMovimientoFinanciero.CONFIRMADO },
          },
        },
      }),
    ]);

    const ingresosMes = movimientosMes.reduce(
      (s, m) => s + toNumber(m.monto),
      0,
    );

    let cobranzaPendiente = 0;
    let utilidadEstimada = 0;
    const rentabilidadEventos: {
      eventoId: string;
      titulo: string;
      cotizado: number;
      pagado: number;
      utilidadCotizada: number;
    }[] = [];

    for (const evento of eventosConFinanzas) {
      const cot = evento.cotizaciones[0];
      const cotizado = cot ? toNumber(cot.total) : 0;
      const utilidad = cot ? toNumber(cot.utilidad) : 0;
      const ingresos = evento.movimientos
        .filter(
          (m) =>
            m.tipo === TipoMovimientoFinanciero.ANTICIPO ||
            m.tipo === TipoMovimientoFinanciero.PAGO,
        )
        .reduce((s, m) => s + toNumber(m.monto), 0);
      const reembolsos = evento.movimientos
        .filter((m) => m.tipo === TipoMovimientoFinanciero.REEMBOLSO)
        .reduce((s, m) => s + toNumber(m.monto), 0);
      const pagado = ingresos - reembolsos;

      cobranzaPendiente += Math.max(0, cotizado - pagado);
      utilidadEstimada += utilidad;

      if (cotizado > 0) {
        rentabilidadEventos.push({
          eventoId: evento.id,
          titulo: evento.titulo,
          cotizado,
          pagado,
          utilidadCotizada: utilidad,
        });
      }
    }

    rentabilidadEventos.sort((a, b) => b.utilidadCotizada - a.utilidadCotizada);

    const itemsReservados = await this.prisma.cotizacionItem.groupBy({
      by: ['productoId'],
      where: {
        esSubarrendo: false,
        productoId: { not: null },
        cotizacion: {
          estado: { in: [EstadoCotizacion.ENVIADA, EstadoCotizacion.APROBADA] },
        },
      },
      _sum: { cantidad: true },
    });

    const reservadoPorProducto = new Map(
      itemsReservados
        .filter((i) => i.productoId)
        .map((i) => [i.productoId!, i._sum.cantidad ?? 0]),
    );

    let totalUnidades = 0;
    let totalReservadas = 0;
    const ocupacionPorProducto: {
      productoId: string;
      nombre: string;
      reservado: number;
      total: number;
      porcentaje: number;
    }[] = [];

    for (const producto of productos) {
      const reservado = reservadoPorProducto.get(producto.id) ?? 0;
      totalUnidades += producto.cantidadTotal;
      totalReservadas += Math.min(reservado, producto.cantidadTotal);
      if (producto.cantidadTotal > 0) {
        ocupacionPorProducto.push({
          productoId: producto.id,
          nombre: producto.nombre,
          reservado,
          total: producto.cantidadTotal,
          porcentaje: Math.round((reservado / producto.cantidadTotal) * 100),
        });
      }
    }

    ocupacionPorProducto.sort((a, b) => b.porcentaje - a.porcentaje);

    const ocupacionInventario =
      totalUnidades > 0
        ? Math.round((totalReservadas / totalUnidades) * 100)
        : 0;

    return {
      kpis: {
        totalClientes,
        totalEventos,
        eventosActivos,
        eventosMes,
        ingresosMes,
        cobranzaPendiente,
        utilidadEstimada,
        ocupacionInventario,
      },
      eventosPorEstado: eventosPorEstado.map((item) => ({
        estado: item.estado,
        cantidad: item._count.estado,
      })),
      proximosEventos,
      rentabilidadEventos: rentabilidadEventos.slice(0, 5),
      ocupacionPorProducto: ocupacionPorProducto.slice(0, 5),
      cotizacionesAprobadas: cotizacionesAprobadas.length,
    };
  }
}
