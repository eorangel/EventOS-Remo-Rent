'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProveedoresResumenOperacion } from '@/components/ProveedoresResumenOperacion';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ALCALDIAS_CDMX,
  ENTIDADES_FEDERATIVAS,
  ESTADO_VERIFICACION_COLORS,
  ESTADO_VERIFICACION_LABELS,
  TIPO_PROVEEDOR_LABELS,
  esCiudadDeMexico,
} from '@/lib/labels';
import type { Proveedor, ResumenOperacionProveedores } from '@/lib/types';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [resumen, setResumen] = useState<ResumenOperacionProveedores | null>(null);
  const [search, setSearch] = useState('');
  const [entidad, setEntidad] = useState('');
  const [alcaldia, setAlcaldia] = useState('');
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<'resumen' | 'directorio'>('resumen');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (entidad) params.set('entidadFederativa', entidad);
    if (alcaldia) params.set('alcaldia', alcaldia);
    const q = params.toString() ? `?${params}` : '';

    Promise.all([
      apiFetch<Proveedor[]>(`/proveedores${q}`),
      apiFetch<ResumenOperacionProveedores>('/proveedores/resumen/operacion'),
    ])
      .then(([prov, res]) => {
        setProveedores(prov);
        setResumen(res);
      })
      .finally(() => setLoading(false));
  }, [search, entidad, alcaldia]);

  return (
    <>
      <PageHeader
        title="Proveedores"
        description="Red de inventario, cobertura geográfica y operación — base para el producto B2C"
        action={
          <Link href="/proveedores/nuevo">
            <Button>Registrar proveedor</Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVista('resumen')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            vista === 'resumen'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Resumen operativo
        </button>
        <button
          type="button"
          onClick={() => setVista('directorio')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            vista === 'directorio'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Directorio
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-72 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-80 rounded-2xl bg-slate-200" />
            <div className="h-80 rounded-2xl bg-slate-200" />
          </div>
        </div>
      ) : vista === 'resumen' && resumen ? (
        <ProveedoresResumenOperacion data={resumen} />
      ) : (
        <>
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
              onChange={(e) => {
                setEntidad(e.target.value);
                setAlcaldia('');
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Todas las entidades</option>
              {ENTIDADES_FEDERATIVAS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            {esCiudadDeMexico(entidad) && (
              <select
                value={alcaldia}
                onChange={(e) => setAlcaldia(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Todas las alcaldías</option>
                {ALCALDIAS_CDMX.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            )}
          </div>

          {proveedores.length === 0 ? (
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
                    {[proveedor.alcaldia, proveedor.ciudad, proveedor.entidadFederativa]
                      .filter(Boolean)
                      .join(', ') || 'Ubicación pendiente'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge className="bg-slate-100 text-slate-700">
                      {proveedor._count?.productos ?? 0} productos
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700">
                      {TIPO_PROVEEDOR_LABELS[proveedor.tipo]}
                    </Badge>
                    {proveedor.radioCoberturaKm && (
                      <Badge className="bg-brand-50 text-brand-700">
                        {proveedor.radioCoberturaKm} km cobertura
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
