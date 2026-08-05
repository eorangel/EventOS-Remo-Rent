'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  formatFechaCorta,
  formatMoney,
} from '@/lib/labels';
import type { CotizacionProveedor, EstadoCotizacion } from '@/lib/types';

export default function ProveedorCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionProveedor[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoCotizacion | ''>('');
  const [loading, setLoading] = useState(true);

  async function cargar() {
    const params = filtroEstado ? `?estado=${filtroEstado}` : '';
    const data = await apiFetch<CotizacionProveedor[]>(`/portal/cotizaciones${params}`);
    setCotizaciones(data);
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [filtroEstado]);

  return (
    <>
      <PageHeader
        title="Cotizaciones"
        description="Crea y envía cotizaciones a tus clientes en minutos"
        action={
          <Link href="/proveedor/cotizaciones/nueva">
            <Button>+ Nueva cotización</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoCotizacion | '')}
            className="text-sm"
          >
            <option value="">Todas</option>
            {(Object.keys(ESTADO_COTIZACION_LABELS) as EstadoCotizacion[]).map((e) => (
              <option key={e} value={e}>
                {ESTADO_COTIZACION_LABELS[e]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando cotizaciones...</p>
      ) : cotizaciones.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">Aún no tienes cotizaciones. Crea la primera en un par de minutos.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {cotizaciones.map((c) => (
            <Link key={c.id} href={`/proveedor/cotizaciones/${c.id}`}>
              <Card className="transition hover:border-teal-300 hover:shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {c.titulo ?? c.clienteProveedor?.nombre ?? 'Cotización'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {c.folio} · {c.clienteProveedor?.nombre}
                      {c.fechaEvento ? ` · ${formatFechaCorta(c.fechaEvento)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={ESTADO_COTIZACION_COLORS[c.estado]}>
                      {ESTADO_COTIZACION_LABELS[c.estado]}
                    </Badge>
                    <span className="text-lg font-bold text-slate-900">{formatMoney(c.total)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
