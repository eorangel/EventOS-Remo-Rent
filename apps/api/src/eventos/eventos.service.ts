import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto, UpdateEventoDto } from './dto/evento.dto';
import { EstadoEvento } from '@prisma/client';

const eventoInclude = {
  cliente: true,
  creadoPor: { select: { id: true, nombre: true, email: true } },
  cotizaciones: {
    orderBy: { createdAt: 'desc' as const },
    include: { _count: { select: { items: true } } },
  },
};

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { estado?: EstadoEvento; search?: string }) {
    const { estado, search } = filters ?? {};

    return this.prisma.evento.findMany({
      where: {
        ...(estado ? { estado } : {}),
        ...(search
          ? {
              OR: [
                { titulo: { contains: search, mode: 'insensitive' } },
                { lugar: { contains: search, mode: 'insensitive' } },
                { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: eventoInclude,
      orderBy: { fechaEvento: 'asc' },
    });
  }

  async findOne(id: string) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
      include: eventoInclude,
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    return evento;
  }

  create(dto: CreateEventoDto, creadoPorId: string) {
    return this.prisma.evento.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaEvento: new Date(dto.fechaEvento),
        fechaMontaje: dto.fechaMontaje ? new Date(dto.fechaMontaje) : null,
        fechaDesmontaje: dto.fechaDesmontaje ? new Date(dto.fechaDesmontaje) : null,
        lugar: dto.lugar,
        estado: dto.estado ?? EstadoEvento.BORRADOR,
        notas: dto.notas,
        clienteId: dto.clienteId,
        creadoPorId,
      },
      include: eventoInclude,
    });
  }

  async update(id: string, dto: UpdateEventoDto) {
    await this.findOne(id);

    return this.prisma.evento.update({
      where: { id },
      data: {
        ...dto,
        fechaEvento: dto.fechaEvento ? new Date(dto.fechaEvento) : undefined,
        fechaMontaje: dto.fechaMontaje ? new Date(dto.fechaMontaje) : undefined,
        fechaDesmontaje: dto.fechaDesmontaje ? new Date(dto.fechaDesmontaje) : undefined,
      },
      include: eventoInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.evento.delete({ where: { id } });
  }
}
