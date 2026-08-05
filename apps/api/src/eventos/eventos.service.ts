import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto, UpdateEventoDto } from './dto/evento.dto';
import { EstadoEvento, EstadoEventoProveedor } from '@prisma/client';
import { toNumber } from '../common/utils/pricing';

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

  async findAllCrm(filters?: {
    search?: string;
    origen?: 'PLATAFORMA' | 'PROVEEDOR';
    estado?: string;
  }) {
    const { search, origen, estado } = filters ?? {};

    const [plataforma, proveedor] = await Promise.all([
      origen === 'PROVEEDOR'
        ? []
        : this.prisma.evento.findMany({
            where: {
              ...(estado ? { estado: estado as EstadoEvento } : {}),
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
            include: {
              cliente: { select: { id: true, nombre: true } },
              creadoPor: { select: { id: true, nombre: true } },
              cotizaciones: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { total: true },
              },
            },
          }),
      origen === 'PLATAFORMA'
        ? []
        : this.prisma.eventoClienteProveedor.findMany({
            where: {
              ...(estado ? { estado: estado as EstadoEventoProveedor } : {}),
              ...(search
                ? {
                    OR: [
                      { titulo: { contains: search, mode: 'insensitive' } },
                      { lugar: { contains: search, mode: 'insensitive' } },
                      { clienteProveedor: { nombre: { contains: search, mode: 'insensitive' } } },
                      { proveedor: { nombre: { contains: search, mode: 'insensitive' } } },
                    ],
                  }
                : {}),
            },
            include: {
              proveedor: { select: { id: true, nombre: true } },
              clienteProveedor: { select: { id: true, nombre: true } },
            },
          }),
    ]);

    const items = [
      ...plataforma.map((e) => ({
        id: e.id,
        origen: 'PLATAFORMA' as const,
        titulo: e.titulo,
        fechaEvento: e.fechaEvento.toISOString(),
        fechaFin: e.fechaDesmontaje?.toISOString() ?? null,
        lugar: e.lugar,
        estado: e.estado,
        clienteId: e.clienteId,
        clienteNombre: e.cliente.nombre,
        proveedorId: null as string | null,
        proveedorNombre: null as string | null,
        montoEstimado:
          e.cotizaciones[0]?.total != null ? toNumber(e.cotizaciones[0].total as never) : null,
        creadoPor: e.creadoPor.nombre,
        creadoEn: e.createdAt.toISOString(),
        enlace: `/eventos/${e.id}`,
      })),
      ...proveedor.map((e) => ({
        id: e.id,
        origen: 'PROVEEDOR' as const,
        titulo: e.titulo,
        fechaEvento: e.fechaEvento.toISOString(),
        fechaFin: e.fechaFin?.toISOString() ?? null,
        lugar: e.lugar,
        estado: e.estado,
        clienteId: e.clienteProveedorId,
        clienteNombre: e.clienteProveedor.nombre,
        proveedorId: e.proveedorId,
        proveedorNombre: e.proveedor.nombre,
        montoEstimado: e.montoEstimado != null ? toNumber(e.montoEstimado as never) : null,
        creadoPor: null as string | null,
        creadoEn: e.createdAt.toISOString(),
        enlace: `/eventos/portal/${e.id}`,
      })),
    ].sort((a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime());

    return items;
  }

  async getCrmResumen() {
    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPlataforma, totalProveedor, plataforma, proveedor] = await Promise.all([
      this.prisma.evento.count(),
      this.prisma.eventoClienteProveedor.count(),
      this.prisma.evento.findMany({
        select: { estado: true, fechaEvento: true, createdAt: true },
      }),
      this.prisma.eventoClienteProveedor.findMany({
        select: { estado: true, fechaEvento: true, createdAt: true },
      }),
    ]);

    const completadosPlataforma = plataforma.filter((e) => e.estado === EstadoEvento.COMPLETADO).length;
    const completadosProveedor = proveedor.filter((e) => e.estado === EstadoEventoProveedor.COMPLETADO).length;
    const proximosPlataforma = plataforma.filter(
      (e) => e.fechaEvento >= hoy && e.estado !== EstadoEvento.CANCELADO,
    ).length;
    const proximosProveedor = proveedor.filter(
      (e) => e.fechaEvento >= hoy && e.estado !== EstadoEventoProveedor.CANCELADO,
    ).length;
    const mesPlataforma = plataforma.filter((e) => e.createdAt >= inicioMes).length;
    const mesProveedor = proveedor.filter((e) => e.createdAt >= inicioMes).length;

    const buckets: { mes: string; mesLabel: string; plataforma: number; proveedor: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = new Intl.DateTimeFormat('es-MX', {
        month: 'short',
        year: '2-digit',
      }).format(d);
      buckets.push({ mes: key, mesLabel, plataforma: 0, proveedor: 0 });
    }

    for (const e of plataforma) {
      const key = `${e.fechaEvento.getFullYear()}-${String(e.fechaEvento.getMonth() + 1).padStart(2, '0')}`;
      const bucket = buckets.find((b) => b.mes === key);
      if (bucket) bucket.plataforma += 1;
    }
    for (const e of proveedor) {
      const key = `${e.fechaEvento.getFullYear()}-${String(e.fechaEvento.getMonth() + 1).padStart(2, '0')}`;
      const bucket = buckets.find((b) => b.mes === key);
      if (bucket) bucket.proveedor += 1;
    }

    return {
      total: totalPlataforma + totalProveedor,
      plataforma: totalPlataforma,
      proveedor: totalProveedor,
      completados: completadosPlataforma + completadosProveedor,
      proximos: proximosPlataforma + proximosProveedor,
      registradosMes: mesPlataforma + mesProveedor,
      porMes: buckets,
    };
  }

  async findOneCrmProveedor(id: string) {
    const evento = await this.prisma.eventoClienteProveedor.findUnique({
      where: { id },
      include: {
        proveedor: { select: { id: true, nombre: true, ciudad: true, entidadFederativa: true } },
        clienteProveedor: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true },
        },
      },
    });
    if (!evento) throw new NotFoundException('Evento de proveedor no encontrado');

    return {
      id: evento.id,
      origen: 'PROVEEDOR' as const,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaEvento: evento.fechaEvento.toISOString(),
      fechaFin: evento.fechaFin?.toISOString() ?? null,
      fechaEntrega: evento.fechaEntrega?.toISOString() ?? null,
      fechaRecogida: evento.fechaRecogida?.toISOString() ?? null,
      lugar: evento.lugar,
      estado: evento.estado,
      montoEstimado: evento.montoEstimado != null ? toNumber(evento.montoEstimado as never) : null,
      notas: evento.notas,
      creadoEn: evento.createdAt.toISOString(),
      proveedor: evento.proveedor,
      cliente: evento.clienteProveedor,
    };
  }
}
