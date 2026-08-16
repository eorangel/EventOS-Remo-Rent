'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_COTIZACION_COLORS,
  ESTADO_COTIZACION_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type { EventoCrmCotizacionDetalle } from '@/lib/types';

export default function EventoCotizacionDetallePage() {
  const params = useParams<{ id: string }>();
  const [cotizacion, setCotizacion] = useState<EventoCrmCotizacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<EventoCrmCotizacionDetalle>(`/eventos/crm/cotizacion/${params.id}`)
      .then(setCotizacion)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando cotización...</p>;
  }

  if (!cotizacion) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Cotización no encontrada.</p>
        <Link href="/eventos" className="text-sm text-brand-700 hover:underline">
          Volver al registro CRM
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={cotizacion.titulo}
        description={`Cotización ${cotizacion.folio} — portal de proveedor`}
        action={
          <Link href="/eventos">
            <span className="text-sm font-medium text-brand-700 hover:underline">← Registro CRM</span>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-violet-50 text-violet-800">Cotización proveedor</Badge>
        <Badge className={ESTADO_COTIZACION_COLORS[cotizacion.estado]}>
          {ESTADO_COTIZACION_LABELS[cotizacion.estado]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Detalle</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Folio</dt>
              <dd className="font-medium text-slate-900">{cotizacion.folio}</dd>
            </div>
            {cotizacion.fechaEvento && (
              <div>
                <dt className="text-slate-500">Fecha del evento</dt>
                <dd className="font-medium text-slate-900">{formatFecha(cotizacion.fechaEvento)}</dd>
              </div>
            )}
            {cotizacion.lugarEntrega && (
              <div>
                <dt className="text-slate-500">Lugar de entrega</dt>
                <dd className="font-medium text-slate-900">{cotizacion.lugarEntrega}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500">Total</dt>
              <dd className="font-medium text-slate-900">{formatMoney(cotizacion.total)}</dd>
            </div>
            {cotizacion.notas && (
              <div>
                <dt className="text-slate-500">Notas</dt>
                <dd className="text-slate-800">{cotizacion.notas}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500">Registrada</dt>
              <dd className="text-slate-800">{formatFecha(cotizacion.creadoEn)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Proveedor</h3>
            <Link
              href={`/proveedores/${cotizacion.proveedor.id}`}
              className="font-medium text-brand-700 hover:underline"
            >
              {cotizacion.proveedor.nombre}
            </Link>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Cliente</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Nombre</dt>
                <dd className="font-medium text-slate-900">{cotizacion.cliente.nombre}</dd>
              </div>
              {cotizacion.cliente.empresa && (
                <div>
                  <dt className="text-slate-500">Empresa</dt>
                  <dd className="text-slate-800">{cotizacion.cliente.empresa}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Productos cotizados</h3>
        {cotizacion.items.length === 0 ? (
          <p className="text-sm text-slate-500">Sin partidas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="pb-2 pr-4">Producto</th>
                  <th className="pb-2 pr-4">Cantidad</th>
                  <th className="pb-2 pr-4">Precio unit.</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cotizacion.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4">
                      {item.productoNombre ?? item.descripcion}
                    </td>
                    <td className="py-2 pr-4">{item.cantidad}</td>
                    <td className="py-2 pr-4">{formatMoney(item.precioUnitario)}</td>
                    <td className="py-2 text-right font-medium">{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
