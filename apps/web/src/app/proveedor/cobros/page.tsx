'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_ORDEN_COBRO_LABELS,
  formatFechaCorta,
  formatMoney,
} from '@/lib/labels';
import type { ClienteProveedor, EstadoOrdenCobro, OrdenCobro } from '@/lib/types';

const ESTADOS_COBRO: EstadoOrdenCobro[] = [
  'BORRADOR',
  'PENDIENTE',
  'PAGADO',
  'VENCIDO',
  'CANCELADO',
];

export default function ProveedorCobrosPage() {
  const searchParams = useSearchParams();
  const cobroDestacadoId = searchParams.get('cobro');
  const desdeCotizacion = searchParams.get('desde') === 'cotizacion';
  const cobroRef = useRef<HTMLDivElement>(null);

  const [cobros, setCobros] = useState<OrdenCobro[]>([]);
  const [clientes, setClientes] = useState<ClienteProveedor[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrdenCobro | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [form, setForm] = useState({
    clienteProveedorId: '',
    concepto: '',
    monto: '',
    fechaVencimiento: '',
    notas: '',
  });

  async function cargar() {
    const params = filtroEstado ? `?estado=${filtroEstado}` : '';
    const [cobrosData, clientesData] = await Promise.all([
      apiFetch<OrdenCobro[]>(`/portal/cobros${params}`),
      apiFetch<ClienteProveedor[]>('/portal/clientes'),
    ]);
    setCobros(cobrosData);
    setClientes(clientesData.filter((c) => c.activo));
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [filtroEstado]);

  useEffect(() => {
    if (!cobroDestacadoId || loading) return;
    cobroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [cobroDestacadoId, loading, cobros]);

  async function crearCobro(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/portal/cobros', {
        method: 'POST',
        body: JSON.stringify({
          clienteProveedorId: form.clienteProveedorId,
          concepto: form.concepto,
          monto: Number(form.monto),
          fechaVencimiento: form.fechaVencimiento || undefined,
          notas: form.notas || undefined,
        }),
      });
      setForm({
        clienteProveedorId: '',
        concepto: '',
        monto: '',
        fechaVencimiento: '',
        notas: '',
      });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function actualizarEstado(id: string, estado: EstadoOrdenCobro) {
    setActualizandoId(id);
    try {
      await apiFetch(`/portal/cobros/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      await cargar();
    } finally {
      setActualizandoId(null);
    }
  }

  async function marcarPagado(id: string) {
    const referencia = window.prompt('Referencia de pago (SPEI, transferencia, etc.):') ?? undefined;
    await apiFetch(`/portal/cobros/${id}/marcar-pagado`, {
      method: 'POST',
      body: JSON.stringify({ referencia }),
    });
    await cargar();
  }

  return (
    <>
      <PageHeader
        title="Órdenes de cobro"
        description="Registra cobros manuales y da seguimiento a pagos de tus clientes"
      />

      {desdeCotizacion && cobroDestacadoId && (
        <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <p className="font-medium">Cotización creada — asigna el estado del cobro</p>
          <p className="mt-1 text-teal-800">
            Se generó una orden de cobro con el total de la cotización. Elige el estado (por ejemplo,
            Pendiente o Pagado) en el listado de abajo.
          </p>
          <Link
            href="/proveedor/cotizaciones"
            className="mt-2 inline-block font-medium text-teal-700 hover:text-teal-900"
          >
            Ver cotizaciones →
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Nueva orden</h2>
          {clientes.length === 0 ? (
            <p className="text-sm text-slate-500">Primero registra un cliente</p>
          ) : (
            <form onSubmit={crearCobro} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cliente *</label>
                <select
                  value={form.clienteProveedorId}
                  onChange={(e) => setForm({ ...form, clienteProveedorId: e.target.value })}
                  required
                  className="w-full text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                      {c.empresa ? ` — ${c.empresa}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Concepto *</label>
                <input
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  required
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Monto (MXN) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  required
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Vencimiento</label>
                <input
                  type="date"
                  value={form.fechaVencimiento}
                  onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="w-full text-sm"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creando...' : 'Crear cobro'}
              </Button>
            </form>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Historial</h2>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoOrdenCobro | '')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_COBRO.map((e) => (
                <option key={e} value={e}>
                  {ESTADO_ORDEN_COBRO_LABELS[e]}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando cobros...</p>
          ) : cobros.length === 0 ? (
            <p className="text-sm text-slate-500">Sin órdenes de cobro</p>
          ) : (
            <div className="space-y-3">
              {cobros.map((cobro) => {
                const destacado = cobro.id === cobroDestacadoId;
                return (
                  <div
                    key={cobro.id}
                    ref={destacado ? cobroRef : undefined}
                    className={`rounded-xl border px-4 py-3 ${
                      destacado
                        ? 'border-teal-400 bg-teal-50/50 ring-2 ring-teal-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{cobro.concepto}</p>
                        <p className="text-sm text-slate-500">
                          {cobro.folio} · {cobro.clienteProveedor?.nombre ?? 'Cliente'}
                        </p>
                        {cobro.fechaVencimiento && (
                          <p className="mt-1 text-xs text-slate-500">
                            Vence: {formatFechaCorta(cobro.fechaVencimiento)}
                          </p>
                        )}
                        {cobro.notas && (
                          <p className="mt-1 text-xs text-slate-600">{cobro.notas}</p>
                        )}
                        {cobro.referencia && (
                          <p className="mt-1 text-xs text-slate-600">Ref: {cobro.referencia}</p>
                        )}
                        {cobro.pagadoEn && (
                          <p className="mt-1 text-xs text-emerald-700">
                            Pagado: {formatFechaCorta(cobro.pagadoEn)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-semibold text-slate-900">
                          {formatMoney(cobro.monto)}
                        </span>
                        <label className="flex flex-col items-end gap-1 text-xs text-slate-600">
                          Estado
                          <select
                            value={cobro.estado}
                            disabled={actualizandoId === cobro.id}
                            onChange={(e) =>
                              actualizarEstado(cobro.id, e.target.value as EstadoOrdenCobro)
                            }
                            className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-800"
                          >
                            {ESTADOS_COBRO.map((e) => (
                              <option key={e} value={e}>
                                {ESTADO_ORDEN_COBRO_LABELS[e]}
                              </option>
                            ))}
                          </select>
                        </label>
                        {cobro.estado === 'PENDIENTE' && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="text-xs"
                            onClick={() => marcarPagado(cobro.id)}
                          >
                            Marcar pagado
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
