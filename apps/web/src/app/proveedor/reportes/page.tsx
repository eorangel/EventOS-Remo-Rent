'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_EVENTO_PROVEEDOR_COLORS,
  ESTADO_EVENTO_PROVEEDOR_LABELS,
  formatFechaCorta,
  formatMoney,
} from '@/lib/labels';
import type { PortalReportes } from '@/lib/types';

const AreaTrendChart = dynamic(
  () => import('@/components/ReportesCharts').then((m) => m.AreaTrendChart),
  { ssr: false },
);
const ColumnChart = dynamic(
  () => import('@/components/ReportesCharts').then((m) => m.ColumnChart),
  { ssr: false },
);
const DonutChart = dynamic(
  () => import('@/components/ReportesCharts').then((m) => m.DonutChart),
  { ssr: false },
);
const HorizontalCompareChart = dynamic(
  () => import('@/components/ReportesCharts').then((m) => m.HorizontalCompareChart),
  { ssr: false },
);

function RankedList<T>({
  items,
  renderPrimary,
  renderSecondary,
  renderValue,
  formatValue,
  max,
}: {
  items: T[];
  renderPrimary: (item: T, index: number) => string;
  renderSecondary: (item: T) => string;
  renderValue: (item: T) => number;
  formatValue?: (value: number) => string;
  max?: number;
}) {
  const list = max ? items.slice(0, max) : items;
  const top = Math.max(...list.map((item) => renderValue(item)), 1);
  const fmt = formatValue ?? ((v: number) => v.toLocaleString('es-MX'));

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Sin datos todavía</p>
      ) : (
        list.map((item, index) => {
          const value = renderValue(item);
          const pct = Math.round((value / top) * 100);
          return (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-teal-200"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{renderPrimary(item, index)}</p>
                    <p className="text-xs text-slate-500">{renderSecondary(item)}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-teal-700">
                  {fmt(value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ChartPanel({
  title,
  hint,
  children,
  className = '',
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mb-3 text-[11px] text-slate-400">{hint}</p>
      {children}
    </div>
  );
}

export default function ProveedorReportesPage() {
  const [data, setData] = useState<PortalReportes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiFetch<PortalReportes>('/portal/reportes')
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar reportes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Vistazo general de clientes, productos, ventas y eventos"
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-800">No se pudieron cargar los reportes</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <Button type="button" variant="secondary" className="mt-3" onClick={retry}>
            Reintentar
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 rounded-2xl bg-slate-200" />
            <div className="h-96 rounded-2xl bg-slate-200" />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-teal-100 bg-gradient-to-br from-teal-50 to-white">
              <p className="text-sm font-medium text-teal-800/70">Ventas (6 meses)</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatMoney(data.resumen.totalVentas)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-slate-500">Eventos registrados</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{data.resumen.totalEventos}</p>
              <p className="mt-1 text-xs text-slate-500">
                {data.eventos.resumen.proximos} próximos
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-slate-500">Unidades rentadas</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {data.resumen.productosRentados}
              </p>
              <p className="mt-1 text-xs text-slate-500">En cotizaciones aprobadas/enviadas</p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-slate-500">Clientes activos</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {data.resumen.clientesConActividad}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Top clientes</h2>
              <p className="mb-4 text-sm text-slate-500">Por ingresos cobrados</p>
              <ChartPanel
                title="Participación en ingresos"
                hint="¿Quién aporta más a tu facturación?"
                className="mb-5"
              >
                <DonutChart
                  segments={data.topClientes.map((c) => ({
                    label: c.nombre,
                    value: c.totalCobrado,
                  }))}
                  centerValue={formatMoney(data.resumen.totalVentas)}
                  centerLabel="Total 6 meses"
                />
              </ChartPanel>
              <HorizontalCompareChart
                items={data.topClientes.map((c) => ({
                  label: c.nombre,
                  value: c.totalCobrado,
                  display: formatMoney(c.totalCobrado),
                }))}
              />
              <div className="mt-5 border-t border-slate-100 pt-5">
                <RankedList
                  items={data.topClientes}
                  renderPrimary={(c) => c.nombre}
                  renderSecondary={(c) =>
                    `${c.cobrosPagados} cobro(s) · ${c.eventos} evento(s)`
                  }
                  renderValue={(c) => c.totalCobrado}
                  formatValue={(v) => formatMoney(v)}
                  max={5}
                />
              </div>
            </Card>

            <Card>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Productos más rentados</h2>
              <p className="mb-4 text-sm text-slate-500">Por cantidad en cotizaciones confirmadas</p>
              <ChartPanel
                title="Comparativa de unidades"
                hint="¿Qué mobiliario se renta más?"
                className="mb-5"
              >
                <HorizontalCompareChart
                  items={data.productosMasRentados.map((p) => ({
                    label: p.nombre,
                    value: p.cantidadRentada,
                    display: `${p.cantidadRentada} uds.`,
                  }))}
                />
              </ChartPanel>
              <ChartPanel
                title="Mix de productos"
                hint="Proporción del catálogo rentado"
              >
                <DonutChart
                  segments={data.productosMasRentados.map((p) => ({
                    label: p.nombre,
                    value: p.cantidadRentada,
                  }))}
                  centerValue={`${data.resumen.productosRentados}`}
                  centerLabel="Unidades"
                  size={140}
                  strokeWidth={18}
                />
              </ChartPanel>
              <div className="mt-5 border-t border-slate-100 pt-5">
                <RankedList
                  items={data.productosMasRentados}
                  renderPrimary={(p) => p.nombre}
                  renderSecondary={(p) => `${formatMoney(p.ingresosEstimados)} en cotizaciones`}
                  renderValue={(p) => p.cantidadRentada}
                  formatValue={(v) => `${v} uds.`}
                  max={5}
                />
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Ventas por mes</h2>
              <p className="mb-4 text-sm text-slate-500">Cobros pagados · últimos 6 meses</p>
              <ChartPanel
                title="Tendencia de ingresos"
                hint="Evolución mes a mes"
                className="mb-5"
              >
                <AreaTrendChart
                  data={data.ventasPorMes}
                  valueKey="monto"
                  labelKey="mesLabel"
                  formatValue={(v) => formatMoney(v)}
                />
              </ChartPanel>
              <ChartPanel title="Barras mensuales" hint="Comparación directa entre meses">
                <ColumnChart
                  data={data.ventasPorMes}
                  valueKey="monto"
                  labelKey="mesLabel"
                  formatValue={(v) => formatMoney(v)}
                  gradientFrom="#0d9488"
                  gradientTo="#5eead4"
                />
              </ChartPanel>
            </Card>

            <Card>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Eventos</h2>
              <p className="mb-4 text-sm text-slate-500">Actividad y estado · últimos 6 meses</p>
              <ChartPanel
                title="Eventos por mes"
                hint="Volumen de operación"
                className="mb-5"
              >
                <ColumnChart
                  data={data.eventos.porMes}
                  valueKey="cantidad"
                  labelKey="mesLabel"
                  gradientFrom="#2563eb"
                  gradientTo="#93c5fd"
                />
              </ChartPanel>
              <ChartPanel
                title="Estado de eventos"
                hint="¿Cuántos en cada etapa?"
                className="mb-5"
              >
                <DonutChart
                  segments={[
                    {
                      label: 'Confirmados',
                      value: data.eventos.resumen.confirmados,
                      color: '#3b82f6',
                    },
                    {
                      label: 'En ejecución',
                      value: data.eventos.resumen.enEjecucion,
                      color: '#8b5cf6',
                    },
                    {
                      label: 'Completados',
                      value: data.eventos.resumen.completados,
                      color: '#10b981',
                    },
                    {
                      label: 'Otros',
                      value: Math.max(
                        0,
                        data.eventos.resumen.total -
                          data.eventos.resumen.confirmados -
                          data.eventos.resumen.enEjecucion -
                          data.eventos.resumen.completados,
                      ),
                      color: '#94a3b8',
                    },
                  ].filter((s) => s.value > 0)}
                  centerValue={String(data.eventos.resumen.total)}
                  centerLabel="Eventos"
                  size={140}
                  strokeWidth={18}
                />
              </ChartPanel>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-50 text-blue-800">
                  {data.eventos.resumen.confirmados} confirmados
                </Badge>
                <Badge className="bg-violet-50 text-violet-800">
                  {data.eventos.resumen.enEjecucion} en ejecución
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-800">
                  {data.eventos.resumen.completados} completados
                </Badge>
                <Badge className="bg-amber-50 text-amber-800">
                  {data.eventos.resumen.proximos} próximos
                </Badge>
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Eventos recientes</h2>
                <p className="text-sm text-slate-500">Últimos eventos registrados</p>
              </div>
              <Link href="/proveedor/calendario" className="text-sm text-teal-700 hover:underline">
                Ver calendario →
              </Link>
            </div>
            {data.eventos.recientes.length === 0 ? (
              <p className="text-sm text-slate-500">Sin eventos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="pb-3 pr-4 font-medium">Evento</th>
                      <th className="pb-3 pr-4 font-medium">Cliente</th>
                      <th className="pb-3 pr-4 font-medium">Fecha</th>
                      <th className="pb-3 pr-4 font-medium">Estado</th>
                      <th className="pb-3 font-medium text-right">Monto est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.eventos.recientes.map((ev) => (
                      <tr key={ev.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-slate-900">{ev.titulo}</p>
                          {ev.lugar && (
                            <p className="text-xs text-slate-500">{ev.lugar}</p>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Link
                            href={`/proveedor/clientes/${ev.clienteId}`}
                            className="text-teal-700 hover:underline"
                          >
                            {ev.clienteNombre}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {formatFechaCorta(ev.fecha)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={ESTADO_EVENTO_PROVEEDOR_COLORS[ev.estado]}>
                            {ESTADO_EVENTO_PROVEEDOR_LABELS[ev.estado]}
                          </Badge>
                        </td>
                        <td className="py-3 text-right font-medium text-slate-900">
                          {ev.montoEstimado != null ? formatMoney(ev.montoEstimado) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
