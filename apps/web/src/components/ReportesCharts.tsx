'use client';

import { useId } from 'react';

const CHART_COLORS = [
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#f43f5e',
  '#06b6d4',
  '#84cc16',
  '#6366f1',
];

export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 22,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color?: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500"
        style={{ width: size, height: size }}
      >
        Sin datos
      </div>
    );
  }

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const dash = pct * c;
            const circle = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue && (
              <p className="text-lg font-bold text-slate-900">{centerValue}</p>
            )}
            {centerLabel && (
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                {centerLabel}
              </p>
            )}
          </div>
        )}
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((seg, i) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color ?? CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-700">{seg.label}</span>
              <span className="shrink-0 font-medium text-slate-900">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ColumnChart({
  data,
  valueKey,
  labelKey,
  formatValue,
  gradientFrom = '#14b8a6',
  gradientTo = '#5eead4',
  height = 200,
}: {
  data: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  formatValue?: (v: number) => string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const w = 360;
  const padX = 24;
  const padTop = 16;
  const padBottom = 36;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  const barGap = 12;
  const barW = Math.max(
    16,
    (w - padX * 2 - barGap * (data.length - 1)) / Math.max(data.length, 1),
  );

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`col-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = padTop + chartH * (1 - tick);
          return (
            <line
              key={tick}
              x1={padX}
              y1={y}
              x2={w - padX}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={tick === 0 ? '0' : '4 4'}
            />
          );
        })}
        {data.map((item, i) => {
          const value = Number(item[valueKey]) || 0;
          const barH = (value / max) * chartH;
          const x = padX + i * (barW + barGap);
          const y = padTop + chartH - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, value > 0 ? 4 : 0)}
                rx={6}
                fill={`url(#col-${uid})`}
                opacity={value > 0 ? 1 : 0.25}
                className="transition-all duration-700"
              />
              {value > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-slate-600 text-[9px] font-medium"
                  transform={`rotate(0 ${x + barW / 2} ${y - 6})`}
                >
                  {formatValue ? formatValue(value) : value}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {String(item[labelKey])}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function AreaTrendChart({
  data,
  valueKey,
  labelKey,
  formatValue,
}: {
  data: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  formatValue?: (v: number) => string;
}) {
  const uid = useId().replace(/:/g, '');
  const w = 360;
  const h = 140;
  const pad = 20;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((Number(d[valueKey]) || 0) / max) * (h - pad * 2);
    return { x, y, label: String(d[labelKey]), value: Number(d[valueKey]) || 0 };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${points[0]?.x ?? pad},${h - pad} ${line} ${points[points.length - 1]?.x ?? w - pad},${h - pad}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`line-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#area-${uid})`} />
        <polyline
          points={line}
          fill="none"
          stroke={`url(#line-${uid})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#14b8a6" strokeWidth="2" />
            <title>
              {p.label}: {formatValue ? formatValue(p.value) : p.value}
            </title>
          </g>
        ))}
      </svg>
      <div className="flex justify-between px-1 text-[10px] text-slate-500">
        {data.map((d, i) => (
          <span key={i}>{String(d[labelKey])}</span>
        ))}
      </div>
    </div>
  );
}

export function HorizontalCompareChart({
  items,
  maxItems = 5,
}: {
  items: { label: string; value: number; display: string }[];
  maxItems?: number;
}) {
  const list = items.slice(0, maxItems);
  const max = Math.max(...list.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Sin datos</p>
      ) : (
        list.map((item, i) => (
          <div key={i}>
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="truncate font-medium text-slate-700">{item.label}</span>
              <span className="shrink-0 text-slate-500">{item.display}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((item.value / max) * 100)}%`,
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
