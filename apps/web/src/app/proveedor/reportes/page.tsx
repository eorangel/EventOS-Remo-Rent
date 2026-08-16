'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  ESTADO_EVENTO_PROVEEDOR_COLORS,
  ESTADO_EVENTO_PROVEEDOR_LABELS,
  formatFechaCorta,
  formatMoney,
} from '@/lib/labels';
import type { PortalReporteOperacion, PortalReportes } from '@/lib/types';

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

function estadoOperacionLabel(op: PortalReporteOperacion) {
  if (op.tipo === 'cotizacion') {
    const estado = op.estado as keyof typeof ESTADO_COTIZACION_LABELS;
    return ESTADO_COTIZACION_LABELS[estado] ?? op.estado;
  }
  const estado = op.estado as keyof typeof ESTADO_EVENTO_PROVEEDOR_LABELS;
  return ESTADO_EVENTO_PROVEEDOR_LABELS[estado] ?? op.estado;
}

function estadoOperacionColor(op: PortalReporteOperacion) {
  if (op.tipo === 'cotizacion') {
    const estado = op.estado as keyof typeof ESTADO_COTIZACION_COLORS;
    return ESTADO_COTIZACION_COLORS[estado] ?? 'bg-slate-100 text-slate-700';
  }
  const estado = op.estado as keyof typeof ESTADO_EVENTO_PROVEEDOR_COLORS;
  return ESTADO_EVENTO_PROVEEDOR_COLORS[estado] ?? 'bg-slate-100 text-slate-700';
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
        description="Visibilidad de cotizaciones, cobros, eventos y catálogo en operación"
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
        (() => {
          const ops = data.operaciones ?? {
            resumen: {
              total: data.eventos.resumen.total,
              eventosRegistrados: data.eventos.resumen.total,
              cotizacionesActivas: data.resumen.cotizacionesActivas ?? 0,
              cotizacionesBorrador: 0,
              cotizacionesEnviadas: 0,
              cotizacionesAprobadas: 0,
              confirmados: data.eventos.resumen.confirmados,
              enEjecucion: data.eventos.resumen.enEjecucion,
              completados: data.eventos.resumen.completados,
              proximos: data.eventos.resumen.proximos,
            },
            porMes: data.eventos.porMes,
            recientes: data.eventos.recientes,
          };
          const recientes = ops.recientes;

          return (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-teal-100 bg-gradient-to-br from-teal-50 to-white">
              <p className="text-sm font-medium text-teal-800/70">Ventas cobradas (6 meses)</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatMoney(data.resumen.totalVentas)}
              </p>
              {data.resumen.totalPipeline != null && data.resumen.totalPipeline > 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  {formatMoney(data.resumen.totalPipeline)} por cobrar
                </p>
              )}
            </Card>
            <Card>
              <p className="text-sm font-medium text-slate-500">Operaciones activas</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {data.resumen.totalOperaciones ?? data.resumen.totalEventos}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {ops.resumen.eventosRegistrados} eventos · {ops.resumen.cotizacionesActivas} cotizaciones
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-slate-500">Unidades en cotizaciones</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {data.resumen.productosRentados}
              </p>
              <p className="mt-1 text-xs text-slate-500">Incluye borradores, enviadas y aprobadas</p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-slate-500">Clientes con actividad</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {data.resumen.clientesConActividad}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Top clientes</h2>
              <p className="mb-4 text-sm text-slate-500">Por ingresos cobrados y cotizaciones activas</p>
              <ChartPanel
                title="Participación en ingresos"
                hint="Cobros pagados en los últimos 6 meses"
                className="mb-5"
              >
                <DonutChart
                  segments={data.topClientes
                    .filter((c) => c.totalCobrado > 0)
                    .map((c) => ({
                      label: c.nombre,
                      value: c.totalCobrado,
                    }))}
                  centerValue={formatMoney(data.resumen.totalVentas)}
                  centerLabel="Cobrado 6 meses"
                />
              </ChartPanel>
              <HorizontalCompareChart
                items={data.topClientes.map((c) => ({
                  label: c.nombre,
                  value: c.totalCobrado + (c.totalCotizado ?? 0),
                  display: formatMoney(c.totalCobrado + (c.totalCotizado ?? 0)),
                }))}
              />
              <div className="mt-5 border-t border-slate-100 pt-5">
                <RankedList
                  items={data.topClientes}
                  renderPrimary={(c) => c.nombre}
                  renderSecondary={(c) =>
                    `${c.cobrosPagados} cobro(s) · ${c.cotizaciones ?? 0} cotiz. · ${c.eventos} evento(s)`
                  }
                  renderValue={(c) => c.totalCobrado + (c.totalCotizado ?? 0)}
                  formatValue={(v) => formatMoney(v)}
                  max={5}
                />
              </div>
            </Card>

            <Card>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Productos más rentados</h2>
              <p className="mb-4 text-sm text-slate-500">Por cantidad en cotizaciones activas</p>
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
              {data.pipelinePorMes && data.pipelinePorMes.some((p) => p.monto > 0) && (
                <ChartPanel
                  title="Por cobrar"
                  hint="Cobros pendientes por mes de vencimiento"
                  className="mt-5"
                >
                  <ColumnChart
                    data={data.pipelinePorMes}
                    valueKey="monto"
                    labelKey="mesLabel"
                    formatValue={(v) => formatMoney(v)}
                    gradientFrom="#f59e0b"
                    gradientTo="#fcd34d"
                  />
                </ChartPanel>
              )}
            </Card>

            <Card>
              <h2 className="mb-1 text-lg font-semibold text-slate-900">Operaciones</h2>
              <p className="mb-4 text-sm text-slate-500">Eventos y cotizaciones · últimos 6 meses</p>
              <ChartPanel
                title="Operaciones por mes"
                hint="Volumen de actividad"
                className="mb-5"
              >
                <ColumnChart
                  data={ops.porMes}
                  valueKey="cantidad"
                  labelKey="mesLabel"
                  gradientFrom="#2563eb"
                  gradientTo="#93c5fd"
                />
              </ChartPanel>
              <ChartPanel
                title="Mix operativo"
                hint="Eventos vs cotizaciones activas"
                className="mb-5"
              >
                <DonutChart
                  segments={[
                    {
                      label: 'Eventos',
                      value: ops.resumen.eventosRegistrados,
                      color: '#3b82f6',
                    },
                    {
                      label: 'Cotizaciones',
                      value: ops.resumen.cotizacionesActivas,
                      color: '#8b5cf6',
                    },
                  ].filter((s) => s.value > 0)}
                  centerValue={String(ops.resumen.total)}
                  centerLabel="Total"
                  size={140}
                  strokeWidth={18}
                />
              </ChartPanel>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-50 text-blue-800">
                  {ops.resumen.confirmados} eventos confirmados
                </Badge>
                <Badge className="bg-violet-50 text-violet-800">
                  {ops.resumen.cotizacionesEnviadas} cotiz. enviadas
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-800">
                  {ops.resumen.cotizacionesAprobadas} cotiz. aprobadas
                </Badge>
                <Badge className="bg-amber-50 text-amber-800">
                  {ops.resumen.proximos} próximos
                </Badge>
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Actividad reciente</h2>
                <p className="text-sm text-slate-500">Eventos y cotizaciones más recientes</p>
              </div>
              <Link href="/proveedor/calendario" className="text-sm text-teal-700 hover:underline">
                Ver calendario →
              </Link>
            </div>
            {recientes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Sin operaciones registradas. Crea una cotización o un evento en Clientes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="pb-3 pr-4 font-medium">Operación</th>
                      <th className="pb-3 pr-4 font-medium">Cliente</th>
                      <th className="pb-3 pr-4 font-medium">Fecha</th>
                      <th className="pb-3 pr-4 font-medium">Estado</th>
                      <th className="pb-3 font-medium text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.map((ev) => (
                      <tr key={`${ev.tipo}-${ev.id}`} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-start gap-2">
                            <Badge className={ev.tipo === 'cotizacion' ? 'bg-violet-50 text-violet-800' : 'bg-blue-50 text-blue-800'}>
                              {ev.tipo === 'cotizacion' ? 'Cotización' : 'Evento'}
                            </Badge>
                            <div>
                              {ev.enlace ? (
                                <Link href={ev.enlace} className="font-medium text-slate-900 hover:text-teal-700">
                                  {ev.titulo}
                                </Link>
                              ) : (
                                <p className="font-medium text-slate-900">{ev.titulo}</p>
                              )}
                              {ev.lugar && (
                                <p className="text-xs text-slate-500">{ev.lugar}</p>
                              )}
                            </div>
                          </div>
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
                          <Badge className={estadoOperacionColor(ev)}>
                            {estadoOperacionLabel(ev)}
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
          );
        })()
      ) : null}
    </>
  );
}
