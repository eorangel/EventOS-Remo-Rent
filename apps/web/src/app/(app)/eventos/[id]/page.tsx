'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  ESTADO_EVENTO_COLORS,
  ESTADO_EVENTO_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type { Cotizacion, EstadoEvento, Evento } from '@/lib/types';

const ESTADOS: EstadoEvento[] = [
  'BORRADOR',
  'COTIZACION',
  'CONFIRMADO',
  'EN_LOGISTICA',
  'EN_EJECUCION',
  'COMPLETADO',
  'CANCELADO',
];

export default function EventoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creandoCotizacion, setCreandoCotizacion] = useState(false);
  const [operando, setOperando] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!params.id) return;
    apiFetch<Evento>(`/eventos/${params.id}`)
      .then(setEvento)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function cambiarEstado(estado: EstadoEvento) {
    if (!evento) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Evento>(`/eventos/${evento.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      setEvento(updated);
    } finally {
      setSaving(false);
    }
  }

  async function crearCotizacion() {
    if (!evento) return;
    setCreandoCotizacion(true);
    try {
      const cot = await apiFetch<Cotizacion>('/cotizaciones', {
        method: 'POST',
        body: JSON.stringify({ eventoId: evento.id }),
      });
      router.push(`/cotizaciones/${cot.id}`);
    } finally {
      setCreandoCotizacion(false);
    }
  }

  async function sincronizarAgenda() {
    if (!evento) return;
    setOperando(true);
    setMsg('');
    try {
      await apiFetch(`/agenda/evento/${evento.id}/sincronizar`, { method: 'POST' });
      setMsg('Agenda sincronizada correctamente.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setOperando(false);
    }
  }

  async function importarSubarrendos() {
    if (!evento) return;
    setOperando(true);
    setMsg('');
    try {
      const creados = await apiFetch<unknown[]>(
        `/subarrendos/evento/${evento.id}/importar-cotizacion`,
        { method: 'POST' },
      );
      setMsg(`${creados.length} subarrendo(s) importados desde cotización.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setOperando(false);
    }
  }

  async function generarDocumento(tipo: string) {
    if (!evento) return;
    setOperando(true);
    setMsg('');
    try {
      const doc = await apiFetch<{ id: string; titulo: string }>('/documentos/generar', {
        method: 'POST',
        body: JSON.stringify({ eventoId: evento.id, tipo }),
      });
      setMsg(`Documento generado: ${doc.titulo}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setOperando(false);
    }
  }

  return (
    <>
      {loading ? (
      <p className="text-sm text-slate-500">Cargando evento...</p>
      ) : !evento ? (
      <p className="text-sm text-red-600">Evento no encontrado</p>
      ) : (
      <>
      <PageHeader
      title={evento.titulo}
      description={evento.descripcion ?? 'Detalle del evento'}
      action={
      <Badge className={ESTADO_EVENTO_COLORS[evento.estado]}>
      {ESTADO_EVENTO_LABELS[evento.estado]}
      </Badge>
      }
      />
      
      <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Información general</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
      <div>
      <dt className="text-sm text-slate-500">Cliente</dt>
      <dd className="font-medium text-slate-900">
      <Link
      href={`/clientes/${evento.clienteId}`}
      className="text-brand-600 hover:underline"
      >
      {evento.cliente?.nombre}
      </Link>
      </dd>
      </div>
      <div>
      <dt className="text-sm text-slate-500">Creado por</dt>
      <dd className="font-medium text-slate-900">
      {evento.creadoPor?.nombre ?? '—'}
      </dd>
      </div>
      <div>
      <dt className="text-sm text-slate-500">Fecha del evento</dt>
      <dd className="font-medium text-slate-900">
      {formatFecha(evento.fechaEvento)}
      </dd>
      </div>
      <div>
      <dt className="text-sm text-slate-500">Lugar</dt>
      <dd className="font-medium text-slate-900">{evento.lugar ?? '—'}</dd>
      </div>
      <div>
      <dt className="text-sm text-slate-500">Montaje</dt>
      <dd className="font-medium text-slate-900">
      {evento.fechaMontaje ? formatFecha(evento.fechaMontaje) : '—'}
      </dd>
      </div>
      <div>
      <dt className="text-sm text-slate-500">Desmontaje</dt>
      <dd className="font-medium text-slate-900">
      {evento.fechaDesmontaje ? formatFecha(evento.fechaDesmontaje) : '—'}
      </dd>
      </div>
      </dl>
      {evento.notas && (
      <div className="mt-6 rounded-xl bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">Notas internas</p>
      <p className="mt-1 text-sm text-slate-600">{evento.notas}</p>
      </div>
      )}
      </Card>
      
      <Card>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Ciclo de vida</h2>
      <p className="mb-4 text-sm text-slate-500">
      Actualiza el estado del evento conforme avance la operación.
      </p>
      <div className="space-y-2">
      {ESTADOS.map((estado) => (
      <Button
      key={estado}
      variant={evento.estado === estado ? 'primary' : 'secondary'}
      disabled={saving || evento.estado === estado}
      onClick={() => cambiarEstado(estado)}
      className="w-full justify-start"
      >
      {ESTADO_EVENTO_LABELS[estado]}
      </Button>
      ))}
      </div>
      </Card>
      </div>
      
      <Card className="mt-6">
      <div className="mb-4 flex items-center justify-between">
      <div>
      <h2 className="text-lg font-semibold text-slate-900">Cotizaciones</h2>
      <p className="text-sm text-slate-500">
      Propuestas comerciales ligadas a este evento
      </p>
      </div>
      <Button onClick={crearCotizacion} disabled={creandoCotizacion}>
      {creandoCotizacion ? 'Creando...' : 'Nueva cotización'}
      </Button>
      </div>
      
      {!evento.cotizaciones?.length ? (
      <p className="text-sm text-slate-500">
      Este evento aún no tiene cotizaciones.
      </p>
      ) : (
      <div className="space-y-3">
      {evento.cotizaciones.map((cot) => (
      <Link
      key={cot.id}
      href={`/cotizaciones/${cot.id}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300"
      >
      <div>
      <p className="font-medium text-slate-900">{cot.folio}</p>
      <p className="text-sm text-slate-500">
      {cot._count?.items ?? 0} ítem(s)
      </p>
      </div>
      <div className="flex items-center gap-3">
      <span className="font-semibold text-slate-900">
      {formatMoney(Number(cot.total))}
      </span>
      <Badge className={ESTADO_COTIZACION_COLORS[cot.estado]}>
      {ESTADO_COTIZACION_LABELS[cot.estado]}
      </Badge>
      </div>
      </Link>
      ))}
      </div>
      )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Operación</h2>
        <p className="mb-4 text-sm text-slate-500">
          Agenda, logística y subarrendos ligados a este evento.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={sincronizarAgenda} disabled={operando}>
            Sincronizar agenda
          </Button>
          <Link href={`/logistica/${evento.id}`}>
            <Button variant="secondary">Configurar logística</Button>
          </Link>
          <Button variant="secondary" onClick={importarSubarrendos} disabled={operando}>
            Importar subarrendos
          </Button>
          <Link href="/agenda">
            <Button variant="secondary">Ver agenda</Button>
          </Link>
          <Link href="/subarrendos">
            <Button variant="secondary">Ver subarrendos</Button>
          </Link>
        </div>
        {msg && <p className="mt-3 text-sm text-brand-700">{msg}</p>}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Finanzas y documentos</h2>
        <p className="mb-4 text-sm text-slate-500">
          Cobranza, pagos y generación de documentos del evento.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/finanzas/${evento.id}`}>
            <Button variant="secondary">Ver finanzas</Button>
          </Link>
          <Link href="/documentos">
            <Button variant="secondary">Ver documentos</Button>
          </Link>
          <Button variant="secondary" onClick={() => generarDocumento('COTIZACION')} disabled={operando}>
            Generar cotización PDF
          </Button>
          <Button variant="secondary" onClick={() => generarDocumento('CONTRATO')} disabled={operando}>
            Generar contrato
          </Button>
          <Button variant="secondary" onClick={() => generarDocumento('RECIBO')} disabled={operando}>
            Generar recibo
          </Button>
          <Button variant="secondary" onClick={() => generarDocumento('ACTA_ENTREGA')} disabled={operando}>
            Generar acta de entrega
          </Button>
        </div>
      </Card>
      </>
      )}
    </>
  );
}
