import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoActividad } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActividadDto, UpdateActividadDto } from './dto/agenda.dto';

const actividadInclude = {
  evento: {
    include: { cliente: { select: { id: true, nombre: true } } },
  },
};

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  findByRango(desde: string, hasta: string) {
    return this.prisma.actividadAgenda.findMany({
      where: {
        fechaInicio: { gte: new Date(desde), lte: new Date(hasta) },
      },
      include: actividadInclude,
      orderBy: { fechaInicio: 'asc' },
    });
  }

  findByEvento(eventoId: string) {
    return this.prisma.actividadAgenda.findMany({
      where: { eventoId },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async sincronizarEvento(eventoId: string) {
    const evento = await this.prisma.evento.findUnique({ where: { id: eventoId } });
    if (!evento) throw new NotFoundException('Evento no encontrado');

    const actividades: {
      tipo: TipoActividad;
      titulo: string;
      fechaInicio: Date;
      fechaFin?: Date;
      lugar?: string;
    }[] = [];

    if (evento.fechaMontaje) {
      actividades.push({
        tipo: 'MONTAJE',
        titulo: `Montaje — ${evento.titulo}`,
        fechaInicio: evento.fechaMontaje,
        fechaFin: evento.fechaEvento,
        lugar: evento.lugar ?? undefined,
      });
    }

    actividades.push({
      tipo: 'EVENTO',
      titulo: evento.titulo,
      fechaInicio: evento.fechaEvento,
      lugar: evento.lugar ?? undefined,
    });

    if (evento.fechaDesmontaje) {
      actividades.push({
        tipo: 'DESMONTAJE',
        titulo: `Desmontaje — ${evento.titulo}`,
        fechaInicio: evento.fechaDesmontaje,
        lugar: evento.lugar ?? undefined,
      });
    }

    await this.prisma.actividadAgenda.deleteMany({ where: { eventoId } });

    for (const act of actividades) {
      await this.prisma.actividadAgenda.create({
        data: { eventoId, ...act },
      });
    }

    return this.findByEvento(eventoId);
  }

  create(dto: CreateActividadDto) {
    return this.prisma.actividadAgenda.create({
      data: {
        eventoId: dto.eventoId,
        tipo: dto.tipo,
        titulo: dto.titulo,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        lugar: dto.lugar,
        notas: dto.notas,
      },
      include: actividadInclude,
    });
  }

  async update(id: string, dto: UpdateActividadDto) {
    const act = await this.prisma.actividadAgenda.findUnique({ where: { id } });
    if (!act) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.actividadAgenda.update({
      where: { id },
      data: {
        ...dto,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
      include: actividadInclude,
    });
  }

  async toggleCompletada(id: string) {
    const act = await this.prisma.actividadAgenda.findUnique({ where: { id } });
    if (!act) throw new NotFoundException('Actividad no encontrada');

    return this.prisma.actividadAgenda.update({
      where: { id },
      data: { completada: !act.completada },
      include: actividadInclude,
    });
  }
}
