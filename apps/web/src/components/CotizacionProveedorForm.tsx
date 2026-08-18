'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { abrirPdfHtml, calcTotalesCotizacion, rangoFechaConsulta } from '@/lib/cotizacion-proveedor';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  MODALIDAD_PRECIO_MENU_LABELS,
  formatMoney,
} from '@/lib/labels';
import type {
  ClienteProveedor,
  CotizacionPdfResponse,
  CotizacionProveedor,
  EstadoCotizacion,
  MenuBanqueteProveedor,
  ModalidadPrecioMenu,
  PerfilEmpresaResponse,
  ProductoProveedorInventario,
  ServicioProveedor,
} from '@/lib/types';

type LineItem = {
  key: string;
  productoProveedorId?: string;
  servicioProveedorId?: string;
  menuBanqueteProveedorId?: string;
  modalidadPrecioMenu?: ModalidadPrecioMenu;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
};

type Props = {
  mode: 'create' | 'edit';
  cotizacionId?: string;
  initialClienteId?: string;
  initialData?: CotizacionProveedor;
};

function newLine(): LineItem {
  return {
    key: crypto.randomUUID(),
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
  };
}

function subtotalLinea(line: LineItem) {
  return (Number(line.cantidad) || 0) * (Number(line.precioUnitario) || 0);
}

function tipoLinea(line: LineItem): { label: string; className: string } {
  if (line.menuBanqueteProveedorId) {
    return { label: 'Menú', className: 'bg-amber-100 text-amber-800' };
  }
  if (line.servicioProveedorId) {
    return { label: 'Servicio', className: 'bg-violet-100 text-violet-800' };
  }
  if (line.productoProveedorId) {
    return { label: 'Producto', className: 'bg-teal-100 text-teal-800' };
  }
  return { label: 'Manual', className: 'bg-slate-100 text-slate-600' };
}

export function CotizacionProveedorForm({
  mode,
  cotizacionId,
  initialClienteId,
  initialData,
}: Props) {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteProveedor[]>([]);
  const [productos, setProductos] = useState<ProductoProveedorInventario[]>([]);
  const [servicios, setServicios] = useState<ServicioProveedor[]>([]);
  const [menus, setMenus] = useState<MenuBanqueteProveedor[]>([]);
  const [perfil, setPerfil] = useState<PerfilEmpresaResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const [clienteProveedorId, setClienteProveedorId] = useState(
    initialData?.clienteProveedorId ?? initialClienteId ?? '',
  );
  const [clienteMode, setClienteMode] = useState<'existing' | 'new'>(
    initialClienteId || initialData?.clienteProveedorId ? 'existing' : 'existing',
  );
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
  });
  const [titulo, setTitulo] = useState(initialData?.titulo ?? '');
  const [estado, setEstado] = useState<EstadoCotizacion>(initialData?.estado ?? 'BORRADOR');
  const [fechaEvento, setFechaEvento] = useState(
    initialData?.fechaEvento ? initialData.fechaEvento.slice(0, 10) : '',
  );
  const [lugarEntrega, setLugarEntrega] = useState(initialData?.lugarEntrega ?? '');
  const [costoEnvio, setCostoEnvio] = useState(String(initialData?.costoEnvio ?? 0));
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(
    String(initialData?.descuentoPorcentaje ?? 0),
  );
  const [ivaPorcentaje, setIvaPorcentaje] = useState(String(initialData?.ivaPorcentaje ?? 16));
  const [ivaIncluido, setIvaIncluido] = useState(initialData?.ivaIncluido ?? false);
  const [validoHasta, setValidoHasta] = useState(
    initialData?.validoHasta ? initialData.validoHasta.slice(0, 10) : '',
  );
  const [notas, setNotas] = useState(initialData?.notas ?? '');
  const [lines, setLines] = useState<LineItem[]>(
    initialData?.items?.length
      ? initialData.items.map((i) => ({
          key: i.id ?? crypto.randomUUID(),
          productoProveedorId: i.productoProveedorId ?? undefined,
          servicioProveedorId: i.servicioProveedorId ?? undefined,
          menuBanqueteProveedorId: i.menuBanqueteProveedorId ?? undefined,
          modalidadPrecioMenu: i.modalidadPrecioMenu ?? undefined,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
        }))
      : [newLine()],
  );
  const [productoPick, setProductoPick] = useState('');
  const [servicioPick, setServicioPick] = useState('');
  const [menuPick, setMenuPick] = useState('');
  const [menuModalidad, setMenuModalidad] = useState<ModalidadPrecioMenu>('POR_PERSONA');

  useEffect(() => {
    apiFetch<ClienteProveedor[]>('/portal/clientes').then((c) =>
      setClientes(c.filter((x) => x.activo)),
    );
    apiFetch<ServicioProveedor[]>('/portal/servicios').then((s) =>
      setServicios(s.filter((x) => x.activo)),
    );
    apiFetch<MenuBanqueteProveedor[]>('/portal/menus-banquete').then((m) =>
      setMenus(m.filter((x) => x.activo)),
    );
    apiFetch<PerfilEmpresaResponse>('/portal/empresa').then((e) => {
      setPerfil(e);
      if (mode === 'create' && e.perfil.ivaIncluido) {
        setIvaIncluido(true);
      }
    });
  }, [mode]);

  useEffect(() => {
    if (!fechaEvento) {
      apiFetch<ProductoProveedorInventario[]>('/portal/productos').then((p) =>
        setProductos(
          p.filter((x) => x.activo).map((x) => ({
            ...x,
            cantidadTotal: x.cantidadDisponible,
            cantidadReservada: 0,
          })),
        ),
      );
      return;
    }

    const { fechaInicio, fechaFin } = rangoFechaConsulta(fechaEvento);
    const exclude = cotizacionId ? `&excludeCotizacionId=${cotizacionId}` : '';
    apiFetch<ProductoProveedorInventario[]>(
      `/portal/productos/disponibilidad?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}${exclude}`,
    ).then(setProductos);
  }, [fechaEvento, cotizacionId]);

  const totales = useMemo(
    () =>
      calcTotalesCotizacion(
        lines.map((l) => ({ cantidad: l.cantidad, precioUnitario: l.precioUnitario })),
        Number(costoEnvio) || 0,
        Number(descuentoPorcentaje) || 0,
        Number(ivaPorcentaje) || 0,
        ivaIncluido,
      ),
    [lines, costoEnvio, descuentoPorcentaje, ivaPorcentaje, ivaIncluido],
  );

  function agregarProducto() {
    const prod = productos.find((p) => p.id === productoPick);
    if (!prod) return;
    if (fechaEvento && prod.cantidadDisponible <= 0) {
      alert(`No hay unidades disponibles de "${prod.nombre}" en esa fecha.`);
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        productoProveedorId: prod.id,
        descripcion: prod.nombre,
        cantidad: 1,
        precioUnitario: prod.precioReferencia,
      },
    ]);
    setProductoPick('');
  }

  function agregarServicio() {
    const serv = servicios.find((s) => s.id === servicioPick);
    if (!serv) return;
    setLines((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        servicioProveedorId: serv.id,
        descripcion: serv.nombre,
        cantidad: 1,
        precioUnitario: serv.precioReferencia ?? 0,
      },
    ]);
    setServicioPick('');
  }

  function modalidadesMenu(menu: MenuBanqueteProveedor): ModalidadPrecioMenu[] {
    const opts: ModalidadPrecioMenu[] = [];
    if (menu.precioPorPersona != null) opts.push('POR_PERSONA');
    if (menu.precioPorEvento != null) opts.push('POR_EVENTO');
    return opts;
  }

  function agregarMenu() {
    const menu = menus.find((m) => m.id === menuPick);
    if (!menu) return;
    const opts = modalidadesMenu(menu);
    const modalidad = opts.includes(menuModalidad) ? menuModalidad : opts[0];
    if (!modalidad) {
      alert('Este menú no tiene precios configurados');
      return;
    }
    const precio =
      modalidad === 'POR_PERSONA'
        ? (menu.precioPorPersona ?? 0)
        : (menu.precioPorEvento ?? 0);
    const cantidad =
      modalidad === 'POR_PERSONA'
        ? Math.max(menu.minimoPersonas ?? 1, 1)
        : 1;
    setLines((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        menuBanqueteProveedorId: menu.id,
        modalidadPrecioMenu: modalidad,
        descripcion: `${menu.nombre} (${MODALIDAD_PRECIO_MENU_LABELS[modalidad].toLowerCase()})`,
        cantidad,
        precioUnitario: precio,
      },
    ]);
    setMenuPick('');
  }

  function actualizarLinea(key: string, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function eliminarLinea(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  }

  function payloadItems() {
    return lines
      .filter((l) => l.descripcion.trim())
      .map((l) => ({
        productoProveedorId: l.productoProveedorId,
        servicioProveedorId: l.servicioProveedorId,
        menuBanqueteProveedorId: l.menuBanqueteProveedorId,
        modalidadPrecioMenu: l.modalidadPrecioMenu,
        descripcion: l.descripcion.trim(),
        cantidad: Number(l.cantidad),
        precioUnitario: Number(l.precioUnitario),
      }));
  }

  function inventarioLinea(line: LineItem) {
    if (!line.productoProveedorId || !fechaEvento) return null;
    const prod = productos.find((p) => p.id === line.productoProveedorId);
    if (!prod) return null;
    const usadoEnLineas = lines
      .filter((l) => l.productoProveedorId === line.productoProveedorId)
      .reduce((acc, l) => acc + l.cantidad, 0);
    return { prod, usadoEnLineas, excede: usadoEnLineas > prod.cantidadDisponible };
  }

  async function guardar(enviar = false) {
    const items = payloadItems();
    if (mode === 'create') {
      if (clienteMode === 'existing' && !clienteProveedorId) {
        alert('Selecciona un cliente');
        return;
      }
      if (clienteMode === 'new' && !nuevoCliente.nombre.trim()) {
        alert('Ingresa el nombre del cliente');
        return;
      }
    } else if (!clienteProveedorId) {
      alert('Selecciona un cliente');
      return;
    }
    if (!items.length) {
      alert('Agrega al menos un concepto');
      return;
    }
    if (fechaEvento) {
      const porProducto = new Map<string, number>();
      for (const item of items) {
        if (!item.productoProveedorId) continue;
        porProducto.set(
          item.productoProveedorId,
          (porProducto.get(item.productoProveedorId) ?? 0) + item.cantidad,
        );
      }
      for (const [pid, cantidad] of porProducto) {
        const prod = productos.find((p) => p.id === pid);
        if (prod && cantidad > prod.cantidadDisponible) {
          alert(
            `"${prod.nombre}": solo hay ${prod.cantidadDisponible} disponible(s) en esa fecha (${prod.cantidadReservada} de ${prod.cantidadTotal} rentadas).`,
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      const body = {
        ...(mode === 'create'
          ? clienteMode === 'existing'
            ? { clienteProveedorId }
            : {
                cliente: {
                  nombre: nuevoCliente.nombre.trim(),
                  empresa: nuevoCliente.empresa.trim() || undefined,
                  email: nuevoCliente.email.trim() || undefined,
                  telefono: nuevoCliente.telefono.trim() || undefined,
                },
              }
          : {}),
        titulo: titulo || undefined,
        estado: enviar ? 'ENVIADA' : estado,
        fechaEvento: fechaEvento ? new Date(fechaEvento).toISOString() : undefined,
        lugarEntrega: lugarEntrega || undefined,
        costoEnvio: Number(costoEnvio) || 0,
        descuentoPorcentaje: Number(descuentoPorcentaje) || 0,
        ivaPorcentaje: Number(ivaPorcentaje) || 16,
        ivaIncluido,
        validoHasta: validoHasta ? new Date(validoHasta).toISOString() : undefined,
        notas: notas || undefined,
        items,
      };

      if (mode === 'create') {
        const created = await apiFetch<CotizacionProveedor>('/portal/cotizaciones', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (created.ordenCobroId) {
          router.replace(`/proveedor/cobros?cobro=${created.ordenCobroId}&desde=cotizacion`);
        } else {
          router.replace(`/proveedor/cotizaciones/${created.id}`);
        }
      } else if (cotizacionId) {
        await apiFetch(`/portal/cotizaciones/${cotizacionId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        if (enviar) setEstado('ENVIADA');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function generarPdf() {
    if (mode === 'create' || !cotizacionId) {
      await guardar(false);
      return;
    }
    setGenerandoPdf(true);
    try {
      const doc = await apiFetch<CotizacionPdfResponse>(
        `/portal/cotizaciones/${cotizacionId}/pdf`,
        { method: 'POST' },
      );
      abrirPdfHtml(doc.html, doc.titulo);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo generar el PDF');
    } finally {
      setGenerandoPdf(false);
    }
  }

  const menuSeleccionado = menus.find((m) => m.id === menuPick);
  const modalidadesDisponibles = menuSeleccionado ? modalidadesMenu(menuSeleccionado) : [];

  return (
    <div className="pb-24 lg:pb-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
        <div className="min-w-0 space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Cliente y evento</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {mode === 'create' ? (
              <>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setClienteMode('existing')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      clienteMode === 'existing'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Cliente existente
                  </button>
                  <button
                    type="button"
                    onClick={() => setClienteMode('new')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      clienteMode === 'new'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    + Nuevo cliente
                  </button>
                </div>
                {clienteMode === 'existing' ? (
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-sm text-slate-600">Cliente</span>
                    <select
                      value={clienteProveedorId}
                      onChange={(e) => setClienteProveedorId(e.target.value)}
                      className="w-full text-sm"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                          {c.empresa ? ` — ${c.empresa}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-sm text-slate-600">Nombre *</span>
                      <input
                        value={nuevoCliente.nombre}
                        onChange={(e) =>
                          setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                        }
                        placeholder="Nombre del cliente"
                        className="w-full text-sm"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-600">Empresa</span>
                      <input
                        value={nuevoCliente.empresa}
                        onChange={(e) =>
                          setNuevoCliente({ ...nuevoCliente, empresa: e.target.value })
                        }
                        className="w-full text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-slate-600">Teléfono</span>
                      <input
                        value={nuevoCliente.telefono}
                        onChange={(e) =>
                          setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })
                        }
                        className="w-full text-sm"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-sm text-slate-600">Correo</span>
                      <input
                        type="email"
                        value={nuevoCliente.email}
                        onChange={(e) =>
                          setNuevoCliente({ ...nuevoCliente, email: e.target.value })
                        }
                        className="w-full text-sm"
                      />
                    </label>
                  </>
                )}
              </>
            ) : (
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm text-slate-600">Cliente</span>
                <select
                  value={clienteProveedorId}
                  onChange={(e) => setClienteProveedorId(e.target.value)}
                  disabled
                  className="w-full text-sm"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                      {c.empresa ? ` — ${c.empresa}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm text-slate-600">Título / concepto</span>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Boda 180 invitados — mobiliario"
                className="w-full text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-600">Fecha del evento</span>
              <input
                type="date"
                value={fechaEvento}
                onChange={(e) => setFechaEvento(e.target.value)}
                className="w-full text-sm"
              />
              {fechaEvento && (
                <span className="mt-1 block text-xs text-teal-700">
                  El inventario incluye todas las cotizaciones (incluso borradores) en esa fecha
                </span>
              )}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-600">Válida hasta</span>
              <input
                type="date"
                value={validoHasta}
                onChange={(e) => setValidoHasta(e.target.value)}
                className="w-full text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm text-slate-600">Lugar de entrega</span>
              <input
                value={lugarEntrega}
                onChange={(e) => setLugarEntrega(e.target.value)}
                placeholder="Dirección de montaje o entrega"
                className="w-full text-sm"
              />
            </label>
          </div>
        </Card>

        <Card>
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Conceptos</h2>
            <span className="text-sm text-slate-500">
              {lines.filter((l) => l.descripcion.trim()).length} línea(s)
            </span>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Agrega productos, servicios o menús del catálogo, o captura líneas manuales.
          </p>

          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Agregar del catálogo
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">Producto</label>
                <div className="flex gap-2">
                  <select
                    value={productoPick}
                    onChange={(e) => setProductoPick(e.target.value)}
                    className="min-w-0 flex-1 text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — {formatMoney(p.precioReferencia)}
                        {fechaEvento
                          ? ` · disp. ${p.cantidadDisponible}/${p.cantidadTotal ?? p.cantidadDisponible}`
                          : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 px-3"
                    onClick={agregarProducto}
                    disabled={!productoPick}
                    aria-label="Agregar producto"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">Servicio</label>
                <div className="flex gap-2">
                  <select
                    value={servicioPick}
                    onChange={(e) => setServicioPick(e.target.value)}
                    className="min-w-0 flex-1 text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                        {s.precioReferencia != null ? ` — ${formatMoney(s.precioReferencia)}` : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 px-3"
                    onClick={agregarServicio}
                    disabled={!servicioPick}
                    aria-label="Agregar servicio"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">Menú de banquete</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={menuPick}
                    onChange={(e) => {
                      setMenuPick(e.target.value);
                      const m = menus.find((x) => x.id === e.target.value);
                      if (m) {
                        const opts = modalidadesMenu(m);
                        if (opts.length) setMenuModalidad(opts[0]);
                      }
                    }}
                    className="min-w-0 flex-1 text-sm"
                  >
                    <option value="">Seleccionar menú...</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                        {m.precioPorPersona != null
                          ? ` · ${formatMoney(m.precioPorPersona)}/pers.`
                          : ''}
                        {m.precioPorEvento != null
                          ? ` · ${formatMoney(m.precioPorEvento)}/evt.`
                          : ''}
                      </option>
                    ))}
                  </select>
                  {modalidadesDisponibles.length > 1 && (
                    <select
                      value={menuModalidad}
                      onChange={(e) =>
                        setMenuModalidad(e.target.value as ModalidadPrecioMenu)
                      }
                      className="w-full text-sm sm:w-40"
                    >
                      {modalidadesDisponibles.map((o) => (
                        <option key={o} value={o}>
                          {MODALIDAD_PRECIO_MENU_LABELS[o]}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 sm:w-auto"
                    onClick={agregarMenu}
                    disabled={!menuPick}
                  >
                    Agregar menú
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setLines((p) => [...p, newLine()])}
              >
                + Línea manual
              </Button>
            </div>
          </div>

          {lines.length > 0 && (
            <div className="mb-2 hidden gap-2 px-1 text-xs font-medium text-slate-500 md:grid md:grid-cols-[minmax(0,1fr)_72px_96px_96px_36px]">
              <span>Descripción</span>
              <span className="text-center">Cant.</span>
              <span className="text-right">P. unit.</span>
              <span className="text-right">Subtotal</span>
              <span />
            </div>
          )}

          <div className="space-y-3">
            {lines.map((line, index) => {
              const inv = inventarioLinea(line);
              const tipo = tipoLinea(line);
              const subtotal = subtotalLinea(line);

              return (
                <div
                  key={line.key}
                  className={`rounded-xl border ${
                    inv?.excede ? 'border-red-300 bg-red-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Vista móvil / tablet pequeña */}
                  <div className="space-y-3 p-3 md:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${tipo.className}`}
                        >
                          {tipo.label}
                        </span>
                        {line.menuBanqueteProveedorId && line.modalidadPrecioMenu && (
                          <span className="text-xs text-slate-500">
                            {MODALIDAD_PRECIO_MENU_LABELS[line.modalidadPrecioMenu]}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarLinea(line.key)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Eliminar línea"
                      >
                        ×
                      </button>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        Descripción
                      </span>
                      <input
                        value={line.descripcion}
                        onChange={(e) =>
                          actualizarLinea(line.key, { descripcion: e.target.value })
                        }
                        placeholder="Concepto"
                        className="w-full text-sm"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          {line.modalidadPrecioMenu === 'POR_PERSONA' ? 'Personas' : 'Cantidad'}
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={line.cantidad}
                          onChange={(e) =>
                            actualizarLinea(line.key, {
                              cantidad: Number(e.target.value) || 1,
                            })
                          }
                          className="w-full text-sm"
                          disabled={
                            line.modalidadPrecioMenu === 'POR_EVENTO' &&
                            Boolean(line.menuBanqueteProveedorId)
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          Precio unit.
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.precioUnitario}
                          onChange={(e) =>
                            actualizarLinea(line.key, {
                              precioUnitario: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full text-sm"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-xs font-medium text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
                    </div>

                    {inv?.excede && (
                      <p className="text-xs text-red-700">
                        Excede disponibilidad: {inv.usadoEnLineas} solicitadas,{' '}
                        {inv.prod.cantidadDisponible} disponibles
                      </p>
                    )}
                  </div>

                  {/* Vista desktop */}
                  <div className="hidden gap-2 p-3 md:grid md:grid-cols-[minmax(0,1fr)_72px_96px_96px_36px] md:items-start">
                    <div className="min-w-0 space-y-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${tipo.className}`}
                        >
                          {tipo.label}
                        </span>
                        {line.menuBanqueteProveedorId && line.modalidadPrecioMenu && (
                          <span className="text-xs text-slate-500">
                            {MODALIDAD_PRECIO_MENU_LABELS[line.modalidadPrecioMenu]}
                            {line.modalidadPrecioMenu === 'POR_EVENTO' ? ' · cant. 1' : ''}
                          </span>
                        )}
                      </div>
                      <input
                        value={line.descripcion}
                        onChange={(e) =>
                          actualizarLinea(line.key, { descripcion: e.target.value })
                        }
                        placeholder="Descripción"
                        className="w-full text-sm"
                      />
                      {inv?.excede && (
                        <p className="text-xs text-red-700">
                          Excede disponibilidad ({inv.usadoEnLineas}/{inv.prod.cantidadDisponible})
                        </p>
                      )}
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={line.cantidad}
                      onChange={(e) =>
                        actualizarLinea(line.key, { cantidad: Number(e.target.value) || 1 })
                      }
                      className="text-center text-sm"
                      title={
                        line.modalidadPrecioMenu === 'POR_PERSONA' ? 'Personas' : 'Cantidad'
                      }
                      disabled={
                        line.modalidadPrecioMenu === 'POR_EVENTO' &&
                        Boolean(line.menuBanqueteProveedorId)
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.precioUnitario}
                      onChange={(e) =>
                        actualizarLinea(line.key, {
                          precioUnitario: Number(e.target.value) || 0,
                        })
                      }
                      className="text-right text-sm"
                      title="Precio unitario"
                    />
                    <p className="pt-2 text-right text-sm font-semibold text-slate-900">
                      {formatMoney(subtotal)}
                    </p>
                    <button
                      type="button"
                      onClick={() => eliminarLinea(line.key)}
                      className="mx-auto rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Quitar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {lines.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
              Agrega al menos un concepto del catálogo o una línea manual.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Notas</h2>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Condiciones especiales, tiempos de montaje, etc."
            className="w-full text-sm"
          />
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        {mode === 'edit' && initialData && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-sm text-slate-500">{initialData.folio}</p>
                <Badge className={ESTADO_COTIZACION_COLORS[estado]}>
                  {ESTADO_COTIZACION_LABELS[estado]}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {perfil && (
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Tu contacto en la cotización</h2>
            <p className="text-sm text-slate-500">
              Contacto para el cliente. Al generar el PDF también se incluyen tus políticas de renta y
              cancelación si las tienes configuradas.
            </p>
            <div className="mt-3 space-y-1 text-sm text-slate-800">
              <p className="font-medium">{perfil.proveedor.nombre}</p>
              {perfil.proveedor.contacto && (
                <p className="text-slate-600">{perfil.proveedor.contacto}</p>
              )}
              <p className="text-slate-600">
                {[perfil.proveedor.email, perfil.proveedor.telefono, perfil.proveedor.sitioWeb]
                  .filter(Boolean)
                  .join(' · ') || 'Sin correo ni teléfono'}
              </p>
            </div>
            <Link
              href="/proveedor/configuracion"
              className="mt-3 inline-block text-sm font-medium text-teal-700 hover:text-teal-900"
            >
              Editar en configuración →
            </Link>
          </Card>
        )}

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Totales</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
            <label className="block">
              <span className="mb-1 block text-slate-600">Costo de envío</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={costoEnvio}
                onChange={(e) => setCostoEnvio(e.target.value)}
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-slate-600">Descuento (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={descuentoPorcentaje}
                onChange={(e) => setDescuentoPorcentaje(e.target.value)}
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-slate-600">IVA (%)</span>
              <input
                type="number"
                min={0}
                step="0.5"
                value={ivaPorcentaje}
                onChange={(e) => setIvaPorcentaje(e.target.value)}
                className="w-full"
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
              <input
                type="checkbox"
                checked={ivaIncluido}
                onChange={(e) => setIvaIncluido(e.target.checked)}
              />
              <span>IVA incluido en precios</span>
            </label>
          </div>

          <dl className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Subtotal conceptos</dt>
              <dd className="font-medium">{formatMoney(totales.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Envío</dt>
              <dd>{formatMoney(Number(costoEnvio) || 0)}</dd>
            </div>
            {totales.descuentoMonto > 0 && (
              <div className="flex justify-between gap-4 text-emerald-700">
                <dt>Descuento</dt>
                <dd>-{formatMoney(totales.descuentoMonto)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">IVA</dt>
              <dd>{formatMoney(totales.montoIva)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <dt>Total</dt>
              <dd>{formatMoney(totales.total)}</dd>
            </div>
          </dl>
        </Card>

        <div className="hidden flex-col gap-2 lg:flex">
          <Button onClick={() => guardar(false)} disabled={saving}>
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear cotización' : 'Guardar cambios'}
          </Button>
          {mode === 'edit' && (
            <>
              <Button variant="secondary" onClick={() => guardar(true)} disabled={saving}>
                Marcar como enviada
              </Button>
              <Button variant="secondary" onClick={generarPdf} disabled={generandoPdf || saving}>
                {generandoPdf ? 'Generando...' : 'Generar PDF'}
              </Button>
            </>
          )}
        </div>
      </div>
      </div>

      {/* Barra fija en móvil / tablet */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">Total cotización</p>
            <p className="truncate text-lg font-bold text-slate-900">
              {formatMoney(totales.total)}
            </p>
          </div>
          <Button
            onClick={() => guardar(false)}
            disabled={saving}
            className="shrink-0"
          >
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </div>
        {mode === 'edit' && (
          <div className="mx-auto mt-2 flex max-w-lg gap-2">
            <Button
              variant="secondary"
              className="flex-1 text-sm"
              onClick={() => guardar(true)}
              disabled={saving}
            >
              Enviar
            </Button>
            <Button
              variant="secondary"
              className="flex-1 text-sm"
              onClick={generarPdf}
              disabled={generandoPdf || saving}
            >
              PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
