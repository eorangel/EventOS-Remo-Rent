'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, EmptyState, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_SUSCRIPCION_COLORS,
  ESTADO_SUSCRIPCION_LABELS,
  METODO_PAGO_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type { EstadoSuscripcion, SuscripcionListItem, SuscripcionesResumen } from '@/lib/types';

export default function SuscripcionesPage() {
  const [items, setItems] = useState<SuscripcionListItem[]>([]);
  const [resumen, setResumen] = useState<SuscripcionesResumen | null>(null);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<'' | EstadoSuscripcion>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (estado) params.set('estado', estado);
    const query = params.toString() ? `?${params.toString()}` : '';

    Promise.all([
      apiFetch<SuscripcionListItem[]>(`/suscripciones${query}`),
      apiFetch<SuscripcionesResumen>('/suscripciones/resumen'),
    ])
      .then(([list, res]) => {
        setItems(list);
        setResumen(res);
      })
      .finally(() => setLoading(false));
  }, [search, estado]);

  return (
    <>
      <PageHeader
        title="Suscripciones"
        description="Panel administrativo de planes SaaS — empresas proveedoras, cobros recurrentes e historial de pagos"
      />

      {resumen && (
        <section className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white shadow-lg lg:p-8">
          <p className="text-sm text-brand-200/80">Facturación SaaS · Admin</p>
          <h2 className="mt-1 text-xl font-bold">Resumen de suscripciones</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Total empresas', value: resumen.total },
              { label: 'Activas', value: resumen.activas },
              { label: 'En prueba', value: resumen.prueba },
              { label: 'Suspendidas', value: resumen.suspendidas },
              { label: 'MRR estimado', value: formatMoney(resumen.mrr) },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-wider text-slate-300">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: '', label: 'Todos' },
              { id: 'ACTIVA', label: 'Activas' },
              { id: 'PRUEBA', label: 'Prueba' },
              { id: 'SUSPENDIDA', label: 'Suspendidas' },
              { id: 'CANCELADA', label: 'Canceladas' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id || 'all'}
              type="button"
              onClick={() => setEstado(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                estado === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Buscar empresa o plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-72"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando suscripciones...</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin suscripciones"
          description="Aún no hay empresas con plan asignado en la plataforma."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Empresa</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha de alta</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Próximo cobro</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Método de pago</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Pagos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/suscripciones/${item.id}`}
                        className="font-medium text-brand-700 hover:text-brand-900 hover:underline"
                      >
                        {item.empresa}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{item.plan}</div>
                      <div className="text-xs text-slate-500">
                        {formatMoney(item.precioMensual)}/mes
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={ESTADO_SUSCRIPCION_COLORS[item.estado]}>
                        {ESTADO_SUSCRIPCION_LABELS[item.estado]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatFecha(item.fechaAlta)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {item.proximoCobro ? formatFecha(item.proximoCobro) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.metodoPago ? METODO_PAGO_LABELS[item.metodoPago] : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                      {item.totalPagos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
