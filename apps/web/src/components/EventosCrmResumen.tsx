'use client';

import { Card, KpiCard } from '@/components/ui';
import type { EventosCrmResumen } from '@/lib/types';

function MesChart({ data }: { data: EventosCrmResumen['porMes'] }) {
  const max = Math.max(...data.map((d) => d.plataforma + d.proveedor), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const total = item.plataforma + item.proveedor;
        const pct = Math.round((total / max) * 100);
        const platPct = total > 0 ? Math.round((item.plataforma / total) * 100) : 0;

        return (
          <div key={item.mes}>
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="font-medium capitalize text-slate-700">{item.mesLabel}</span>
              <span className="shrink-0 text-slate-500">
                {total} evento{total !== 1 ? 's' : ''}
                {total > 0 && (
                  <span className="ml-2 text-xs text-slate-400">
                    ({item.plataforma} plataforma · {item.proveedor} proveedor)
                  </span>
                )}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-brand-500 transition-all duration-700"
                style={{ width: `${pct * (platPct / 100)}%` }}
              />
              <div
                className="h-full bg-violet-400 transition-all duration-700"
                style={{ width: `${pct * ((100 - platPct) / 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EventosCrmResumenPanel({ data }: { data: EventosCrmResumen }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white shadow-lg lg:p-8">
        <p className="text-sm text-brand-200/80">Registro central · CRM</p>
        <h2 className="mt-1 text-xl font-bold">Todos los eventos del ecosistema</h2>
        <p className="mt-1 text-sm text-slate-300">
          Eventos levantados en Remo&amp;Rent y en los portales de proveedores, unificados en una sola vista
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total registrados',
              value: data.total.toLocaleString('es-MX'),
              hint: `${data.plataforma} plataforma · ${data.proveedor} proveedor`,
            },
            {
              label: 'Completados',
              value: data.completados.toLocaleString('es-MX'),
              hint: 'Eventos cerrados exitosamente',
            },
            {
              label: 'Próximos',
              value: data.proximos.toLocaleString('es-MX'),
              hint: 'Con fecha futura y sin cancelar',
            },
            {
              label: 'Este mes',
              value: data.registradosMes.toLocaleString('es-MX'),
              hint: 'Nuevos registros en el mes actual',
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <p className="text-xs uppercase tracking-wider text-slate-300">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
              <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Origen de eventos</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard
              label="Plataforma Remo&Rent"
              value={data.plataforma}
              hint="Eventos internos del CRM"
            />
            <KpiCard
              label="Portales proveedor"
              value={data.proveedor}
              hint="Levantados por la red de proveedores"
            />
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
              Plataforma
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-400" />
              Proveedor
            </span>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Eventos por mes (últimos 6 meses)
          </h3>
          <MesChart data={data.porMes} />
        </Card>
      </div>
    </div>
  );
}
