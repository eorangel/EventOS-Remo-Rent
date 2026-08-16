'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventosCrmResumenPanel } from '@/components/EventosCrmResumen';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  ESTADO_EVENTO_COLORS,
  ESTADO_EVENTO_LABELS,
  ESTADO_EVENTO_PROVEEDOR_COLORS,
  ESTADO_EVENTO_PROVEEDOR_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type {
  EstadoCotizacion,
  EstadoEvento,
  EstadoEventoProveedor,
  EventoCrm,
  EventosCrmResumen,
  OrigenEventoCrm,
} from '@/lib/types';

function estadoCrm(evento: EventoCrm) {
  if (evento.origen === 'PLATAFORMA') {
    const e = evento.estado as EstadoEvento;
    return {
      label: ESTADO_EVENTO_LABELS[e] ?? evento.estado,
      color: ESTADO_EVENTO_COLORS[e] ?? 'bg-slate-100 text-slate-700',
    };
  }
  if (evento.tipo === 'COTIZACION') {
    const e = evento.estado as EstadoCotizacion;
    return {
      label: ESTADO_COTIZACION_LABELS[e] ?? evento.estado,
      color: ESTADO_COTIZACION_COLORS[e] ?? 'bg-slate-100 text-slate-700',
    };
  }
  const e = evento.estado as EstadoEventoProveedor;
  return {
    label: ESTADO_EVENTO_PROVEEDOR_LABELS[e] ?? evento.estado,
    color: ESTADO_EVENTO_PROVEEDOR_COLORS[e] ?? 'bg-slate-100 text-slate-700',
  };
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<EventoCrm[]>([]);
  const [resumen, setResumen] = useState<EventosCrmResumen | null>(null);
  const [search, setSearch] = useState('');
  const [origen, setOrigen] = useState<'' | OrigenEventoCrm>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (origen) params.set('origen', origen);
    const query = params.toString() ? `?${params.toString()}` : '';

    Promise.all([
      apiFetch<EventoCrm[]>(`/eventos/crm${query}`),
      apiFetch<EventosCrmResumen>('/eventos/crm/resumen'),
    ])
      .then(([items, res]) => {
        setEventos(items);
        setResumen(res);
      })
      .finally(() => setLoading(false));
  }, [search, origen]);

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Registro unificado de eventos, cotizaciones y operaciones de proveedores en la red"
        action={
          <Link href="/eventos/nuevo">
            <Button variant="secondary">Nuevo evento (plataforma)</Button>
          </Link>
        }
      />

      {resumen && <EventosCrmResumenPanel data={resumen} />}

      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: '', label: 'Todos' },
                { id: 'PLATAFORMA', label: 'Plataforma' },
                { id: 'PROVEEDOR', label: 'Proveedores' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id || 'all'}
                type="button"
                onClick={() => setOrigen(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  origen === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            placeholder="Buscar evento, cliente, proveedor o lugar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-80"
          />
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando eventos...</p>
        ) : eventos.length === 0 ? (
          <EmptyState
            title="Sin eventos"
            description="Aún no hay eventos ni cotizaciones registradas. La actividad de proveedores aparecerá aquí automáticamente."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Evento</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Proveedor</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Origen</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventos.map((evento) => {
                    const { label, color } = estadoCrm(evento);
                    return (
                      <tr key={`${evento.origen}-${evento.tipo ?? 'EVENTO'}-${evento.id}`} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <Link
                            href={evento.enlace}
                            className="font-medium text-brand-700 hover:text-brand-900 hover:underline"
                          >
                            {evento.titulo}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {evento.tipo === 'COTIZACION' && (
                              <Badge className="bg-violet-50 text-violet-700">Cotización</Badge>
                            )}
                            {evento.lugar && (
                              <p className="text-xs text-slate-500">{evento.lugar}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{evento.clienteNombre}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {evento.proveedorNombre ? (
                            <Link
                              href={`/proveedores/${evento.proveedorId}`}
                              className="text-brand-700 hover:underline"
                            >
                              {evento.proveedorNombre}
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatFecha(evento.fechaEvento)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              evento.origen === 'PLATAFORMA'
                                ? 'bg-brand-50 text-brand-800'
                                : 'bg-violet-50 text-violet-800'
                            }
                          >
                            {evento.origen === 'PLATAFORMA' ? 'Plataforma' : 'Proveedor'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={color}>{label}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                          {evento.montoEstimado != null ? formatMoney(evento.montoEstimado) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
