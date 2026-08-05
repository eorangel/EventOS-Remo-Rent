'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ESTADO_VERIFICACION_COLORS, ESTADO_VERIFICACION_LABELS } from '@/lib/labels';
import type { ResumenOperacionProveedores } from '@/lib/types';

const MAP_BOUNDS = { minLat: 14.5, maxLat: 32.8, minLng: -118.5, maxLng: -86.5 };
const MAP_W = 420;
const MAP_H = 260;

function project(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MAP_W;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_H;
  return { x, y };
}

function coverageRadiusKm(radio: number | null) {
  if (!radio) return 0;
  const latSpan = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
  return (radio / 111) / latSpan * MAP_H * 0.45;
}

export function MapaProveedoresMexico({
  ubicaciones,
}: {
  ubicaciones: ResumenOperacionProveedores['ubicaciones'];
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = ubicaciones.find((u) => u.id === hovered);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full rounded-xl bg-slate-50">
        <defs>
          <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#mapGrid)" rx="12" />
        <rect
          x={MAP_W * 0.08}
          y={MAP_H * 0.12}
          width={MAP_W * 0.84}
          height={MAP_H * 0.76}
          rx="8"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <text x={MAP_W * 0.5} y={18} textAnchor="middle" className="fill-slate-400 text-[10px]">
          Cobertura geográfica · México
        </text>

        {ubicaciones.map((u) => {
          const { x, y } = project(u.lat, u.lng);
          const r = coverageRadiusKm(u.radioCoberturaKm);
          const isHovered = hovered === u.id;
          const color =
            u.estadoVerificacion === 'VERIFICADO'
              ? '#0d9488'
              : u.estadoVerificacion === 'EN_REVISION'
                ? '#f59e0b'
                : '#94a3b8';

          return (
            <g key={u.id}>
              {r > 4 && (
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={color}
                  opacity={isHovered ? 0.18 : 0.08}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 7 : 5}
                fill={color}
                stroke="#fff"
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHovered(u.id)}
                onMouseLeave={() => setHovered(null)}
              />
              {u.precision === 'estimada' && (
                <circle cx={x + 6} cy={y - 6} r={2.5} fill="#fbbf24" stroke="#fff" strokeWidth="1" />
              )}
            </g>
          );
        })}
      </svg>

      {active && (
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/proveedores/${active.id}`} className="font-semibold text-brand-700 hover:underline">
                {active.nombre}
              </Link>
              <p className="text-xs text-slate-500">
                {[active.alcaldia, active.ciudad, active.entidad].filter(Boolean).join(', ')}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_VERIFICACION_COLORS[active.estadoVerificacion as keyof typeof ESTADO_VERIFICACION_COLORS] ?? 'bg-slate-100 text-slate-700'}`}
            >
              {ESTADO_VERIFICACION_LABELS[active.estadoVerificacion as keyof typeof ESTADO_VERIFICACION_LABELS] ?? active.estadoVerificacion}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
            <span>{active.productos} productos</span>
            <span>{active.unidades.toLocaleString('es-MX')} uds.</span>
            <span>{active.eventos} eventos</span>
            {active.radioCoberturaKm && <span>Radio {active.radioCoberturaKm} km</span>}
            {active.precision === 'estimada' && (
              <span className="text-amber-600">Ubicación estimada</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Verificado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> En revisión
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Borrador
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-white bg-amber-400 ring-1 ring-amber-400" />{' '}
          Ubicación estimada
        </span>
      </div>
    </div>
  );
}
