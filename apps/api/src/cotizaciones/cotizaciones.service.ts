import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCotizacion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductosService } from '../productos/productos.service';
import {
  AddCotizacionItemDto,
  CreateCotizacionDto,
  UpdateCotizacionDto,
} from './dto/cotizacion.dto';
import {
  calcPrecioVenta,
  calcSubtotal,
  generarFolio,
  rangoEvento,
  roundMoney,
  toNumber,
} from '../common/utils/pricing';

const cotizacionInclude = {
  evento: {
    include: {
      cliente: { select: { id: true, nombre: true, empresa: true } },
    },
  },
  items: {
    include: {
      producto: true,
      proveedor: true,
    },
    orderBy: { descripcion: 'asc' as const },
  },
};

@Injectable()
export class CotizacionesService {
  constructor(
    private prisma: PrismaService,
    private productosService: ProductosService,
  ) {}

  findAll(filters?: { eventoId?: string; estado?: EstadoCotizacion }) {
    return this.prisma.cotizacion
      .findMany({
        where: {
          ...(filters?.eventoId ? { eventoId: filters.eventoId } : {}),
          ...(filters?.estado ? { estado: filters.estado } : {}),
        },
        include: {
          evento: {
            include: { cliente: { select: { id: true, nombre: true } } },
          },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      .then((rows) =>
        rows.map((row) => ({
          ...row,
          margenGlobal: toNumber(row.margenGlobal),
          subtotalCosto: toNumber(row.subtotalCosto),
          subtotalVenta: toNumber(row.subtotalVenta),
          total: toNumber(row.total),
          utilidad: toNumber(row.utilidad),
        })),
      );
  }

  async findOne(id: string) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: cotizacionInclude,
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    return this.serializeCotizacion(cotizacion);
  }

  async create(dto: CreateCotizacionDto) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: dto.eventoId },
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    const folio = await generarFolio(this.prisma);
    const margenGlobal = dto.margenGlobal ?? 30;

    const cotizacion = await this.prisma.cotizacion.create({
      data: {
        folio,
        eventoId: dto.eventoId,
        margenGlobal,
        notas: dto.notas,
        validoHasta: dto.validoHasta ? new Date(dto.validoHasta) : null,
      },
    });

    if (dto.items?.length) {
      for (const item of dto.items) {
        await this.addItem(cotizacion.id, item);
      }
    }

    await this.recalcularTotales(cotizacion.id);

    if (evento.estado === 'BORRADOR') {
      await this.prisma.evento.update({
        where: { id: evento.id },
        data: { estado: 'COTIZACION' },
      });
    }

    return this.findOne(cotizacion.id);
  }

  async update(id: string, dto: UpdateCotizacionDto) {
    await this.findOne(id);

    await this.prisma.cotizacion.update({
      where: { id },
      data: {
        ...dto,
        validoHasta: dto.validoHasta ? new Date(dto.validoHasta) : undefined,
      },
    });

    if (dto.margenGlobal !== undefined) {
      await this.recalcularTotales(id);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cotizacion.delete({ where: { id } });
  }

  async addItem(cotizacionId: string, dto: AddCotizacionItemDto) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: { evento: true },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    const esSubarrendo = dto.esSubarrendo ?? false;
    const margen = dto.margenPorcentaje ?? toNumber(cotizacion.margenGlobal);
    const rango = rangoEvento(cotizacion.evento);

    if (esSubarrendo) {
      if (!dto.proveedorId) {
        throw new BadRequestException('Subarrendo requiere un proveedor');
      }
      const proveedor = await this.prisma.proveedor.findUnique({
        where: { id: dto.proveedorId },
      });
      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado');
      }
    } else if (dto.productoId) {
      await this.productosService.validarDisponibilidad(
        dto.productoId,
        dto.cantidad,
        rango.inicio.toISOString(),
        rango.fin.toISOString(),
        cotizacion.eventoId,
      );
    }

    const precioUnitario = calcPrecioVenta(dto.costoUnitario, margen);
    const subtotal = calcSubtotal(precioUnitario, dto.cantidad);

    await this.prisma.cotizacionItem.create({
      data: {
        cotizacionId,
        productoId: dto.productoId ?? null,
        proveedorId: dto.proveedorId ?? null,
        descripcion: dto.descripcion,
        cantidad: dto.cantidad,
        costoUnitario: dto.costoUnitario,
        margenPorcentaje: margen,
        precioUnitario,
        subtotal,
        esSubarrendo,
      },
    });

    await this.recalcularTotales(cotizacionId);
    return this.findOne(cotizacionId);
  }

  async removeItem(cotizacionId: string, itemId: string) {
    const item = await this.prisma.cotizacionItem.findFirst({
      where: { id: itemId, cotizacionId },
    });

    if (!item) {
      throw new NotFoundException('Ítem no encontrado');
    }

    await this.prisma.cotizacionItem.delete({ where: { id: itemId } });
    await this.recalcularTotales(cotizacionId);
    return this.findOne(cotizacionId);
  }

  async recalcularTotales(cotizacionId: string) {
    const items = await this.prisma.cotizacionItem.findMany({
      where: { cotizacionId },
    });

    let subtotalCosto = 0;
    let subtotalVenta = 0;

    for (const item of items) {
      subtotalCosto += toNumber(item.costoUnitario) * item.cantidad;
      subtotalVenta += toNumber(item.subtotal);
    }

    subtotalCosto = roundMoney(subtotalCosto);
    subtotalVenta = roundMoney(subtotalVenta);
    const utilidad = roundMoney(subtotalVenta - subtotalCosto);

    await this.prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: {
        subtotalCosto,
        subtotalVenta,
        total: subtotalVenta,
        utilidad,
      },
    });
  }

  private serializeCotizacion(cotizacion: {
    subtotalCosto: { toNumber(): number } | number;
    subtotalVenta: { toNumber(): number } | number;
    total: { toNumber(): number } | number;
    utilidad: { toNumber(): number } | number;
    margenGlobal: { toNumber(): number } | number;
    items: Array<{
      costoUnitario: { toNumber(): number } | number;
      margenPorcentaje: { toNumber(): number } | number;
      precioUnitario: { toNumber(): number } | number;
      subtotal: { toNumber(): number } | number;
      producto?: { costoUnitario: unknown; precioRenta: unknown } | null;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }) {
    return {
      ...cotizacion,
      margenGlobal: toNumber(cotizacion.margenGlobal as never),
      subtotalCosto: toNumber(cotizacion.subtotalCosto as never),
      subtotalVenta: toNumber(cotizacion.subtotalVenta as never),
      total: toNumber(cotizacion.total as never),
      utilidad: toNumber(cotizacion.utilidad as never),
      items: cotizacion.items.map((item) => ({
        ...item,
        costoUnitario: toNumber(item.costoUnitario as never),
        margenPorcentaje: toNumber(item.margenPorcentaje as never),
        precioUnitario: toNumber(item.precioUnitario as never),
        subtotal: toNumber(item.subtotal as never),
        producto: item.producto
          ? {
              ...item.producto,
              costoUnitario: toNumber(item.producto.costoUnitario as never),
              precioRenta: toNumber(item.producto.precioRenta as never),
            }
          : null,
      })),
    };
  }
}
