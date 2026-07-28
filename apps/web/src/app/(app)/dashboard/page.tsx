'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, KpiCard, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_EVENTO_COLORS,
  ESTADO_EVENTO_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type { DashboardResumen } from '@/lib/types';

const modulos = [
  { href: '/agenda', label: 'Agenda', desc: 'Montajes y entregas', color: 'bg-indigo-50 text-indigo-800' },
  { href: '/eventos', label: 'Eventos', desc: 'Ciclo de vida del evento', color: 'bg-brand-50 text-brand-700' },
  { href: '/cotizaciones', label: 'Cotizaciones', desc: 'Propuestas comerciales', color: 'bg-amber-50 text-amber-800' },
  { href: '/logistica', label: 'Logística', desc: 'Rutas y checklist', color: 'bg-orange-50 text-orange-800' },
  { href: '/subarrendos', label: 'Subarrendos', desc: 'Proveedores externos', color: 'bg-purple-50 text-purple-800' },
  { href: '/finanzas', label: 'Finanzas', desc: 'Pagos y cobranza', color: 'bg-green-50 text-green-800' },
  { href: '/documentos', label: 'Documentos', desc: 'Contratos y recibos', color: 'bg-rose-50 text-rose-800' },
  { href: '/clientes', label: 'Clientes', desc: 'Expediente y historial', color: 'bg-blue-50 text-blue-800' },
  { href: '/inventario', label: 'Inventario', desc: 'Mobiliario y existencias', color: 'bg-emerald-50 text-emerald-800' },
  { href: '/proveedores', label: 'Proveedores', desc: 'Red de inventario', color: 'bg-teal-50 text-teal-800' },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<DashboardResumen>('/dashboard/resumen')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error de conexión'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Centro de operación — todo EventOS desde aquí"
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {modulos.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md ${m.color}`}
          >
            <p className="font-semibold">{m.label}</p>
            <p className="mt-1 text-xs opacity-80">{m.desc}</p>
          </Link>
        ))}
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-800">No se pudo conectar con la API</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <p className="mt-2 text-xs text-red-600">
            Asegúrate de tener corriendo: <code className="rounded bg-red-100 px-1">npm run dev:api</code>
          </p>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando indicadores...</p>
      ) : data ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Clientes" value={data.kpis.totalClientes} />
            <KpiCard label="Eventos activos" value={data.kpis.eventosActivos} />
            <KpiCard label="Ingresos del mes" value={formatMoney(data.kpis.ingresosMes)} />
            <KpiCard label="Cobranza pendiente" value={formatMoney(data.kpis.cobranzaPendiente)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Utilidad estimada" value={formatMoney(data.kpis.utilidadEstimada)} />
            <KpiCard label="Ocupación inventario" value={`${data.kpis.ocupacionInventario}%`} />
            <KpiCard label="Eventos este mes" value={data.kpis.eventosMes} />
            <KpiCard label="Cotiz. aprobadas" value={data.cotizacionesAprobadas} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Eventos por estado</h2>
              <div className="space-y-3">
                {data.eventosPorEstado.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin eventos registrados</p>
                ) : (
                  data.eventosPorEstado.map((item) => (
                    <div
                      key={item.estado}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <Badge className={ESTADO_EVENTO_COLORS[item.estado]}>
                        {ESTADO_EVENTO_LABELS[item.estado]}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-900">{item.cantidad}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Próximos eventos</h2>
                <Link href="/eventos" className="text-sm font-medium text-brand-600 hover:underline">
                  Ver todos
                </Link>
              </div>
              <div className="space-y-3">
                {data.proximosEventos.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay eventos próximos</p>
                ) : (
                  data.proximosEventos.map((evento) => (
                    <Link
                      key={evento.id}
                      href={`/eventos/${evento.id}`}
                      className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{evento.titulo}</p>
                          <p className="text-sm text-slate-500">
                            {evento.cliente?.nombre} · {formatFecha(evento.fechaEvento)}
                          </p>
                        </div>
                        <Badge className={ESTADO_EVENTO_COLORS[evento.estado]}>
                          {ESTADO_EVENTO_LABELS[evento.estado]}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Rentabilidad por evento</h2>
              <div className="space-y-3">
                {data.rentabilidadEventos.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin datos de rentabilidad</p>
                ) : (
                  data.rentabilidadEventos.map((ev) => (
                    <Link
                      key={ev.eventoId}
                      href={`/finanzas/${ev.eventoId}`}
                      className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300"
                    >
                      <p className="font-medium text-slate-900">{ev.titulo}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-600">
                        <span>Cotizado: {formatMoney(ev.cotizado)}</span>
                        <span>Pagado: {formatMoney(ev.pagado)}</span>
                        <span className="font-medium text-emerald-700">
                          Utilidad: {formatMoney(ev.utilidadCotizada)}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Ocupación de inventario</h2>
              <div className="space-y-3">
                {data.ocupacionPorProducto.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin productos activos</p>
                ) : (
                  data.ocupacionPorProducto.map((p) => (
                    <div key={p.productoId} className="rounded-xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{p.nombre}</p>
                        <span className="text-sm font-semibold text-slate-700">{p.porcentaje}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.min(p.porcentaje, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {p.reservado} de {p.total} unidades reservadas
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : !error ? (
        <p className="text-sm text-red-600">No se pudieron cargar los indicadores</p>
      ) : null}
    </>
  );
}
