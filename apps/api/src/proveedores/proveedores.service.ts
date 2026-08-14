import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { roundMoney, toNumber } from '../common/utils/pricing';
import { CreateProveedorDto, UpdateProveedorDto } from './dto/proveedor.dto';
import { CreateProveedorUsuarioDto } from '../portal/dto/portal.dto';
import { EstadoVerificacionProveedor, EstadoOrdenCobro, RolUsuario, TipoProveedor } from '@prisma/client';

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

const DIAS_DEFAULT = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const ENTIDAD_COORDS: Record<string, { lat: number; lng: number }> = {
  Aguascalientes: { lat: 21.8853, lng: -102.2916 },
  'Baja California': { lat: 30.8406, lng: -115.2838 },
  'Baja California Sur': { lat: 24.1426, lng: -110.3128 },
  Campeche: { lat: 19.83, lng: -90.5349 },
  Chiapas: { lat: 16.7569, lng: -93.1292 },
  Chihuahua: { lat: 28.6329, lng: -106.0691 },
  'Ciudad de México': { lat: 19.4326, lng: -99.1332 },
  Coahuila: { lat: 25.4232, lng: -101.0053 },
  Colima: { lat: 19.2452, lng: -103.7241 },
  Durango: { lat: 24.0277, lng: -104.6532 },
  'Estado de México': { lat: 19.351, lng: -99.757 },
  Guanajuato: { lat: 21.019, lng: -101.2574 },
  Guerrero: { lat: 17.4392, lng: -99.5451 },
  Hidalgo: { lat: 20.0911, lng: -98.7624 },
  Jalisco: { lat: 20.6597, lng: -103.3496 },
  Michoacán: { lat: 19.5665, lng: -101.7068 },
  Morelos: { lat: 18.6813, lng: -99.1013 },
  Nayarit: { lat: 21.7514, lng: -104.8455 },
  'Nuevo León': { lat: 25.5922, lng: -99.9962 },
  Oaxaca: { lat: 17.0732, lng: -96.7266 },
  Puebla: { lat: 19.0414, lng: -98.2063 },
  Querétaro: { lat: 20.5888, lng: -100.3899 },
  'Quintana Roo': { lat: 21.1619, lng: -86.8515 },
  'San Luis Potosí': { lat: 22.1565, lng: -100.9855 },
  Sinaloa: { lat: 24.8091, lng: -107.394 },
  Sonora: { lat: 29.2974, lng: -110.3309 },
  Tabasco: { lat: 17.9892, lng: -92.9281 },
  Tamaulipas: { lat: 24.2669, lng: -98.8363 },
  Tlaxcala: { lat: 19.3139, lng: -98.2404 },
  Veracruz: { lat: 19.1738, lng: -96.1342 },
  Yucatán: { lat: 20.7099, lng: -89.0943 },
  Zacatecas: { lat: 22.7709, lng: -102.5832 },
};

function resolverCoordenadas(proveedor: {
  latitud?: unknown;
  longitud?: unknown;
  entidadFederativa?: string | null;
  ciudad?: string | null;
}) {
  const lat = proveedor.latitud != null ? toNumber(proveedor.latitud as never) : null;
  const lng = proveedor.longitud != null ? toNumber(proveedor.longitud as never) : null;
  if (lat != null && lng != null) {
    return { lat, lng, precision: 'exacta' as const };
  }
  const entidad = proveedor.entidadFederativa;
  if (entidad && ENTIDAD_COORDS[entidad]) {
    const base = ENTIDAD_COORDS[entidad];
    const jitter = (proveedor.ciudad?.length ?? 0) % 5;
    return {
      lat: base.lat + jitter * 0.08 - 0.16,
      lng: base.lng + jitter * 0.06 - 0.12,
      precision: 'estimada' as const,
    };
  }
  return null;
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
    alcaldia?: string;
    ciudad?: string;
    estadoVerificacion?: EstadoVerificacionProveedor;
    categoria?: string;
  }) {
    const { search, tipo, activo, entidadFederativa, alcaldia, ciudad, estadoVerificacion, categoria } =
      filters ?? {};

    const rows = await this.prisma.proveedor.findMany({
      where: {
        ...(tipo ? { tipo } : {}),
        ...(activo !== undefined ? { activo } : {}),
        ...(entidadFederativa ? { entidadFederativa } : {}),
        ...(alcaldia ? { alcaldia } : {}),
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
      proveedoresConUsuario,
      clientesPortal,
      cobrosPortal,
      cobrosPagadosPortal,
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
      this.prisma.proveedor.count({
        where: { activo: true, usuarios: { some: { activo: true } } },
      }),
      this.prisma.clienteProveedor.count({ where: { activo: true } }),
      this.prisma.ordenCobro.count(),
      this.prisma.ordenCobro.count({ where: { estado: 'PAGADO' } }),
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
      proveedoresConUsuario,
      clientesPortal,
      cobrosPortal,
      cobrosPagadosPortal,
      adopcionPortal:
        totalProveedores > 0
          ? Math.round((proveedoresConUsuario / totalProveedores) * 100)
          : 0,
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

  async resumenOperacion() {
    const proveedores = await this.prisma.proveedor.findMany({
      include: {
        productos: { where: { activo: true }, select: { categoria: true, cantidadDisponible: true } },
        _count: {
          select: {
            productos: true,
            clientesPortal: true,
            eventosClientes: true,
            cotizaciones: true,
            ordenesCobro: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    const cobrosPagados = await this.prisma.ordenCobro.findMany({
      where: { estado: EstadoOrdenCobro.PAGADO },
      select: { proveedorId: true, monto: true },
    });

    const montoPorProveedor = new Map<string, number>();
    for (const cobro of cobrosPagados) {
      montoPorProveedor.set(
        cobro.proveedorId,
        (montoPorProveedor.get(cobro.proveedorId) ?? 0) + toNumber(cobro.monto),
      );
    }

    const cobrosPagadosPorProveedor = new Map<string, number>();
    for (const cobro of cobrosPagados) {
      cobrosPagadosPorProveedor.set(
        cobro.proveedorId,
        (cobrosPagadosPorProveedor.get(cobro.proveedorId) ?? 0) + 1,
      );
    }

    let unidadesInventario = 0;
    let productosCatalogados = 0;
    const categoriasSet = new Set<string>();
    const entidadMap = new Map<string, { proveedores: number; unidades: number; productos: number }>();
    const alcaldiaMap = new Map<string, { proveedores: number; unidades: number; productos: number }>();
    const categoriaMap = new Map<
      string,
      { unidades: number; productos: number; proveedores: Set<string> }
    >();

    const operacionPorProveedor = proveedores.map((p) => {
      const unidades = p.productos.reduce((s, prod) => s + prod.cantidadDisponible, 0);
      productosCatalogados += p.productos.length;
      unidadesInventario += unidades;

      for (const prod of p.productos) {
        if (prod.categoria) categoriasSet.add(prod.categoria);
        const cat = prod.categoria ?? 'Sin categoría';
        const row = categoriaMap.get(cat) ?? {
          unidades: 0,
          productos: 0,
          proveedores: new Set<string>(),
        };
        row.unidades += prod.cantidadDisponible;
        row.productos += 1;
        row.proveedores.add(p.id);
        categoriaMap.set(cat, row);
      }

      if (p.entidadFederativa) {
        const ent = entidadMap.get(p.entidadFederativa) ?? {
          proveedores: 0,
          unidades: 0,
          productos: 0,
        };
        ent.proveedores += 1;
        ent.unidades += unidades;
        ent.productos += p.productos.length;
        entidadMap.set(p.entidadFederativa, ent);
      }

      if (p.entidadFederativa === 'Ciudad de México' && p.alcaldia) {
        const alc = alcaldiaMap.get(p.alcaldia) ?? {
          proveedores: 0,
          unidades: 0,
          productos: 0,
        };
        alc.proveedores += 1;
        alc.unidades += unidades;
        alc.productos += p.productos.length;
        alcaldiaMap.set(p.alcaldia, alc);
      }

      return {
        id: p.id,
        nombre: p.nombre,
        ciudad: p.ciudad,
        entidad: p.entidadFederativa,
        alcaldia: p.alcaldia,
        activo: p.activo,
        estadoVerificacion: p.estadoVerificacion,
        tipo: p.tipo,
        productos: p._count.productos,
        unidades,
        clientes: p._count.clientesPortal,
        eventos: p._count.eventosClientes,
        cotizaciones: p._count.cotizaciones,
        cobros: p._count.ordenesCobro,
        cobrosPagados: cobrosPagadosPorProveedor.get(p.id) ?? 0,
        montoCobrado: roundMoney(montoPorProveedor.get(p.id) ?? 0),
        radioCoberturaKm: p.radioCoberturaKm,
      };
    });

    const ubicaciones = proveedores
      .map((p) => {
        const coords = resolverCoordenadas(p);
        if (!coords) return null;
        const unidades = p.productos.reduce((s, prod) => s + prod.cantidadDisponible, 0);
        return {
          id: p.id,
          nombre: p.nombre,
          lat: coords.lat,
          lng: coords.lng,
          ciudad: p.ciudad,
          entidad: p.entidadFederativa,
          alcaldia: p.alcaldia,
          productos: p._count.productos,
          unidades,
          eventos: p._count.eventosClientes,
          estadoVerificacion: p.estadoVerificacion,
          activo: p.activo,
          radioCoberturaKm: p.radioCoberturaKm,
          precision: coords.precision,
        };
      })
      .filter((u): u is NonNullable<typeof u> => u != null);

    const activos = proveedores.filter((p) => p.activo).length;
    const verificados = proveedores.filter(
      (p) => p.estadoVerificacion === EstadoVerificacionProveedor.VERIFICADO,
    ).length;

    const eventosOperados = proveedores.reduce((s, p) => s + p._count.eventosClientes, 0);
    const cotizacionesEmitidas = proveedores.reduce((s, p) => s + p._count.cotizaciones, 0);
    const cobrosGenerados = proveedores.reduce((s, p) => s + p._count.ordenesCobro, 0);
    const totalCobrosPagados = cobrosPagados.length;
    const montoCobrado = roundMoney(
      cobrosPagados.reduce((s, c) => s + toNumber(c.monto), 0),
    );

    return {
      resumen: {
        totalProveedores: proveedores.length,
        activos,
        verificados,
        unidadesInventario,
        productosCatalogados,
        categoriasUnicas: categoriasSet.size,
        entidadesConPresencia: entidadMap.size,
        alcaldiasConPresencia: alcaldiaMap.size,
        eventosOperados,
        cotizacionesEmitidas,
        cobrosGenerados,
        cobrosPagados: totalCobrosPagados,
        montoCobrado,
      },
      porEntidad: [...entidadMap.entries()]
        .map(([entidad, data]) => ({ entidad, ...data }))
        .sort((a, b) => b.unidades - a.unidades),
      porAlcaldia: [...alcaldiaMap.entries()]
        .map(([alcaldia, data]) => ({ alcaldia, ...data }))
        .sort((a, b) => b.unidades - a.unidades),
      inventarioPorCategoria: [...categoriaMap.entries()]
        .map(([categoria, data]) => ({
          categoria,
          unidades: data.unidades,
          productos: data.productos,
          proveedores: data.proveedores.size,
        }))
        .sort((a, b) => b.unidades - a.unidades),
      ubicaciones,
      operacionPorProveedor,
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

  async createUsuario(proveedorId: string, dto: CreateProveedorUsuarioDto) {
    await this.findOne(proveedorId);

    if (
      dto.rol !== RolUsuario.ADMIN_PROVEEDOR &&
      dto.rol !== RolUsuario.OPERADOR_PROVEEDOR
    ) {
      throw new BadRequestException('Rol no válido para portal de proveedor');
    }

    const email = dto.email.toLowerCase();
    const existing = await this.prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre: dto.nombre,
        rol: dto.rol,
        proveedorId,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });
  }

  async listUsuarios(proveedorId: string) {
    await this.findOne(proveedorId);
    return this.prisma.usuario.findMany({
      where: { proveedorId },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPerfilEmpresaAdmin(proveedorId: string) {
    await this.findOne(proveedorId);
    const portalService = await this.getPerfilEmpresaData(proveedorId);
    return portalService;
  }

  private async getPerfilEmpresaData(proveedorId: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: proveedorId },
      include: { perfilEmpresa: true },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

    const perfil = proveedor.perfilEmpresa;
    const horarioDefault = {
      dias: DIAS_DEFAULT.map((dia) => ({
        dia,
        abre: '09:00',
        cierra: '18:00',
        cerrado: dia === 'Domingo',
      })),
    };
    const horario =
      perfil?.horario && typeof perfil.horario === 'object'
        ? perfil.horario
        : horarioDefault;
    const redesSociales =
      perfil?.redesSociales && typeof perfil.redesSociales === 'object'
        ? perfil.redesSociales
        : {
            facebook: '',
            instagram: '',
            whatsapp: proveedor.telefono ?? '',
            tiktok: '',
            linkedin: '',
            sitioWeb: proveedor.sitioWeb ?? '',
          };
    const redes = (redesSociales ?? {}) as Record<string, string>;

    const checks = [
      !!proveedor.razonSocial,
      !!proveedor.rfc,
      !!proveedor.email,
      !!proveedor.direccion,
      !!perfil?.logoUrl,
      !!perfil?.politicasRenta,
      !!perfil?.condicionesCancelacion,
      !!(redes.instagram || redes.facebook || redes.whatsapp),
    ];

    return {
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        razonSocial: proveedor.razonSocial,
        rfc: proveedor.rfc,
        email: proveedor.email,
        telefono: proveedor.telefono,
        contacto: proveedor.contacto,
        direccion: proveedor.direccion,
        ciudad: proveedor.ciudad,
        entidadFederativa: proveedor.entidadFederativa,
        sitioWeb: proveedor.sitioWeb,
      },
      perfil: {
        logoUrl: perfil?.logoUrl ?? null,
        regimenFiscal: perfil?.regimenFiscal ?? null,
        codigoPostal: perfil?.codigoPostal ?? null,
        horario,
        redesSociales,
        politicasRenta: perfil?.politicasRenta ?? null,
        condicionesCancelacion: perfil?.condicionesCancelacion ?? null,
        ivaIncluido: perfil?.ivaIncluido ?? false,
        moneda: perfil?.moneda ?? 'MXN',
        updatedAt: perfil?.updatedAt ?? null,
      },
      completitudPerfilEmpresa: Math.round((checks.filter(Boolean).length / checks.length) * 100),
    };
  }
}
