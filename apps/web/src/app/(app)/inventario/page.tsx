'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { formatMoney } from '@/lib/labels';
import type { Producto } from '@/lib/types';

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    apiFetch<Producto[]>(`/productos${query}`)
      .then(setProductos)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error de conexión'))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Control de mobiliario, existencias y disponibilidad"
        action={
          <Link href="/inventario/nuevo">
            <Button>Nuevo producto</Button>
          </Link>
        }
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-800">No se pudo cargar el inventario</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <p className="mt-2 text-xs text-red-600">
            Verifica que la API esté corriendo: <code className="rounded bg-red-100 px-1">npm run dev:api</code>
          </p>
        </Card>
      )}

      <div className="mb-6">
        <input
          type="search"
          placeholder="Buscar por código, nombre o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando inventario...</p>
      ) : error ? null : productos.length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="Registra mobiliario para usarlo en cotizaciones."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Existencias
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Costo / Renta
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{producto.nombre}</p>
                    <p className="text-sm text-slate-500">{producto.codigo}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {producto.categoria ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {producto.cantidadTotal}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p>{formatMoney(Number(producto.costoUnitario))} costo</p>
                    <p>{formatMoney(Number(producto.precioRenta))} renta</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        producto.activo
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }
                    >
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
