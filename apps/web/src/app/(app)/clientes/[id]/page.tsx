'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_EVENTO_COLORS,
  ESTADO_EVENTO_LABELS,
  formatFecha,
} from '@/lib/labels';
import type { Cliente } from '@/lib/types';

export default function ClienteDetallePage() {
  const params = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<Cliente>(`/clientes/${params.id}`)
      .then(setCliente)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <>
      {loading ? (
      <p className="text-sm text-slate-500">Cargando expediente...</p>
      ) : !cliente ? (
      <p className="text-sm text-red-600">Cliente no encontrado</p>
      ) : (
      <>
      <PageHeader
      title={cliente.nombre}
      description={cliente.empresa ?? 'Expediente del cliente'}
      action={
      <Link href={`/eventos/nuevo?clienteId=${cliente.id}`}>
      <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
      Crear evento
      </button>
      </Link>
      }
      />
      
      <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Contacto</h2>
      <dl className="space-y-3 text-sm">
      <div>
      <dt className="text-slate-500">Correo</dt>
      <dd className="font-medium text-slate-900">{cliente.email ?? '—'}</dd>
      </div>
      <div>
      <dt className="text-slate-500">Teléfono</dt>
      <dd className="font-medium text-slate-900">{cliente.telefono ?? '—'}</dd>
      </div>
      <div>
      <dt className="text-slate-500">Dirección</dt>
      <dd className="font-medium text-slate-900">{cliente.direccion ?? '—'}</dd>
      </div>
      {cliente.notas && (
      <div>
      <dt className="text-slate-500">Notas</dt>
      <dd className="text-slate-700">{cliente.notas}</dd>
      </div>
      )}
      </dl>
      </Card>
      
      <Card className="lg:col-span-2">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
      Historial de eventos ({cliente.eventos?.length ?? 0})
      </h2>
      {!cliente.eventos?.length ? (
      <p className="text-sm text-slate-500">Este cliente aún no tiene eventos.</p>
      ) : (
      <div className="space-y-3">
      {cliente.eventos.map((evento) => (
      <Link
      key={evento.id}
      href={`/eventos/${evento.id}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300"
      >
      <div>
      <p className="font-medium text-slate-900">{evento.titulo}</p>
      <p className="text-sm text-slate-500">
      {formatFecha(evento.fechaEvento)} · {evento.lugar ?? 'Sin lugar'}
      </p>
      </div>
      <Badge className={ESTADO_EVENTO_COLORS[evento.estado]}>
      {ESTADO_EVENTO_LABELS[evento.estado]}
      </Badge>
      </Link>
      ))}
      </div>
      )}
      </Card>
      </div>
      </>
      )}
    </>
  );
}
