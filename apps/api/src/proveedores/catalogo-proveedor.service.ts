import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { assertFotoUrl } from '../common/utils/foto-url';
import { EstadoCotizacion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';
import { fechaEventoEnRango } from '../common/utils/fecha-evento';
import {
  CreateCoberturaDto,
  CreateProductoProveedorDto,
  CreateServicioDto,
  FotoProductoDto,
  UpdateProductoProveedorDto,
} from './dto/catalogo.dto';
import { UpdateServicioProveedorDto } from './dto/banquete.dto';
import {
  buildPlantillaExcel,
  FilaProductoExcel,
  parseProductosExcel,
} from './excel-productos.parser';

const productoInclude = {
  fotos: { orderBy: { orden: 'asc' as const } },
  proveedor: { select: { id: true, nombre: true, ciudad: true, entidadFederativa: true } },
};

@Injectable()
export class CatalogoProveedorService {
  constructor(private prisma: PrismaService) {}

  private mapProducto<T extends { precioReferencia: unknown }>(p: T) {
    return { ...p, precioReferencia: toNumber(p.precioReferencia as never) };
  }

  private mapServicio<T extends { precioReferencia: unknown | null }>(s: T) {
    return {
      ...s,
      precioReferencia: s.precioReferencia != null ? toNumber(s.precioReferencia as never) : null,
    };
  }

  async listProductos(proveedorId: string, filters?: { categoria?: string; search?: string }) {
    await this.ensureProveedor(proveedorId);
    const rows = await this.prisma.productoProveedor.findMany({
      where: {
        proveedorId,
        ...(filters?.categoria ? { categoria: filters.categoria } : {}),
        ...(filters?.search
          ? {
              OR: [
                { nombre: { contains: filters.search, mode: 'insensitive' } },
                { categoria: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: productoInclude,
      orderBy: { nombre: 'asc' },
    });
    return rows.map((r) => this.mapProducto(r));
  }

  async getProducto(proveedorId: string, id: string) {
    const p = await this.prisma.productoProveedor.findFirst({
      where: { id, proveedorId },
      include: productoInclude,
    });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return this.mapProducto(p);
  }

  async createProducto(proveedorId: string, dto: CreateProductoProveedorDto) {
    await this.ensureProveedor(proveedorId);
    const fotos = dto.fotos?.length
      ? dto.fotos.map((f, i) => {
          try {
            const url = assertFotoUrl(f.url);
            return { ...f, url: url!, orden: f.orden ?? i };
          } catch (err) {
            throw new BadRequestException(err instanceof Error ? err.message : 'URL de foto inválida');
          }
        })
      : undefined;
    const producto = await this.prisma.productoProveedor.create({
      data: {
        proveedorId,
        nombre: dto.nombre,
        categoria: dto.categoria,
        descripcion: dto.descripcion,
        cantidadDisponible: dto.cantidadDisponible ?? 0,
        precioReferencia: dto.precioReferencia ?? 0,
        unidadMedida: dto.unidadMedida,
        activo: dto.activo,
        fotos: fotos?.length ? { create: fotos } : undefined,
      },
      include: productoInclude,
    });
    return this.mapProducto(producto);
  }

  async updateProducto(proveedorId: string, id: string, dto: UpdateProductoProveedorDto) {
    await this.getProducto(proveedorId, id);
    const { fotoUrl, ...data } = dto;
    await this.prisma.productoProveedor.update({
      where: { id },
      data,
    });
    if (fotoUrl !== undefined) {
      if (fotoUrl?.trim()) {
        try {
          assertFotoUrl(fotoUrl);
        } catch (err) {
          throw new BadRequestException(err instanceof Error ? err.message : 'URL de foto inválida');
        }
      }
      await this.syncFotoPrincipal(id, fotoUrl);
    }
    return this.getProducto(proveedorId, id);
  }

  /** Una sola foto principal por producto (portal + Excel). */
  private async syncFotoPrincipal(productoId: string, fotoUrl: string | null | undefined) {
    await this.prisma.fotoProductoProveedor.deleteMany({
      where: { productoProveedorId: productoId },
    });
    const url = fotoUrl?.trim();
    if (url) {
      await this.prisma.fotoProductoProveedor.create({
        data: {
          productoProveedorId: productoId,
          url,
          esPrincipal: true,
          orden: 0,
        },
      });
    }
  }

  async removeProducto(proveedorId: string, id: string) {
    await this.getProducto(proveedorId, id);
    return this.prisma.productoProveedor.delete({ where: { id } });
  }

  async addFoto(proveedorId: string, productoId: string, dto: FotoProductoDto) {
    await this.getProducto(proveedorId, productoId);
    let url: string;
    try {
      url = assertFotoUrl(dto.url)!;
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'URL de foto inválida');
    }
    if (dto.esPrincipal) {
      await this.prisma.fotoProductoProveedor.updateMany({
        where: { productoProveedorId: productoId },
        data: { esPrincipal: false },
      });
    }
    return this.prisma.fotoProductoProveedor.create({
      data: {
        productoProveedorId: productoId,
        url,
        esPrincipal: dto.esPrincipal ?? false,
        orden: dto.orden ?? 0,
      },
    });
  }

  async removeFoto(proveedorId: string, productoId: string, fotoId: string) {
    await this.getProducto(proveedorId, productoId);
    return this.prisma.fotoProductoProveedor.delete({ where: { id: fotoId } });
  }

  async listCoberturas(proveedorId: string) {
    await this.ensureProveedor(proveedorId);
    return this.prisma.coberturaProveedor.findMany({
      where: { proveedorId },
      orderBy: { entidad: 'asc' },
    });
  }

  async createCobertura(proveedorId: string, dto: CreateCoberturaDto) {
    await this.ensureProveedor(proveedorId);
    return this.prisma.coberturaProveedor.create({
      data: { proveedorId, ...dto },
    });
  }

  async removeCobertura(proveedorId: string, id: string) {
    await this.ensureProveedor(proveedorId);
    return this.prisma.coberturaProveedor.delete({ where: { id } });
  }

  async listServicios(proveedorId: string) {
    await this.ensureProveedor(proveedorId);
    const rows = await this.prisma.servicioProveedor.findMany({
      where: { proveedorId },
      orderBy: { nombre: 'asc' },
    });
    return rows.map((s) => this.mapServicio(s));
  }

  async createServicio(proveedorId: string, dto: CreateServicioDto) {
    await this.ensureProveedor(proveedorId);
    const s = await this.prisma.servicioProveedor.create({
      data: {
        proveedorId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        precioReferencia: dto.precioReferencia,
        activo: dto.activo,
      },
    });
    return this.mapServicio(s);
  }

  async updateServicio(proveedorId: string, id: string, dto: UpdateServicioProveedorDto) {
    await this.ensureProveedor(proveedorId);
    const existing = await this.prisma.servicioProveedor.findFirst({
      where: { id, proveedorId },
    });
    if (!existing) throw new NotFoundException('Servicio no encontrado');
    const s = await this.prisma.servicioProveedor.update({
      where: { id },
      data: dto,
    });
    return this.mapServicio(s);
  }

  async removeServicio(proveedorId: string, id: string) {
    await this.ensureProveedor(proveedorId);
    return this.prisma.servicioProveedor.delete({ where: { id } });
  }

  getPlantillaExcelProductos(): Buffer {
    return buildPlantillaExcel();
  }

  previewImportProductosExcel(buffer: Buffer) {
    const filas = parseProductosExcel(buffer);
    return this.buildImportResult(filas, true);
  }

  async importProductosExcel(proveedorId: string, buffer: Buffer) {
    await this.ensureProveedor(proveedorId);
    const filas = parseProductosExcel(buffer);
    const validas = filas.filter((f) => f.valido);

    if (validas.length === 0) {
      throw new BadRequestException('No hay filas válidas para importar. Revise la vista previa.');
    }

    const existentes = await this.prisma.productoProveedor.findMany({
      where: { proveedorId },
      select: { id: true, nombre: true },
    });
    const porNombre = new Map(
      existentes.map((p) => [p.nombre.trim().toLowerCase(), p.id]),
    );

    let creados = 0;
    let actualizados = 0;

    for (const fila of validas) {
      const key = fila.nombre.trim().toLowerCase();
      const existenteId = porNombre.get(key);

      if (existenteId) {
        await this.prisma.productoProveedor.update({
          where: { id: existenteId },
          data: {
            categoria: fila.categoria,
            descripcion: fila.descripcion,
            cantidadDisponible: fila.cantidadDisponible,
            precioReferencia: fila.precioReferencia,
            unidadMedida: fila.unidadMedida,
            activo: true,
          },
        });
        if (fila.fotoUrl) {
          await this.syncFotoPrincipal(existenteId, fila.fotoUrl);
        }
        actualizados += 1;
      } else {
        const producto = await this.prisma.productoProveedor.create({
          data: {
            proveedorId,
            nombre: fila.nombre.trim(),
            categoria: fila.categoria,
            descripcion: fila.descripcion,
            cantidadDisponible: fila.cantidadDisponible,
            precioReferencia: fila.precioReferencia,
            unidadMedida: fila.unidadMedida,
            activo: true,
            fotos: fila.fotoUrl
              ? { create: [{ url: fila.fotoUrl, esPrincipal: true, orden: 0 }] }
              : undefined,
          },
        });
        porNombre.set(key, producto.id);
        creados += 1;
      }
    }

    return {
      ...this.buildImportResult(filas, false),
      creados,
      actualizados,
    };
  }

  private buildImportResult(filas: FilaProductoExcel[], vistaPrevia: boolean) {
    const validas = filas.filter((f) => f.valido).length;
    return {
      vistaPrevia,
      totalFilas: filas.length,
      validas,
      invalidas: filas.length - validas,
      filas,
    };
  }

  private async ensureProveedor(id: string) {
    const p = await this.prisma.proveedor.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Proveedor no encontrado');
    return p;
  }

  async getDisponibilidad(
    proveedorId: string,
    productoProveedorId: string,
    fechaInicio: string,
    fechaFin: string,
    excludeCotizacionId?: string,
  ) {
    const producto = await this.getProducto(proveedorId, productoProveedorId);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const reservado = await this.calcularReservado(
      proveedorId,
      productoProveedorId,
      inicio,
      fin,
      excludeCotizacionId,
    );

    const total = producto.cantidadDisponible;
    const disponible = Math.max(0, total - reservado);

    return {
      productoProveedorId,
      cantidadTotal: total,
      cantidadReservada: reservado,
      cantidadDisponible: disponible,
      sinStock: total === 0,
    };
  }

  async calcularReservado(
    proveedorId: string,
    productoProveedorId: string,
    inicio: Date,
    fin: Date,
    excludeCotizacionId?: string,
  ): Promise<number> {
    const items = await this.prisma.cotizacionProveedorItem.findMany({
      where: {
        productoProveedorId,
        cotizacion: {
          proveedorId,
          estado: {
            in: [
              EstadoCotizacion.BORRADOR,
              EstadoCotizacion.ENVIADA,
              EstadoCotizacion.APROBADA,
            ],
          },
          fechaEvento: { not: null },
          ...(excludeCotizacionId ? { id: { not: excludeCotizacionId } } : {}),
        },
      },
      include: { cotizacion: true },
    });

    let reservado = 0;
    for (const item of items) {
      if (fechaEventoEnRango(item.cotizacion.fechaEvento!, inicio, fin)) {
        reservado += item.cantidad;
      }
    }

    return reservado;
  }

  async validarDisponibilidad(
    proveedorId: string,
    productoProveedorId: string,
    cantidad: number,
    fechaInicio: string,
    fechaFin: string,
    excludeCotizacionId?: string,
  ) {
    const producto = await this.getProducto(proveedorId, productoProveedorId);
    const disp = await this.getDisponibilidad(
      proveedorId,
      productoProveedorId,
      fechaInicio,
      fechaFin,
      excludeCotizacionId,
    );

    if (disp.sinStock) {
      throw new BadRequestException(
        `"${producto.nombre}" no tiene existencias en inventario.`,
      );
    }

    if (cantidad > disp.cantidadDisponible) {
      throw new BadRequestException(
        `"${producto.nombre}": solo hay ${disp.cantidadDisponible} disponible(s) en esa fecha (${disp.cantidadReservada} de ${disp.cantidadTotal} ya rentadas). Se solicitan ${cantidad}.`,
      );
    }

    return disp;
  }

  async listarConDisponibilidad(
    proveedorId: string,
    fechaInicio: string,
    fechaFin: string,
    excludeCotizacionId?: string,
    filters?: { categoria?: string; search?: string },
  ) {
    const productos = await this.listProductos(proveedorId, filters);

    return Promise.all(
      productos.map(async (producto) => {
        const disp = await this.getDisponibilidad(
          proveedorId,
          producto.id,
          fechaInicio,
          fechaFin,
          excludeCotizacionId,
        );
        return { ...producto, ...disp };
      }),
    );
  }
}
