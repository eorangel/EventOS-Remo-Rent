'use client';

import Link from 'next/link';
import { MapaProveedoresMexico } from '@/components/MapaProveedoresMexico';
import { Badge, Card, KpiCard } from '@/components/ui';
import {
  ESTADO_VERIFICACION_COLORS,
  ESTADO_VERIFICACION_LABELS,
  TIPO_PROVEEDOR_LABELS,
  formatMoney,
} from '@/lib/labels';
import type { ResumenOperacionProveedores } from '@/lib/types';

function HorizontalBars({
  items,
  valueKey,
  labelKey,
  suffix = '',
}: {
  items: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  suffix?: string;
}) {
  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin datos</p>
      ) : (
        items.map((item, i) => {
          const value = Number(item[valueKey]) || 0;
          const pct = Math.round((value / max) * 100);
          return (
            <div key={i}>
              <div className="mb-1 flex justify-between gap-2 text-sm">
                <span className="truncate font-medium text-slate-700">{String(item[labelKey])}</span>
                <span className="shrink-0 text-slate-500">
                  {value.toLocaleString('es-MX')}
                  {suffix}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-700"
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

export function ProveedoresResumenOperacion({ data }: { data: ResumenOperacionProveedores }) {
  const r = data.resumen;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white shadow-lg lg:p-8">
        <p className="text-sm text-brand-200/80">Inteligencia de red · B2C</p>
        <h2 className="mt-1 text-xl font-bold">Resumen operativo de proveedores</h2>
        <p className="mt-1 text-sm text-slate-300">
          Inventario disponible, actividad comercial y cobertura geográfica para diseñar el producto B2C
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Empresas en red', value: r.totalProveedores, hint: `${r.activos} activas · ${r.verificados} verificadas` },
            { label: 'Unidades en inventario', value: r.unidadesInventario.toLocaleString('es-MX'), hint: `${r.productosCatalogados} productos · ${r.categoriasUnicas} categorías` },
            { label: 'Eventos operados', value: r.eventosOperados, hint: `${r.cotizacionesEmitidas} cotizaciones emitidas` },
            { label: 'Cobros en plataforma', value: formatMoney(r.montoCobrado), hint: `${r.cobrosPagados} pagados de ${r.cobrosGenerados}` },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wider text-slate-300">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
              <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Mapa de cobertura</h3>
          <p className="mb-4 text-sm text-slate-500">
            Ubicación de proveedores y radio de cobertura · {r.entidadesConPresencia} entidades con presencia
          </p>
          <MapaProveedoresMexico ubicaciones={data.ubicaciones} />
        </Card>

        <Card>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Inventario por categoría</h3>
          <p className="mb-4 text-sm text-slate-500">Qué hay disponible en la red para ofrecer al consumidor final</p>
          <HorizontalBars
            items={data.inventarioPorCategoria.slice(0, 8).map((c) => ({
              categoria: c.categoria,
              unidades: c.unidades,
            }))}
            valueKey="unidades"
            labelKey="categoria"
            suffix=" uds."
          />
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Top categorías · detalle
            </p>
            <div className="space-y-2">
              {data.inventarioPorCategoria.slice(0, 5).map((c) => (
                <div key={c.categoria} className="flex justify-between text-sm">
                  <span className="text-slate-700">{c.categoria}</span>
                  <span className="text-slate-500">
                    {c.proveedores} prov. · {c.productos} prod.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Inventario por alcaldía</h3>
          <p className="mb-4 text-sm text-slate-500">
            Desglose CDMX · {r.alcaldiasConPresencia} alcaldía(s) con proveedores — foco inicial B2C
          </p>
          {data.porAlcaldia.length === 0 ? (
            <p className="text-sm text-slate-500">
              Sin proveedores con alcaldía registrada en Ciudad de México
            </p>
          ) : (
            <>
              <HorizontalBars
                items={data.porAlcaldia.map((a) => ({
                  alcaldia: a.alcaldia,
                  unidades: a.unidades,
                }))}
                valueKey="unidades"
                labelKey="alcaldia"
                suffix=" uds."
              />
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="space-y-2">
                  {data.porAlcaldia.map((a) => (
                    <div key={a.alcaldia} className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{a.alcaldia}</span>
                      <span className="text-slate-500">
                        {a.proveedores} prov. · {a.productos} prod. · {a.unidades.toLocaleString('es-MX')} uds.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Inventario por región</h3>
          <p className="mb-4 text-sm text-slate-500">Dónde hay capacidad instalada para escalar B2C</p>
          <HorizontalBars
            items={data.porEntidad.map((e) => ({
              entidad: e.entidad,
              unidades: e.unidades,
            }))}
            valueKey="unidades"
            labelKey="entidad"
            suffix=" uds."
          />
        </Card>

        <Card>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Indicadores de red</h3>
          <p className="mb-4 text-sm text-slate-500">Salud operativa agregada</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard label="Entidades cubiertas" value={r.entidadesConPresencia} />
            <KpiCard label="Alcaldías CDMX" value={r.alcaldiasConPresencia} />
            <KpiCard label="Categorías activas" value={r.categoriasUnicas} />
            <KpiCard label="Cotizaciones" value={r.cotizacionesEmitidas} />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Operación por proveedor</h3>
        <p className="mb-4 text-sm text-slate-500">Detalle de actividad e inventario de cada empresa en la red</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Empresa</th>
                <th className="pb-3 pr-4 font-medium">Ubicación</th>
                <th className="pb-3 pr-4 font-medium">Alcaldía</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 pr-4 font-medium text-right">Inventario</th>
                <th className="pb-3 pr-4 font-medium text-right">Clientes</th>
                <th className="pb-3 pr-4 font-medium text-right">Eventos</th>
                <th className="pb-3 pr-4 font-medium text-right">Cobrado</th>
                <th className="pb-3 font-medium text-right">Radio</th>
              </tr>
            </thead>
            <tbody>
              {data.operacionPorProveedor.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/proveedores/${p.id}`} className="font-medium text-brand-700 hover:underline">
                      {p.nombre}
                    </Link>
                    <p className="text-xs text-slate-500">{TIPO_PROVEEDOR_LABELS[p.tipo]}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {[p.ciudad, p.entidad].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{p.alcaldia ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <Badge className={ESTADO_VERIFICACION_COLORS[p.estadoVerificacion as keyof typeof ESTADO_VERIFICACION_COLORS] ?? 'bg-slate-100 text-slate-700'}>
                      {ESTADO_VERIFICACION_LABELS[p.estadoVerificacion as keyof typeof ESTADO_VERIFICACION_LABELS] ?? p.estadoVerificacion}
                    </Badge>
                    {!p.activo && <span className="ml-1 text-xs text-red-500">Inactiva</span>}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="font-medium text-slate-900">{p.unidades.toLocaleString('es-MX')}</span>
                    <span className="block text-xs text-slate-500">{p.productos} prod.</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-700">{p.clientes}</td>
                  <td className="py-3 pr-4 text-right text-slate-700">{p.eventos}</td>
                  <td className="py-3 pr-4 text-right font-medium text-slate-900">
                    {formatMoney(p.montoCobrado)}
                    <span className="block text-xs font-normal text-slate-500">{p.cobrosPagados} cobros</span>
                  </td>
                  <td className="py-3 text-right text-slate-600">
                    {p.radioCoberturaKm ? `${p.radioCoberturaKm} km` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
