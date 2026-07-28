import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubarrendoDto, UpdateSubarrendoDto } from './dto/subarrendo.dto';
import { toNumber } from '../common/utils/pricing';

const subarrendoInclude = {
  evento: {
    include: { cliente: { select: { id: true, nombre: true } } },
  },
  proveedor: true,
};

@Injectable()
export class SubarrendosService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { eventoId?: string; estado?: string }) {
    return this.prisma.subarrendo
      .findMany({
        where: {
          ...(filters?.eventoId ? { eventoId: filters.eventoId } : {}),
          ...(filters?.estado ? { estado: filters.estado as never } : {}),
        },
        include: subarrendoInclude,
        orderBy: { createdAt: 'desc' },
      })
      .then((rows) =>
        rows.map((r) => ({ ...r, costo: toNumber(r.costo) })),
      );
  }

  async findOne(id: string) {
    const s = await this.prisma.subarrendo.findUnique({
      where: { id },
      include: subarrendoInclude,
    });
    if (!s) throw new NotFoundException('Subarrendo no encontrado');
    return { ...s, costo: toNumber(s.costo) };
  }

  create(dto: CreateSubarrendoDto) {
    return this.prisma.subarrendo
      .create({
        data: {
          eventoId: dto.eventoId,
          proveedorId: dto.proveedorId,
          cotizacionItemId: dto.cotizacionItemId,
          descripcion: dto.descripcion,
          cantidad: dto.cantidad,
          costo: dto.costo,
          fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : null,
          notas: dto.notas,
        },
        include: subarrendoInclude,
      })
      .then((r) => ({ ...r, costo: toNumber(r.costo) }));
  }

  async importarDesdeCotizacion(eventoId: string) {
    const items = await this.prisma.cotizacionItem.findMany({
      where: {
        esSubarrendo: true,
        cotizacion: { eventoId },
      },
      include: { proveedor: true },
    });

    const creados = [];
    for (const item of items) {
      if (!item.proveedorId) continue;

      const existing = await this.prisma.subarrendo.findFirst({
        where: { eventoId, cotizacionItemId: item.id },
      });
      if (existing) continue;

      const sub = await this.prisma.subarrendo.create({
        data: {
          eventoId,
          proveedorId: item.proveedorId,
          cotizacionItemId: item.id,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          costo: item.costoUnitario,
          estado: 'IDENTIFICADO',
        },
        include: subarrendoInclude,
      });
      creados.push({ ...sub, costo: toNumber(sub.costo) });
    }

    return creados;
  }

  async update(id: string, dto: UpdateSubarrendoDto) {
    await this.findOne(id);
    return this.prisma.subarrendo
      .update({
        where: { id },
        data: {
          ...dto,
          fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
        },
        include: subarrendoInclude,
      })
      .then((r) => ({ ...r, costo: toNumber(r.costo) }));
  }
}
