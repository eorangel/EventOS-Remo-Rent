'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_EVENTO_COLORS,
  ESTADO_EVENTO_LABELS,
  ESTADO_LOGISTICA_COLORS,
  ESTADO_LOGISTICA_LABELS,
  formatFecha,
} from '@/lib/labels';
import type { Logistica } from '@/lib/types';

export default function LogisticaPage() {
  const [items, setItems] = useState<Logistica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Logistica[]>('/logistica')
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Logística"
        description="Asignación de vehículos, rutas, personal y checklist operativo"
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando logística...</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            Sin asignaciones de logística. Configúralas desde el detalle de un evento.
          </p>
          <Link href="/eventos" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
            Ir a eventos
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((log) => (
            <Link
              key={log.id}
              href={`/logistica/${log.eventoId}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{log.evento?.titulo}</p>
                  <p className="text-sm text-slate-500">
                    {log.evento?.cliente?.nombre} · {log.conductor ?? 'Sin conductor'}
                  </p>
                  {log.vehiculo && (
                    <p className="mt-1 text-sm text-slate-600">
                      {log.vehiculo.nombre} ({log.vehiculo.placa})
                    </p>
                  )}
                  {log.fechaSalida && (
                    <p className="mt-1 text-xs text-slate-500">
                      Salida: {formatFecha(log.fechaSalida)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {log.checklist && (
                    <span className="text-sm text-slate-500">
                      Checklist: {log.checklist.filter((c) => c.completado).length}/
                      {log.checklist.length}
                    </span>
                  )}
                  <Badge className={ESTADO_LOGISTICA_COLORS[log.estado]}>
                    {ESTADO_LOGISTICA_LABELS[log.estado]}
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
