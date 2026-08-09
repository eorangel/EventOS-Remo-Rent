'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type PlatformPreviewProps = {
  variant?: 'dashboard' | 'calendario' | 'cobros';
  className?: string;
};

const DESKTOP_WIDTH = 980;
const DESKTOP_HEIGHT = 560;

const navItems = [
  { label: 'Inicio', icon: '◫' },
  { label: 'Calendario', icon: '▦' },
  { label: 'Clientes', icon: '◎' },
  { label: 'Cotizaciones', icon: '▤' },
  { label: 'Reportes', icon: '◧' },
  { label: 'Cobros', icon: '$' },
  { label: 'Catálogo', icon: '▣' },
];

const sparklinePoints = '4,58 52,42 100,48 148,28 196,34 244,12 276,18';
const sparklineArea = `4,72 ${sparklinePoints} 276,72`;

function formatMoney(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="flex gap-1.5">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      <div className="mx-auto flex h-7 w-full max-w-md items-center justify-center rounded-md bg-slate-100 px-3 text-[11px] text-slate-500">
        {url}
      </div>
    </div>
  );
}

function Sidebar({ activeLabel }: { activeLabel: string }) {
  return (
    <aside className="w-56 shrink-0 border-r border-brand-900 bg-brand-950">
      <div className="border-b border-brand-900 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <Image
            src="/remo-mark.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-contain"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">REMO</p>
            <p className="truncate text-[10px] text-brand-300">Remo&Rent</p>
          </div>
        </div>
      </div>
      <nav className="space-y-0.5 p-2.5">
        {navItems.map((item) => {
          const active = item.label === activeLabel;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${
                active
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'text-slate-300'
              }`}
            >
              <span className="text-sm opacity-80">{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-brand-900 p-3">
        <div className="rounded-lg bg-brand-900/80 px-3 py-2">
          <p className="truncate text-xs font-medium text-white">María Operaciones</p>
          <p className="text-[10px] text-brand-300">Portal proveedor</p>
        </div>
      </div>
    </aside>
  );
}

function DashboardFinancieroPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-5 shadow-xl shadow-teal-900/20">
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
              </span>
              Inteligencia financiera en vivo
            </div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-teal-200/80">
              Dashboard financiero
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white">{formatMoney(284500)}</p>
            <p className="mt-1 text-xs text-teal-100/70">Ingresos del mes · Marzo 2026</p>
            <span className="mt-2 inline-flex rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              ↑ 18% vs mes anterior
            </span>
          </div>

          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
              <circle
                cx="48"
                cy="48"
                r="36"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="226"
                strokeDashoffset="29"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-xl font-bold text-white">87%</p>
              <p className="text-[9px] uppercase tracking-wider text-teal-200/80">Cobranza</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {[
            { label: 'Eventos', value: '14', sub: '9 activos' },
            { label: 'Clientes', value: '38', sub: 'activos' },
            { label: 'Cobros', value: '21', sub: '26 emitidos' },
            { label: 'Saldo pendiente', value: formatMoney(47200), sub: '5 por cobrar' },
            { label: 'Mes anterior', value: formatMoney(241000), sub: 'cobrados' },
          ].map((tile) => (
            <div
              key={tile.label}
              className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-teal-100/70">
                {tile.label}
              </p>
              <p className="mt-1 text-base font-bold text-white">{tile.value}</p>
              <p className="mt-0.5 text-[10px] text-teal-100/60">{tile.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-teal-200/70">
            Tendencia de ingresos · últimas 6 semanas
          </p>
          <svg viewBox="0 0 280 72" className="h-16 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="landingSparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(45 212 191)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="rgb(45 212 191)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={sparklineArea} fill="url(#landingSparkFill)" />
            <polyline
              points={sparklinePoints}
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-1 flex justify-between text-[10px] text-teal-200/70">
            {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarioPreview() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const marked = [3, 7, 12, 15, 18, 22, 26];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">Calendario operativo</h3>
        <p className="text-xs text-slate-500">Entregas, eventos y cobros en un solo lugar</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Marzo 2026</p>
            <div className="flex gap-1 text-xs text-slate-400">
              <span className="rounded bg-slate-100 px-2 py-0.5">‹</span>
              <span className="rounded bg-slate-100 px-2 py-0.5">›</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-500">
            {days.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }, (_, i) => {
              const day = i + 1;
              const active = day === 15;
              const hasEvent = marked.includes(day);
              return (
                <div
                  key={day}
                  className={`relative flex h-8 items-center justify-center rounded-lg text-xs ${
                    active
                      ? 'bg-brand-600 font-bold text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {day}
                  {hasEvent && !active ? (
                    <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[10px]">
            {[
              { color: 'bg-blue-500', label: 'Entrega' },
              { color: 'bg-violet-500', label: 'Evento' },
              { color: 'bg-amber-500', label: 'Cobro' },
              { color: 'bg-emerald-500', label: 'Recoger' },
            ].map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5 text-slate-600">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Agenda del día · 15 mar
          </p>
          <div className="mt-3 space-y-2.5">
            {[
              { time: '09:00', title: 'Entrega mobiliario', type: 'ENTREGA', color: 'border-l-blue-500 bg-blue-50' },
              { time: '14:00', title: 'Boda González-Ruiz', type: 'EVENTO', color: 'border-l-violet-500 bg-violet-50' },
              { time: '17:30', title: 'Anticipo evento WTC', type: 'COBRO', color: 'border-l-amber-500 bg-amber-50' },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-lg border-l-[3px] px-3 py-2.5 ${item.color}`}
              >
                <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                <p className="text-[10px] text-slate-500">
                  {item.time} · {item.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CobrosPreview() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">Cobros y flujo de efectivo</h3>
        <p className="text-xs text-slate-500">Emite, da seguimiento y cobra sin salir del portal</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pagados', value: formatMoney(186300), tone: 'text-emerald-700 bg-emerald-50 ring-emerald-100' },
          { label: 'Pendientes', value: formatMoney(47200), tone: 'text-amber-700 bg-amber-50 ring-amber-100' },
          { label: 'Vencidos', value: formatMoney(12800), tone: 'text-rose-700 bg-rose-50 ring-rose-100' },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl p-4 ring-1 ${kpi.tone}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{kpi.label}</p>
            <p className="mt-1 text-xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold text-slate-600">
          <span>Concepto</span>
          <span>Monto</span>
          <span>Estado</span>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            {
              concepto: 'Anticipo boda González-Ruiz',
              folio: 'COB-2026-0142',
              monto: formatMoney(45000),
              estado: 'Pagado',
              color: 'bg-emerald-100 text-emerald-800',
            },
            {
              concepto: 'Saldo congreso WTC',
              folio: 'COB-2026-0138',
              monto: formatMoney(82000),
              estado: 'Pendiente',
              color: 'bg-amber-100 text-amber-800',
            },
            {
              concepto: 'Renta mobiliario corporativo',
              folio: 'COB-2026-0135',
              monto: formatMoney(18500),
              estado: 'Enviado',
              color: 'bg-blue-100 text-blue-800',
            },
          ].map((row) => (
            <div
              key={row.folio}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-900">{row.concepto}</p>
                <p className="text-[10px] text-slate-500">{row.folio}</p>
              </div>
              <p className="text-xs font-semibold text-slate-900">{row.monto}</p>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${row.color}`}>
                {row.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewBody({ variant }: { variant: 'dashboard' | 'calendario' | 'cobros' }) {
  const activeNav =
    variant === 'dashboard' ? 'Inicio' : variant === 'calendario' ? 'Calendario' : 'Cobros';

  return (
    <div className="flex h-[520px] bg-slate-100">
      <Sidebar activeLabel={activeNav} />
      <div className="min-w-0 flex-1 overflow-hidden p-5">
        {variant === 'dashboard' ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Remo&Rent</h3>
              <p className="text-xs text-slate-500">
                Tu centro de control — finanzas, clientes y operación en un vistazo
              </p>
            </div>
            <DashboardFinancieroPreview />
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { icon: '▦', title: 'Calendario y agenda', desc: 'Entregas, eventos y cobros del día' },
                { icon: '◎', title: 'Clientes', desc: '38 activos · CRM completo' },
                { icon: '▤', title: 'Cotizaciones', desc: 'Propuestas con inventario en tiempo real' },
                { icon: '$', title: 'Cobros', desc: `${formatMoney(47200)} pendientes` },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700">
                    {card.icon}
                  </span>
                  <p className="mt-2 text-xs font-semibold text-slate-900">{card.title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {variant === 'calendario' ? <CalendarioPreview /> : null}
        {variant === 'cobros' ? <CobrosPreview /> : null}
      </div>
    </div>
  );
}

const previewUrls = {
  dashboard: 'https://web-production-8e240.up.railway.app/proveedor/dashboard',
  calendario: 'https://web-production-8e240.up.railway.app/proveedor/calendario',
  cobros: 'https://web-production-8e240.up.railway.app/proveedor/cobros',
};

export function PlatformPreview({
  variant = 'dashboard',
  className = '',
}: PlatformPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateScale = () => {
      const width = node.clientWidth;
      setScale(Math.min(1, width / DESKTOP_WIDTH));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scaledHeight = DESKTOP_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-2xl shadow-slate-400/30 ring-1 ring-slate-900/5 ${className}`}
      style={{ height: scaledHeight }}
    >
      <div
        style={{
          width: DESKTOP_WIDTH,
          height: DESKTOP_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <BrowserChrome url={previewUrls[variant]} />
        <PreviewBody variant={variant} />
      </div>
    </div>
  );
}

/** @deprecated Use PlatformPreview */
export function CrmPreview({ className }: { className?: string }) {
  return <PlatformPreview variant="dashboard" className={className} />;
}
