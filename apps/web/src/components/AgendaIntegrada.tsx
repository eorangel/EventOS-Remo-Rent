'use client';

import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import {
  AGENDA_SECCION_COLORS,
  AGENDA_SECCION_LABELS,
  formatFecha,
  formatFechaCorta,
  formatMoney,
  TIPO_SEGUIMIENTO_LABELS,
} from '@/lib/labels';
import type { AgendaItem, AgendaPortal, AgendaSeccion } from '@/lib/types';

type SeccionKey = keyof AgendaSeccion;

const SECCIONES: SeccionKey[] = [
  'entregas',
  'recogidas',
  'eventos',
  'cobros',
  'seguimientos',
  'pagosPendientes',
];

function AgendaItemCard({ item, showMonto }: { item: AgendaItem; showMonto?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">{item.titulo}</p>
          <Link
            href={`/proveedor/clientes/${item.clienteId}`}
            className="text-sm text-teal-700 hover:underline"
          >
            {item.clienteNombre}
          </Link>
          {item.lugar && (
            <p className="mt-1 text-xs text-slate-500">{item.lugar}</p>
          )}
          {item.subtipo && (
            <p className="mt-1 text-xs text-slate-500">
              {TIPO_SEGUIMIENTO_LABELS[item.subtipo as keyof typeof TIPO_SEGUIMIENTO_LABELS] ??
                item.subtipo}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-slate-500">{formatFecha(item.fecha)}</p>
          {showMonto && item.monto != null && (
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatMoney(item.monto)}
            </p>
          )}
          {item.vencido && (
            <Badge className="mt-1 bg-rose-100 text-rose-800">Vencido</Badge>
          )}
        </div>
      </div>
      {item.enlace && (
        <Link
          href={item.enlace}
          className="mt-2 inline-block text-xs font-medium text-teal-700 hover:underline"
        >
          Ver detalle →
        </Link>
      )}
    </div>
  );
}

function SeccionAgenda({
  seccion,
  items,
  showMonto,
}: {
  seccion: SeccionKey;
  items: AgendaItem[];
  showMonto?: boolean;
}) {
  const label = AGENDA_SECCION_LABELS[seccion];
  const colorClass = AGENDA_SECCION_COLORS[seccion];

  return (
    <Card className={`${colorClass} border`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{label}</h3>
        <Badge className="bg-white/80 text-slate-700">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin actividades</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <AgendaItemCard key={item.id} item={item} showMonto={showMonto} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function AgendaIntegrada({
  agenda,
  loading,
}: {
  agenda: AgendaPortal | null;
  loading: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-slate-500">Cargando agenda...</p>;
  }

  if (!agenda) return null;

  const tituloFecha = agenda.esHoy
    ? 'Hoy'
    : formatFechaCorta(`${agenda.fecha}T12:00:00.000Z`);

  const resumenItems = [
    { key: 'entregas' as const, count: agenda.resumen.entregas },
    { key: 'recogidas' as const, count: agenda.resumen.recogidas },
    { key: 'eventos' as const, count: agenda.resumen.eventos },
    { key: 'cobros' as const, count: agenda.resumen.cobros },
    { key: 'seguimientos' as const, count: agenda.resumen.seguimientos },
    { key: 'pagosPendientes' as const, count: agenda.resumen.pagosPendientes },
  ].filter((r) => r.count > 0);

  const totalActividades =
    agenda.resumen.entregas +
    agenda.resumen.recogidas +
    agenda.resumen.eventos +
    agenda.resumen.cobros +
    agenda.resumen.seguimientos;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Agenda integrada — {tituloFecha}
          </h2>
          <p className="text-sm text-slate-500">
            {totalActividades} actividad{totalActividades !== 1 ? 'es' : ''} del día
            {agenda.resumen.pagosPendientes > 0 &&
              ` · ${agenda.resumen.pagosPendientes} pago(s) pendiente(s) en total`}
          </p>
        </div>
        {resumenItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resumenItems.map(({ key, count }) => (
              <span
                key={key}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${AGENDA_SECCION_COLORS[key]} border`}
              >
                {count} {AGENDA_SECCION_LABELS[key].toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECCIONES.map((seccion) => (
          <SeccionAgenda
            key={seccion}
            seccion={seccion}
            items={agenda.secciones[seccion]}
            showMonto={seccion === 'cobros' || seccion === 'pagosPendientes'}
          />
        ))}
      </div>
    </div>
  );
}
