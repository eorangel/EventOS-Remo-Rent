'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_EVENTO_COLORS,
  ESTADO_EVENTO_LABELS,
  formatFecha,
} from '@/lib/labels';
import type { Evento } from '@/lib/types';

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    apiFetch<Evento[]>(`/eventos${query}`)
      .then(setEventos)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <PageHeader
      title="Eventos"
      description="Núcleo del sistema — ciclo de vida completo del evento"
      action={
      <Link href="/eventos/nuevo">
      <Button>Nuevo evento</Button>
      </Link>
      }
      />
      
      <div className="mb-6">
      <input
      type="search"
      placeholder="Buscar por título, lugar o cliente..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-md"
      />
      </div>
      
      {loading ? (
      <p className="text-sm text-slate-500">Cargando eventos...</p>
      ) : eventos.length === 0 ? (
      <EmptyState
      title="Sin eventos"
      description="Crea tu primer evento para iniciar el flujo operativo."
      />
      ) : (
      <div className="grid gap-4">
      {eventos.map((evento) => (
      <Link
      key={evento.id}
      href={`/eventos/${evento.id}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
      >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
      <h2 className="text-lg font-semibold text-slate-900">{evento.titulo}</h2>
      <p className="mt-1 text-sm text-slate-600">
      {evento.cliente?.nombre} · {formatFecha(evento.fechaEvento)}
      </p>
      {evento.lugar && (
      <p className="mt-1 text-sm text-slate-500">{evento.lugar}</p>
      )}
      </div>
      <Badge className={ESTADO_EVENTO_COLORS[evento.estado]}>
      {ESTADO_EVENTO_LABELS[evento.estado]}
      </Badge>
      </div>
      </Link>
      ))}
      </div>
      )}
    </>
  );
}
