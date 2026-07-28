'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_SUBARRENDO_COLORS,
  ESTADO_SUBARRENDO_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type { EstadoSubarrendo, Subarrendo } from '@/lib/types';

const ESTADOS: EstadoSubarrendo[] = [
  'IDENTIFICADO',
  'SOLICITADO',
  'CONFIRMADO',
  'RECIBIDO',
  'DEVUELTO',
];

export default function SubarrendosPage() {
  const [items, setItems] = useState<Subarrendo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Subarrendo[]>('/subarrendos')
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function cambiarEstado(id: string, estado: EstadoSubarrendo) {
    setSaving(id);
    try {
      const updated = await apiFetch<Subarrendo>(`/subarrendos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      setItems((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Subarrendos"
        description="Seguimiento de mobiliario rentado a proveedores externos"
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando subarrendos...</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            No hay subarrendos registrados. Impórtalos desde cotizaciones en el detalle del evento.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((sub) => (
            <Card key={sub.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{sub.descripcion}</p>
                  <p className="text-sm text-slate-500">
                    {sub.evento?.titulo} · {sub.proveedor?.nombre}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Cantidad: {sub.cantidad} · Costo: {formatMoney(sub.costo)}
                  </p>
                  {sub.fechaEntrega && (
                    <p className="text-xs text-slate-500">
                      Entrega: {formatFecha(sub.fechaEntrega)}
                    </p>
                  )}
                  <Link
                    href={`/eventos/${sub.eventoId}`}
                    className="mt-2 inline-block text-xs text-brand-600 hover:underline"
                  >
                    Ver evento
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={ESTADO_SUBARRENDO_COLORS[sub.estado]}>
                    {ESTADO_SUBARRENDO_LABELS[sub.estado]}
                  </Badge>
                  <select
                    value={sub.estado}
                    disabled={saving === sub.id}
                    onChange={(e) => cambiarEstado(sub.id, e.target.value as EstadoSubarrendo)}
                    className="text-sm"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {ESTADO_SUBARRENDO_LABELS[e]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
