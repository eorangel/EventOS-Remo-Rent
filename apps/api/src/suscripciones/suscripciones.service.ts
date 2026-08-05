import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoSuscripcion, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';

function mapSuscripcion(
  s: Prisma.SuscripcionGetPayload<{
    include: {
      proveedor: { select: { id: true; nombre: true; razonSocial: true; activo: true } };
      plan: { select: { id: true; nombre: true; codigo: true; precioMensual: true; moneda: true } };
      pagos: { orderBy: { pagadoEn: 'desc' } };
    };
  }>,
) {
  return {
    id: s.id,
    empresa: s.proveedor.nombre,
    empresaRazonSocial: s.proveedor.razonSocial,
    proveedorId: s.proveedorId,
    proveedorActivo: s.proveedor.activo,
    plan: s.plan.nombre,
    planId: s.planId,
    planCodigo: s.plan.codigo,
    precioMensual: toNumber(s.plan.precioMensual),
    moneda: s.plan.moneda,
    estado: s.estado,
    fechaAlta: s.fechaAlta.toISOString(),
    proximoCobro: s.proximoCobro?.toISOString() ?? null,
    metodoPago: s.metodoPago,
    referenciaPago: s.referenciaPago,
    canceladaEn: s.canceladaEn?.toISOString() ?? null,
    pagos: s.pagos.map((p) => ({
      id: p.id,
      monto: toNumber(p.monto),
      moneda: p.moneda,
      estado: p.estado,
      metodoPago: p.metodoPago,
      referencia: p.referencia,
      periodoInicio: p.periodoInicio.toISOString(),
      periodoFin: p.periodoFin.toISOString(),
      pagadoEn: p.pagadoEn.toISOString(),
    })),
  };
}

@Injectable()
export class SuscripcionesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { search?: string; estado?: EstadoSuscripcion; planId?: string }) {
    const { search, estado, planId } = filters ?? {};

    const items = await this.prisma.suscripcion.findMany({
      where: {
        ...(estado ? { estado } : {}),
        ...(planId ? { planId } : {}),
        ...(search
          ? {
              OR: [
                { proveedor: { nombre: { contains: search, mode: 'insensitive' } } },
                { proveedor: { razonSocial: { contains: search, mode: 'insensitive' } } },
                { plan: { nombre: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        proveedor: { select: { id: true, nombre: true, razonSocial: true, activo: true } },
        plan: { select: { id: true, nombre: true, codigo: true, precioMensual: true, moneda: true } },
        pagos: { orderBy: { pagadoEn: 'desc' }, take: 1 },
        _count: { select: { pagos: true } },
      },
      orderBy: [{ proximoCobro: 'asc' }, { fechaAlta: 'desc' }],
    });

    return items.map((s) => {
      const mapped = mapSuscripcion({ ...s, pagos: s.pagos });
      return {
        id: mapped.id,
        empresa: mapped.empresa,
        proveedorId: mapped.proveedorId,
        plan: mapped.plan,
        planId: mapped.planId,
        precioMensual: mapped.precioMensual,
        moneda: mapped.moneda,
        estado: mapped.estado,
        fechaAlta: mapped.fechaAlta,
        proximoCobro: mapped.proximoCobro,
        metodoPago: mapped.metodoPago,
        ultimoPago: mapped.pagos[0] ?? null,
        totalPagos: s._count.pagos,
      };
    });
  }

  async findOne(id: string) {
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id },
      include: {
        proveedor: { select: { id: true, nombre: true, razonSocial: true, activo: true } },
        plan: { select: { id: true, nombre: true, codigo: true, precioMensual: true, moneda: true } },
        pagos: { orderBy: { pagadoEn: 'desc' } },
      },
    });

    if (!suscripcion) throw new NotFoundException('Suscripción no encontrada');
    return mapSuscripcion(suscripcion);
  }

  async getResumen() {
    const [total, activas, prueba, suspendidas, canceladas, planes, mrr] = await Promise.all([
      this.prisma.suscripcion.count(),
      this.prisma.suscripcion.count({ where: { estado: EstadoSuscripcion.ACTIVA } }),
      this.prisma.suscripcion.count({ where: { estado: EstadoSuscripcion.PRUEBA } }),
      this.prisma.suscripcion.count({ where: { estado: EstadoSuscripcion.SUSPENDIDA } }),
      this.prisma.suscripcion.count({ where: { estado: EstadoSuscripcion.CANCELADA } }),
      this.prisma.plan.findMany({ where: { activo: true }, orderBy: { precioMensual: 'asc' } }),
      this.prisma.suscripcion.findMany({
        where: { estado: { in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.PRUEBA] } },
        include: { plan: { select: { precioMensual: true } } },
      }),
    ]);

    const mrrTotal = mrr.reduce((sum, s) => sum + toNumber(s.plan.precioMensual), 0);

    return {
      total,
      activas,
      prueba,
      suspendidas,
      canceladas,
      mrr: mrrTotal,
      planes: planes.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        codigo: p.codigo,
        precioMensual: toNumber(p.precioMensual),
        moneda: p.moneda,
      })),
    };
  }

  listPlanes() {
    return this.prisma.plan.findMany({
      where: { activo: true },
      orderBy: { precioMensual: 'asc' },
    }).then((planes) =>
      planes.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        codigo: p.codigo,
        precioMensual: toNumber(p.precioMensual),
        moneda: p.moneda,
        descripcion: p.descripcion,
      })),
    );
  }
}
