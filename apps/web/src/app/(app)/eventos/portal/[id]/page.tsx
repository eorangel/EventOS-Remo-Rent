'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_EVENTO_PROVEEDOR_COLORS,
  ESTADO_EVENTO_PROVEEDOR_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type { EventoCrmProveedorDetalle } from '@/lib/types';

export default function EventoPortalDetallePage() {
  const params = useParams<{ id: string }>();
  const [evento, setEvento] = useState<EventoCrmProveedorDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<EventoCrmProveedorDetalle>(`/eventos/crm/proveedor/${params.id}`)
      .then(setEvento)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando evento...</p>;
  }

  if (!evento) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Evento no encontrado.</p>
        <Link href="/eventos" className="text-sm text-brand-700 hover:underline">
          Volver al registro CRM
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={evento.titulo}
        description="Evento registrado en portal de proveedor — vista de solo lectura para administración"
        action={
          <Link href="/eventos">
            <span className="text-sm font-medium text-brand-700 hover:underline">← Registro CRM</span>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-violet-50 text-violet-800">Portal proveedor</Badge>
        <Badge className={ESTADO_EVENTO_PROVEEDOR_COLORS[evento.estado]}>
          {ESTADO_EVENTO_PROVEEDOR_LABELS[evento.estado]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Detalle del evento</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Fecha del evento</dt>
              <dd className="font-medium text-slate-900">{formatFecha(evento.fechaEvento)}</dd>
            </div>
            {evento.fechaFin && (
              <div>
                <dt className="text-slate-500">Fecha fin</dt>
                <dd className="font-medium text-slate-900">{formatFecha(evento.fechaFin)}</dd>
              </div>
            )}
            {evento.fechaEntrega && (
              <div>
                <dt className="text-slate-500">Entrega</dt>
                <dd className="font-medium text-slate-900">{formatFecha(evento.fechaEntrega)}</dd>
              </div>
            )}
            {evento.fechaRecogida && (
              <div>
                <dt className="text-slate-500">Recogida</dt>
                <dd className="font-medium text-slate-900">{formatFecha(evento.fechaRecogida)}</dd>
              </div>
            )}
            {evento.lugar && (
              <div>
                <dt className="text-slate-500">Lugar</dt>
                <dd className="font-medium text-slate-900">{evento.lugar}</dd>
              </div>
            )}
            {evento.montoEstimado != null && (
              <div>
                <dt className="text-slate-500">Monto estimado</dt>
                <dd className="font-medium text-slate-900">{formatMoney(evento.montoEstimado)}</dd>
              </div>
            )}
            {evento.descripcion && (
              <div>
                <dt className="text-slate-500">Descripción</dt>
                <dd className="text-slate-800">{evento.descripcion}</dd>
              </div>
            )}
            {evento.notas && (
              <div>
                <dt className="text-slate-500">Notas</dt>
                <dd className="text-slate-800">{evento.notas}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500">Registrado</dt>
              <dd className="text-slate-800">{formatFecha(evento.creadoEn)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Proveedor</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Empresa</dt>
                <dd>
                  <Link
                    href={`/proveedores/${evento.proveedor.id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {evento.proveedor.nombre}
                  </Link>
                </dd>
              </div>
              {(evento.proveedor.ciudad || evento.proveedor.entidadFederativa) && (
                <div>
                  <dt className="text-slate-500">Ubicación</dt>
                  <dd className="text-slate-800">
                    {[evento.proveedor.ciudad, evento.proveedor.entidadFederativa]
                      .filter(Boolean)
                      .join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Cliente del proveedor</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Nombre</dt>
                <dd className="font-medium text-slate-900">{evento.cliente.nombre}</dd>
              </div>
              {evento.cliente.empresa && (
                <div>
                  <dt className="text-slate-500">Empresa</dt>
                  <dd className="text-slate-800">{evento.cliente.empresa}</dd>
                </div>
              )}
              {evento.cliente.email && (
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-slate-800">{evento.cliente.email}</dd>
                </div>
              )}
              {evento.cliente.telefono && (
                <div>
                  <dt className="text-slate-500">Teléfono</dt>
                  <dd className="text-slate-800">{evento.cliente.telefono}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
