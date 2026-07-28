import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCotizacion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';
import { eventosSeTraslapan, rangoEvento, toNumber } from '../common/utils/pricing';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { search?: string; categoria?: string; activo?: boolean }) {
    const { search, categoria, activo } = filters ?? {};

    return this.prisma.producto.findMany({
      where: {
        ...(activo !== undefined ? { activo } : {}),
        ...(categoria ? { categoria } : {}),
        ...(search
          ? {
              OR: [
                { nombre: { contains: search, mode: 'insensitive' } },
                { codigo: { contains: search, mode: 'insensitive' } },
                { categoria: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  create(dto: CreateProductoDto) {
    return this.prisma.producto.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductoDto) {
    await this.findOne(id);
    return this.prisma.producto.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.producto.delete({ where: { id } });
  }

  async getDisponibilidad(
    productoId: string,
    fechaInicio: string,
    fechaFin: string,
    excludeEventoId?: string,
  ) {
    const producto = await this.findOne(productoId);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const reservado = await this.calcularReservado(
      productoId,
      inicio,
      fin,
      excludeEventoId,
    );

    const total = producto.cantidadTotal;
    const disponible = Math.max(0, total - reservado);

    return {
      productoId,
      cantidadTotal: total,
      cantidadReservada: reservado,
      cantidadDisponible: disponible,
      requiereSubarrendo: disponible === 0 && total > 0,
      sinStock: total === 0,
    };
  }

  async calcularReservado(
    productoId: string,
    inicio: Date,
    fin: Date,
    excludeEventoId?: string,
  ): Promise<number> {
    const items = await this.prisma.cotizacionItem.findMany({
      where: {
        productoId,
        esSubarrendo: false,
        cotizacion: {
          estado: { in: [EstadoCotizacion.ENVIADA, EstadoCotizacion.APROBADA] },
          ...(excludeEventoId ? { eventoId: { not: excludeEventoId } } : {}),
        },
      },
      include: {
        cotizacion: {
          include: { evento: true },
        },
      },
    });

    let reservado = 0;
    for (const item of items) {
      const rango = rangoEvento(item.cotizacion.evento);
      if (eventosSeTraslapan(inicio, fin, rango.inicio, rango.fin)) {
        reservado += item.cantidad;
      }
    }

    return reservado;
  }

  async validarDisponibilidad(
    productoId: string,
    cantidad: number,
    fechaInicio: string,
    fechaFin: string,
    excludeEventoId?: string,
  ) {
    const disp = await this.getDisponibilidad(
      productoId,
      fechaInicio,
      fechaFin,
      excludeEventoId,
    );

    if (disp.sinStock) {
      throw new BadRequestException(
        'Este producto no tiene existencias en inventario. Considere subarrendamiento.',
      );
    }

    if (cantidad > disp.cantidadDisponible) {
      throw new BadRequestException(
        `Solo hay ${disp.cantidadDisponible} unidad(es) disponible(s). Se requieren ${cantidad}. Considere subarrendamiento.`,
      );
    }

    return disp;
  }

  async listarConDisponibilidad(
    fechaInicio: string,
    fechaFin: string,
    excludeEventoId?: string,
  ) {
    const productos = await this.findAll({ activo: true });

    return Promise.all(
      productos.map(async (producto) => {
        const disp = await this.getDisponibilidad(
          producto.id,
          fechaInicio,
          fechaFin,
          excludeEventoId,
        );
        return {
          ...producto,
          costoUnitario: toNumber(producto.costoUnitario),
          precioRenta: toNumber(producto.precioRenta),
          ...disp,
        };
      }),
    );
  }
}
