import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber, roundMoney } from '../common/utils/pricing';
import { CreateMenuBanqueteDto, PlatilloMenuDto, UpdateMenuBanqueteDto } from './dto/banquete.dto';

const menuInclude = {
  platillos: { orderBy: { orden: 'asc' as const } },
};

@Injectable()
export class CatalogoBanqueteService {
  constructor(private prisma: PrismaService) {}

  private mapMenu<T extends {
    precioPorPersona: unknown;
    precioPorEvento: unknown;
    platillos: unknown[];
  }>(row: T) {
    return {
      ...row,
      precioPorPersona:
        row.precioPorPersona != null ? toNumber(row.precioPorPersona as never) : null,
      precioPorEvento:
        row.precioPorEvento != null ? toNumber(row.precioPorEvento as never) : null,
    };
  }

  private validatePrecios(dto: { precioPorPersona?: number | null; precioPorEvento?: number | null }) {
    const porPersona = dto.precioPorPersona ?? null;
    const porEvento = dto.precioPorEvento ?? null;
    if (porPersona == null && porEvento == null) {
      throw new BadRequestException('Indica precio por persona, por evento, o ambos');
    }
    if (porPersona != null && porPersona < 0) {
      throw new BadRequestException('Precio por persona inválido');
    }
    if (porEvento != null && porEvento < 0) {
      throw new BadRequestException('Precio por evento inválido');
    }
  }

  private normalizePlatillos(platillos?: PlatilloMenuDto[]) {
    return (platillos ?? [])
      .filter((p) => p.nombre?.trim())
      .map((p, i) => ({
        seccion: p.seccion,
        nombre: p.nombre.trim(),
        descripcion: p.descripcion?.trim() || undefined,
        orden: p.orden ?? i,
      }));
  }

  async listMenus(proveedorId: string) {
    const rows = await this.prisma.menuBanqueteProveedor.findMany({
      where: { proveedorId },
      include: menuInclude,
      orderBy: { nombre: 'asc' },
    });
    return rows.map((r) => this.mapMenu(r));
  }

  async getMenu(proveedorId: string, id: string) {
    const row = await this.prisma.menuBanqueteProveedor.findFirst({
      where: { id, proveedorId },
      include: menuInclude,
    });
    if (!row) throw new NotFoundException('Menú de banquete no encontrado');
    return this.mapMenu(row);
  }

  async createMenu(proveedorId: string, dto: CreateMenuBanqueteDto) {
    this.validatePrecios(dto);
    const platillos = this.normalizePlatillos(dto.platillos);
    const row = await this.prisma.menuBanqueteProveedor.create({
      data: {
        proveedorId,
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion?.trim(),
        precioPorPersona: dto.precioPorPersona ?? null,
        precioPorEvento: dto.precioPorEvento ?? null,
        minimoPersonas: dto.minimoPersonas,
        incluyeBebidas: dto.incluyeBebidas ?? false,
        incluyeMeseros: dto.incluyeMeseros ?? false,
        notas: dto.notas?.trim(),
        activo: dto.activo ?? true,
        platillos: platillos.length ? { create: platillos } : undefined,
      },
      include: menuInclude,
    });
    return this.mapMenu(row);
  }

  async updateMenu(proveedorId: string, id: string, dto: UpdateMenuBanqueteDto) {
    const existing = await this.getMenu(proveedorId, id);
    if (dto.precioPorPersona !== undefined || dto.precioPorEvento !== undefined) {
      this.validatePrecios({
        precioPorPersona:
          dto.precioPorPersona !== undefined ? dto.precioPorPersona : existing.precioPorPersona,
        precioPorEvento:
          dto.precioPorEvento !== undefined ? dto.precioPorEvento : existing.precioPorEvento,
      });
    }

    if (dto.platillos) {
      await this.prisma.platilloMenuBanquete.deleteMany({ where: { menuId: id } });
      const platillos = this.normalizePlatillos(dto.platillos);
      if (platillos.length) {
        await this.prisma.platilloMenuBanquete.createMany({
          data: platillos.map((p) => ({ ...p, menuId: id })),
        });
      }
    }

    const row = await this.prisma.menuBanqueteProveedor.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion?.trim() || null } : {}),
        ...(dto.precioPorPersona !== undefined ? { precioPorPersona: dto.precioPorPersona } : {}),
        ...(dto.precioPorEvento !== undefined ? { precioPorEvento: dto.precioPorEvento } : {}),
        ...(dto.minimoPersonas !== undefined ? { minimoPersonas: dto.minimoPersonas } : {}),
        ...(dto.incluyeBebidas !== undefined ? { incluyeBebidas: dto.incluyeBebidas } : {}),
        ...(dto.incluyeMeseros !== undefined ? { incluyeMeseros: dto.incluyeMeseros } : {}),
        ...(dto.notas !== undefined ? { notas: dto.notas?.trim() || null } : {}),
        ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
      },
      include: menuInclude,
    });
    return this.mapMenu(row);
  }

  async removeMenu(proveedorId: string, id: string) {
    await this.getMenu(proveedorId, id);
    return this.prisma.menuBanqueteProveedor.delete({ where: { id } });
  }

  /** Resuelve línea de cotización desde menú de banquete. */
  resolveMenuLine(
    menu: {
      id: string;
      nombre: string;
      precioPorPersona: number | null;
      precioPorEvento: number | null;
      minimoPersonas: number | null;
    },
    modalidad: 'POR_PERSONA' | 'POR_EVENTO',
    cantidad: number,
    precioUnitarioOverride?: number,
  ) {
    if (modalidad === 'POR_PERSONA') {
      if (menu.precioPorPersona == null) {
        throw new BadRequestException(`El menú "${menu.nombre}" no tiene precio por persona`);
      }
      const personas = Math.max(cantidad, menu.minimoPersonas ?? 1);
      const precio = roundMoney(precioUnitarioOverride ?? menu.precioPorPersona);
      return {
        menuBanqueteProveedorId: menu.id,
        modalidadPrecioMenu: 'POR_PERSONA' as const,
        descripcion: `${menu.nombre} (por persona)`,
        cantidad: personas,
        precioUnitario: precio,
        subtotal: roundMoney(precio * personas),
      };
    }

    if (menu.precioPorEvento == null) {
      throw new BadRequestException(`El menú "${menu.nombre}" no tiene precio por evento`);
    }
    const precio = roundMoney(precioUnitarioOverride ?? menu.precioPorEvento);
    return {
      menuBanqueteProveedorId: menu.id,
      modalidadPrecioMenu: 'POR_EVENTO' as const,
      descripcion: `${menu.nombre} (por evento)`,
      cantidad: 1,
      precioUnitario: precio,
      subtotal: precio,
    };
  }
}
