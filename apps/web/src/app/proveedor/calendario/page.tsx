'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AgendaIntegrada } from '@/components/AgendaIntegrada';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  CALENDARIO_TIPO_COLORS,
  CALENDARIO_TIPO_LABELS,
  formatFecha,
  formatFechaCorta,
} from '@/lib/labels';
import type { AgendaPortal, CalendarioItem, CalendarioPortal } from '@/lib/types';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const TIPOS_CALENDARIO = [
  'ENTREGA',
  'RECOGER',
  'EVENTO',
  'COBRO',
  'SEGUIMIENTO',
  'PAGO_PENDIENTE',
] as const;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ProveedorCalendarioPage() {
  const [mes, setMes] = useState(() => new Date());
  const [data, setData] = useState<CalendarioPortal | null>(null);
  const [agenda, setAgenda] = useState<AgendaPortal | null>(null);
  const [diaSel, setDiaSel] = useState<Date | null>(() => new Date());
  const [loadingCal, setLoadingCal] = useState(true);
  const [loadingAgenda, setLoadingAgenda] = useState(true);

  const inicio = startOfMonth(mes);
  const fin = endOfMonth(mes);
  const fechaAgenda = diaSel ? toDateKey(diaSel) : toDateKey(new Date());

  useEffect(() => {
    setLoadingCal(true);
    const desde = toDateKey(inicio);
    const hasta = toDateKey(fin);
    apiFetch<CalendarioPortal>(`/portal/calendario?desde=${desde}&hasta=${hasta}`)
      .then(setData)
      .finally(() => setLoadingCal(false));
  }, [mes.getFullYear(), mes.getMonth()]);

  useEffect(() => {
    setLoadingAgenda(true);
    apiFetch<AgendaPortal>(`/portal/agenda?fecha=${fechaAgenda}`)
      .then(setAgenda)
      .finally(() => setLoadingAgenda(false));
  }, [fechaAgenda]);

  const itemsPorDia = useMemo(() => {
    const map = new Map<string, CalendarioItem[]>();
    for (const item of data?.items ?? []) {
      const key = item.fecha.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [data]);

  const celdas = useMemo(() => {
    const first = new Date(inicio);
    const startPad = first.getDay();
    const daysInMonth = fin.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(mes.getFullYear(), mes.getMonth(), d));
    }
    return cells;
  }, [mes, inicio, fin]);

  const itemsDiaSel =
    diaSel != null ? itemsPorDia.get(toDateKey(diaSel)) ?? [] : [];

  const tituloMes = new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
  }).format(mes);

  function irAHoy() {
    const hoy = new Date();
    setMes(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    setDiaSel(hoy);
  }

  return (
    <>
      <PageHeader
        title="Calendario y agenda"
        description="Entregas, recogidas, eventos, cobros, seguimientos y pagos pendientes en una sola vista"
      />

      <div className="mb-8">
        <AgendaIntegrada agenda={agenda} loading={loadingAgenda} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">{tituloMes}</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
              >
                ←
              </Button>
              <Button type="button" variant="secondary" onClick={irAHoy}>
                Hoy
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
              >
                →
              </Button>
            </div>
          </div>

          {loadingCal ? (
            <p className="text-sm text-slate-500">Cargando calendario...</p>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
                {DIAS.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {celdas.map((dia, idx) => {
                  if (!dia) return <div key={`pad-${idx}`} className="min-h-[72px]" />;
                  const key = toDateKey(dia);
                  const items = itemsPorDia.get(key) ?? [];
                  const selected = diaSel && sameDay(dia, diaSel);
                  const hoy = sameDay(dia, new Date());
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDiaSel(dia)}
                      className={`min-h-[72px] rounded-lg border p-1 text-left transition ${
                        selected
                          ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                          : 'border-slate-200 bg-white hover:border-teal-300'
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          hoy ? 'bg-teal-600 text-white' : 'text-slate-700'
                        }`}
                      >
                        {dia.getDate()}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {items.slice(0, 3).map((item) => (
                          <div
                            key={`${item.tipo}-${item.id}`}
                            className={`truncate rounded px-1 text-[10px] text-white ${CALENDARIO_TIPO_COLORS[item.tipo]}`}
                          >
                            {item.titulo}
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-[10px] text-slate-500">+{items.length - 3} más</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
            {TIPOS_CALENDARIO.map((t) => (
              <span key={t} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${CALENDARIO_TIPO_COLORS[t]}`} />
                {CALENDARIO_TIPO_LABELS[t]}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">
            {diaSel ? formatFechaCorta(diaSel.toISOString()) : 'Selecciona un día'}
          </h2>
          {itemsDiaSel.length === 0 ? (
            <p className="text-sm text-slate-500">Sin actividades este día</p>
          ) : (
            <div className="space-y-3">
              {itemsDiaSel.map((item) => (
                <div key={`${item.tipo}-${item.id}`} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge className="bg-slate-100 text-slate-700">
                      {CALENDARIO_TIPO_LABELS[item.tipo]}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatFecha(item.fecha)}</span>
                  </div>
                  <p className="font-medium text-slate-900">{item.titulo}</p>
                  <Link
                    href={`/proveedor/clientes/${item.clienteId}`}
                    className="mt-1 block text-sm text-teal-700 hover:underline"
                  >
                    {item.clienteNombre} →
                  </Link>
                  {item.enlace && item.enlace !== `/proveedor/clientes/${item.clienteId}` && (
                    <Link
                      href={item.enlace}
                      className="mt-1 block text-xs text-teal-600 hover:underline"
                    >
                      Ver detalle →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
