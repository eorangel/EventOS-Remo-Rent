'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, EmptyState, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  formatMoney,
} from '@/lib/labels';
import type { Cotizacion } from '@/lib/types';

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Cotizacion[]>('/cotizaciones')
      .then(setCotizaciones)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
      title="Cotizaciones"
      description="Propuestas comerciales ligadas a eventos"
      />
      
      {loading ? (
      <p className="text-sm text-slate-500">Cargando cotizaciones...</p>
      ) : cotizaciones.length === 0 ? (
      <EmptyState
      title="Sin cotizaciones"
      description="Crea una cotización desde el detalle de un evento."
      />
      ) : (
      <div className="space-y-3">
      {cotizaciones.map((cot) => (
      <Link
      key={cot.id}
      href={`/cotizaciones/${cot.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300"
      >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
      <p className="font-semibold text-slate-900">{cot.folio}</p>
      <p className="text-sm text-slate-600">
      {cot.evento?.titulo} · {cot.evento?.cliente?.nombre}
      </p>
      <p className="mt-1 text-sm text-slate-500">
      {cot._count?.items ?? 0} ítem(s)
      </p>
      </div>
      <div className="flex items-center gap-4">
      <p className="text-lg font-bold text-slate-900">
      {formatMoney(Number(cot.total))}
      </p>
      <Badge className={ESTADO_COTIZACION_COLORS[cot.estado]}>
      {ESTADO_COTIZACION_LABELS[cot.estado]}
      </Badge>
      </div>
      </div>
      </Link>
      ))}
      </div>
      )}
    </>
  );
}
