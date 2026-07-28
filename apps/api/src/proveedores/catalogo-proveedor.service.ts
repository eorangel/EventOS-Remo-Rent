import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';
import {
  CreateCoberturaDto,
  CreateProductoProveedorDto,
  CreateServicioDto,
  FotoProductoDto,
  UpdateProductoProveedorDto,
} from './dto/catalogo.dto';

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
        fotos: dto.fotos?.length
          ? { create: dto.fotos.map((f, i) => ({ ...f, orden: f.orden ?? i })) }
          : undefined,
      },
      include: productoInclude,
    });
    return this.mapProducto(producto);
  }

  async updateProducto(proveedorId: string, id: string, dto: UpdateProductoProveedorDto) {
    await this.getProducto(proveedorId, id);
    const producto = await this.prisma.productoProveedor.update({
      where: { id },
      data: dto,
      include: productoInclude,
    });
    return this.mapProducto(producto);
  }

  async removeProducto(proveedorId: string, id: string) {
    await this.getProducto(proveedorId, id);
    return this.prisma.productoProveedor.delete({ where: { id } });
  }

  async addFoto(proveedorId: string, productoId: string, dto: FotoProductoDto) {
    await this.getProducto(proveedorId, productoId);
    if (dto.esPrincipal) {
      await this.prisma.fotoProductoProveedor.updateMany({
        where: { productoProveedorId: productoId },
        data: { esPrincipal: false },
      });
    }
    return this.prisma.fotoProductoProveedor.create({
      data: {
        productoProveedorId: productoId,
        url: dto.url,
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

  async removeServicio(proveedorId: string, id: string) {
    await this.ensureProveedor(proveedorId);
    return this.prisma.servicioProveedor.delete({ where: { id } });
  }

  private async ensureProveedor(id: string) {
    const p = await this.prisma.proveedor.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Proveedor no encontrado');
    return p;
  }
}
