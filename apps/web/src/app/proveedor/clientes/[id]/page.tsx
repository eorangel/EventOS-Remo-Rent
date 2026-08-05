'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  ESTADO_EVENTO_PROVEEDOR_COLORS,
  ESTADO_EVENTO_PROVEEDOR_LABELS,
  ESTADO_ORDEN_COBRO_COLORS,
  ESTADO_ORDEN_COBRO_LABELS,
  ESTADO_SEGUIMIENTO_LABELS,
  TIPO_SEGUIMIENTO_LABELS,
  formatFecha,
  formatFechaCorta,
  formatMoney,
} from '@/lib/labels';
import type {
  ClienteHistorial,
  ClienteProveedor,
  EstadoEventoProveedor,
  TipoSeguimientoCliente,
} from '@/lib/types';

export default function ProveedorClienteDetallePage() {
  const params = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<ClienteProveedor | null>(null);
  const [historial, setHistorial] = useState<ClienteHistorial | null>(null);
  const [tab, setTab] = useState<'seguimiento' | 'eventos' | 'cotizaciones' | 'historial'>('seguimiento');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [segForm, setSegForm] = useState({
    tipo: 'LLAMADA' as TipoSeguimientoCliente,
    titulo: '',
    descripcion: '',
    fechaProgramada: '',
  });

  const [evForm, setEvForm] = useState({
    titulo: '',
    descripcion: '',
    fechaEvento: '',
    fechaFin: '',
    fechaEntrega: '',
    fechaRecogida: '',
    lugar: '',
    estado: 'COTIZACION' as EstadoEventoProveedor,
    montoEstimado: '',
  });

  async function cargar() {
    if (!params.id) return;
    const [c, h] = await Promise.all([
      apiFetch<ClienteProveedor>(`/portal/clientes/${params.id}`),
      apiFetch<ClienteHistorial>(`/portal/clientes/${params.id}/historial`),
    ]);
    setCliente(c);
    setHistorial(h);
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [params.id]);

  async function crearSeguimiento(e: React.FormEvent) {
    e.preventDefault();
    if (!params.id) return;
    setSaving(true);
    try {
      await apiFetch('/portal/seguimientos', {
        method: 'POST',
        body: JSON.stringify({
          clienteProveedorId: params.id,
          ...segForm,
          fechaProgramada: new Date(segForm.fechaProgramada).toISOString(),
        }),
      });
      setSegForm({ tipo: 'LLAMADA', titulo: '', descripcion: '', fechaProgramada: '' });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function completarSeguimiento(id: string) {
    await apiFetch(`/portal/seguimientos/${id}/completar`, { method: 'POST' });
    await cargar();
  }

  async function crearEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!params.id) return;
    setSaving(true);
    try {
      await apiFetch('/portal/eventos', {
        method: 'POST',
        body: JSON.stringify({
          clienteProveedorId: params.id,
          titulo: evForm.titulo,
          descripcion: evForm.descripcion || undefined,
          fechaEvento: new Date(evForm.fechaEvento).toISOString(),
          fechaFin: evForm.fechaFin ? new Date(evForm.fechaFin).toISOString() : undefined,
          fechaEntrega: evForm.fechaEntrega ? new Date(evForm.fechaEntrega).toISOString() : undefined,
          fechaRecogida: evForm.fechaRecogida ? new Date(evForm.fechaRecogida).toISOString() : undefined,
          lugar: evForm.lugar || undefined,
          estado: evForm.estado,
          montoEstimado: evForm.montoEstimado ? Number(evForm.montoEstimado) : undefined,
        }),
      });
      setEvForm({
        titulo: '',
        descripcion: '',
        fechaEvento: '',
        fechaFin: '',
        fechaEntrega: '',
        fechaRecogida: '',
        lugar: '',
        estado: 'COTIZACION',
        montoEstimado: '',
      });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'seguimiento' as const, label: 'Seguimiento' },
    { id: 'eventos' as const, label: 'Eventos' },
    { id: 'cotizaciones' as const, label: `Cotizaciones (${historial?.cotizaciones?.length ?? 0})` },
    { id: 'historial' as const, label: 'Historial' },
  ];

  return (
    <>
      <PageHeader
        title={cliente?.nombre ?? 'Cliente'}
        description={cliente?.empresa ?? 'Expediente y seguimiento comercial'}
        action={
          <Link href="/proveedor/clientes">
            <Button variant="secondary">← Clientes</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando expediente...</p>
      ) : !cliente || !historial ? (
        <p className="text-sm text-red-600">Cliente no encontrado</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{cliente.nombre}</p>
                {cliente.empresa && <p className="text-sm text-slate-500">{cliente.empresa}</p>}
                <p className="mt-2 text-sm text-slate-600">
                  {[cliente.email, cliente.telefono].filter(Boolean).join(' · ') || 'Sin contacto'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge className="bg-blue-50 text-blue-800">
                  {cliente._count?.eventos ?? 0} eventos
                </Badge>
                <Badge className="bg-violet-50 text-violet-800">
                  {cliente._count?.seguimientos ?? 0} seguimientos
                </Badge>
                <Badge className="bg-teal-50 text-teal-800">
                  {cliente._count?.cotizaciones ?? historial.cotizaciones?.length ?? 0} cotizaciones
                </Badge>
                <Badge className="bg-amber-50 text-amber-800">
                  {cliente._count?.cobros ?? 0} cobros
                </Badge>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === t.id ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'seguimiento' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Nuevo seguimiento</h2>
                <form onSubmit={crearSeguimiento} className="space-y-3">
                  <select
                    value={segForm.tipo}
                    onChange={(e) =>
                      setSegForm({ ...segForm, tipo: e.target.value as TipoSeguimientoCliente })
                    }
                    className="w-full text-sm"
                  >
                    {(Object.keys(TIPO_SEGUIMIENTO_LABELS) as TipoSeguimientoCliente[]).map((t) => (
                      <option key={t} value={t}>
                        {TIPO_SEGUIMIENTO_LABELS[t]}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder="Título del seguimiento"
                    value={segForm.titulo}
                    onChange={(e) => setSegForm({ ...segForm, titulo: e.target.value })}
                    className="w-full text-sm"
                  />
                  <textarea
                    rows={2}
                    placeholder="Notas"
                    value={segForm.descripcion}
                    onChange={(e) => setSegForm({ ...segForm, descripcion: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    required
                    type="datetime-local"
                    value={segForm.fechaProgramada}
                    onChange={(e) => setSegForm({ ...segForm, fechaProgramada: e.target.value })}
                    className="w-full text-sm"
                  />
                  <Button type="submit" disabled={saving}>
                    Programar seguimiento
                  </Button>
                </form>
              </Card>
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Pendientes y recientes</h2>
                {historial.seguimientos.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin seguimientos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {historial.seguimientos.map((s) => (
                      <div key={s.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{s.titulo}</p>
                            <p className="text-sm text-slate-500">
                              {TIPO_SEGUIMIENTO_LABELS[s.tipo]} · {formatFecha(s.fechaProgramada)}
                            </p>
                          </div>
                          <Badge
                            className={
                              s.estado === 'COMPLETADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }
                          >
                            {ESTADO_SEGUIMIENTO_LABELS[s.estado]}
                          </Badge>
                        </div>
                        {s.estado === 'PENDIENTE' && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="mt-2 text-xs"
                            onClick={() => completarSeguimiento(s.id)}
                          >
                            Marcar completado
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {tab === 'eventos' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Registrar evento</h2>
                <form onSubmit={crearEvento} className="space-y-3">
                  <input
                    required
                    placeholder="Nombre del evento"
                    value={evForm.titulo}
                    onChange={(e) => setEvForm({ ...evForm, titulo: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    required
                    type="datetime-local"
                    value={evForm.fechaEvento}
                    onChange={(e) => setEvForm({ ...evForm, fechaEvento: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    type="datetime-local"
                    placeholder="Fin del evento"
                    value={evForm.fechaFin}
                    onChange={(e) => setEvForm({ ...evForm, fechaFin: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    type="datetime-local"
                    placeholder="Fecha de entrega"
                    value={evForm.fechaEntrega}
                    onChange={(e) => setEvForm({ ...evForm, fechaEntrega: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    type="datetime-local"
                    placeholder="Fecha de recogida"
                    value={evForm.fechaRecogida}
                    onChange={(e) => setEvForm({ ...evForm, fechaRecogida: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    placeholder="Lugar"
                    value={evForm.lugar}
                    onChange={(e) => setEvForm({ ...evForm, lugar: e.target.value })}
                    className="w-full text-sm"
                  />
                  <select
                    value={evForm.estado}
                    onChange={(e) =>
                      setEvForm({ ...evForm, estado: e.target.value as EstadoEventoProveedor })
                    }
                    className="w-full text-sm"
                  >
                    {(Object.keys(ESTADO_EVENTO_PROVEEDOR_LABELS) as EstadoEventoProveedor[]).map(
                      (st) => (
                        <option key={st} value={st}>
                          {ESTADO_EVENTO_PROVEEDOR_LABELS[st]}
                        </option>
                      ),
                    )}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Monto estimado (MXN)"
                    value={evForm.montoEstimado}
                    onChange={(e) => setEvForm({ ...evForm, montoEstimado: e.target.value })}
                    className="w-full text-sm"
                  />
                  <textarea
                    rows={2}
                    placeholder="Descripción"
                    value={evForm.descripcion}
                    onChange={(e) => setEvForm({ ...evForm, descripcion: e.target.value })}
                    className="w-full text-sm"
                  />
                  <Button type="submit" disabled={saving}>
                    Guardar evento
                  </Button>
                </form>
              </Card>
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Historial de eventos</h2>
                {historial.eventos.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin eventos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {historial.eventos.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{ev.titulo}</p>
                            <p className="text-sm text-slate-500">
                              {formatFecha(ev.fechaEvento)}
                              {ev.lugar ? ` · ${ev.lugar}` : ''}
                            </p>
                            {ev.montoEstimado != null && (
                              <p className="mt-1 text-sm font-semibold text-teal-700">
                                {formatMoney(ev.montoEstimado)}
                              </p>
                            )}
                          </div>
                          <Badge className={ESTADO_EVENTO_PROVEEDOR_COLORS[ev.estado]}>
                            {ESTADO_EVENTO_PROVEEDOR_LABELS[ev.estado]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {tab === 'cotizaciones' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link href={`/proveedor/cotizaciones/nueva?clienteId=${params.id}`}>
                  <Button>+ Nueva cotización</Button>
                </Link>
              </div>
              {!historial.cotizaciones?.length ? (
                <Card>
                  <p className="text-sm text-slate-500">
                    Este cliente aún no tiene cotizaciones. Crea una en minutos desde tu catálogo.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {historial.cotizaciones.map((cot) => (
                    <Link key={cot.id} href={`/proveedor/cotizaciones/${cot.id}`}>
                      <Card className="transition hover:border-teal-300">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900">{cot.titulo ?? cot.folio}</p>
                            <p className="text-sm text-slate-500">
                              {cot.folio}
                              {cot.fechaEvento ? ` · ${formatFechaCorta(cot.fechaEvento)}` : ''}
                              {cot.lugarEntrega ? ` · ${cot.lugarEntrega}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={ESTADO_COTIZACION_COLORS[cot.estado]}>
                              {ESTADO_COTIZACION_LABELS[cot.estado]}
                            </Badge>
                            <span className="font-semibold text-teal-700">{formatMoney(cot.total)}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'historial' && (
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Línea de tiempo</h2>
              {historial.timeline.length === 0 ? (
                <p className="text-sm text-slate-500">Sin actividad registrada</p>
              ) : (
                <div className="relative space-y-4 border-l-2 border-slate-200 pl-6">
                  {historial.timeline.map((item) => (
                    <div key={`${item.tipo}-${item.id}`} className="relative">
                      <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-teal-500" />
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <Badge className="bg-slate-100 text-slate-700">{item.tipo}</Badge>
                          <span>{formatFechaCorta(item.fecha)}</span>
                        </div>
                        <p className="mt-1 font-medium text-slate-900">{item.titulo}</p>
                        {item.subtitulo && (
                          <p className="text-sm text-slate-500">{item.subtitulo}</p>
                        )}
                        {item.tipo === 'COBRO' && item.meta?.monto != null && (
                          <p className="mt-1 text-sm font-semibold">
                            {formatMoney(item.meta.monto as number)}
                          </p>
                        )}
                        {item.tipo === 'COTIZACION' && item.meta?.total != null && (
                          <p className="mt-1 text-sm font-semibold text-teal-700">
                            {formatMoney(item.meta.total as number)}
                          </p>
                        )}
                        {item.tipo === 'EVENTO' && (
                          <Badge className={`mt-2 ${ESTADO_EVENTO_PROVEEDOR_COLORS[item.estado as EstadoEventoProveedor]}`}>
                            {ESTADO_EVENTO_PROVEEDOR_LABELS[item.estado as EstadoEventoProveedor]}
                          </Badge>
                        )}
                        {item.tipo === 'COBRO' && (
                          <Badge className={`mt-2 ${ESTADO_ORDEN_COBRO_COLORS[item.estado as keyof typeof ESTADO_ORDEN_COBRO_COLORS]}`}>
                            {ESTADO_ORDEN_COBRO_LABELS[item.estado as keyof typeof ESTADO_ORDEN_COBRO_LABELS]}
                          </Badge>
                        )}
                        {item.tipo === 'COTIZACION' && (
                          <Badge className={`mt-2 ${ESTADO_COTIZACION_COLORS[item.estado as keyof typeof ESTADO_COTIZACION_COLORS]}`}>
                            {ESTADO_COTIZACION_LABELS[item.estado as keyof typeof ESTADO_COTIZACION_LABELS]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </>
  );
}
