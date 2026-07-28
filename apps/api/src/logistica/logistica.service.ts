import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertLogisticaDto, UpdateLogisticaDto } from './dto/logistica.dto';

const DEFAULT_CHECKLIST = [
  'Verificar mobiliario cargado',
  'Confirmar dirección con cliente',
  'Revisar herramientas de montaje',
  'Entregar y firmar acta',
  'Fotografías de evidencia',
];

const logisticaInclude = {
  evento: {
    include: { cliente: { select: { id: true, nombre: true } } },
  },
  vehiculo: true,
  checklist: { orderBy: { orden: 'asc' as const } },
};

@Injectable()
export class LogisticaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.logistica.findMany({
      include: logisticaInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEvento(eventoId: string) {
    const log = await this.prisma.logistica.findUnique({
      where: { eventoId },
      include: logisticaInclude,
    });
    if (!log) throw new NotFoundException('Logística no configurada para este evento');
    return log;
  }

  async upsert(dto: UpsertLogisticaDto) {
    const evento = await this.prisma.evento.findUnique({ where: { id: dto.eventoId } });
    if (!evento) throw new NotFoundException('Evento no encontrado');

    const existing = await this.prisma.logistica.findUnique({
      where: { eventoId: dto.eventoId },
    });

    const data = {
      vehiculoId: dto.vehiculoId ?? null,
      conductor: dto.conductor,
      equipo: dto.equipo,
      fechaSalida: dto.fechaSalida ? new Date(dto.fechaSalida) : null,
      fechaRegreso: dto.fechaRegreso ? new Date(dto.fechaRegreso) : null,
      ruta: dto.ruta,
      estado: dto.estado,
      notas: dto.notas,
    };

    let logistica;
    if (existing) {
      logistica = await this.prisma.logistica.update({
        where: { id: existing.id },
        data,
      });
    } else {
      logistica = await this.prisma.logistica.create({
        data: { eventoId: dto.eventoId, ...data },
      });

      const items = dto.checklist ?? DEFAULT_CHECKLIST.map((d, i) => ({
        descripcion: d,
        orden: i,
      }));

      for (const item of items) {
        await this.prisma.logisticaChecklistItem.create({
          data: {
            logisticaId: logistica.id,
            descripcion: item.descripcion,
            orden: item.orden ?? 0,
          },
        });
      }
    }

    return this.prisma.logistica.findUnique({
      where: { id: logistica.id },
      include: logisticaInclude,
    });
  }

  async update(id: string, dto: UpdateLogisticaDto) {
    const log = await this.prisma.logistica.findUnique({ where: { id } });
    if (!log) throw new NotFoundException('Logística no encontrada');

    return this.prisma.logistica.update({
      where: { id },
      data: {
        ...dto,
        vehiculoId: dto.vehiculoId ?? undefined,
        fechaSalida: dto.fechaSalida ? new Date(dto.fechaSalida) : undefined,
        fechaRegreso: dto.fechaRegreso ? new Date(dto.fechaRegreso) : undefined,
      },
      include: logisticaInclude,
    });
  }

  async toggleChecklistItem(itemId: string) {
    const item = await this.prisma.logisticaChecklistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Ítem no encontrado');

    await this.prisma.logisticaChecklistItem.update({
      where: { id: itemId },
      data: { completado: !item.completado },
    });

    return this.prisma.logistica.findUnique({
      where: { id: item.logisticaId },
      include: logisticaInclude,
    });
  }
}
