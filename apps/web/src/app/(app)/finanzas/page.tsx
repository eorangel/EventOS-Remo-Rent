'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, KpiCard, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_MOVIMIENTO_COLORS,
  ESTADO_MOVIMIENTO_LABELS,
  METODO_PAGO_LABELS,
  TIPO_MOVIMIENTO_COLORS,
  TIPO_MOVIMIENTO_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type {
  MovimientoFinanciero,
  ResumenFinancieroGlobal,
} from '@/lib/types';

export default function FinanzasPage() {
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([]);
  const [resumen, setResumen] = useState<ResumenFinancieroGlobal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<MovimientoFinanciero[]>('/finanzas'),
      apiFetch<ResumenFinancieroGlobal>('/finanzas/resumen'),
    ])
      .then(([movs, res]) => {
        setMovimientos(movs);
        setResumen(res);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Pagos, anticipos, gastos y saldos por evento"
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando finanzas...</p>
      ) : (
        <div className="space-y-8">
          {resumen && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Ingresos del mes" value={formatMoney(resumen.ingresosMes)} />
              <KpiCard label="Total cotizado" value={formatMoney(resumen.totalCotizado)} />
              <KpiCard label="Total cobrado" value={formatMoney(resumen.totalCobrado)} />
              <KpiCard label="Cobranza pendiente" value={formatMoney(resumen.totalPendiente)} />
            </div>
          )}

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Movimientos recientes</h2>
            {movimientos.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay movimientos. Regístralos desde el detalle del evento.
              </p>
            ) : (
              <div className="space-y-3">
                {movimientos.map((mov) => (
                  <div
                    key={mov.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{mov.concepto}</p>
                      <p className="text-sm text-slate-500">
                        {mov.evento?.titulo} · {mov.evento?.cliente?.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFecha(mov.fecha)} · {METODO_PAGO_LABELS[mov.metodoPago]}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {formatMoney(mov.monto)}
                      </span>
                      <Badge className={TIPO_MOVIMIENTO_COLORS[mov.tipo]}>
                        {TIPO_MOVIMIENTO_LABELS[mov.tipo]}
                      </Badge>
                      <Badge className={ESTADO_MOVIMIENTO_COLORS[mov.estado]}>
                        {ESTADO_MOVIMIENTO_LABELS[mov.estado]}
                      </Badge>
                      <Link href={`/finanzas/${mov.eventoId}`}>
                        <Button variant="secondary">Ver evento</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
