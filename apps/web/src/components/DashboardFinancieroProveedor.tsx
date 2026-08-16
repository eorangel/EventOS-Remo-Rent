'use client';

import Link from 'next/link';
import { formatMoney } from '@/lib/labels';
import type { PortalDashboardFinanciero } from '@/lib/types';

function Sparkline({ data }: { data: { semana: string; monto: number }[] }) {
  const max = Math.max(...data.map((d) => d.monto), 1);
  const w = 280;
  const h = 72;
  const pad = 4;
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (d.monto / max) * (h - pad * 2);
    return { x, y, ...d };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${points[0]?.x ?? 0},${h} ${line} ${points[points.length - 1]?.x ?? 0},${h}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[72px] w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(45 212 191)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(45 212 191)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#sparkFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="url(#sparkLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.monto > 0 ? 3.5 : 0}
            fill="#99f6e4"
            className="drop-shadow-sm"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-teal-200/70">
        {data.map((d) => (
          <span key={d.semana}>{d.semana}</span>
        ))}
      </div>
    </div>
  );
}

function CobranzaRing({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="-rotate-90" width="112" height="112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-white">{value}%</p>
        <p className="text-[10px] uppercase tracking-wider text-teal-200/80">Cobranza</p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  sub,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  accent: string;
}) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:bg-white/10 ${accent}`}
    >
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/5 blur-xl transition group-hover:bg-white/10" />
      <p className="text-xs font-medium uppercase tracking-wider text-teal-100/70">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-teal-100/60">{sub}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function DashboardFinancieroProveedor({
  data,
}: {
  data: PortalDashboardFinanciero;
}) {
  const ingresosSemanales = data.ingresosSemanales ?? [];
  const variacion = data.variacionIngresos;
  const variacionPositiva = variacion != null && variacion >= 0;

  return (
    <section className="dashboard-financiero relative overflow-hidden rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-6 shadow-2xl shadow-teal-900/20 sm:p-8">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
              </span>
              Inteligencia financiera en vivo
            </div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-teal-200/80">
              Dashboard financiero
            </h2>
            <p className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {formatMoney(data.ingresosMes)}
            </p>
            <p className="mt-1 text-sm text-teal-100/70">Ingresos del mes · {data.mesLabel}</p>
            {variacion != null && (
              <p
                className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  variacionPositiva
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {variacionPositiva ? '↑' : '↓'} {Math.abs(variacion)}% vs mes anterior
              </p>
            )}
          </div>

          <CobranzaRing value={data.tasaCobranza} />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricTile
            label="Operaciones"
            value={data.eventosMes}
            sub={`${data.eventosActivos} en curso${data.cotizacionesActivas ? ` · ${data.cotizacionesActivas} cotiz.` : ''}`}
            href="/proveedor/calendario"
            accent=""
          />
          <MetricTile
            label="Clientes"
            value={data.clientesActivos}
            sub="activos"
            href="/proveedor/clientes"
            accent=""
          />
          <MetricTile
            label="Cobros"
            value={data.cobrosPagadosMes}
            sub={`${data.cobrosCreadosMes} emitidos este mes`}
            href="/proveedor/cobros"
            accent=""
          />
          <MetricTile
            label="Saldo pendiente"
            value={formatMoney(data.saldoPendiente)}
            sub={`${data.cobrosPendientes} por cobrar`}
            href="/proveedor/cobros"
            accent=""
          />
          <MetricTile
            label="Mes anterior"
            value={formatMoney(data.ingresosMesAnterior)}
            sub="ingresos cobrados"
            accent=""
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-teal-200/70">
              Tendencia de ingresos · últimas 6 semanas
            </p>
            <Link
              href="/proveedor/cobros"
              className="text-xs font-medium text-teal-300 hover:text-teal-200"
            >
              Ver cobros →
            </Link>
          </div>
          <Sparkline data={ingresosSemanales.length > 0 ? ingresosSemanales : [{ semana: '—', monto: 0 }]} />
        </div>
      </div>
    </section>
  );
}
