'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  formatMoney,
} from '@/lib/labels';
import type {
  Cotizacion,
  EstadoCotizacion,
  Producto,
  Proveedor,
} from '@/lib/types';

const ESTADOS: EstadoCotizacion[] = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA'];

export default function CotizacionDetallePage() {
  const params = useParams<{ id: string }>();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [nuevoItem, setNuevoItem] = useState({
    productoId: '',
    proveedorId: '',
    descripcion: '',
    cantidad: 1,
    costoUnitario: 0,
    esSubarrendo: false,
  });

  async function cargar() {
    if (!params.id) return;
    const cot = await apiFetch<Cotizacion>(`/cotizaciones/${params.id}`);
    setCotizacion(cot);

    if (cot.evento) {
      const inicio = cot.evento.fechaMontaje ?? cot.evento.fechaEvento;
      const fin = cot.evento.fechaDesmontaje ?? cot.evento.fechaEvento;
      const prods = await apiFetch<Producto[]>(
        `/productos/disponibilidad?fechaInicio=${encodeURIComponent(inicio)}&fechaFin=${encodeURIComponent(fin)}&excludeEventoId=${cot.eventoId}`,
      );
      setProductos(prods);
    }

    const provs = await apiFetch<Proveedor[]>('/proveedores?activo=true');
    setProveedores(provs.filter((p) => p.tipo === 'SUBARRENDO'));
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [params.id]);

  function seleccionarProducto(productoId: string) {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;
    setNuevoItem({
      ...nuevoItem,
      productoId,
      descripcion: producto.nombre,
      costoUnitario: Number(producto.costoUnitario),
      esSubarrendo: false,
      proveedorId: '',
    });
  }

  async function cambiarEstado(estado: EstadoCotizacion) {
    if (!cotizacion) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Cotizacion>(`/cotizaciones/${cotizacion.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      setCotizacion(updated);
    } finally {
      setSaving(false);
    }
  }

  async function agregarItem(e: React.FormEvent) {
    e.preventDefault();
    if (!cotizacion) return;
    setSaving(true);
    setError('');

    try {
      const updated = await apiFetch<Cotizacion>(`/cotizaciones/${cotizacion.id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          ...nuevoItem,
          productoId: nuevoItem.esSubarrendo ? undefined : nuevoItem.productoId || undefined,
          proveedorId: nuevoItem.esSubarrendo ? nuevoItem.proveedorId : undefined,
        }),
      });
      setCotizacion(updated);
      setNuevoItem({
        productoId: '',
        proveedorId: '',
        descripcion: '',
        cantidad: 1,
        costoUnitario: 0,
        esSubarrendo: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar ítem');
    } finally {
      setSaving(false);
    }
  }

  async function eliminarItem(itemId: string) {
    if (!cotizacion) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Cotizacion>(
        `/cotizaciones/${cotizacion.id}/items/${itemId}`,
        { method: 'DELETE' },
      );
      setCotizacion(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {loading ? (
      <p className="text-sm text-slate-500">Cargando cotización...</p>
      ) : !cotizacion ? (
      <p className="text-sm text-red-600">Cotización no encontrada</p>
      ) : (
      <>
      <PageHeader
      title={cotizacion.folio}
      description={
      <>
      Evento:{' '}
      <Link
      href={`/eventos/${cotizacion.eventoId}`}
      className="text-brand-600 hover:underline"
      >
      {cotizacion.evento?.titulo}
      </Link>
      {' · '}
      {cotizacion.evento?.cliente?.nombre}
      </>
      }
      action={
      <Badge className={ESTADO_COTIZACION_COLORS[cotizacion.estado]}>
      {ESTADO_COTIZACION_LABELS[cotizacion.estado]}
      </Badge>
      }
      />
      
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
      <Card>
      <p className="text-sm text-slate-500">Costo total</p>
      <p className="text-xl font-bold text-slate-900">
      {formatMoney(Number(cotizacion.subtotalCosto))}
      </p>
      </Card>
      <Card>
      <p className="text-sm text-slate-500">Venta total</p>
      <p className="text-xl font-bold text-slate-900">
      {formatMoney(Number(cotizacion.subtotalVenta))}
      </p>
      </Card>
      <Card>
      <p className="text-sm text-slate-500">Utilidad</p>
      <p className="text-xl font-bold text-emerald-700">
      {formatMoney(Number(cotizacion.utilidad))}
      </p>
      </Card>
      <Card>
      <p className="text-sm text-slate-500">Margen global</p>
      <p className="text-xl font-bold text-slate-900">
      {Number(cotizacion.margenGlobal)}%
      </p>
      </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Ítems</h2>
      {!cotizacion.items?.length ? (
      <p className="text-sm text-slate-500">Sin ítems en esta cotización.</p>
      ) : (
      <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
      <thead>
      <tr className="border-b border-slate-200 text-left text-slate-500">
      <th className="pb-2 pr-4">Descripción</th>
      <th className="pb-2 pr-4">Cant.</th>
      <th className="pb-2 pr-4">Costo</th>
      <th className="pb-2 pr-4">Margen</th>
      <th className="pb-2 pr-4">Precio</th>
      <th className="pb-2 pr-4">Subtotal</th>
      <th className="pb-2" />
      </tr>
      </thead>
      <tbody>
      {cotizacion.items.map((item) => (
      <tr key={item.id} className="border-b border-slate-100">
      <td className="py-3 pr-4">
      <p className="font-medium text-slate-900">{item.descripcion}</p>
      {item.esSubarrendo && (
      <Badge className="mt-1 bg-purple-100 text-purple-800">
      Subarrendo · {item.proveedor?.nombre}
      </Badge>
      )}
      </td>
      <td className="py-3 pr-4">{item.cantidad}</td>
      <td className="py-3 pr-4">{formatMoney(item.costoUnitario)}</td>
      <td className="py-3 pr-4">{item.margenPorcentaje}%</td>
      <td className="py-3 pr-4">{formatMoney(item.precioUnitario)}</td>
      <td className="py-3 pr-4 font-medium">
      {formatMoney(item.subtotal)}
      </td>
      <td className="py-3">
      <button
      onClick={() => eliminarItem(item.id)}
      disabled={saving}
      className="text-xs text-red-600 hover:underline"
      >
      Quitar
      </button>
      </td>
      </tr>
      ))}
      </tbody>
      </table>
      </div>
      )}
      </Card>
      
      <div className="space-y-6">
      <Card>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Estado</h2>
      <div className="space-y-2">
      {ESTADOS.map((estado) => (
      <Button
      key={estado}
      variant={cotizacion.estado === estado ? 'primary' : 'secondary'}
      disabled={saving || cotizacion.estado === estado}
      onClick={() => cambiarEstado(estado)}
      className="w-full justify-start"
      >
      {ESTADO_COTIZACION_LABELS[estado]}
      </Button>
      ))}
      </div>
      </Card>
      
      <Card>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Agregar ítem</h2>
      <form onSubmit={agregarItem} className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
      <input
      type="checkbox"
      checked={nuevoItem.esSubarrendo}
      onChange={(e) =>
      setNuevoItem({
      ...nuevoItem,
      esSubarrendo: e.target.checked,
      productoId: '',
      proveedorId: '',
      })
      }
      />
      Es subarrendo
      </label>
      
      {!nuevoItem.esSubarrendo ? (
      <div>
      <label className="mb-1 block text-sm text-slate-600">Producto</label>
      <select
      value={nuevoItem.productoId}
      onChange={(e) => seleccionarProducto(e.target.value)}
      className="w-full"
      required
      >
      <option value="">Seleccionar...</option>
      {productos.map((p) => (
      <option key={p.id} value={p.id}>
      {p.nombre} — disp. {p.cantidadDisponible ?? p.cantidadTotal}
      </option>
      ))}
      </select>
      </div>
      ) : (
      <div>
      <label className="mb-1 block text-sm text-slate-600">Proveedor</label>
      <select
      value={nuevoItem.proveedorId}
      onChange={(e) =>
      setNuevoItem({ ...nuevoItem, proveedorId: e.target.value })
      }
      className="w-full"
      required
      >
      <option value="">Seleccionar...</option>
      {proveedores.map((p) => (
      <option key={p.id} value={p.id}>
      {p.nombre}
      </option>
      ))}
      </select>
      <input
      className="mt-2 w-full"
      placeholder="Descripción del ítem"
      value={nuevoItem.descripcion}
      onChange={(e) =>
      setNuevoItem({ ...nuevoItem, descripcion: e.target.value })
      }
      required
      />
      </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
      <div>
      <label className="mb-1 block text-sm text-slate-600">Cantidad</label>
      <input
      type="number"
      min={1}
      value={nuevoItem.cantidad}
      onChange={(e) =>
      setNuevoItem({ ...nuevoItem, cantidad: Number(e.target.value) })
      }
      className="w-full"
      required
      />
      </div>
      <div>
      <label className="mb-1 block text-sm text-slate-600">Costo unit.</label>
      <input
      type="number"
      min={0}
      step="0.01"
      value={nuevoItem.costoUnitario}
      onChange={(e) =>
      setNuevoItem({
      ...nuevoItem,
      costoUnitario: Number(e.target.value),
      })
      }
      className="w-full"
      required
      />
      </div>
      </div>
      
      {error && (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
      {error}
      </div>
      )}
      
      <Button type="submit" disabled={saving} className="w-full">
      {saving ? 'Agregando...' : 'Agregar ítem'}
      </Button>
      </form>
      </Card>
      </div>
      </div>
      </>
      )}
    </>
  );
}
