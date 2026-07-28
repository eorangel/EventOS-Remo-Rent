'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  MetodoPago,
  MovimientoFinanciero,
  ResumenFinancieroEvento,
  TipoMovimientoFinanciero,
} from '@/lib/types';

const TIPOS: TipoMovimientoFinanciero[] = ['ANTICIPO', 'PAGO', 'REEMBOLSO', 'GASTO'];
const METODOS: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO'];

export default function FinanzasEventoPage() {
  const params = useParams<{ eventoId: string }>();
  const [resumen, setResumen] = useState<ResumenFinancieroEvento | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: 'ANTICIPO' as TipoMovimientoFinanciero,
    concepto: '',
    monto: '',
    metodoPago: 'TRANSFERENCIA' as MetodoPago,
    referencia: '',
  });

  async function cargar() {
    if (!params.eventoId) return;
    const [res, movs] = await Promise.all([
      apiFetch<ResumenFinancieroEvento>(`/finanzas/evento/${params.eventoId}/resumen`),
      apiFetch<MovimientoFinanciero[]>(`/finanzas?eventoId=${params.eventoId}`),
    ]);
    setResumen(res);
    setMovimientos(movs);
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [params.eventoId]);

  async function registrarMovimiento(e: React.FormEvent) {
    e.preventDefault();
    if (!params.eventoId) return;
    setSaving(true);
    try {
      await apiFetch('/finanzas', {
        method: 'POST',
        body: JSON.stringify({
          eventoId: params.eventoId,
          tipo: form.tipo,
          concepto: form.concepto,
          monto: Number(form.monto),
          metodoPago: form.metodoPago,
          referencia: form.referencia || undefined,
        }),
      });
      setForm({ tipo: 'ANTICIPO', concepto: '', monto: '', metodoPago: 'TRANSFERENCIA', referencia: '' });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={resumen?.evento.titulo ?? 'Finanzas del evento'}
        description="Cobranza, gastos y rentabilidad"
        action={
          <Link href="/finanzas">
            <Button variant="secondary">← Finanzas</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : !resumen ? (
        <p className="text-sm text-red-600">Evento no encontrado</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total cotizado" value={formatMoney(resumen.totalCotizado)} />
            <KpiCard label="Total pagado" value={formatMoney(resumen.totalPagado)} />
            <KpiCard label="Saldo pendiente" value={formatMoney(resumen.saldoPendiente)} />
            <KpiCard label="Utilidad real" value={formatMoney(resumen.utilidadReal)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumen financiero</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Cotización ref.</dt>
                  <dd className="font-medium">{resumen.cotizacionRef?.folio ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Costo estimado</dt>
                  <dd>{formatMoney(resumen.costoEstimado)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Gastos extra</dt>
                  <dd>{formatMoney(resumen.totalGastos)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Costo real</dt>
                  <dd>{formatMoney(resumen.costoReal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Utilidad cotizada</dt>
                  <dd>{formatMoney(resumen.utilidadCotizada)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <dt className="font-medium text-slate-700">Margen real</dt>
                  <dd className="font-semibold text-brand-700">{resumen.margenReal}%</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Registrar movimiento</h2>
              <form onSubmit={registrarMovimiento} className="space-y-3">
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoMovimientoFinanciero })}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{TIPO_MOVIMIENTO_LABELS[t]}</option>
                  ))}
                </select>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Concepto"
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Monto"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  required
                />
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={form.metodoPago}
                  onChange={(e) => setForm({ ...form, metodoPago: e.target.value as MetodoPago })}
                >
                  {METODOS.map((m) => (
                    <option key={m} value={m}>{METODO_PAGO_LABELS[m]}</option>
                  ))}
                </select>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Referencia (opcional)"
                  value={form.referencia}
                  onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                />
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Guardando...' : 'Registrar'}
                </Button>
              </form>
            </Card>
          </div>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Movimientos</h2>
            {movimientos.length === 0 ? (
              <p className="text-sm text-slate-500">Sin movimientos registrados.</p>
            ) : (
              <div className="space-y-3">
                {movimientos.map((mov) => (
                  <div
                    key={mov.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{mov.concepto}</p>
                      <p className="text-xs text-slate-500">
                        {formatFecha(mov.fecha)} · {METODO_PAGO_LABELS[mov.metodoPago]}
                        {mov.referencia ? ` · Ref: ${mov.referencia}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatMoney(mov.monto)}</span>
                      <Badge className={TIPO_MOVIMIENTO_COLORS[mov.tipo]}>
                        {TIPO_MOVIMIENTO_LABELS[mov.tipo]}
                      </Badge>
                      <Badge className={ESTADO_MOVIMIENTO_COLORS[mov.estado]}>
                        {ESTADO_MOVIMIENTO_LABELS[mov.estado]}
                      </Badge>
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
