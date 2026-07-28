import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';
import { CreateProveedorDto, UpdateProveedorDto } from './dto/proveedor.dto';
import { EstadoVerificacionProveedor, TipoProveedor } from '@prisma/client';

const expedienteInclude = {
  productos: {
    include: { fotos: { orderBy: { orden: 'asc' as const } } },
    orderBy: { nombre: 'asc' as const },
  },
  coberturas: { orderBy: { entidad: 'asc' as const } },
  servicios: { orderBy: { nombre: 'asc' as const } },
  _count: {
    select: { productos: true, coberturas: true, servicios: true, subarrendos: true },
  },
};

function calcularCompletitud(proveedor: {
  razonSocial: string | null;
  email: string | null;
  telefono: string | null;
  ciudad: string | null;
  entidadFederativa: string | null;
  direccion: string | null;
  eventosSimultaneosMax: number | null;
  radioCoberturaKm: number | null;
  productos: { fotos: unknown[] }[];
  coberturas: unknown[];
  servicios: unknown[];
}): number {
  const checks = [
    !!proveedor.razonSocial,
    !!proveedor.email,
    !!proveedor.telefono,
    !!proveedor.ciudad && !!proveedor.entidadFederativa,
    !!proveedor.direccion,
    proveedor.productos.length > 0,
    proveedor.productos.some((p) => p.fotos.length > 0),
    proveedor.coberturas.length > 0,
    proveedor.servicios.length > 0,
    proveedor.eventosSimultaneosMax != null || proveedor.radioCoberturaKm != null,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  private mapProveedorList<T extends { latitud?: unknown; longitud?: unknown }>(p: T) {
    return {
      ...p,
      latitud: p.latitud != null ? toNumber(p.latitud as never) : null,
      longitud: p.longitud != null ? toNumber(p.longitud as never) : null,
    };
  }

  async findAll(filters?: {
    search?: string;
    tipo?: TipoProveedor;
    activo?: boolean;
    entidadFederativa?: string;
    ciudad?: string;
    estadoVerificacion?: EstadoVerificacionProveedor;
    categoria?: string;
  }) {
    const { search, tipo, activo, entidadFederativa, ciudad, estadoVerificacion, categoria } =
      filters ?? {};

    const rows = await this.prisma.proveedor.findMany({
      where: {
        ...(tipo ? { tipo } : {}),
        ...(activo !== undefined ? { activo } : {}),
        ...(entidadFederativa ? { entidadFederativa } : {}),
        ...(ciudad ? { ciudad: { contains: ciudad, mode: 'insensitive' } } : {}),
        ...(estadoVerificacion ? { estadoVerificacion } : {}),
        ...(categoria
          ? { productos: { some: { categoria: { equals: categoria, mode: 'insensitive' } } } }
          : {}),
        ...(search
          ? {
              OR: [
                { nombre: { contains: search, mode: 'insensitive' } },
                { razonSocial: { contains: search, mode: 'insensitive' } },
                { contacto: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { ciudad: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: { select: { productos: true, coberturas: true, servicios: true, items: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    return rows.map((p) => this.mapProveedorList(p));
  }

  async findOne(id: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: { _count: { select: { productos: true, coberturas: true, servicios: true, items: true } } },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return this.mapProveedorList(proveedor);
  }

  async findExpediente(id: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: expedienteInclude,
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

    const mapped = {
      ...this.mapProveedorList(proveedor),
      productos: proveedor.productos.map((p) => ({
        ...p,
        precioReferencia: toNumber(p.precioReferencia),
      })),
      servicios: proveedor.servicios.map((s) => ({
        ...s,
        precioReferencia: s.precioReferencia != null ? toNumber(s.precioReferencia) : null,
      })),
      completitudPerfil: calcularCompletitud(proveedor),
    };

    return mapped;
  }

  create(dto: CreateProveedorDto) {
    return this.prisma.proveedor
      .create({
        data: {
          ...dto,
          latitud: dto.latitud,
          longitud: dto.longitud,
        },
        include: { _count: { select: { productos: true } } },
      })
      .then((p) => this.mapProveedorList(p));
  }

  async update(id: string, dto: UpdateProveedorDto) {
    await this.findOne(id);
    return this.prisma.proveedor
      .update({
        where: { id },
        data: {
          ...dto,
          latitud: dto.latitud,
          longitud: dto.longitud,
        },
        include: { _count: { select: { productos: true } } },
      })
      .then((p) => this.mapProveedorList(p));
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.proveedor.delete({ where: { id } });
  }

  async metricasCaptura() {
    const [
      totalProveedores,
      verificados,
      productosCatalogo,
      conFotos,
      coberturas,
      servicios,
      porEntidad,
      porCategoria,
    ] = await Promise.all([
      this.prisma.proveedor.count({ where: { activo: true } }),
      this.prisma.proveedor.count({ where: { estadoVerificacion: 'VERIFICADO' } }),
      this.prisma.productoProveedor.count({ where: { activo: true } }),
      this.prisma.productoProveedor.count({
        where: { fotos: { some: {} } },
      }),
      this.prisma.coberturaProveedor.count(),
      this.prisma.servicioProveedor.count({ where: { activo: true } }),
      this.prisma.proveedor.groupBy({
        by: ['entidadFederativa'],
        where: { entidadFederativa: { not: null } },
        _count: { entidadFederativa: true },
      }),
      this.prisma.productoProveedor.groupBy({
        by: ['categoria'],
        where: { categoria: { not: null } },
        _count: { categoria: true },
        orderBy: { _count: { categoria: 'desc' } },
        take: 8,
      }),
    ]);

    const proveedores = await this.prisma.proveedor.findMany({
      where: { activo: true },
      include: {
        productos: { include: { fotos: true } },
        coberturas: true,
        servicios: true,
      },
    });

    const completitudPromedio =
      proveedores.length > 0
        ? Math.round(
            proveedores.reduce((sum, p) => sum + calcularCompletitud(p), 0) / proveedores.length,
          )
        : 0;

    return {
      totalProveedores,
      verificados,
      productosCatalogo,
      productosConFotos: conFotos,
      zonasCobertura: coberturas,
      serviciosRegistrados: servicios,
      completitudPromedio,
      porEntidad: porEntidad
        .filter((e) => e.entidadFederativa)
        .map((e) => ({
          entidad: e.entidadFederativa!,
          cantidad: e._count.entidadFederativa,
        })),
      topCategorias: porCategoria
        .filter((c) => c.categoria)
        .map((c) => ({
          categoria: c.categoria!,
          cantidad: c._count.categoria,
        })),
    };
  }

  async listCategorias() {
    const rows = await this.prisma.productoProveedor.groupBy({
      by: ['categoria'],
      where: { categoria: { not: null } },
      _count: { categoria: true },
      orderBy: { categoria: 'asc' },
    });
    return rows.filter((r) => r.categoria).map((r) => r.categoria!);
  }
}
