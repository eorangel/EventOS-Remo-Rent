'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardFinancieroProveedor } from '@/components/DashboardFinancieroProveedor';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_ORDEN_COBRO_COLORS,
  ESTADO_ORDEN_COBRO_LABELS,
  ESTADO_VERIFICACION_COLORS,
  ESTADO_VERIFICACION_LABELS,
  formatMoney,
} from '@/lib/labels';
import type { PortalDashboard } from '@/lib/types';

export default function ProveedorDashboardPage() {
  const [data, setData] = useState<PortalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiFetch<PortalDashboard>('/portal/dashboard')
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader
        title={data?.proveedor.nombre ?? 'Mi negocio'}
        description="Tu centro de control — finanzas, clientes y operación en un vistazo"
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-800">No se pudo cargar el dashboard</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-80 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-2xl bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {data.financiero ? (
            <DashboardFinancieroProveedor data={data.financiero} />
          ) : (
            <Card className="border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-800">
                El resumen financiero no está disponible. Recarga la página o reinicia la API.
              </p>
            </Card>
          )}

          {data.financiero && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/proveedor/calendario"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700">
                ▦
              </span>
              <p className="mt-3 font-semibold text-slate-900 group-hover:text-teal-800">
                Calendario y agenda
              </p>
              <p className="mt-1 text-sm text-slate-500">Entregas, eventos y cobros del día</p>
            </Link>
            <Link
              href="/proveedor/clientes"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                ◎
              </span>
              <p className="mt-3 font-semibold text-slate-900 group-hover:text-teal-800">
                Clientes
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {data.resumen.clientesActivos} activos · CRM completo
              </p>
            </Link>
            <Link
              href="/proveedor/cotizaciones"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                ▤
              </span>
              <p className="mt-3 font-semibold text-slate-900 group-hover:text-teal-800">
                Cotizaciones
              </p>
              <p className="mt-1 text-sm text-slate-500">Propuestas con inventario en tiempo real</p>
            </Link>
            <Link
              href="/proveedor/cobros"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-sm font-bold text-amber-700">
                $
              </span>
              <p className="mt-3 font-semibold text-slate-900 group-hover:text-teal-800">
                Cobros
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {data.financiero ? formatMoney(data.financiero.saldoPendiente) : '—'} pendientes
              </p>
            </Link>
          </div>
          )}

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={
                    ESTADO_VERIFICACION_COLORS[data.proveedor.estadoVerificacion ?? 'BORRADOR']
                  }
                >
                  {ESTADO_VERIFICACION_LABELS[data.proveedor.estadoVerificacion ?? 'BORRADOR']}
                </Badge>
                <Badge className="bg-slate-100 text-slate-700">
                  {data.resumen.productosCatalogo} productos en catálogo
                </Badge>
              </div>
              <div className="min-w-[200px]">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-500">Completitud del perfil</span>
                  <span className="font-semibold text-teal-700">
                    {data.proveedor.completitudPerfil}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all"
                    style={{ width: `${data.proveedor.completitudPerfil}%` }}
                  />
                </div>
              </div>
              {data.proveedor.completitudPerfil < 100 && (
                <Link href="/proveedor/configuracion">
                  <Button variant="secondary">Completar perfil</Button>
                </Link>
              )}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Cobros recientes</h2>
              <Link href="/proveedor/cobros" className="text-sm text-teal-700 hover:underline">
                Ver todos →
              </Link>
            </div>
            {data.cobrosRecientes.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay órdenes de cobro</p>
            ) : (
              <div className="space-y-3">
                {data.cobrosRecientes.map((cobro) => (
                  <div
                    key={cobro.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50/30"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{cobro.concepto}</p>
                      <p className="text-sm text-slate-500">
                        {cobro.folio} · {cobro.clienteProveedor?.nombre ?? 'Cliente'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">
                        {formatMoney(cobro.monto)}
                      </span>
                      <Badge className={ESTADO_ORDEN_COBRO_COLORS[cobro.estado]}>
                        {ESTADO_ORDEN_COBRO_LABELS[cobro.estado]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
