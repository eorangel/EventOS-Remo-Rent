import { TipoServicioContrato } from '@prisma/client';
import { formatMoneyMx } from './cotizacion-proveedor.utils';

type CotizacionItemLite = {
  descripcion: string;
  menuBanqueteProveedorId?: string | null;
  servicioProveedorId?: string | null;
  productoProveedorId?: string | null;
  menuBanquete?: { nombre: string } | null;
  servicioProveedor?: { nombre: string } | null;
  productoProveedor?: { nombre: string } | null;
};

export function inferTipoServicioContrato(items: CotizacionItemLite[]): TipoServicioContrato {
  if (items.some((i) => i.menuBanqueteProveedorId)) return TipoServicioContrato.BANQUETE;
  if (items.some((i) => i.servicioProveedorId)) return TipoServicioContrato.SERVICIO;
  if (items.some((i) => i.productoProveedorId)) return TipoServicioContrato.RENTA_MOBILIARIO;
  return TipoServicioContrato.GENERAL;
}

export function inferServicioNombre(items: CotizacionItemLite[]): string | undefined {
  const menu = items.find((i) => i.menuBanquete?.nombre || i.menuBanqueteProveedorId);
  if (menu?.menuBanquete?.nombre) return menu.menuBanquete.nombre;

  const servicio = items.find((i) => i.servicioProveedor?.nombre || i.servicioProveedorId);
  if (servicio?.servicioProveedor?.nombre) return servicio.servicioProveedor.nombre;

  const producto = items.find((i) => i.productoProveedor?.nombre || i.productoProveedorId);
  if (producto?.productoProveedor?.nombre) return producto.productoProveedor.nombre;

  return items[0]?.descripcion;
}

export function formatFechaContrato(date: Date | null | undefined) {
  if (!date) return undefined;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(date);
}

export function formatFechaContratoInput(date: Date | null | undefined) {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10);
}

export function buildPrefillContratoDesdeCotizacion(input: {
  cliente: {
    nombre: string;
    empresa?: string | null;
    email?: string | null;
    telefono?: string | null;
  };
  fechaEvento?: Date | null;
  lugarEntrega?: string | null;
  total: number;
  moneda?: string;
  items: CotizacionItemLite[];
}) {
  return {
    clienteNombre: input.cliente.nombre,
    clienteEmpresa: input.cliente.empresa ?? undefined,
    clienteEmail: input.cliente.email ?? undefined,
    clienteTelefono: input.cliente.telefono ?? undefined,
    fechaEvento: formatFechaContrato(input.fechaEvento),
    fechaEventoInput: formatFechaContratoInput(input.fechaEvento),
    lugarEvento: input.lugarEntrega ?? undefined,
    montoTotal: formatMoneyMx(input.total, input.moneda ?? 'MXN'),
    servicioNombre: inferServicioNombre(input.items),
    tipoServicio: inferTipoServicioContrato(input.items),
  };
}

export function sugerirPlantillaId(
  plantillas: Array<{
    id: string;
    tipoServicio: TipoServicioContrato;
    servicioProveedorId?: string | null;
    menuBanqueteProveedorId?: string | null;
    estado: string;
  }>,
  tipo: TipoServicioContrato,
  items: CotizacionItemLite[],
) {
  const servicioId = items.find((i) => i.servicioProveedorId)?.servicioProveedorId;
  const menuId = items.find((i) => i.menuBanqueteProveedorId)?.menuBanqueteProveedorId;

  const byLinked = plantillas.find(
    (p) =>
      (servicioId && p.servicioProveedorId === servicioId) ||
      (menuId && p.menuBanqueteProveedorId === menuId),
  );
  if (byLinked) return byLinked.id;

  const activas = plantillas.filter((p) => p.estado === 'ACTIVA');
  const byTipo = activas.find((p) => p.tipoServicio === tipo);
  if (byTipo) return byTipo.id;

  const byTipoAny = plantillas.find((p) => p.tipoServicio === tipo);
  if (byTipoAny) return byTipoAny.id;

  return activas[0]?.id ?? plantillas[0]?.id;
}
