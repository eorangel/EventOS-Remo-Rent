'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, EmptyState, KpiCard, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ENTIDADES_FEDERATIVAS,
  ESTADO_VERIFICACION_COLORS,
  ESTADO_VERIFICACION_LABELS,
  TIPO_PROVEEDOR_LABELS,
} from '@/lib/labels';
import type { MetricasCapturaProveedores, Proveedor } from '@/lib/types';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [metricas, setMetricas] = useState<MetricasCapturaProveedores | null>(null);
  const [search, setSearch] = useState('');
  const [entidad, setEntidad] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (entidad) params.set('entidadFederativa', entidad);
    const q = params.toString() ? `?${params}` : '';

    Promise.all([
      apiFetch<Proveedor[]>(`/proveedores${q}`),
      apiFetch<MetricasCapturaProveedores>('/proveedores/metricas/captura'),
    ])
      .then(([prov, met]) => {
        setProveedores(prov);
        setMetricas(met);
      })
      .finally(() => setLoading(false));
  }, [search, entidad]);

  return (
    <>
      <PageHeader
        title="Red de proveedores"
        description="Base de datos de inventario para eventos — captura y catalogación"
        action={
          <Link href="/proveedores/nuevo">
            <Button>Registrar proveedor</Button>
          </Link>
        }
      />

      {metricas && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Proveedores activos" value={metricas.totalProveedores} />
          <KpiCard label="Productos catalogados" value={metricas.productosCatalogo} />
          <KpiCard label="Completitud promedio" value={`${metricas.completitudPromedio}%`} />
          <KpiCard label="Verificados" value={metricas.verificados} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar empresa, contacto, ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
        <select
          value={entidad}
          onChange={(e) => setEntidad(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las entidades</option>
          {ENTIDADES_FEDERATIVAS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando red de proveedores...</p>
      ) : proveedores.length === 0 ? (
        <EmptyState
          title="Sin proveedores"
          description="Comienza a construir el catálogo nacional de inventario para eventos."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proveedores.map((proveedor) => (
            <Link
              key={proveedor.id}
              href={`/proveedores/${proveedor.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">{proveedor.nombre}</h2>
                  {proveedor.razonSocial && (
                    <p className="text-sm text-slate-500">{proveedor.razonSocial}</p>
                  )}
                </div>
                <Badge className={ESTADO_VERIFICACION_COLORS[proveedor.estadoVerificacion ?? 'BORRADOR']}>
                  {ESTADO_VERIFICACION_LABELS[proveedor.estadoVerificacion ?? 'BORRADOR']}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                {[proveedor.ciudad, proveedor.entidadFederativa].filter(Boolean).join(', ') || 'Ubicación pendiente'}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge className="bg-slate-100 text-slate-700">
                  {proveedor._count?.productos ?? 0} productos
                </Badge>
                <Badge className="bg-slate-100 text-slate-700">
                  {TIPO_PROVEEDOR_LABELS[proveedor.tipo]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
