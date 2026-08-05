'use client';

import Link from 'next/link';
import { formatMoney } from '@/lib/labels';
import type { DashboardResumen } from '@/lib/types';

function MiniBars({
  data,
  valueKey,
  labelKey,
  color = 'bg-brand-500',
}: {
  data: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((item, i) => {
        const value = Number(item[valueKey]) || 0;
        const h = Math.max((value / max) * 100, value > 0 ? 8 : 0);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-md ${color} transition-all duration-700`}
                style={{ height: `${h}%` }}
                title={`${item[labelKey]}: ${value}`}
              />
            </div>
            <span className="text-[10px] text-slate-500">{String(item[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm ${accent ?? ''}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-indigo-100/80">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-indigo-100/60">{hint}</p>}
    </div>
  );
}

function RateRing({ value, label, suffix = '%' }: { value: number; label: string; suffix?: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(value, 100) / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="-rotate-90" width="96" height="96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="#818cf8"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-lg font-bold text-white">
            {value}
            {suffix}
          </p>
        </div>
      </div>
      <p className="text-center text-xs text-indigo-100/70">{label}</p>
    </div>
  );
}

const VERIFICACION_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  VERIFICADO: 'Verificado',
};

export function DashboardAdminInterno({ data }: { data: DashboardResumen }) {
  const m = data.metricas;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-900 p-6 shadow-xl lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mb-6">
          <p className="text-sm font-medium text-indigo-200/80">Panel administrativo · Remo&Rent</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Métricas internas de plataforma</h2>
          <p className="mt-1 text-sm text-indigo-100/60">
            Salud del negocio SaaS — empresas, usuarios, cobros y crecimiento
          </p>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Empresas registradas"
            value={m.empresasRegistradas}
            hint={`${m.empresasActivas} activas · ${m.empresasVerificadas} verificadas`}
          />
          <MetricCard
            label="Usuarios activos"
            value={m.usuariosActivos}
            hint={`${m.usuariosPlataforma} plataforma · ${m.usuariosProveedor} proveedor`}
          />
          <MetricCard
            label="Eventos creados"
            value={m.eventosCreados}
            hint={`${m.eventosPlataforma} internos · ${m.eventosProveedor} en portales`}
          />
          <MetricCard
            label="Cobros generados"
            value={m.cobrosGenerados}
            hint={formatMoney(m.montoCobrosGenerados)}
          />
          <MetricCard
            label="Cobros pagados"
            value={m.cobrosPagados}
            hint={formatMoney(m.montoCobrosPagados)}
          />
          <MetricCard
            label="Uso del sistema (30 días)"
            value={m.usoSistema}
            hint="Altas y actividad registrada"
          />
        </div>

        <div className="relative mt-6 grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:grid-cols-3">
          <div className="text-center lg:border-r lg:border-white/10 lg:pr-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-indigo-100/70">
              MRR (mes actual)
            </p>
            <p className="text-4xl font-bold text-white">{formatMoney(m.mrr)}</p>
            <p className="mt-1 text-xs text-indigo-100/60">Ingresos cobrados vía plataforma</p>
          </div>
          <RateRing value={m.churn} label="Churn (30 días)" />
          <RateRing value={m.conversionPruebaPago} label="Conversión a pago" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Cobros pagados por mes</h3>
          <p className="mb-4 text-xs text-slate-500">Últimos 6 meses · monto cobrado</p>
          <MiniBars
            data={data.tendencias.porMes.map((row) => ({
              mesLabel: row.mesLabel,
              monto: row.montoPagado,
            }))}
            valueKey="monto"
            labelKey="mesLabel"
            color="bg-brand-500"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Tasa de cobranza</h3>
          <p className="mb-4 text-xs text-slate-500">Pagado vs generado (histórico)</p>
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-5xl font-bold text-brand-600">{m.tasaCobranza}%</p>
            <p className="mt-2 text-sm text-slate-500">
              {formatMoney(m.montoCobrosPagados)} de {formatMoney(m.montoCobrosGenerados)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Nuevas empresas por mes</h3>
          <p className="mb-4 text-xs text-slate-500">Registros de proveedores</p>
          <MiniBars
            data={data.tendencias.porMes.map((row) => ({
              mesLabel: row.mesLabel,
              cantidad: row.empresasNuevas,
            }))}
            valueKey="cantidad"
            labelKey="mesLabel"
            color="bg-indigo-500"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Uso del sistema por mes</h3>
          <p className="mb-4 text-xs text-slate-500">Acciones registradas en plataforma</p>
          <MiniBars
            data={data.tendencias.porMes.map((row) => ({
              mesLabel: row.mesLabel,
              actividad: row.usoSistema,
            }))}
            valueKey="actividad"
            labelKey="mesLabel"
            color="bg-violet-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Empresas recientes</h3>
            <p className="text-xs text-slate-500">Últimos registros en la plataforma</p>
          </div>
          <Link href="/proveedores" className="text-sm font-medium text-brand-600 hover:underline">
            Ver proveedores →
          </Link>
        </div>
        {data.recientes.empresas.length === 0 ? (
          <p className="text-sm text-slate-500">Sin empresas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Empresa</th>
                  <th className="pb-3 pr-4 font-medium">Ciudad</th>
                  <th className="pb-3 pr-4 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Registro</th>
                </tr>
              </thead>
              <tbody>
                {data.recientes.empresas.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/proveedores/${emp.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {emp.nombre}
                      </Link>
                      {!emp.activo && (
                        <span className="ml-2 text-xs text-red-500">Inactiva</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{emp.ciudad ?? '—'}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {VERIFICACION_LABELS[emp.estadoVerificacion] ?? emp.estadoVerificacion}
                    </td>
                    <td className="py-3 text-slate-600">
                      {new Date(emp.createdAt).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
