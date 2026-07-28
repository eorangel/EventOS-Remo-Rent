import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EstadoCotizacion,
  EstadoMovimientoFinanciero,
  TipoMovimientoFinanciero,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';
import { CreateMovimientoDto, UpdateMovimientoDto } from './dto/finanza.dto';

const movimientoInclude = {
  evento: {
    include: { cliente: { select: { id: true, nombre: true } } },
  },
};

@Injectable()
export class FinanzasService {
  constructor(private prisma: PrismaService) {}

  private mapMovimiento<T extends { monto: unknown }>(row: T) {
    return { ...row, monto: toNumber(row.monto as never) };
  }

  findAll(filters?: { eventoId?: string; tipo?: string; estado?: string }) {
    return this.prisma.movimientoFinanciero
      .findMany({
        where: {
          ...(filters?.eventoId ? { eventoId: filters.eventoId } : {}),
          ...(filters?.tipo ? { tipo: filters.tipo as never } : {}),
          ...(filters?.estado ? { estado: filters.estado as never } : {}),
        },
        include: movimientoInclude,
        orderBy: { fecha: 'desc' },
      })
      .then((rows) => rows.map((r) => this.mapMovimiento(r)));
  }

  async findOne(id: string) {
    const mov = await this.prisma.movimientoFinanciero.findUnique({
      where: { id },
      include: movimientoInclude,
    });
    if (!mov) throw new NotFoundException('Movimiento no encontrado');
    return this.mapMovimiento(mov);
  }

  create(dto: CreateMovimientoDto) {
    return this.prisma.movimientoFinanciero
      .create({
        data: {
          eventoId: dto.eventoId,
          tipo: dto.tipo,
          concepto: dto.concepto,
          monto: dto.monto,
          metodoPago: dto.metodoPago,
          estado: dto.estado,
          referencia: dto.referencia,
          fecha: dto.fecha ? new Date(dto.fecha) : undefined,
          notas: dto.notas,
        },
        include: movimientoInclude,
      })
      .then((r) => this.mapMovimiento(r));
  }

  async update(id: string, dto: UpdateMovimientoDto) {
    await this.findOne(id);
    return this.prisma.movimientoFinanciero
      .update({
        where: { id },
        data: {
          ...dto,
          fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        },
        include: movimientoInclude,
      })
      .then((r) => this.mapMovimiento(r));
  }

  async resumenEvento(eventoId: string) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        cliente: { select: { id: true, nombre: true } },
        cotizaciones: {
          orderBy: { createdAt: 'desc' },
        },
        movimientos: true,
        subarrendos: true,
      },
    });
    if (!evento) throw new NotFoundException('Evento no encontrado');

    const cotizacionRef =
      evento.cotizaciones.find((c) => c.estado === EstadoCotizacion.APROBADA) ??
      evento.cotizaciones[0];

    const totalCotizado = cotizacionRef ? toNumber(cotizacionRef.total) : 0;
    const costoEstimado = cotizacionRef ? toNumber(cotizacionRef.subtotalCosto) : 0;
    const utilidadCotizada = cotizacionRef ? toNumber(cotizacionRef.utilidad) : 0;

    const confirmados = evento.movimientos.filter(
      (m) => m.estado === EstadoMovimientoFinanciero.CONFIRMADO,
    );

    const totalIngresos = confirmados
      .filter(
        (m) =>
          m.tipo === TipoMovimientoFinanciero.ANTICIPO ||
          m.tipo === TipoMovimientoFinanciero.PAGO,
      )
      .reduce((sum, m) => sum + toNumber(m.monto), 0);

    const totalReembolsos = confirmados
      .filter((m) => m.tipo === TipoMovimientoFinanciero.REEMBOLSO)
      .reduce((sum, m) => sum + toNumber(m.monto), 0);

    const totalGastos = confirmados
      .filter((m) => m.tipo === TipoMovimientoFinanciero.GASTO)
      .reduce((sum, m) => sum + toNumber(m.monto), 0);

    const totalPagado = totalIngresos - totalReembolsos;
    const saldoPendiente = Math.max(0, totalCotizado - totalPagado);
    const costoReal = costoEstimado + totalGastos;
    const utilidadReal = totalPagado - costoReal;

    return {
      evento: {
        id: evento.id,
        titulo: evento.titulo,
        cliente: evento.cliente,
      },
      cotizacionRef: cotizacionRef
        ? {
            id: cotizacionRef.id,
            folio: cotizacionRef.folio,
            estado: cotizacionRef.estado,
            total: toNumber(cotizacionRef.total),
          }
        : null,
      totalCotizado,
      totalPagado,
      saldoPendiente,
      totalGastos,
      costoEstimado,
      costoReal,
      utilidadCotizada,
      utilidadReal,
      margenReal:
        totalPagado > 0 ? Math.round((utilidadReal / totalPagado) * 10000) / 100 : 0,
    };
  }

  async resumenGlobal() {
    const eventos = await this.prisma.evento.findMany({
      where: { estado: { not: 'CANCELADO' } },
      include: {
        cotizaciones: { orderBy: { createdAt: 'desc' }, take: 1 },
        movimientos: {
          where: { estado: EstadoMovimientoFinanciero.CONFIRMADO },
        },
      },
    });

    let totalCotizado = 0;
    let totalCobrado = 0;
    let totalPendiente = 0;

    for (const evento of eventos) {
      const cot = evento.cotizaciones[0];
      const cotizado = cot ? toNumber(cot.total) : 0;
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

      totalCotizado += cotizado;
      totalCobrado += pagado;
      totalPendiente += Math.max(0, cotizado - pagado);
    }

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const ingresosMes = await this.prisma.movimientoFinanciero.findMany({
      where: {
        estado: EstadoMovimientoFinanciero.CONFIRMADO,
        tipo: { in: [TipoMovimientoFinanciero.ANTICIPO, TipoMovimientoFinanciero.PAGO] },
        fecha: { gte: inicioMes },
      },
    });

    const ingresosMesTotal = ingresosMes.reduce(
      (s, m) => s + toNumber(m.monto),
      0,
    );

    return {
      totalCotizado,
      totalCobrado,
      totalPendiente,
      ingresosMes: ingresosMesTotal,
    };
  }
}
